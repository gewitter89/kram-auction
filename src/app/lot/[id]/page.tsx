import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { LotPageContent } from '@/components/lot/LotPageContent'
import { auth } from '@/lib/auth-config'

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

  const session = await auth()
  const isOwner = session?.user?.id === lot.sellerId
  const isAdmin = session?.user?.role === 'admin' || session?.user?.email === 'admin@kram.ua'
  if ((lot.status === 'pending_review' || lot.status === 'rejected') && !isOwner && !isAdmin) {
    notFound()
  }

  // Increment views
  await prisma.listing.update({ where: { id }, data: { views: { increment: 1 } } })

  // Query authentic counts for seller trust card
  const [activeListingsCount, completedDealsCount] = await Promise.all([
    prisma.listing.count({ where: { sellerId: lot.seller.id, status: 'active' } }),
    prisma.transaction.count({ where: { sellerId: lot.seller.id, status: 'COMPLETED' } })
  ])

  // Attach authentic metadata to the seller object
  const lotWithSellerMeta = {
    ...lot,
    seller: {
      ...lot.seller,
      activeListingsCount,
      completedDealsCount
    }
  }

  // Get similar lots
  const similar = await prisma.listing.findMany({
    where: { categoryId: lot.categoryId, id: { not: lot.id }, status: 'active' },
    take: 4,
    include: { 
      seller: { select: { name: true, rating: true, verified: true, reviewsCount: true } },
      _count: { select: { bids: true } }
    }
  })

  return <LotPageContent lot={lotWithSellerMeta} similar={similar} />
}

