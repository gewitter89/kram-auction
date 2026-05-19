export const OLX_URL_RE = /^https:\/\/www\.olx\.ua\/d\/(?:uk\/)?obyavlenie\/[a-z0-9-]+-ID([0-9A-Za-z]+)\.html/i
const BASE62 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

export type OlxImportedListing = {
  olxUrl: string
  offerId: number
  title: string
  description: string
  sourceDescription: string
  price: number
  condition: 'new' | 'used'
  conditionLabel: string
  city: string
  district?: string
  locationLabel: string
  photos: string[]
  categorySlug: string
  categoryName: string
  startPrice: number
  minIncrement: number
}

export function extractOlxOfferId(olxUrl: string) {
  const match = olxUrl.trim().match(OLX_URL_RE)
  if (!match) return null
  let value = 0
  for (const ch of match[1]) {
    const idx = BASE62.indexOf(ch)
    if (idx === -1) return null
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

function mapOlxCategory(offer: any, title: string, description: string) {
  const text = `${title} ${description}`.toLowerCase()
  const olxCategoryId = Number(offer?.category?.id || 0)

  if (text.includes('iphone') || text.includes('samsung') || text.includes('телефон') || text.includes('смартфон')) return { slug: 'phones', name: 'Телефони' }
  if (text.includes('ноутбук') || text.includes('macbook') || text.includes('laptop')) return { slug: 'laptops', name: 'Ноутбуки та ПК' }
  if (text.includes('playstation') || text.includes('xbox') || text.includes('nintendo') || text.includes('консол')) return { slug: 'games', name: 'Ігри' }
  if (text.includes('дитяч') || text.includes('дитин') || text.includes('розмір 3') || olxCategoryId === 541) return { slug: 'kids', name: 'Дитячі товари' }
  if (text.includes('шорти') || text.includes('сукня') || text.includes('одяг') || text.includes('взут')) return { slug: 'fashion', name: 'Одяг' }
  if (text.includes('велосипед') || text.includes('спорт')) return { slug: 'sport', name: 'Спорт' }
  if (text.includes('книга')) return { slug: 'books', name: 'Книги' }
  if (text.includes('інструмент') || text.includes('дриль') || text.includes('пила')) return { slug: 'tools', name: 'Інструменти' }
  if (text.includes('дім') || text.includes('мебл')) return { slug: 'home', name: 'Дім' }
  if (text.includes('авто') || text.includes('шина') || text.includes('диск')) return { slug: 'auto', name: 'Авто' }
  return { slug: 'electronics', name: 'Електроніка' }
}

export async function fetchOlxListing(olxUrl: string): Promise<OlxImportedListing> {
  const offerId = extractOlxOfferId(olxUrl)
  if (!offerId) throw new Error('INVALID_OLX_URL')

  const response = await fetch(`https://www.olx.ua/api/v1/offers/${offerId}`, {
    headers: {
      'User-Agent': 'OLX/5.91.3 (Android 13; KRAM Import)',
      'Accept': 'application/json',
      'Accept-Language': 'uk-UA,uk;q=0.9,en;q=0.8',
    },
    next: { revalidate: 0 },
  })

  if (!response.ok) throw new Error('OLX_FETCH_FAILED')
  const payload = await response.json()
  const offer = payload?.data
  if (!offer?.title) throw new Error('OLX_EMPTY_RESPONSE')

  const priceParam = Array.isArray(offer.params) ? offer.params.find((p: any) => p?.key === 'price') : null
  const price = Number(priceParam?.value?.value || 1)
  const stateParam = Array.isArray(offer.params) ? offer.params.find((p: any) => p?.key === 'state') : null
  const condition = stateParam?.value?.key === 'new' ? 'new' : 'used'
  const conditionLabel = stateParam?.value?.label || (condition === 'new' ? 'Нове' : 'Вживане')
  const photos = Array.isArray(offer.photos) ? offer.photos.map((p: any) => p?.link).filter(Boolean).map(normalizeOlxImage).slice(0, 8) : []

  const title = String(offer.title).slice(0, 120)
  const city = String(offer.location?.city?.name || 'Київ').slice(0, 50)
  const district = offer.location?.district?.name ? String(offer.location.district.name) : undefined
  const sourceDescription = stripHtml(String(offer.description || ''))
  const mappedCategory = mapOlxCategory(offer, title, sourceDescription)
  const locationLabel = district ? `${city}, ${district} район` : city
  const description = `${sourceDescription}\n\nІмпортовано з OLX-оголошення власника: ${olxUrl}\nЛокація: ${locationLabel}.\nОплата та доставка узгоджуються напряму між сторонами; KRAM фіксує лот, ставки та повідомлення.`.slice(0, 2000)
  const startPrice = Math.max(1, Math.round(price * 0.8))

  return {
    olxUrl,
    offerId,
    title,
    description,
    sourceDescription,
    price,
    condition,
    conditionLabel,
    city,
    district,
    locationLabel,
    photos,
    categorySlug: mappedCategory.slug,
    categoryName: mappedCategory.name,
    startPrice,
    minIncrement: price >= 1000 ? 50 : 20,
  }
}
