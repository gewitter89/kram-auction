import { ImageResponse } from 'next/og'
import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'
import { parseListingImages } from '@/lib/seo'

export const runtime = 'edge'
export const alt = 'KRAM lot preview'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const lot = await prisma.listing.findUnique({
    where: { id },
    select: {
      title: true,
      currentPrice: true,
      buyNowPrice: true,
      city: true,
      images: true,
      status: true,
      category: { select: { name: true } },
      seller: { select: { verified: true } },
    },
  })

  const images = parseListingImages(lot?.images)
  const image = images[0]
  const title = lot?.title || 'KRAM — прозорі онлайн-торги'
  const price = lot ? formatPrice(lot.currentPrice) : 'Прозорі ставки'
  const buyNow = lot?.buyNowPrice ? `Купити зараз: ${formatPrice(lot.buyNowPrice)}` : 'Прямі домовленості'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: '#0B1220',
          color: 'white',
          fontFamily: 'Inter, Arial, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #0B1220 0%, #172554 55%, #1D4ED8 100%)' }} />
        <div style={{ position: 'absolute', top: -160, right: -160, width: 420, height: 420, borderRadius: 999, background: 'rgba(37, 99, 235, 0.35)' }} />
        <div style={{ position: 'absolute', bottom: -140, left: -120, width: 360, height: 360, borderRadius: 999, background: 'rgba(16, 185, 129, 0.22)' }} />

        <div style={{ zIndex: 2, display: 'flex', width: '100%', height: '100%', padding: 56, gap: 42 }}>
          <div style={{ flex: 1.05, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 58, height: 58, borderRadius: 16, background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 900 }}>K</div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: 30, fontWeight: 900, letterSpacing: '-0.04em' }}>KRAM</div>
                <div style={{ fontSize: 16, color: '#BFDBFE', fontWeight: 700 }}>Прозорі онлайн-торги</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ padding: '8px 14px', borderRadius: 999, background: 'rgba(255,255,255,0.12)', color: '#DBEAFE', fontSize: 18, fontWeight: 800 }}>{lot?.category?.name || 'Каталог'}</div>
                {lot?.seller.verified && <div style={{ padding: '8px 14px', borderRadius: 999, background: 'rgba(16,185,129,0.18)', color: '#BBF7D0', fontSize: 18, fontWeight: 800 }}>Перевірений продавець</div>}
              </div>
              <div style={{ fontSize: 56, lineHeight: 1.04, fontWeight: 950, letterSpacing: '-0.055em', maxHeight: 180, overflow: 'hidden' }}>{title}</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 18 }}>
                <div style={{ fontSize: 56, fontWeight: 950, color: '#93C5FD', letterSpacing: '-0.05em' }}>{price}</div>
                <div style={{ fontSize: 20, color: '#CBD5E1', marginBottom: 12, fontWeight: 700 }}>{buyNow}</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#CBD5E1', fontSize: 20, fontWeight: 700 }}>
              <div>{lot?.city || 'Україна'} · Оплата напряму між сторонами</div>
              <div>kram-auction.vercel.app</div>
            </div>
          </div>

          <div style={{ width: 430, height: 510, borderRadius: 34, overflow: 'hidden', background: 'rgba(255,255,255,0.1)', border: '2px solid rgba(255,255,255,0.18)', boxShadow: '0 30px 80px rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {image ? (
              <img src={image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ fontSize: 96, fontWeight: 950, color: '#93C5FD' }}>KRAM</div>
            )}
          </div>
        </div>
      </div>
    ),
    size
  )
}
