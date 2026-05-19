import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isRateLimited } from '@/lib/rateLimit'
import { createToken, tokenExpiry } from '@/lib/auth-tokens'
import { sendSimpleEventEmail } from '@/lib/email'
import { absoluteUrl } from '@/lib/site-url'

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    if (await isRateLimited(`forgot-password:${ip}`, 5, 60_000)) {
      return NextResponse.json({ error: 'Забагато спроб. Спробуйте пізніше.' }, { status: 429 })
    }

    const { email } = await request.json()
    const normalizedEmail = String(email || '').toLowerCase().trim()
    if (!normalizedEmail.includes('@')) return NextResponse.json({ success: true })

    const users = await prisma.$queryRaw<Array<{ id: string; name: string; email: string }>>`
      SELECT id, name, email FROM "User" WHERE email = ${normalizedEmail} LIMIT 1
    `
    const user = users[0]
    if (!user) return NextResponse.json({ success: true })

    const { token, hash } = createToken()
    await prisma.report.updateMany({ where: { userId: user.id, reason: 'password_reset_token', status: 'pending' }, data: { status: 'dismissed' } })
    await prisma.report.create({
      data: {
        userId: user.id,
        listingId: null,
        reason: 'password_reset_token',
        comment: JSON.stringify({ hash, expiresAt: tokenExpiry(2) }),
        status: 'pending',
      }
    })

    await sendSimpleEventEmail({
      to: user.email,
      subject: '🔐 Відновлення пароля KRAM',
      title: 'Відновлення пароля',
      message: 'Натисніть кнопку нижче, щоб встановити новий пароль. Посилання діє 2 години.',
      ctaUrl: absoluteUrl(`/auth/reset-password?token=${token}`),
      ctaLabel: 'Скинути пароль'
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ success: true })
  }
}
