import { test, expect } from '@playwright/test'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

test.describe('KRAM Real-Time Bidding (SSE/WebSocket Synchronisation)', () => {
  let sellerId: string
  let buyerAId: string
  let buyerBId: string
  let listingId: string

  const sellerEmail = `test_seller_${Date.now()}@kram-test.com`
  const buyerAEmail = `buyer_a_${Date.now()}@kram-test.com`
  const buyerBEmail = `buyer_b_${Date.now()}@kram-test.com`
  const password = 'test_password_123'
  const hashedPassword = bcrypt.hashSync(password, 10)

  test.beforeAll(async () => {
    // 1. Clean up and seed categories if missing
    let category = await prisma.category.findFirst()
    if (!category) {
      category = await prisma.category.create({
        data: { name: 'Електроніка', slug: 'electronics', icon: 'Laptop' }
      })
    }

    // 2. Create 3 active test users: 1 Seller, 2 Buyers
    const seller = await prisma.user.create({
      data: {
        name: 'Герман Селлер',
        email: sellerEmail,
        passwordHash: hashedPassword,
        verified: true,
        role: 'user'
      }
    })
    sellerId = seller.id

    const buyerA = await prisma.user.create({
      data: {
        name: 'Покупець А',
        email: buyerAEmail,
        passwordHash: hashedPassword,
        verified: true,
        role: 'user'
      }
    })
    buyerAId = buyerA.id

    const buyerB = await prisma.user.create({
      data: {
        name: 'Покупець Б',
        email: buyerBEmail,
        passwordHash: hashedPassword,
        verified: true,
        role: 'user'
      }
    })
    buyerBId = buyerB.id

    // 3. Create an active auction lot ending in 2 days
    const listing = await prisma.listing.create({
      data: {
        title: `PlayStation 5 Pro Live SSE Test #${Date.now().toString().slice(-4)}`,
        description: 'Опис тестового лота PlayStation 5 Pro для реалтайм тестів.',
        categoryId: category.id,
        condition: 'like_new',
        city: 'Київ',
        startPrice: 20000,
        currentPrice: 20000,
        minIncrement: 500,
        sellerId: sellerId,
        endsAt: new Date(Date.now() + 1000 * 60 * 60 * 48), // 2 days
        status: 'active',
        images: JSON.stringify(['https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg'])
      }
    })
    listingId = listing.id
  })

  test.afterAll(async () => {
    // Clean up test data to protect production/testing DB state
    await prisma.bid.deleteMany({ where: { listingId } })
    await prisma.listing.delete({ where: { id: listingId } })
    await prisma.user.deleteMany({
      where: {
        id: { in: [sellerId, buyerAId, buyerBId] }
      }
    })
    await prisma.$disconnect()
  })

  test('Buyer B page should update instantly when Buyer A places a bid (Two-Tab Sync Check)', async ({ browser }) => {
    // Context A representing Buyer A
    const contextA = await browser.newContext()
    const pageA = await contextA.newPage()

    // Context B representing Buyer B
    const contextB = await browser.newContext()
    const pageB = await contextB.newPage()

    // 1. Sign in Buyer A in Context A
    await pageA.goto('/auth/login')
    await pageA.fill('input[type="email"]', buyerAEmail)
    await pageA.fill('input[type="password"]', password)
    await pageA.click('button[type="submit"]')
    await pageA.waitForURL(url => url.pathname === '/' || url.pathname === '/cabinet')

    // 2. Sign in Buyer B in Context B
    await pageB.goto('/auth/login')
    await pageB.fill('input[type="email"]', buyerBEmail)
    await pageB.fill('input[type="password"]', password)
    await pageB.click('button[type="submit"]')
    await pageB.waitForURL(url => url.pathname === '/' || url.pathname === '/cabinet')

    // 3. Both navigate to the active listing page
    const lotUrl = `/lot/${listingId}`
    await pageA.goto(lotUrl)
    await pageB.goto(lotUrl)

    // Wait for the lot details to load on both pages
    await expect(pageA.locator('h1')).toContainText('PlayStation 5 Pro')
    await expect(pageB.locator('h1')).toContainText('PlayStation 5 Pro')

    // Verify start price is 20,000 ₴
    await expect(pageA.locator('[data-testid="current-price"]')).toContainText('20 000')
    await expect(pageB.locator('[data-testid="current-price"]')).toContainText('20 000')

    // Inject a special property in Buyer B's window object to prove no page reload occurs
    await pageB.evaluate(() => {
      ;(window as any).testReloadToken = 'stayed_alive'
    })

    // 4. Buyer A places a bid of 21,000 ₴
    await pageA.click('[data-testid="open-bid-modal"]')
    await pageA.fill('input[name="amount"]', '21000')
    await pageA.click('[data-testid="submit-bid"]')

    // Confirm that Buyer A's page updates (shows 21,000 ₴)
    await expect(pageA.locator('[data-testid="current-price"]')).toContainText('21 000')

    // 5. CRITICAL CHECK: Buyer B's page must update INSTANTLY to 21,000 ₴ via SSE/Pusher
    // Without reload, wait for the text to appear
    await expect(pageB.locator('[data-testid="current-price"]')).toContainText('21 000', { timeout: 8000 })

    // 6. PROVE NO PAGE RELOAD HAPPENED
    const reloadToken = await pageB.evaluate(() => (window as any).testReloadToken)
    expect(reloadToken).toBe('stayed_alive')

    // 7. Verify the new bid is listed in Bids History in Buyer B's tab (name is sliced to first 4 chars + ***)
    await expect(pageB.locator('[data-testid="bids-history"]')).toContainText('Поку***')
    await expect(pageB.locator('[data-testid="bids-history"]')).toContainText('21 000')

    // Close page contexts cleanly
    await pageA.close()
    await pageB.close()
    await contextA.close()
    await contextB.close()
  })
})
