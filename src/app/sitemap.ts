import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
import { absoluteUrl } from '@/lib/site-url'
import { publicActiveListingWhere } from '@/lib/public-listing-filters'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = ['', '/catalog', '/fees', '/safety', '/rules', '/terms', '/privacy', '/support', '/about'].map(path => ({
    url: absoluteUrl(path || '/'),
    lastModified: new Date(),
    changeFrequency: path === '' ? 'daily' as const : 'weekly' as const,
    priority: path === '' ? 1 : 0.7,
  }))

  try {
    const [lots, categories] = await Promise.all([
      prisma.listing.findMany({
        where: publicActiveListingWhere(),
        select: { id: true, createdAt: true, endsAt: true },
        orderBy: { createdAt: 'desc' },
        take: 5000,
      }),
      prisma.category.findMany({ select: { slug: true } }),
    ])

    return [
      ...staticPages,
      ...categories.map(category => ({
        url: absoluteUrl(`/catalog?category=${category.slug}`),
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.6,
      })),
      ...lots.map(lot => ({
        url: absoluteUrl(`/lot/${lot.id}`),
        lastModified: lot.createdAt,
        changeFrequency: new Date(lot.endsAt) > new Date() ? 'hourly' as const : 'weekly' as const,
        priority: 0.8,
      })),
    ]
  } catch (error) {
    console.warn('Sitemap DB fetch failed, returning static sitemap only:', error)
    return staticPages
  }
}
