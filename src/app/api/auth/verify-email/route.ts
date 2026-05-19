import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashToken, isExpired } from '@/lib/auth-tokens'
import { absoluteUrl } from '@/lib/site-url'

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token') || ''
  const hash = hashToken(token)

  const records = await prisma.report.findMany({ where: { reason: 'email_verify_token', status: 'pending' }, select: { id: true, userId: true, comment: true }, take: 200 })
  const record = records.find(r => {
    try { const parsed = JSON.parse(r.comment || '{}'); return parsed.hash === hash && !isExpired(parsed.expiresAt) } catch { return false }
  })

  if (!record) return NextResponse.redirect(absoluteUrl('/cabinet?emailVerified=failed'))

  await prisma.$executeRawUnsafe('UPDATE "User" SET "emailVerified" = $1, "verificationStatus" = CASE WHEN "verificationStatus" = $2 THEN $3 ELSE "verificationStatus" END WHERE id = $4', true, 'NONE', 'EMAIL_ONLY', record.userId).catch(async () => {
    await prisma.user.update({ where: { id: record.userId }, data: { emailVerified: true }, select: { id: true } }).catch(() => {})
  })
  await prisma.report.update({ where: { id: record.id }, data: { status: 'resolved' } })
  await prisma.notification.create({ data: { userId: record.userId, type: 'email_verified', title: 'Email підтверджено', message: 'Ваш email успішно підтверджено.' } }).catch(() => {})

  return NextResponse.redirect(absoluteUrl('/cabinet?emailVerified=1'))
}
