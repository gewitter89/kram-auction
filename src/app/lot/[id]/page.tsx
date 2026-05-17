import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { LotPageContent } from '@/components/lot/LotPageContent'

export default async function LotPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const lot = await prisma.listing.findUnique({
    where: { id },
    include: {
      seller: { select: { id: true, name: true, rating: true, verified: true, city: true, createdAt: true, reviewsCount: true } },
      category: { select: { name: true, slug: true } },
      bids: {
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: { user: { select: { name: true } } }
      },
    }
  })

  if (!lot) notFound()

  // Increment views
  await prisma.listing.update({ where: { id }, data: { views: { increment: 1 } } })

  // Get similar lots
  const similar = await prisma.listing.findMany({
    where: { categoryId: lot.categoryId, id: { not: lot.id }, status: 'active' },
    take: 4,
    include: { 
      seller: { select: { name: true, rating: true, verified: true } },
      _count: { select: { bids: true } }
    }
  })

  return <LotPageContent lot={lot} similar={similar} />
}
