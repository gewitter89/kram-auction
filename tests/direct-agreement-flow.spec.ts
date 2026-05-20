import { test, expect } from '@playwright/test'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function login(page: any, email: string, password: string) {
  await page.goto('/auth/login')
  await page.fill('input[type="email"]', email)
  await page.fill('input[type="password"]', password)
  await page.click('button[type="submit"]')
  await page.waitForURL((url: URL) => url.pathname === '/' || url.pathname === '/cabinet')
}

test.describe('direct agreement transaction flow', () => {
  test.skip(!process.env.DATABASE_URL, 'DATABASE_URL is required for DB-backed transaction E2E')
  const stamp = Date.now()
  const password = 'test_password_123'
  const hashedPassword = bcrypt.hashSync(password, 10)
  const sellerEmail = `direct_seller_${stamp}@kram-test.com`
  const buyerEmail = `direct_buyer_${stamp}@kram-test.com`
  let sellerId = ''
  let buyerId = ''
  let listingId = ''
  let transactionId = ''

  test.beforeAll(async () => {
    let category = await prisma.category.findFirst()
    if (!category) {
      category = await prisma.category.create({ data: { name: 'Електроніка', slug: `electronics-${stamp}`, icon: 'Laptop' } })
    }

    const seller = await prisma.user.create({
      data: { name: 'Direct Seller', email: sellerEmail, passwordHash: hashedPassword, verified: true, verificationStatus: 'VERIFIED' }
    })
    sellerId = seller.id

    const buyer = await prisma.user.create({
      data: { name: 'Direct Buyer', email: buyerEmail, passwordHash: hashedPassword, verified: true, verificationStatus: 'VERIFIED' }
    })
    buyerId = buyer.id

    const listing = await prisma.listing.create({
      data: {
        title: `Direct Agreement QA Lot ${stamp}`,
        description: 'QA lot for direct agreement transaction flow.',
        images: JSON.stringify(['https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg']),
        categoryId: category.id,
        sellerId,
        condition: 'used',
        city: 'Київ',
        type: 'buy_now',
        startPrice: 1200,
        currentPrice: 1200,
        buyNowPrice: 1500,
        minIncrement: 50,
        endsAt: new Date(Date.now() + 86400000),
        status: 'active',
      }
    })
    listingId = listing.id
  })

  test.afterAll(async () => {
    if (transactionId) {
      await prisma.transactionEvent.deleteMany({ where: { transactionId } })
      await prisma.paymentRelease.deleteMany({ where: { transactionId } })
      await prisma.payment.deleteMany({ where: { transactionId } })
      await prisma.transaction.deleteMany({ where: { id: transactionId } })
    }
    if (listingId) {
      await prisma.bid.deleteMany({ where: { listingId } })
      await prisma.listing.deleteMany({ where: { id: listingId } })
    }
    await prisma.user.deleteMany({ where: { id: { in: [sellerId, buyerId].filter(Boolean) } } })
    await prisma.$disconnect()
  })

  test('buy-now creates no-escrow direct agreement and advances through shipment to completion', async ({ browser }) => {
    const buyerContext = await browser.newContext()
    const buyerPage = await buyerContext.newPage()
    await login(buyerPage, buyerEmail, password)

    const buyRes = await buyerPage.request.post('/api/buy', { data: { listingId } })
    expect(buyRes.ok()).toBeTruthy()
    const buyJson = await buyRes.json()
    transactionId = buyJson.transactionId
    expect(transactionId).toBeTruthy()

    let tx = await prisma.transaction.findUniqueOrThrow({ where: { id: transactionId } })
    expect(tx.status).toBe('PENDING_PAYMENT')
    expect(tx.paymentStatus).toBe('NOT_PAID')

    const termsRes = await buyerPage.request.post(`/api/transactions/${transactionId}/mark-paid`)
    expect(termsRes.ok()).toBeTruthy()
    tx = await prisma.transaction.findUniqueOrThrow({ where: { id: transactionId } })
    expect(tx.status).toBe('TERMS_AGREED')
    expect(tx.paymentStatus).toBe('NOT_PAID')

    const sellerContext = await browser.newContext()
    const sellerPage = await sellerContext.newPage()
    await login(sellerPage, sellerEmail, password)

    const shipRes = await sellerPage.request.post(`/api/transactions/${transactionId}/ship`, {
      data: { trackingNumber: '20400000000001', deliveryProvider: 'Nova Poshta' }
    })
    expect(shipRes.ok()).toBeTruthy()
    tx = await prisma.transaction.findUniqueOrThrow({ where: { id: transactionId } })
    expect(tx.status).toBe('SELLER_SHIPPED')
    expect(tx.paymentStatus).toBe('NOT_PAID')
    expect(tx.trackingNumber).toBe('20400000000001')

    const confirmRes = await buyerPage.request.post(`/api/transactions/${transactionId}/confirm-received`)
    expect(confirmRes.ok()).toBeTruthy()
    tx = await prisma.transaction.findUniqueOrThrow({ where: { id: transactionId } })
    expect(tx.status).toBe('COMPLETED')
    expect(tx.paymentStatus).toBe('NOT_PAID')

    const releases = await prisma.paymentRelease.count({ where: { transactionId } })
    expect(releases).toBe(0)

    await buyerContext.close()
    await sellerContext.close()
  })
})
