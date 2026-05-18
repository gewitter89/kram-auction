'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { LotCard } from '@/components/lots/LotCard'
import { Heart } from 'lucide-react'
import Link from 'next/link'

export default function FavoritesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [favorites, setFavorites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/favorites')
      return
    }
    if (status === 'authenticated') {
      fetch('/api/favorites').then(r => r.json()).then(d => {
        setFavorites(d.favorites || [])
        setLoading(false)
      })
    }
  }, [status, router])

  function transformLot(lot: any) {
    let images: string[] = []
    try { images = JSON.parse(lot.images || '[]') } catch {}
    return {
      id: lot.id,
      title: lot.title,
      currentPrice: lot.currentPrice,
      bids: lot._count?.bids || 0,
      endsAt: lot.endsAt,
      city: lot.city || 'Україна',
      seller: lot.seller?.name || 'Продавець',
      sellerRating: lot.seller?.rating || 0,
      image: images[0] || `https://placehold.co/400x300/F1F5F9/334155?text=${encodeURIComponent(lot.title.slice(0, 20))}`,
      condition: lot.condition,
      type: lot.type,
      delivery: lot.delivery === 'nova_poshta',
      verified: lot.seller?.verified || false,
      featured: lot.featured || false,
    }
  }

  if (status === 'loading' || loading) {
    return <div className="max-w-[1320px] mx-auto px-4 py-8"><div className="text-[14px] text-[#64748B]">Завантаження...</div></div>
  }

  return (
    <div className="max-w-[1320px] mx-auto px-4 py-8">
      <h1 className="text-[24px] font-bold text-[#0B1220] mb-6">Обране</h1>

      {favorites.length === 0 ? (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-12 text-center">
          <div className="w-14 h-14 mx-auto mb-4 bg-[#F8FAFC] rounded-2xl flex items-center justify-center">
            <Heart className="w-6 h-6 text-[#94A3B8]" />
          </div>
          <p className="text-[16px] font-medium text-[#0F172A] mb-2">Обране порожнє</p>
          <p className="text-[13px] text-[#64748B] mb-6">Додавайте лоти в обране натиснувши на серце</p>
          <Link href="/catalog" className="inline-flex h-10 px-5 items-center bg-[#2563EB] text-white rounded-xl text-[14px] font-semibold hover:bg-[#1D4ED8]">
            Перейти в каталог
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {favorites.map(lot => <LotCard key={lot.id} lot={transformLot(lot)} initialFavorite={true} />)}
        </div>
      )}
    </div>
  )
}
