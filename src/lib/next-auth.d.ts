import NextAuth, { type DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role?: string
      verified?: boolean
    } & DefaultSession["user"]
  }

  interface User {
    id?: string
    role?: string
    verified?: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role?: string
    verified?: boolean
  }
}
