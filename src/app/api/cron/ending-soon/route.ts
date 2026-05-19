import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { absoluteUrl } from '@/lib/site-url'
import { sendSimpleEventEmail } from '@/lib/email'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const bearer = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  const token = request.headers.get('x-cron-secret') || bearer || request.nextUrl.searchParams.get('secret')
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 })
  if (token !== cronSecret) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const now = new Date()
    const until = new Date(Date.now() + 60 * 60 * 1000)
    const listings = await prisma.listing.findMany({
      where: { status: 'active', endsAt: { gt: now, lte: until } },
      include: {
        bids: { select: { userId: true }, distinct: ['userId'] },
        favorites: { select: { userId: true } },
        seller: { select: { id: true } },
      },
      take: 100,
    })

    let notified = 0
    const errors: Array<{ listingId: string; error: string }> = []

    for (const listing of listings) {
      const already = await prisma.auditLog.findFirst({
        where: { action: 'ENDING_SOON_SENT', metadata: { contains: listing.id } },
        select: { id: true }
      })
      if (already) continue

      const userIds = Array.from(new Set([
        ...listing.bids.map(b => b.userId),
        ...listing.favorites.map(f => f.userId),
      ].filter(id => id && id !== listing.seller.id)))

      try {
        const users = await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, email: true, name: true } })
        for (const user of users) {
          await prisma.notification.create({
            data: {
              userId: user.id,
              type: 'ending_soon',
              title: 'Аукціон скоро завершується',
              message: `Лот "${listing.title}" завершується менш ніж за годину.`,
              listingId: listing.id,
            }
          })
          sendSimpleEventEmail({
            to: user.email,
            subject: `⏰ Аукціон скоро завершується — ${listing.title}`,
            title: 'Аукціон скоро завершується',
            message: `Лот "${listing.title}" завершується менш ніж за годину. Якщо він вам цікавий — перевірте поточну ставку.`,
            ctaUrl: absoluteUrl(`/lot/${listing.id}`),
            ctaLabel: 'Перейти до лота'
          }).catch(console.error)
          notified++
        }
        await prisma.auditLog.create({ data: { action: 'ENDING_SOON_SENT', metadata: JSON.stringify({ listingId: listing.id, notified: users.length, timestamp: new Date().toISOString() }) } })
      } catch (error) {
        errors.push({ listingId: listing.id, error: error instanceof Error ? error.message : 'Unknown error' })
      }
    }

    const timestamp = new Date().toISOString()
    await prisma.auditLog.create({ data: { action: errors.length ? 'CRON_ENDING_SOON_PARTIAL' : 'CRON_ENDING_SOON_SUCCESS', metadata: JSON.stringify({ listings: listings.length, notified, errors, timestamp }) } }).catch(() => {})

    return NextResponse.json({ ok: errors.length === 0, listings: listings.length, notified, errors, timestamp })
  } catch (error) {
    console.error('Cron ending-soon error:', error)
    await prisma.auditLog.create({ data: { action: 'CRON_ENDING_SOON_FAILED', metadata: JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error', timestamp: new Date().toISOString() }) } }).catch(() => {})
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
