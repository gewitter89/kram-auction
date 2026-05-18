import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Каталог лотів KRAM',
  description: 'Переглядайте категорії та перші лоти beta-платформи KRAM.',
}

export default function CatalogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
