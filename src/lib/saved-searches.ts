import { prisma } from '@/lib/prisma'

export type SavedSearchFilters = {
  search?: string
  category?: string
  minPrice?: string
  maxPrice?: string
  city?: string
  condition?: string
  type?: string
}

export function normalizeSavedSearch(filters: SavedSearchFilters) {
  const normalized: SavedSearchFilters = {}
  for (const [key, value] of Object.entries(filters)) {
    const v = typeof value === 'string' ? value.trim() : ''
    if (v && v !== 'all') normalized[key as keyof SavedSearchFilters] = v.slice(0, 100)
  }
  return normalized
}

export function savedSearchMatchesLot(filters: SavedSearchFilters, lot: any) {
  const title = `${lot.title || ''} ${lot.description || ''}`.toLowerCase()
  if (filters.search && !title.includes(filters.search.toLowerCase())) return false
  if (filters.category && lot.category?.slug !== filters.category && lot.categoryId !== filters.category) return false
  if (filters.city && String(lot.city || '').toLowerCase() !== filters.city.toLowerCase()) return false
  if (filters.condition && lot.condition !== filters.condition) return false
  if (filters.type) {
    if (filters.type === 'auction' && !['auction', 'both'].includes(lot.type)) return false
    if (filters.type === 'buy_now' && !['buy_now', 'both'].includes(lot.type)) return false
    if (filters.type === 'both' && lot.type !== 'both') return false
  }
  if (filters.minPrice && Number(lot.currentPrice || lot.startPrice || 0) < Number(filters.minPrice)) return false
  if (filters.maxPrice && Number(lot.currentPrice || lot.startPrice || 0) > Number(filters.maxPrice)) return false
  return true
}

export async function notifySavedSearchMatches(lotId: string) {
  const lot = await prisma.listing.findUnique({
    where: { id: lotId },
    include: { category: { select: { slug: true, name: true } } }
  })
  if (!lot || lot.status !== 'active') return

  const saved = await prisma.report.findMany({
    where: { reason: 'saved_search', status: 'reviewed' },
    select: { id: true, userId: true, comment: true },
    take: 500,
  })

  for (const item of saved) {
    if (!item.userId || !item.comment) continue
    try {
      const parsed = JSON.parse(item.comment)
      if (!savedSearchMatchesLot(parsed.filters || {}, lot)) continue
      await prisma.notification.create({
        data: {
          userId: item.userId,
          type: 'saved_search_match',
          title: 'Новий лот за вашим пошуком',
          message: `Зʼявився лот "${lot.title}", який відповідає вашому збереженому пошуку.`,
          listingId: lot.id,
        }
      })
    } catch {}
  }
}
