'use client'

import { Suspense } from 'react'
import CatalogContent from '@/components/catalog/CatalogContent'

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-[14px] text-[#64748B]">Завантаження...</div></div>}>
      <CatalogContent />
    </Suspense>
  )
}
