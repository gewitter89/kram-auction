import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { postDailyDigestToTelegramChannel } from '@/lib/telegram-channel'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const bearer = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  const token = request.headers.get('x-cron-secret') || bearer || request.nextUrl.searchParams.get('secret')
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 })
  if (token !== cronSecret) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const timestamp = new Date().toISOString()

  try {
    const force = request.nextUrl.searchParams.get('force') === '1'
    const result = await postDailyDigestToTelegramChannel({ force })

    await prisma.auditLog.create({
      data: {
        action: result.ok ? 'CRON_DAILY_DIGEST_SUCCESS' : 'CRON_DAILY_DIGEST_SKIPPED',
        metadata: JSON.stringify({ result, force, timestamp }),
      },
    }).catch(() => {})

    return NextResponse.json({ ok: Boolean(result.ok), result, timestamp }, { status: result.ok ? 200 : 200 })
  } catch (error) {
    console.error('Cron daily-digest error:', error)
    await prisma.auditLog.create({
      data: {
        action: 'CRON_DAILY_DIGEST_FAILED',
        metadata: JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error', timestamp }),
      },
    }).catch(() => {})
    return NextResponse.json({ error: 'Server error', timestamp }, { status: 500 })
  }
}
