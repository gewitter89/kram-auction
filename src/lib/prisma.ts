import { PrismaClient } from '@prisma/client'

if (!process.env.DATABASE_URL) {
  console.warn(
    '\x1b[33m[KRAM DATABASE WARNING]: DATABASE_URL is not set in environment variables! ' +
    'Please copy env.example to .env and configure the database link.\x1b[0m'
  )
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error']
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
