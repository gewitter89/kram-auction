import { prisma } from './prisma'

export async function logAuditEvent({
  userId,
  action,
  ip,
  userAgent,
  metadata
}: {
  userId?: string
  action: string
  ip?: string
  userAgent?: string
  metadata?: any
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        ip,
        userAgent,
        metadata: metadata ? JSON.stringify(metadata) : null
      }
    })
  } catch (error) {
    console.error('Failed to create audit log:', error)
  }
}
