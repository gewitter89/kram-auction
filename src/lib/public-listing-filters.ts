export const seedListingTitleFilters = [
  { title: { contains: 'Smoke Test', mode: 'insensitive' as const } },
  { title: { contains: 'QA', mode: 'insensitive' as const } },
  { title: { contains: 'Test', mode: 'insensitive' as const } },
  { title: { contains: 'Тестовий', mode: 'insensitive' as const } },
]

export const seedUserEmails = [
  'admin@kram.ua',
  'tech@test.com',
  'apple@test.com',
  'game@test.com',
  'home@test.com',
  'ivan@test.com',
  'maria@test.com',
  'drone@test.com',
  'bike@test.com',
  'alex@test.com',
  'admin@lotva.ua',
  'qa-seller@kram.local',
  'qa-buyer@kram.local',
  'qa-admin@kram.local',
]

export function publicListingSeedExclusion() {
  return {
    NOT: [
      { OR: seedListingTitleFilters },
      { seller: { email: { in: seedUserEmails } } },
    ],
  }
}

export function publicListingWhere(base: Record<string, unknown> = {}, includeSeed = false) {
  return {
    ...base,
    ...(includeSeed ? {} : publicListingSeedExclusion()),
  }
}

export function publicActiveListingWhere(includeSeed = false) {
  return publicListingWhere({ status: 'active' }, includeSeed)
}
