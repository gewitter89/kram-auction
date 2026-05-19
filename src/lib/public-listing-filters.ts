export const seedListingTitleFilters = [
  { title: { contains: 'Smoke Test', mode: 'insensitive' as const } },
  { title: { contains: 'QA', mode: 'insensitive' as const } },
  { title: { contains: 'Test', mode: 'insensitive' as const } },
]

export function publicActiveListingWhere(includeSeed = false) {
  return {
    status: 'active',
    ...(includeSeed ? {} : { NOT: seedListingTitleFilters }),
  }
}
