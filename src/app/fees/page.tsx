import { FeesPageContent } from '@/components/fees/FeesPageContent'

export const metadata = {
  title: 'Тарифи KRAM | Безкоштовний Beta-запуск',
  description: 'Усі функції KRAM, створення лотів та ставки є повністю безкоштовними. Ми не стягуємо комісій та не приймаємо платежі під час Beta-тестування.',
  keywords: ['тарифи kram', 'безкоштовні лоти', 'безкоштовний аукціон', 'комісія 0%', 'beta kram', 'прямі угоди'],
}

export default function FeesPage() {
  return <FeesPageContent />
}
