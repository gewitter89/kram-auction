import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth-config'
import { ensureCoreCategories } from '@/lib/marketplace-checks'
import { analyzeListingRisk } from '@/lib/listing-risk'
import { assertUserAllowed, restrictionErrorMessage } from '@/lib/user-restrictions'

const OLX_URL_RE = /^https:\/\/www\.olx\.ua\/d\/uk\/obyavlenie\/[a-z0-9-]+-ID([0-9A-Za-z]+)\.html/i
const BASE62 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

function decodeOlxId(code: string) {
  let value = 0
  for (const ch of code) {
    const idx = BASE62.indexOf(ch)
    if (idx === -1) throw new Error('Invalid OLX id')
    value = value * 62 + idx
  }
  return value
}

function stripHtml(input: string) {
  return input
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function normalizeOlxImage(link: string) {
  return link.replace('{width}', '1000').replace('{height}', '1000').replace(':443', '')
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) {
      return NextResponse.json({ error: 'Необхідна авторизація' }, { status: 401 })
    }

    await assertUserAllowed(userId, 'sell')

    const body = await request.json().catch(() => ({}))
    const olxUrl = typeof body.olxUrl === 'string' ? body.olxUrl.trim() : ''
    const match = olxUrl.match(OLX_URL_RE)
    if (!match) {
      return NextResponse.json({ error: 'Вкажіть коректне посилання на OLX-оголошення.' }, { status: 400 })
    }

    const offerId = decodeOlxId(match[1])
    const response = await fetch(`https://www.olx.ua/api/v1/offers/${offerId}`, {
      headers: {
        'User-Agent': 'OLX/5.91.3 (Android 13; KRAM Import)',
        'Accept': 'application/json',
        'Accept-Language': 'uk-UA,uk;q=0.9,en;q=0.8',
      },
      next: { revalidate: 0 },
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Не вдалося прочитати оголошення OLX.' }, { status: 502 })
    }

    const payload = await response.json()
    const offer = payload?.data
    if (!offer?.title) {
      return NextResponse.json({ error: 'OLX не повернув дані оголошення.' }, { status: 502 })
    }

    const priceParam = Array.isArray(offer.params)
      ? offer.params.find((p: any) => p?.key === 'price')
      : null
    const price = Number(priceParam?.value?.value || body.startPrice || 1)
    const stateParam = Array.isArray(offer.params)
      ? offer.params.find((p: any) => p?.key === 'state')
      : null
    const stateKey = stateParam?.value?.key
    const condition = stateKey === 'new' ? 'new' : 'used'

    const photos = Array.isArray(offer.photos)
      ? offer.photos.map((p: any) => p?.link).filter(Boolean).map(normalizeOlxImage).slice(0, 8)
      : []

    const title = String(offer.title).slice(0, 120)
    const city = String(offer.location?.city?.name || body.city || 'Київ').slice(0, 50)
    const district = offer.location?.district?.name ? `, ${offer.location.district.name} район` : ''
    const sourceDescription = stripHtml(String(offer.description || ''))
    const description = `${sourceDescription}\n\nІмпортовано з OLX-оголошення власника: ${olxUrl}\nЛокація: ${city}${district}.\nОплата та доставка узгоджуються напряму між сторонами; KRAM фіксує лот, ставки та повідомлення.`.slice(0, 2000)

    let category = await prisma.category.findFirst({
      where: { OR: [{ slug: 'fashion' }, { name: 'Одяг' }, { slug: 'kids' }, { name: 'Дитячі товари' }] }
    })
    if (!category) {
      await ensureCoreCategories()
      category = await prisma.category.findFirst({
        where: { OR: [{ slug: 'fashion' }, { name: 'Одяг' }, { slug: 'kids' }, { name: 'Дитячі товари' }] }
      })
    }
    if (!category) category = await prisma.category.findFirst()
    if (!category) {
      return NextResponse.json({ error: 'Категорії не налаштовані.' }, { status: 500 })
    }

    const existing = await prisma.listing.findFirst({
      where: {
        sellerId: userId,
        description: { contains: olxUrl },
      },
      select: { id: true, status: true },
    })
    if (existing) {
      return NextResponse.json({ success: true, id: existing.id, status: existing.status, alreadyExists: true })
    }

    const existingListingsCount = await prisma.listing.count({ where: { sellerId: userId } })
    const risk = analyzeListingRisk({
      title,
      description,
      startPrice: Math.max(1, price),
      buyNowPrice: price || null,
      images: photos,
      existingListingsCount,
    })
    const moderationReasons = [...risk.reasons]
    if (!moderationReasons.includes('Імпорт з OLX потребує перевірки модератором')) {
      moderationReasons.push('Імпорт з OLX потребує перевірки модератором')
    }

    const duration = Number(body.duration || 7)
    const endsAt = new Date(Date.now() + duration * 24 * 60 * 60 * 1000)

    const listing = await prisma.listing.create({
      data: {
        title,
        description,
        images: JSON.stringify(photos),
        categoryId: category.id,
        sellerId: userId,
        condition,
        city,
        type: 'both',
        startPrice: Math.max(1, Number(body.startPrice || Math.max(1, Math.round(price * 0.8)))),
        currentPrice: Math.max(1, Number(body.startPrice || Math.max(1, Math.round(price * 0.8)))),
        buyNowPrice: price || null,
        reservePrice: price || null,
        minIncrement: Number(body.minIncrement || 20),
        duration,
        delivery: 'nova_poshta',
        featured: false,
        endsAt,
        status: 'pending_review',
      },
      select: { id: true, status: true, title: true },
    })

    await prisma.report.create({
      data: {
        userId,
        listingId: listing.id,
        reason: 'listing_moderation_required',
        comment: JSON.stringify({ reasons: moderationReasons, source: 'olx_import', olxUrl, offerId }),
        status: 'pending',
      }
    }).catch(() => {})

    await prisma.notification.create({
      data: {
        userId,
        type: 'listing_pending_review',
        title: 'Лот імпортовано з OLX',
        message: `Лот "${listing.title}" створено та відправлено на модерацію.`,
        listingId: listing.id,
      }
    }).catch(() => {})

    return NextResponse.json({
      success: true,
      id: listing.id,
      status: listing.status,
      pendingReview: true,
      moderationReasons,
      imported: { olxUrl, offerId, photos: photos.length, price },
    }, { status: 201 })
  } catch (error) {
    const restrictionMessage = restrictionErrorMessage(error)
    if (restrictionMessage) return NextResponse.json({ error: restrictionMessage }, { status: 403 })
    console.error('OLX import error:', error)
    return NextResponse.json({ error: 'Помилка імпорту OLX-оголошення' }, { status: 500 })
  }
}
