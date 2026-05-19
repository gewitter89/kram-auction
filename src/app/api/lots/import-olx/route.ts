import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth-config'
import { ensureCoreCategories } from '@/lib/marketplace-checks'
import { analyzeListingRisk } from '@/lib/listing-risk'
import { assertUserAllowed, restrictionErrorMessage } from '@/lib/user-restrictions'
import { notifyNewLot } from '@/lib/telegram'
import { notifySavedSearchMatches } from '@/lib/saved-searches'
import { fetchOlxListing } from '@/lib/olx-import'

export async function POST(request: Request) {
  try {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) return NextResponse.json({ error: 'Необхідна авторизація' }, { status: 401 })

    await assertUserAllowed(userId, 'sell')

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { verified: true } })
    const publishImmediately = Boolean(user?.verified)
    const body = await request.json().catch(() => ({}))
    const olxUrl = typeof body.olxUrl === 'string' ? body.olxUrl.trim() : ''

    let imported
    try {
      imported = await fetchOlxListing(olxUrl)
    } catch (error) {
      const code = error instanceof Error ? error.message : ''
      if (code === 'INVALID_OLX_URL') return NextResponse.json({ error: 'Вкажіть коректне посилання на OLX-оголошення.' }, { status: 400 })
      return NextResponse.json({ error: 'Не вдалося прочитати оголошення OLX.' }, { status: 502 })
    }

    const existing = await prisma.listing.findFirst({
      where: { sellerId: userId, description: { contains: imported.olxUrl } },
      select: { id: true, status: true },
    })
    if (existing) return NextResponse.json({ success: true, id: existing.id, status: existing.status, alreadyExists: true })

    let category = await prisma.category.findFirst({ where: { OR: [{ slug: imported.categorySlug }, { name: imported.categoryName }] } })
    if (!category) {
      await ensureCoreCategories()
      category = await prisma.category.findFirst({ where: { OR: [{ slug: imported.categorySlug }, { name: imported.categoryName }] } })
    }
    if (!category) category = await prisma.category.findFirst()
    if (!category) return NextResponse.json({ error: 'Категорії не налаштовані.' }, { status: 500 })

    const startPrice = Math.max(1, Number(body.startPrice || imported.startPrice))
    const buyNowPrice = Number(body.buyNowPrice || imported.price || startPrice)
    const minIncrement = Math.max(1, Number(body.minIncrement || imported.minIncrement))
    const duration = Math.min(30, Math.max(1, Number(body.duration || 7)))
    const existingListingsCount = await prisma.listing.count({ where: { sellerId: userId } })
    const risk = analyzeListingRisk({ title: imported.title, description: imported.description, startPrice, buyNowPrice, images: imported.photos, existingListingsCount })
    const moderationReasons = publishImmediately ? [] : [...risk.reasons]
    if (!publishImmediately && !moderationReasons.includes('Імпорт з OLX потребує перевірки модератором')) moderationReasons.push('Імпорт з OLX потребує перевірки модератором')

    const listing = await prisma.listing.create({
      data: {
        title: imported.title,
        description: imported.description,
        images: JSON.stringify(imported.photos),
        categoryId: category.id,
        sellerId: userId,
        condition: imported.condition,
        city: imported.city,
        type: 'both',
        startPrice,
        currentPrice: startPrice,
        buyNowPrice,
        reservePrice: buyNowPrice,
        minIncrement,
        duration,
        delivery: 'nova_poshta',
        featured: false,
        endsAt: new Date(Date.now() + duration * 24 * 60 * 60 * 1000),
        status: publishImmediately ? 'active' : 'pending_review',
      },
      select: { id: true, status: true, title: true, startPrice: true },
    })

    if (publishImmediately) {
      notifyNewLot({ title: listing.title, startPrice: listing.startPrice, id: listing.id }).catch(console.error)
      notifySavedSearchMatches(listing.id).catch(console.error)
      await prisma.notification.create({ data: { userId, type: 'listing_imported', title: 'Лот опубліковано', message: `Лот "${listing.title}" імпортовано з OLX та опубліковано у каталозі.`, listingId: listing.id } }).catch(() => {})
    } else {
      await prisma.report.create({ data: { userId, listingId: listing.id, reason: 'listing_moderation_required', comment: JSON.stringify({ reasons: moderationReasons, source: 'olx_import', olxUrl: imported.olxUrl, offerId: imported.offerId }), status: 'pending' } }).catch(() => {})
      await prisma.notification.create({ data: { userId, type: 'listing_pending_review', title: 'Лот імпортовано з OLX', message: `Лот "${listing.title}" створено та відправлено на модерацію.`, listingId: listing.id } }).catch(() => {})
    }

    return NextResponse.json({
      success: true,
      id: listing.id,
      status: listing.status,
      pendingReview: !publishImmediately,
      moderationReasons,
      imported: { olxUrl: imported.olxUrl, offerId: imported.offerId, photos: imported.photos.length, price: imported.price, category: imported.categoryName },
    }, { status: 201 })
  } catch (error) {
    const restrictionMessage = restrictionErrorMessage(error)
    if (restrictionMessage) return NextResponse.json({ error: restrictionMessage }, { status: 403 })
    console.error('OLX import error:', error)
    return NextResponse.json({ error: 'Помилка імпорту OLX-оголошення' }, { status: 500 })
  }
}
