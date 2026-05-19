import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { normalizeSavedSearch } from '@/lib/saved-searches'

export async function GET() {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const items = await prisma.report.findMany({
    where: { userId, reason: 'saved_search', status: 'reviewed' },
    orderBy: { createdAt: 'desc' },
    select: { id: true, comment: true, createdAt: true },
  })

  return NextResponse.json({
    savedSearches: items.map(item => {
      try { return { id: item.id, createdAt: item.createdAt, ...JSON.parse(item.comment || '{}') } }
      catch { return { id: item.id, createdAt: item.createdAt, label: 'Пошук', filters: {} } }
    })
  })
}

export async function POST(request: Request) {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const filters = normalizeSavedSearch(body.filters || {})
  if (Object.keys(filters).length === 0) return NextResponse.json({ error: 'Оберіть хоча б один фільтр або пошуковий запит' }, { status: 400 })

  const label = String(body.label || filters.search || 'Збережений пошук').slice(0, 80)
  const fingerprint = JSON.stringify(filters)

  const existing = await prisma.report.findFirst({
    where: { userId, reason: 'saved_search', status: 'reviewed', comment: { contains: fingerprint } },
    select: { id: true }
  })
  if (existing) return NextResponse.json({ success: true, id: existing.id, alreadyExists: true })

  const created = await prisma.report.create({
    data: {
      userId,
      listingId: null,
      reason: 'saved_search',
      comment: JSON.stringify({ label, filters, fingerprint }),
      status: 'reviewed',
    },
    select: { id: true }
  })

  return NextResponse.json({ success: true, id: created.id }, { status: 201 })
}

export async function DELETE(request: Request) {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await request.json().catch(() => ({}))
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })
  await prisma.report.updateMany({ where: { id, userId, reason: 'saved_search' }, data: { status: 'dismissed' } })
  return NextResponse.json({ success: true })
}
