import { auth } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

/**
 * Unified helper to get current authenticated user
 * Uses NextAuth/Auth.js as the single source of truth
 */
export async function getCurrentUser() {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      role: true,
      verified: true,
      city: true,
      phone: true,
      bio: true,
      rating: true,
      reviewsCount: true,
    }
  })

  return user
}

/**
 * Check if current user is admin
 */
export async function isAdmin() {
  const user = await getCurrentUser()
  if (!user) return false
  
  return user.role === 'admin' || user.email === 'admin@kram.ua'
}

/**
 * Require authentication - returns user or throws error
 */
export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}

/**
 * Require admin role - returns user or throws error
 */
export async function requireAdmin() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Unauthorized')
  }
  if (user.role !== 'admin' && user.email !== 'admin@kram.ua') {
    throw new Error('Forbidden')
  }
  return user
}
