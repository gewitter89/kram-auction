import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { createToken, tokenExpiry } from '@/lib/auth-tokens'
import { sendSimpleEventEmail } from '@/lib/email'
import { absoluteUrl } from '@/lib/site-url'

export async function POST() {
  try {
    const session = await auth()
    const userId = session?.user?.id
    const email = session?.user?.email
    if (!userId || !email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { token, hash } = createToken()
    await prisma.report.updateMany({ where: { userId, reason: 'email_verify_token', status: 'pending' }, data: { status: 'dismissed' } })
    await prisma.report.create({ data: { userId, listingId: null, reason: 'email_verify_token', comment: JSON.stringify({ hash, expiresAt: tokenExpiry(24) }), status: 'pending' } })
    await sendSimpleEventEmail({ to: email, subject: '✅ Підтвердіть email KRAM', title: 'Підтвердження email', message: 'Натисніть кнопку нижче, щоб підтвердити email акаунта.', ctaUrl: absoluteUrl(`/api/auth/verify-email?token=${token}`), ctaLabel: 'Підтвердити email' })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Resend verification error:', error)
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 })
  }
}
