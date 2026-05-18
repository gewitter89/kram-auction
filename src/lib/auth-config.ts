import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import Facebook from 'next-auth/providers/facebook'
import GitHub from 'next-auth/providers/github'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { isRateLimited } from './rateLimit'
import { logAuditEvent } from './logger'

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: {
    signIn: '/auth/login',
    newUser: '/cabinet',
  },
  trustHost: true,
  session: { strategy: 'jwt' },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET,
    }),
    Facebook({
      clientId: process.env.AUTH_FACEBOOK_ID || process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.AUTH_FACEBOOK_SECRET || process.env.FACEBOOK_CLIENT_SECRET,
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID || process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET || process.env.GITHUB_CLIENT_SECRET,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, request) {
        if (!credentials?.email || !credentials?.password) return null

        // Rate limiting by IP
        const ip = request?.headers?.get('x-forwarded-for') || 'unknown'
        if (await isRateLimited(`login:${ip}`, 5, 60_000)) {
          throw new Error('Забагато спроб входу. Спробуйте через хвилину.')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        })

        if (!user) return null
        const valid = bcrypt.compareSync(credentials.password as string, user.passwordHash)
        if (!valid) {
          await isRateLimited(`login:${credentials.email}`, 1, 300_000) // Track failed attempts per email
          return null
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.avatar,
        }
      }
    }),
  ],
  events: {
    async signIn({ user, account }) {
      await logAuditEvent({
        userId: user.id,
        action: 'login_success',
        metadata: { provider: account?.provider }
      })
    },
    async createUser({ user }) {
      await logAuditEvent({
        userId: user.id,
        action: 'register',
        metadata: { method: 'oauth' }
      })
    }
  },
  callbacks: {
    async signIn({ user, account }) {
      // For Google, Facebook, GitHub OAuth - find or create user in our DB
      if ((account?.provider === 'google' || account?.provider === 'facebook' || account?.provider === 'github') && user.email) {
        let dbUser = await prisma.user.findUnique({ where: { email: user.email } })
        
        if (!dbUser) {
          // Create new user
          dbUser = await prisma.user.create({
            data: {
              name: user.name || 'Користувач',
              email: user.email,
              passwordHash: '',
              avatar: user.image || null,
              verified: true,
            }
          })
        } else {
          // Update name and avatar from provider if changed
          await prisma.user.update({
            where: { id: dbUser.id },
            data: {
              name: user.name || dbUser.name,
              avatar: user.image || dbUser.avatar,
            }
          })
        }

        // IMPORTANT: Override user.id with our DB id
        user.id = dbUser.id
        user.name = dbUser.name
        user.email = dbUser.email
      }
      return true
    },

    async jwt({ token, user }) {
      if (user) {
        // For Google: user.id is already set to DB id in signIn callback
        // For Credentials: user.id comes from authorize()
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.picture = user.image
      }

      // Always fetch fresh data from DB to ensure correct user
      if (token.email) {
        const dbUser = await prisma.user.findUnique({ 
          where: { email: token.email as string },
          select: { id: true, name: true, email: true, avatar: true, role: true, verified: true }
        })
        if (dbUser) {
          token.id = dbUser.id
          token.name = dbUser.name
          token.email = dbUser.email
          token.picture = dbUser.avatar
          token.role = dbUser.role
          token.verified = dbUser.verified
        }
      }

      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.name = token.name as string
        session.user.email = token.email as string
        session.user.image = token.picture as string
        ;(session.user as { role?: string }).role = token.role as string | undefined
        ;(session.user as { verified?: boolean }).verified = token.verified as boolean | undefined
      }
      return session
    },
  },
})
