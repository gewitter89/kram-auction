type ListingRiskInput = {
  title: string
  description?: string
  startPrice: number
  buyNowPrice?: number | null
  images?: string[]
  existingListingsCount?: number
}

const RISKY_WORDS = [
  'предоплата', 'передоплата', 'аванс', 'задаток', 'скинь', 'скинути на карту',
  'telegram', 'телеграм', 'viber', 'вайбер', 'whatsapp', 'ватсап',
  'без олх', 'без kram', 'обход', 'карта приват', 'mono', 'monobank',
]

const HIGH_VALUE_PRICE = 30000
const LOW_PHOTO_HIGH_VALUE = 10000

export function analyzeListingRisk(input: ListingRiskInput) {
  const reasons: string[] = []
  const text = `${input.title || ''} ${input.description || ''}`.toLowerCase()
  const price = Math.max(Number(input.startPrice || 0), Number(input.buyNowPrice || 0))
  const imageCount = input.images?.length || 0

  if ((input.existingListingsCount || 0) === 0) {
    reasons.push('Перший лот нового продавця')
  }

  if (price >= HIGH_VALUE_PRICE) {
    reasons.push(`Висока вартість лота (${price.toLocaleString('uk-UA')} ₴)`)
  }

  if (price >= LOW_PHOTO_HIGH_VALUE && imageCount < 2) {
    reasons.push('Дорогий лот має менше 2 фото')
  }

  if (imageCount === 0) {
    reasons.push('Лот без фото')
  }

  const matchedWords = RISKY_WORDS.filter(word => text.includes(word))
  if (matchedWords.length > 0) {
    reasons.push(`Підозрілі слова в описі: ${matchedWords.slice(0, 5).join(', ')}`)
  }

  return {
    requiresModeration: reasons.length > 0,
    reasons,
  }
}
