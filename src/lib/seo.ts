import { absoluteUrl, siteUrl } from '@/lib/site-url'
import { formatPrice } from '@/lib/utils'

type ListingForSeo = {
  id: string
  title: string
  description: string | null
  images: string
  currentPrice: number
  city: string | null
  condition: string | null
  status: string
  createdAt?: Date
  endsAt?: Date
  category?: { name: string | null; slug?: string | null } | null
  seller?: { name: string | null; rating?: number | null; reviewsCount?: number | null; verified?: boolean | null } | null
}

export function parseListingImages(images: string | null | undefined): string[] {
  try {
    const parsed = JSON.parse(images || '[]')
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string' && item.length > 0) : []
  } catch {
    return []
  }
}

export function listingSeoDescription(lot: Pick<ListingForSeo, 'title' | 'description' | 'city' | 'category' | 'currentPrice'>) {
  const raw = (lot.description || lot.title).replace(/\s+/g, ' ').trim()
  const base = raw.length > 130 ? `${raw.slice(0, 127).trim()}…` : raw
  const details = [lot.category?.name, lot.city, formatPrice(lot.currentPrice)].filter(Boolean).join(' · ')
  return details ? `${base} ${details}. Прямі домовленості на KRAM.`.slice(0, 180) : `${base} Прямі домовленості на KRAM.`.slice(0, 180)
}

export function listingJsonLd(lot: ListingForSeo) {
  const images = parseListingImages(lot.images)
  const url = absoluteUrl(`/lot/${lot.id}`)
  const rating = lot.seller?.reviewsCount && lot.seller.reviewsCount > 0 && lot.seller.rating
    ? {
        '@type': 'AggregateRating' as const,
        ratingValue: Number(lot.seller.rating.toFixed(1)),
        reviewCount: lot.seller.reviewsCount,
      }
    : undefined

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: lot.title,
    description: listingSeoDescription(lot),
    image: images.length > 0 ? images : [absoluteUrl('/kram-mark.svg')],
    category: lot.category?.name || 'Онлайн-торги',
    sku: lot.id,
    brand: {
      '@type': 'Brand',
      name: 'KRAM',
    },
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'UAH',
      price: lot.currentPrice,
      availability: lot.status === 'active' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: conditionToSchema(lot.condition),
      seller: {
        '@type': 'Person',
        name: lot.seller?.name || 'KRAM seller',
      },
    },
    aggregateRating: rating,
  }
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'KRAM',
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${absoluteUrl('/catalog')}?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'KRAM',
    url: siteUrl,
    logo: absoluteUrl('/kram-mark.svg'),
    sameAs: [process.env.NEXT_PUBLIC_TELEGRAM_URL || 'https://t.me/kram_auction'],
  }
}

export function lotBreadcrumbJsonLd(lot: Pick<ListingForSeo, 'title' | 'category'>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Головна', item: absoluteUrl('/') },
      { '@type': 'ListItem', position: 2, name: 'Каталог', item: absoluteUrl('/catalog') },
      ...(lot.category?.name ? [{ '@type': 'ListItem' as const, position: 3, name: lot.category.name, item: absoluteUrl(`/catalog?category=${lot.category.slug || ''}`) }] : []),
      { '@type': 'ListItem', position: lot.category?.name ? 4 : 3, name: lot.title },
    ],
  }
}

function conditionToSchema(condition: string | null | undefined) {
  switch (condition) {
    case 'new':
      return 'https://schema.org/NewCondition'
    case 'like_new':
      return 'https://schema.org/LikeNewCondition'
    case 'for_parts':
      return 'https://schema.org/DamagedCondition'
    default:
      return 'https://schema.org/UsedCondition'
  }
}
