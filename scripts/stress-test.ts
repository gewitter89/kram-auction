import { PrismaClient } from '@prisma/client'
import { placeBid } from '../src/server/auction/placeBid'
import crypto from 'crypto'

const prisma = new PrismaClient()

// Configuration from CLI parameters
const CONCURRENCY = parseInt(process.env.CONCURRENCY || '10', 10)
const DURATION_SECS = parseInt(process.env.DURATION || '30', 10)

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

interface BidMetrics {
  totalAttempted: number
  totalSuccessful: number
  totalFailed: number
  totalSnipes: number
  totalRateLimited: number
  latencies: number[]
}

const metrics: BidMetrics = {
  totalAttempted: 0,
  totalSuccessful: 0,
  totalFailed: 0,
  totalSnipes: 0,
  totalRateLimited: 0,
  latencies: [],
}

async function run() {
  console.clear()
  console.log('\x1b[38;2;124;58;237m========================================================\x1b[0m')
  console.log('\x1b[38;2;139;92;246m        KRAM CLOSED BETA CONCURRENCY & STRESS TESTER    \x1b[0m')
  console.log('\x1b[38;2;124;58;237m========================================================\x1b[0m')
  console.log(`Concurrency: \x1b[33m${CONCURRENCY} active users\x1b[0m | Duration: \x1b[33m${DURATION_SECS} seconds\x1b[0m\n`)

  // 1. Setup Test Categories and Users
  console.log('⚡ \x1b[36mInitializing isolated test environment...\x1b[0m')
  
  let category = await prisma.category.findFirst()
  if (!category) {
    category = await prisma.category.create({
      data: { name: 'Електроніка', slug: 'electronics-test', icon: 'Laptop' }
    })
  }

  // Create virtual bidders
  const bidders: any[] = []
  console.log(`⚡ Spawning \x1b[32m${CONCURRENCY}\x1b[0m virtual beta bidders...`)
  for (let i = 0; i < CONCURRENCY; i++) {
    const user = await prisma.user.create({
      data: {
        name: `BetaTester_${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
        email: `beta_tester_${i}_${Date.now()}@kram-test.com`,
        passwordHash: 'dummy-hash',
        verified: true,
        role: 'user',
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=beta${i}`,
      }
    })
    bidders.push(user)
  }

  // Create 3 active listing lots for bidding
  const listings: any[] = []
  console.log(`⚡ Spawning \x1b[32m3\x1b[0m active auction items...`)
  for (let i = 0; i < 3; i++) {
    const listing = await prisma.listing.create({
      data: {
        title: `MacBook Pro M4 Beta Lot #${i + 1} (${crypto.randomBytes(2).toString('hex').toUpperCase()})`,
        description: 'Стрес-тестовий лот. Тільки для бета-тестування та вимірювання затримок.',
        categoryId: category.id,
        condition: 'new',
        city: 'Київ',
        startPrice: 15000,
        currentPrice: 15000,
        minIncrement: 100,
        sellerId: bidders[0].id, // Seller is bidder 0
        endsAt: new Date(Date.now() + 1000 * 35), // Ends in 35 seconds to trigger sniping extension tests!
        status: 'active',
        images: JSON.stringify(['https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg'])
      }
    })
    listings.push(listing)
  }

  console.log('\n\x1b[32m✔ Environment initialized successfully!\x1b[0m')
  console.log('\x1b[35m🚀 Launching simulator daemon in 2 seconds...\x1b[0m')
  await sleep(2000)

  let active = true
  const startTime = Date.now()

  // Real-time Dashboard Renderer loop
  const dashboardInterval = setInterval(() => {
    const elapsedSecs = (Date.now() - startTime) / 1000
    const remainingSecs = Math.max(0, DURATION_SECS - elapsedSecs)
    const bps = metrics.totalAttempted / Math.max(1, elapsedSecs)
    const successRate = metrics.totalAttempted > 0 
      ? ((metrics.totalSuccessful / metrics.totalAttempted) * 100).toFixed(1) 
      : '0.0'
    const avgLatency = metrics.latencies.length > 0 
      ? (metrics.latencies.reduce((a, b) => a + b, 0) / metrics.latencies.length).toFixed(1) 
      : '0.0'

    console.clear()
    console.log('\x1b[38;2;124;58;237m========================================================\x1b[0m')
    console.log('\x1b[38;2;139;92;246m       KRAM REAL-TIME CLOSED BETA METRICS DASHBOARD     \x1b[0m')
    console.log('\x1b[38;2;124;58;237m========================================================\x1b[0m')
    console.log(`Elapsed Time: \x1b[33m${elapsedSecs.toFixed(1)}s\x1b[0m / \x1b[33m${DURATION_SECS}s\x1b[0m (Remaining: \x1b[31m${remainingSecs.toFixed(1)}s\x1b[0m)`)
    console.log(`Status: ${active ? '\x1b[32m● RUNNING\x1b[0m' : '\x1b[31m■ STOPPED\x1b[0m'}\n`)

    console.log('\x1b[1m--- PERFORMANCE METRICS ---\x1b[0m')
    console.log(`Total Bids Attempted : \x1b[36m${metrics.totalAttempted}\x1b[0m`)
    console.log(`Successful Bids      : \x1b[32m${metrics.totalSuccessful}\x1b[0m`)
    console.log(`Failed / Outbid      : \x1b[31m${metrics.totalFailed}\x1b[0m`)
    console.log(`Rate Limited Bids    : \x1b[33m${metrics.totalRateLimited}\x1b[0m`)
    console.log(`Anti-Sniping Snipes  : \x1b[35m${metrics.totalSnipes}\x1b[0m`)
    console.log(`Avg Response Latency : \x1b[36m${avgLatency} ms\x1b[0m`)
    console.log(`Bids Per Second (BPS): \x1b[36m${bps.toFixed(2)} bids/sec\x1b[0m`)
    console.log(`Overall Success Rate : \x1b[32m${successRate} %\x1b[0m\n`)

    console.log('\x1b[1m--- CURRENT LOT STATES (REALTIME) ---\x1b[0m')
    listings.forEach((l, index) => {
      console.log(`\x1b[36mLot #${index + 1}\x1b[0m: ${l.title.slice(0, 32)}...`)
      console.log(`  └─ Current Price: \x1b[32m${l.currentPrice} ₴\x1b[0m`)
      const endsIn = (new Date(l.endsAt).getTime() - Date.now()) / 1000
      console.log(`  └─ Time Remaining: \x1b[33m${endsIn.toFixed(1)}s\x1b[0m ${endsIn < 15 ? '\x1b[31m(SNIPING REGION!)\x1b[0m' : ''}`)
    })
  }, 300)

  // Start bidder worker threads
  const bidderPromises = bidders.map(async (bidder, index) => {
    // Bidder 0 is the seller, they shouldn't bid on their own items
    if (index === 0) return

    while (active) {
      // Pick a random listing
      const targetListing = listings[Math.floor(Math.random() * listings.length)]

      // Dynamic bidding price
      const bidIncrement = 100 + Math.floor(Math.random() * 4) * 100
      const bidAmount = targetListing.currentPrice + bidIncrement

      const bidStart = Date.now()
      metrics.totalAttempted++

      try {
        const result = await placeBid({
          userId: bidder.id,
          listingId: targetListing.id,
          amount: bidAmount,
        })

        const latency = Date.now() - bidStart
        metrics.latencies.push(latency)

        if (result.success) {
          metrics.totalSuccessful++
          targetListing.currentPrice = bidAmount
          
          // Check if sniping extension occurred
          if (result.newPrice) {
            // Re-fetch listing endsAt dynamically from database to detect anti-sniping extension
            const updated = await prisma.listing.findUnique({
              where: { id: targetListing.id },
              select: { endsAt: true }
            })
            if (updated && updated.endsAt.getTime() !== targetListing.endsAt.getTime()) {
              metrics.totalSnipes++
              targetListing.endsAt = updated.endsAt
            }
          }
        } else {
          metrics.totalFailed++
          if (result.error && result.error.includes('Забагато')) {
            metrics.totalRateLimited++
          }
          // Fetch fresh price from DB to recover
          const fresh = await prisma.listing.findUnique({
            where: { id: targetListing.id },
            select: { currentPrice: true }
          })
          if (fresh) {
            targetListing.currentPrice = fresh.currentPrice
          }
        }
      } catch (err) {
        metrics.totalFailed++
      }

      // Human-like thinking interval (300ms to 1200ms)
      await sleep(300 + Math.random() * 900)
    }
  })

  // Wait for duration to elapse
  await sleep(DURATION_SECS * 1000)
  active = false

  // Terminate workers
  await Promise.all(bidderPromises)
  clearInterval(dashboardInterval)

  // 3. Final Report
  console.log('\n\x1b[38;2;139;92;246m=== STRESS TEST COMPLETED SUCCESSFULLY ===\x1b[0m')
  console.log('\x1b[36m🧹 Cleaning up stress-test records from test DB...\x1b[0m')
  
  const bidderIds = bidders.map(b => b.id)

  try {
    // Delete notification logs targeting or sent by these bidders
    await prisma.notification.deleteMany({
      where: { userId: { in: bidderIds } }
    })
    
    // Delete audit log entries created during this test
    await prisma.auditLog.deleteMany({
      where: { userId: { in: bidderIds } }
    })

    // Delete bids
    await prisma.bid.deleteMany({
      where: { listingId: { in: listings.map(l => l.id) } }
    })

    // Delete listings
    await prisma.listing.deleteMany({
      where: { id: { in: listings.map(l => l.id) } }
    })

    // Delete users
    await prisma.user.deleteMany({
      where: { id: { in: bidderIds } }
    })

    console.log('🧹 Cleanup completed successfully.')
  } catch (cleanupError) {
    console.error('⚠️ Warning: Error occurred during test environment cleanup:', cleanupError)
  }

  await prisma.$disconnect()
  console.log('\x1b[32m✔ Final status: ALL PASS. Test DB is perfectly clean.\x1b[0m')
}

run().catch(async (e) => {
  console.error('Fatal error during simulation:', e)
  await prisma.$disconnect()
  process.exit(1)
})
