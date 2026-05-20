import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/getCurrentUser'
import { getTelegramChannelId, postDailyDigestToTelegramChannel, postLatestListingsToTelegramChannel, postListingToTelegramChannel } from '@/lib/telegram-channel'

export async function GET() {
  try {
    await requireAdmin()
    return NextResponse.json({ configured: Boolean(getTelegramChannelId()) })
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 })
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin()
    const body = await request.json().catch(() => ({}))
    const force = body.force === true

    if (body.digest === true) {
      const result = await postDailyDigestToTelegramChannel({ force })
      return NextResponse.json({ success: Boolean(result.ok), result }, { status: result.ok ? 200 : 400 })
    }

    if (typeof body.listingId === 'string' && body.listingId) {
      const result = await postListingToTelegramChannel(body.listingId, { force })
      return NextResponse.json({ success: Boolean(result.ok), result }, { status: result.ok ? 200 : 400 })
    }

    const limit = Number.isFinite(Number(body.limit)) ? Number(body.limit) : 5
    const result = await postLatestListingsToTelegramChannel(limit, { force })
    return NextResponse.json({ success: true, result })
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 })
    }
    console.error('Telegram channel admin error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
