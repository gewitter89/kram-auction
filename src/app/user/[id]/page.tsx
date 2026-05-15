import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { SellerProfileContent } from '@/components/user/SellerProfileContent'

export default async function SellerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const seller = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true, name: true, image: true, createdAt: true,
      rating: true, verified: true,
      reviewsCount: true,
      reviewsReceived: {
        orderBy: { createdAt: 'desc' },
        take: 50,
        select: {
          id: true, rating: true, text: true, createdAt: true,
          reviewer: { select: { id: true, name: true, image: true } },
          listing: { select: { id: true, title: true } }
        }
      },
      listings: {
        where: { status: { in: ['active', 'ended', 'sold'] } },
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: {
          id: true, title: true, images: true, currentPrice: true,
          status: true, endsAt: true,
          _count: { select: { bids: true } }
        }
      },
      _count: { select: { listings: true, reviewsReceived: true } }
    }
  })

  if (!seller) notFound()

  const soldCount = seller.listings.filter(l => l.status === 'sold').length
  const activeCount = seller.listings.filter(l => l.status === 'active').length

  return (
    <SellerProfileContent
      seller={{ ...seller, soldCount, activeCount }}
    />
  )
}
