'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { LotCard } from '@/components/lots/LotCard'

interface AuctionGridProps {
  title: string
  type: 'hot' | 'ending' | 'new'
}

export function AuctionGrid({ title, type }: AuctionGridProps) {
  const [lots, setLots] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const sortMap: Record<string, string> = {
      ending: 'ending',
      hot: 'bids',
      new: 'new'
    }
    fetch(`/api/lots?sort=${sortMap[type]}&limit=4`)
      .then(r => r.json())
      .then(data => {
        setLots(data.lots || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [type])

  if (loading) {
    return (
      <section className="max-w-[1320px] mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 w-48 bg-[#E2E8F0] rounded-lg animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden">
              <div className="aspect-[4/3] bg-[#F1F5F9] animate-pulse"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-[#E2E8F0] rounded animate-pulse w-3/4"></div>
                <div className="h-6 bg-[#E2E8F0] rounded animate-pulse w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (lots.length === 0) return null

  return (
    <section className="max-w-[1320px] mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[20px] font-bold text-[#0F172A]">{title}</h2>
        <Link href="/catalog" className="text-[13px] font-medium text-[#2563EB] hover:underline">
          Дивитись всі →
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {lots.map((lot) => (
          <LotCard key={lot.id} lot={transformLot(lot)} />
        ))}
      </div>
    </section>
  )
}

function transformLot(lot: any) {
  const images = parseImages(lot.images)
  return {
    id: lot.id,
    title: lot.title,
    currentPrice: lot.currentPrice,
    bids: lot._count?.bids || 0,
    endsAt: lot.endsAt,
    city: lot.city || 'Україна',
    seller: lot.seller?.name || 'Продавець',
    sellerRating: lot.seller?.rating || 0,
    sellerReviewsCount: lot.seller?.reviewsCount || 0,
    image: images[0] || '',
    condition: lot.condition,
    type: lot.type,
    delivery: lot.delivery === 'nova_poshta',
    verified: lot.seller?.verified || false,
    featured: lot.featured || false,
  }
}

function parseImages(images: string): string[] {
  try {
    return JSON.parse(images || '[]')
  } catch {
    return []
  }
}
