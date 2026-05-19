#!/usr/bin/env tsx
import { PrismaClient } from '@prisma/client'
import { getProductionReadiness } from '../src/lib/marketplace-checks'
import { seedUserEmails } from '../src/lib/public-listing-filters'

const prisma = new PrismaClient()

type Check = {
  label: string
  ok: boolean
  detail?: string
  required?: boolean
}

function env(name: string) {
  return process.env[name]?.trim()
}

async function main() {
  const checks: Check[] = []

  checks.push({ label: 'DATABASE_URL configured', ok: Boolean(env('DATABASE_URL')), required: true })
  checks.push({ label: 'AUTH_SECRET/NEXTAUTH_SECRET configured', ok: Boolean(env('AUTH_SECRET') || env('NEXTAUTH_SECRET')), required: true })
  checks.push({ label: 'NEXT_PUBLIC_SITE_URL/NEXT_PUBLIC_APP_URL configured', ok: Boolean(env('NEXT_PUBLIC_SITE_URL') || env('NEXT_PUBLIC_APP_URL')), required: true })
  checks.push({ label: 'CRON_SECRET configured', ok: Boolean(env('CRON_SECRET')), required: true })
  checks.push({
    label: 'Cloudinary configured for production uploads',
    ok: Boolean(env('CLOUDINARY_URL') || (env('CLOUDINARY_CLOUD_NAME') && env('CLOUDINARY_API_KEY') && env('CLOUDINARY_API_SECRET'))),
    required: true,
  })
  checks.push({ label: 'Demo accounts hidden in public UI', ok: env('NEXT_PUBLIC_SHOW_DEMO_ACCOUNTS') !== 'true', detail: `NEXT_PUBLIC_SHOW_DEMO_ACCOUNTS=${env('NEXT_PUBLIC_SHOW_DEMO_ACCOUNTS') || '(unset)'}` })

  try {
    await prisma.$queryRaw`SELECT 1`
    checks.push({ label: 'Database connection works', ok: true, required: true })

    const readiness = await getProductionReadiness()
    for (const check of readiness.checks) {
      checks.push({ label: check.label, ok: check.ok, detail: typeof check.value !== 'undefined' ? String(check.value) : undefined, required: true })
    }

    const [seedUsers, suspiciousLots, seedSellerLots, emptyImagesActiveLots] = await Promise.all([
      prisma.user.count({ where: { email: { in: seedUserEmails } } }),
      prisma.listing.count({ where: { OR: [{ title: { contains: 'Smoke Test', mode: 'insensitive' } }, { title: { contains: 'QA', mode: 'insensitive' } }, { title: { contains: 'Test', mode: 'insensitive' } }, { title: { contains: 'Тестовий', mode: 'insensitive' } }] } }),
      prisma.listing.count({ where: { seller: { email: { in: seedUserEmails } } } }),
      prisma.listing.count({ where: { status: 'active', images: '[]' } }),
    ])

    checks.push({ label: 'No seed/demo users in production DB', ok: seedUsers === 0, detail: String(seedUsers) })
    checks.push({ label: 'No obvious test/smoke listings in production DB', ok: suspiciousLots === 0, detail: String(suspiciousLots) })
    checks.push({ label: 'No listings owned by seed/demo users', ok: seedSellerLots === 0, detail: String(seedSellerLots) })
    checks.push({ label: 'Active listings usually have photos', ok: emptyImagesActiveLots === 0, detail: `${emptyImagesActiveLots} active lots without images`, required: false })
  } catch (error) {
    checks.push({ label: 'Database connection works', ok: false, required: true, detail: error instanceof Error ? error.message : 'Unknown error' })
  } finally {
    await prisma.$disconnect()
  }

  const failedRequired = checks.filter(check => check.required !== false && !check.ok)
  const warnings = checks.filter(check => check.required === false && !check.ok)

  console.log('\nKRAM production preflight')
  console.log('='.repeat(80))
  for (const check of checks) {
    const icon = check.ok ? '✅' : check.required === false ? '⚠️ ' : '❌'
    console.log(`${icon} ${check.label}${check.detail ? ` — ${check.detail}` : ''}`)
  }
  console.log('='.repeat(80))
  console.log(`Required failed: ${failedRequired.length}`)
  console.log(`Warnings: ${warnings.length}`)

  if (failedRequired.length > 0) {
    console.log('\nNot ready for public launch. Fix required checks above, redeploy, then run again.')
    process.exit(1)
  }

  console.log('\nPreflight passed. Run live QA before announcing publicly.')
}

main().catch(async error => {
  console.error('Preflight failed:', error)
  await prisma.$disconnect()
  process.exit(1)
})
