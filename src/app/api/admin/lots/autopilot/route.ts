import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/getCurrentUser'
import { runListingModerationAutopilot } from '@/lib/listing-moderation'

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin()
    const body = await request.json().catch(() => ({}))
    const dryRun = body.dryRun !== false
    const lotId = typeof body.lotId === 'string' ? body.lotId : undefined
    const limit = Number.isFinite(Number(body.limit)) ? Math.min(Math.max(Number(body.limit), 1), 50) : 25

    const result = await runListingModerationAutopilot({
      actorId: admin.id,
      dryRun,
      lotId,
      limit,
    })

    return NextResponse.json({ success: true, dryRun, ...result })
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 })
    }
    console.error('Autopilot moderation error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
