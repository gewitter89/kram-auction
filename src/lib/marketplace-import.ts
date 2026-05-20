import { fetchOlxListing, type OlxImportedListing, OLX_URL_RE } from '@/lib/olx-import'

export type MarketplaceProvider = 'olx' | 'prom' | 'generic'

export type MarketplaceImportedListing = OlxImportedListing & {
  provider: MarketplaceProvider
  sourceUrl: string
  sourceLabel: string
}

function stripHtml(input: string) {
  return input
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

function meta(html: string, key: string) {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${escaped}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i'),
    new RegExp(`<meta[^>]+name=["']${escaped}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${escaped}["'][^>]*>`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${escaped}["'][^>]*>`, 'i'),
  ]
  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match?.[1]) return decode(match[1])
  }
  return ''
}

function decode(value: string) {
  return value
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim()
}

function parseJsonLd(html: string) {
  const blocks = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
  for (const block of blocks) {
    try {
      const parsed = JSON.parse(block[1].trim())
      const queue = Array.isArray(parsed) ? [...parsed] : [parsed]
      while (queue.length) {
        const item = queue.shift()
        if (!item || typeof item !== 'object') continue
        if (item['@graph']) queue.push(...(Array.isArray(item['@graph']) ? item['@graph'] : [item['@graph']]))
        const type = String(item['@type'] || '').toLowerCase()
        if (type.includes('product') || item.offers) return item
      }
    } catch {}
  }
  return null
}

function numberFromPrice(value: unknown) {
  const raw = String(value || '').replace(/\s/g, '').replace(',', '.')
  const match = raw.match(/\d+(?:\.\d+)?/)
  return match ? Math.max(1, Math.round(Number(match[0]))) : 0
}

function mapGenericCategory(title: string, description: string) {
  const text = `${title} ${description}`.toLowerCase()
  if (text.includes('iphone') || text.includes('samsung') || text.includes('телефон') || text.includes('смартфон')) return { slug: 'phones', name: 'Телефони' }
  if (text.includes('ноутбук') || text.includes('macbook') || text.includes('laptop') || text.includes('комп')) return { slug: 'laptops', name: 'Ноутбуки та ПК' }
  if (text.includes('playstation') || text.includes('xbox') || text.includes('nintendo') || text.includes('гра') || text.includes('консол')) return { slug: 'games', name: 'Ігри' }
  if (text.includes('дитяч') || text.includes('дитин') || text.includes('розмір')) return { slug: 'kids', name: 'Дитячі товари' }
  if (text.includes('одяг') || text.includes('взут') || text.includes('кросів') || text.includes('сандал') || text.includes('шорт')) return { slug: 'fashion', name: 'Одяг' }
  if (text.includes('інструмент') || text.includes('дриль') || text.includes('пила')) return { slug: 'tools', name: 'Інструменти' }
  if (text.includes('книга')) return { slug: 'books', name: 'Книги' }
  if (text.includes('спорт') || text.includes('велосипед')) return { slug: 'sport', name: 'Спорт' }
  if (text.includes('авто') || text.includes('шина') || text.includes('диск')) return { slug: 'auto', name: 'Авто' }
  if (text.includes('дім') || text.includes('мебл') || text.includes('кухн')) return { slug: 'home', name: 'Дім' }
  return { slug: 'electronics', name: 'Електроніка' }
}

function providerFromUrl(url: string): MarketplaceProvider {
  const host = new URL(url).hostname.replace(/^www\./, '')
  if (host.endsWith('olx.ua') && OLX_URL_RE.test(url)) return 'olx'
  if (host.endsWith('prom.ua')) return 'prom'
  return 'generic'
}

export async function fetchMarketplaceListing(sourceUrl: string): Promise<MarketplaceImportedListing> {
  let url: URL
  try { url = new URL(sourceUrl.trim()) } catch { throw new Error('INVALID_MARKETPLACE_URL') }
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('INVALID_MARKETPLACE_URL')

  const provider = providerFromUrl(url.toString())
  if (provider === 'olx') {
    const item = await fetchOlxListing(url.toString())
    return { ...item, provider: 'olx', sourceUrl: item.olxUrl, sourceLabel: 'OLX' }
  }

  const response = await fetch(url.toString(), {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; KRAM Import/1.0; +https://kram-auction.vercel.app)',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'uk-UA,uk;q=0.9,en;q=0.8',
    },
    next: { revalidate: 0 },
  })
  if (!response.ok) throw new Error('MARKETPLACE_FETCH_FAILED')

  const html = await response.text()
  const jsonLd = parseJsonLd(html)
  const title = String(
    jsonLd?.name || meta(html, 'og:title') || meta(html, 'twitter:title') || html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || 'Імпортований лот'
  ).replace(/\s+/g, ' ').slice(0, 120).trim()

  const rawDescription = String(jsonLd?.description || meta(html, 'og:description') || meta(html, 'description') || '').replace(/\s+/g, ' ').trim()
  const sourceDescription = stripHtml(rawDescription || title).slice(0, 1200)
  const imageCandidate = jsonLd?.image || meta(html, 'og:image') || meta(html, 'twitter:image')
  const photos = (Array.isArray(imageCandidate) ? imageCandidate : [imageCandidate])
    .map(item => typeof item === 'string' ? item : item?.url)
    .filter(Boolean)
    .map((item: string) => {
      try { return new URL(item, url.origin).toString() } catch { return '' }
    })
    .filter(Boolean)
    .slice(0, 8)

  const offer = Array.isArray(jsonLd?.offers) ? jsonLd.offers[0] : jsonLd?.offers
  const price = numberFromPrice(offer?.price || meta(html, 'product:price:amount') || meta(html, 'og:price:amount') || html.match(/([0-9][0-9\s]{1,12})(?:₴|грн|UAH)/i)?.[1]) || 1
  const mappedCategory = mapGenericCategory(title, sourceDescription)
  const sourceLabel = provider === 'prom' ? 'Prom.ua' : url.hostname.replace(/^www\./, '')
  const city = 'Київ'
  const description = `${sourceDescription}\n\nІмпортовано з ${sourceLabel}: ${url.toString()}\nОплата та доставка узгоджуються напряму між сторонами; KRAM фіксує лот, ставки та повідомлення.`.slice(0, 2000)
  const startPrice = Math.max(1, Math.round(price * 0.8))

  return {
    provider,
    sourceUrl: url.toString(),
    sourceLabel,
    olxUrl: url.toString(),
    offerId: Math.abs(hashCode(url.toString())),
    title,
    description,
    sourceDescription,
    price,
    condition: 'used',
    conditionLabel: 'Потребує уточнення',
    city,
    locationLabel: city,
    photos,
    categorySlug: mappedCategory.slug,
    categoryName: mappedCategory.name,
    startPrice,
    minIncrement: price >= 1000 ? 50 : 20,
  }
}

function hashCode(value: string) {
  let hash = 0
  for (let i = 0; i < value.length; i++) hash = ((hash << 5) - hash) + value.charCodeAt(i) | 0
  return hash
}
