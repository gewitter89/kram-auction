export function formatPrice(price: number): string {
  return new Intl.NumberFormat('uk-UA').format(price) + ' ₴'
}

export function formatTimeLeft(endsAt: Date | string): string {
  const end = new Date(endsAt)
  const now = new Date()
  const diff = end.getTime() - now.getTime()

  if (diff <= 0) return 'Завершено'

  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)

  if (days > 0) return `${days}д ${hours}г`
  if (hours > 0) return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function getConditionLabel(condition: string): string {
  const labels: Record<string, string> = {
    new: 'Новий',
    like_new: 'Як новий',
    used: 'Вживаний',
    for_parts: 'На запчастини',
  }
  return labels[condition] || condition
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    active: 'Активний',
    ended: 'Завершено',
    sold: 'Продано',
    cancelled: 'Скасовано',
  }
  return labels[status] || status
}

export function timeAgo(date: Date | string): string {
  const now = new Date()
  const d = new Date(date)
  const diff = now.getTime() - d.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'щойно'
  if (minutes < 60) return `${minutes} хв тому`
  if (hours < 24) return `${hours} год тому`
  if (days < 7) return `${days} дн тому`
  return d.toLocaleDateString('uk-UA')
}
