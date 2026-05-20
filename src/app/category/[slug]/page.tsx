import { Suspense } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import CatalogContent from '@/components/catalog/CatalogContent'
import { absoluteUrl } from '@/lib/site-url'
import { getLaunchCategory, launchCategories } from '@/lib/categories'

export function generateStaticParams() {
  return launchCategories.map(category => ({ slug: category.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const category = getLaunchCategory(slug)
  if (!category) return { title: 'Категорію не знайдено | KRAM', robots: { index: false, follow: false } }

  const title = `${category.name} — аукціони та оголошення | KRAM`
  const description = `${category.description} KRAM фіксує ставки й домовленості, оплату та доставку сторони погоджують напряму.`
  const url = absoluteUrl(`/category/${category.slug}`)

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      type: 'website',
      url,
      siteName: 'KRAM',
      locale: 'uk_UA',
      images: [{ url: absoluteUrl('/kram-mark.svg'), alt: 'KRAM', width: 512, height: 512 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [absoluteUrl('/kram-mark.svg')],
    },
  }
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const category = getLaunchCategory(slug)
  if (!category) notFound()

  return (
    <div className="min-h-screen bg-[#FAFBFD]">
      <section className="bg-white border-b border-[#E2E8F0]">
        <div className="max-w-[1320px] mx-auto px-4 py-10">
          <div className="text-[12px] text-[#94A3B8] font-semibold mb-3">
            Головна / Категорії / {category.name}
          </div>
          <div className="max-w-3xl">
            <h1 className="text-[30px] md:text-[38px] font-extrabold text-[#0B1220] tracking-tight mb-3">
              {category.name} на KRAM
            </h1>
            <p className="text-[15px] text-[#475569] leading-relaxed">
              {category.description} Робіть ставки, зберігайте переписку в KRAM і домовляйтесь про оплату та доставку напряму.
            </p>
          </div>
        </div>
      </section>
      <Suspense fallback={<div className="max-w-[1320px] mx-auto px-4 py-10 text-[#64748B]">Завантаження лотів...</div>}>
        <CatalogContent initialCategory={category.slug} />
      </Suspense>
    </div>
  )
}
