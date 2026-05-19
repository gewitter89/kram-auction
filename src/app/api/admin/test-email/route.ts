import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/getCurrentUser'
import { sendSimpleEventEmail, getEmailProviderStatus } from '@/lib/email'
import { auth } from '@/lib/auth-config'

export async function POST(request: Request) {
  try {
    await requireAdmin()
    const session = await auth()
    const body = await request.json().catch(() => ({}))
    const to = body.to || session?.user?.email
    if (!to) return NextResponse.json({ error: 'Email не знайдено' }, { status: 400 })

    await sendSimpleEventEmail({
      to,
      subject: '✅ KRAM test email',
      title: 'Тестовий email KRAM',
      message: 'Якщо ви бачите цей лист, email-провайдер налаштовано правильно.',
      ctaUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://kram-auction.vercel.app',
      ctaLabel: 'Відкрити KRAM'
    })

    return NextResponse.json({ success: true, status: getEmailProviderStatus() })
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 })
    }
    console.error('Test email error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
