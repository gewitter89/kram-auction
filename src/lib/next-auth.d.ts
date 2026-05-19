import NextAuth, { type DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role?: string
      verified?: boolean
      verificationStatus?: string
    } & DefaultSession["user"]
  }

  interface User {
    id?: string
    role?: string
    verified?: boolean
    verificationStatus?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role?: string
    verified?: boolean
    verificationStatus?: string
  }
}
