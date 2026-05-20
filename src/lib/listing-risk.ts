type ListingRiskInput = {
  title: string
  description?: string
  startPrice: number
  buyNowPrice?: number | null
  images?: string[]
  existingListingsCount?: number
  sellerVerified?: boolean
  sellerCompletedDealsCount?: number
  categorySlug?: string | null
}

const RISKY_WORDS = [
  'предоплата', 'передоплата', 'аванс', 'задаток', 'скинь', 'скинути на карту',
  'telegram', 'телеграм', 'viber', 'вайбер', 'whatsapp', 'ватсап',
  'без олх', 'без kram', 'обход', 'карта приват', 'mono', 'monobank',
]

const PROHIBITED_WORDS = [
  'зброя', 'оружие', 'пістолет', 'пистолет', 'автомат', 'патрон', 'боєприпас', 'боеприпас',
  'наркотик', 'канабіс', 'каннабис', 'марихуана', 'амфетамін', 'кокаїн',
  'рецептур', 'антибіотик', 'стероїд', 'стероид', 'ліки', 'лекарство',
  'паспорт', 'водійське посвідчення', 'права', 'база даних',
]

const HIGH_RISK_CATEGORY_SLUGS = new Set(['electronics', 'phones', 'laptops', 'games', 'auto'])
const AUTO_APPROVE_CATEGORY_SLUGS = new Set(['kids', 'fashion', 'home', 'sport', 'tools', 'books', 'collections'])

const HIGH_VALUE_PRICE = 30000
const MEDIUM_VALUE_PRICE = 10000
const LOW_PHOTO_HIGH_VALUE = 10000

export type ListingRiskLevel = 'low' | 'medium' | 'high'
export type ListingModerationDecision = 'auto_approve' | 'manual_review' | 'reject'

export function analyzeListingRisk(input: ListingRiskInput) {
  const reasons: string[] = []
  const warnings: string[] = []
  const blockers: string[] = []
  const text = `${input.title || ''} ${input.description || ''}`.toLowerCase()
  const price = Math.max(Number(input.startPrice || 0), Number(input.buyNowPrice || 0))
  const imageCount = input.images?.length || 0
  const categorySlug = input.categorySlug || null

  if ((input.existingListingsCount || 0) === 0) {
    warnings.push('Перший лот нового продавця')
  }

  if (!input.sellerVerified) {
    blockers.push('Продавець не верифікований')
  }

  if (price >= HIGH_VALUE_PRICE) {
    warnings.push(`Висока вартість лота (${price.toLocaleString('uk-UA')} ₴)`)
  } else if (price >= MEDIUM_VALUE_PRICE && categorySlug && HIGH_RISK_CATEGORY_SLUGS.has(categorySlug)) {
    warnings.push(`Середня/висока вартість у ризиковій категорії (${price.toLocaleString('uk-UA')} ₴)`)
  }

  if (price >= LOW_PHOTO_HIGH_VALUE && imageCount < 2) {
    warnings.push('Дорогий лот має менше 2 фото')
  }

  if (imageCount === 0) {
    blockers.push('Лот без фото')
  } else if (imageCount < 2 && categorySlug && HIGH_RISK_CATEGORY_SLUGS.has(categorySlug)) {
    warnings.push('Ризикова категорія має менше 2 фото')
  }

  if ((input.description || '').trim().length < 40) {
    warnings.push('Короткий опис лота')
  }

  const matchedProhibited = PROHIBITED_WORDS.filter(word => text.includes(word))
  if (matchedProhibited.length > 0) {
    blockers.push(`Можливо заборонений товар/слова: ${matchedProhibited.slice(0, 5).join(', ')}`)
  }

  const matchedWords = RISKY_WORDS.filter(word => text.includes(word))
  if (matchedWords.length > 0) {
    warnings.push(`Підозрілі слова в описі: ${matchedWords.slice(0, 5).join(', ')}`)
  }

  if (categorySlug && HIGH_RISK_CATEGORY_SLUGS.has(categorySlug)) {
    warnings.push('Категорія з підвищеним ризиком шахрайства або підробок')
  }

  reasons.push(...blockers, ...warnings)

  const level: ListingRiskLevel = blockers.length > 0 ? 'high' : warnings.length > 0 ? 'medium' : 'low'

  return {
    requiresModeration: reasons.length > 0,
    level,
    reasons,
    warnings,
    blockers,
    autoApproveEligible: isAutoApproveEligible({ ...input, categorySlug, price, imageCount, blockers, warnings }),
  }
}

function isAutoApproveEligible(input: ListingRiskInput & { price: number; imageCount: number; blockers: string[]; warnings: string[] }) {
  if (!input.sellerVerified) return false
  if (input.blockers.length > 0) return false
  if (input.price >= MEDIUM_VALUE_PRICE) return false
  if (input.imageCount < 2) return false
  if (!input.categorySlug || !AUTO_APPROVE_CATEGORY_SLUGS.has(input.categorySlug)) return false
  if ((input.description || '').trim().length < 60) return false

  const allowedWarnings = new Set(['Перший лот нового продавця'])
  return input.warnings.every(warning => allowedWarnings.has(warning))
}
