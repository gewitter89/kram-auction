import { prisma } from '@/lib/prisma'
import { getEmailProviderStatus } from '@/lib/email'

export const REQUIRED_CATEGORIES = [
  { name: 'Електроніка', slug: 'electronics', icon: 'Laptop' },
  { name: 'Телефони', slug: 'phones', icon: 'Smartphone' },
  { name: 'Ноутбуки та ПК', slug: 'laptops', icon: 'Monitor' },
  { name: 'Авто', slug: 'auto', icon: 'Car' },
  { name: 'Одяг', slug: 'fashion', icon: 'Shirt' },
  { name: 'Дім', slug: 'home', icon: 'Home' },
  { name: 'Дитячі товари', slug: 'kids', icon: 'Baby' },
  { name: 'Спорт', slug: 'sport', icon: 'Dumbbell' },
  { name: 'Книги', slug: 'books', icon: 'BookOpen' },
  { name: 'Інструменти', slug: 'tools', icon: 'Wrench' },
  { name: 'Ігри', slug: 'games', icon: 'Gamepad' },
  { name: 'Колекції', slug: 'collections', icon: 'Package' },
] as const

export async function ensureCoreCategories() {
  const existing = await prisma.category.findMany({ select: { slug: true } })
  const existingSlugs = new Set(existing.map(category => category.slug))
  const missing = REQUIRED_CATEGORIES.filter(category => !existingSlugs.has(category.slug))

  if (missing.length === 0) return { created: 0 }

  await prisma.category.createMany({
    data: missing.map(category => ({ ...category })),
    skipDuplicates: true,
  })

  return { created: missing.length }
}

export async function getProductionReadiness() {
  const [categories, users, activeLots, pendingReports, expiredActiveLots, adminUsers] = await Promise.all([
    prisma.category.count(),
    prisma.user.count(),
    prisma.listing.count({ where: { status: 'active' } }),
    prisma.report.count({ where: { status: 'pending' } }),
    prisma.listing.count({ where: { status: 'active', endsAt: { lte: new Date() } } }),
    prisma.user.count({ where: { OR: [{ role: 'admin' }, { email: 'admin@kram.ua' }] } }),
  ])

  const cloudinaryConfigured = Boolean(
    process.env.CLOUDINARY_URL ||
    (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
  )

  const emailStatus = getEmailProviderStatus()

  const checks = [
    { key: 'database', label: 'База даних відповідає', ok: true },
    { key: 'categories', label: 'Категорії створені', ok: categories >= REQUIRED_CATEGORIES.length, value: categories },
    { key: 'admin', label: 'Є адміністратор', ok: adminUsers > 0, value: adminUsers },
    { key: 'uploads', label: 'Фото-сховище Cloudinary налаштовано', ok: cloudinaryConfigured },
    { key: 'cron', label: 'CRON_SECRET налаштовано', ok: Boolean(process.env.CRON_SECRET) },
    { key: 'auth', label: 'AUTH_SECRET налаштовано', ok: Boolean(process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET) },
    { key: 'email', label: `Email provider налаштовано (${emailStatus.provider})`, ok: emailStatus.configured },
    { key: 'reports', label: 'Немає черги скарг перед запуском', ok: pendingReports === 0, value: pendingReports },
    { key: 'expired', label: 'Немає прострочених активних аукціонів', ok: expiredActiveLots === 0, value: expiredActiveLots },
  ]

  return {
    ready: checks.every(check => check.ok),
    checks,
    stats: { categories, users, activeLots, pendingReports, expiredActiveLots, adminUsers, email: emailStatus },
  }
}
