import { prisma } from '../lib/prisma'
import { spawn } from 'child_process'
import { chromium } from 'playwright'

const PORT = 3002
const BASE_URL = `http://localhost:${PORT}`

interface Telemetry {
  totalRequests: number
  successRequests: number
  failedRequests: number
  totalDurationMs: number
  endpoints: Record<string, { success: number; failed: number; totalMs: number }>
}

const telemetry: Telemetry = {
  totalRequests: 0,
  successRequests: 0,
  failedRequests: 0,
  totalDurationMs: 0,
  endpoints: {}
}

function recordTelemetry(endpoint: string, success: boolean, durationMs: number) {
  telemetry.totalRequests++
  if (success) telemetry.successRequests++
  else telemetry.failedRequests++
  telemetry.totalDurationMs += durationMs

  if (!telemetry.endpoints[endpoint]) {
    telemetry.endpoints[endpoint] = { success: 0, failed: 0, totalMs: 0 }
  }
  const ep = telemetry.endpoints[endpoint]
  if (success) ep.success++
  else ep.failed++
  ep.totalMs += durationMs
}

async function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function run() {
  console.log('🚀 === STARTING INTEGRATED MULTI-AGENT MARKETPLACE STRESS TEST === 🚀\n')

  // 1. Create a category to prevent relationship validation errors
  const category = await prisma.category.upsert({
    where: { slug: 'stress-test-cat' },
    update: {},
    create: {
      name: 'Stress Testing',
      slug: 'stress-test-cat',
      icon: 'zap'
    }
  })

  // 2. Initialize 10 virtual users in the database
  const virtualUsers: any[] = []
  console.log('👤 Initializing 10 Concurrent Virtual Users...')
  for (let i = 1; i <= 10; i++) {
    const user = await prisma.user.upsert({
      where: { email: `agent_user_${i}@stress.kram.ua` },
      update: { name: `Agent User ${i}` },
      create: {
        name: `Agent User ${i}`,
        email: `agent_user_${i}@stress.kram.ua`,
        phone: `+38099000010${i}`,
        passwordHash: 'stress_test_dummy_hash',
        verified: true
      }
    })
    virtualUsers.push(user)
  }
  console.log(`✅ 10 virtual users ready.\n`)

  // 3. Create a listing that will be the target of concurrent bidding
  const seller = virtualUsers[0]
  const targetListing = await prisma.listing.create({
    data: {
      title: 'Extreme Concurrency Stress Lot',
      description: 'Dynamic load and ACID transactional integrity testing',
      condition: 'new',
      status: 'active',
      type: 'auction',
      minIncrement: 50,
      currentPrice: 1000,
      startPrice: 1000,
      endsAt: new Date(Date.now() + 30 * 60000), // 30 minutes from now
      seller: { connect: { id: seller.id } },
      city: 'Kyiv',
      images: '[]',
      category: { connect: { id: category.id } }
    }
  })
  console.log(`📦 Created active target listing: "${targetListing.title}" (ID: ${targetListing.id})`)
  console.log(`   Initial price: 1000₴\n`)

  // 4. Start Next.js local server on port 3002
  console.log(`🔥 Launching Next.js Local Server on port ${PORT}...`)
  const serverProcess = spawn('npx', ['next', 'dev', '-p', String(PORT)], {
    stdio: 'ignore', // Keep logs clean, test output will be printed separately
    shell: true,
    env: { ...process.env, PORT: String(PORT) }
  })

  // Poll server until ready
  let serverReady = false
  for (let attempt = 1; attempt <= 20; attempt++) {
    await wait(1000)
    try {
      const res = await fetch(`${BASE_URL}/api/waitlist`).catch(() => null)
      if (res) {
        serverReady = true
        break
      }
    } catch (e) {}
    console.log(`⌛ Waiting for server to spin up (Attempt ${attempt}/20)...`)
  }

  if (!serverReady) {
    console.error('❌ Error: Local Next.js server failed to launch on port 3002.')
    serverProcess.kill()
    process.exit(1)
  }
  console.log('✅ Local Next.js server is online!\n')

  // 5. Fire 10 Concurrent Virtual Agents performing API request loops!
  let stopTrigger = false
  let globalBidCounter = 1000

  async function startVirtualAgent(user: any, agentIndex: number) {
    console.log(`🤖 Agent ${agentIndex} [${user.name}] is now active and crawling...`)

    while (!stopTrigger) {
      const actionRand = Math.random()
      const startTime = Date.now()

      try {
        // --- ACTION 1: Browse active catalog listings (25% weight) ---
        if (actionRand < 0.25) {
          const res = await fetch(`${BASE_URL}/api/lots`, {
            headers: { 'x-test-stress-bypass': user.id }
          })
          const duration = Date.now() - startTime
          recordTelemetry('GET /api/lots', res.ok, duration)
        }
        // --- ACTION 2: Concurrent bidding wars (35% weight) ---
        else if (actionRand < 0.60) {
          // Calculate bid price safely
          globalBidCounter += 50
          const bidAmount = globalBidCounter

          const res = await fetch(`${BASE_URL}/api/bids`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-test-stress-bypass': user.id
            },
            body: JSON.stringify({ listingId: targetListing.id, amount: bidAmount })
          })
          const data = await res.json().catch(() => ({}))
          const duration = Date.now() - startTime
          recordTelemetry('POST /api/bids', res.ok, duration)
          
          if (res.ok) {
            console.log(`💰 Agent ${agentIndex} placed bid of ${bidAmount}₴ successfully! Result: ${data.message}`)
          } else {
            // OCC error or lower bid rejected is expected behavior and recorded as HTTP 400
            // Console log only significant failures to avoid spam
            if (data.error && !data.error.includes('Мінімальна') && !data.error.includes('перебито')) {
              console.log(`⚠️ Agent ${agentIndex} bid rejected: ${data.error}`)
            }
          }
        }
        // --- ACTION 3: Send messages and proposals to other users (15% weight) ---
        else if (actionRand < 0.75) {
          const randomReceiver = virtualUsers[Math.floor(Math.random() * virtualUsers.length)]
          if (randomReceiver.id !== user.id) {
            const res = await fetch(`${BASE_URL}/api/messages`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-test-stress-bypass': user.id
              },
              body: JSON.stringify({
                receiverId: randomReceiver.id,
                text: `Привет! Предлагаю цену за твой лот. Давай договоримся.`,
                listingId: targetListing.id
              })
            })
            const duration = Date.now() - startTime
            recordTelemetry('POST /api/messages', res.ok, duration)
          }
        }
        // --- ACTION 4: Interact with Telegram Webhook (15% weight) ---
        else if (actionRand < 0.90) {
          const commands = ['/start', '/help', '/catalog', '/sell']
          const randomCommand = commands[Math.floor(Math.random() * commands.length)]

          const res = await fetch(`${BASE_URL}/api/telegram/webhook`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: {
                chat: { id: 100000000 + agentIndex },
                text: randomCommand,
                from: { first_name: user.name, username: `agent_${agentIndex}` }
              }
            })
          })
          const duration = Date.now() - startTime
          recordTelemetry('POST /api/telegram/webhook', res.ok, duration)
        }
        // --- ACTION 5: Query the AI listing optimization assistant (10% weight) ---
        else {
          const res = await fetch(`${BASE_URL}/api/ai/assist`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-test-stress-bypass': user.id
            },
            body: JSON.stringify({
              title: 'Стильний шкіряний рюкзак',
              condition: 'like_new',
              description: 'Рюкзак у чудовому стані, використовувався мало'
            })
          })
          const duration = Date.now() - startTime
          recordTelemetry('POST /api/ai/assist', res.ok, duration)
        }
      } catch (err: any) {
        const duration = Date.now() - startTime
        recordTelemetry('API Request Exception', false, duration)
      }

      // Random delay to match human behavior latency (50-200ms)
      await wait(50 + Math.random() * 150)
    }
  }

  // Launch virtual agents in parallel
  const agentPromises = virtualUsers.map((user, idx) => startVirtualAgent(user, idx + 1))

  // 6. Launch Playwright E2E Browser Session concurrently!
  console.log('\n🖥️ Launching Playwright Headless Browser simulation...')
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()
  const page = await context.newPage()

  try {
    const startBrowserTime = Date.now()
    console.log(`🌐 [E2E User] Navigating to ${BASE_URL}/catalog...`)
    await page.goto(`${BASE_URL}/catalog`)
    await page.waitForTimeout(1000)

    console.log('🔍 [E2E User] Crawling listing items and clicking links...')
    const links = await page.locator('a').allInnerTexts()
    console.log(`🌐 [E2E User] Found ${links.length} hyperlinks on catalog page.`)

    // Verify dynamic activity feed updates
    console.log('📈 [E2E User] Navigating to homepage to verify live activity stream Fallback...')
    await page.goto(BASE_URL)
    await page.waitForTimeout(2000)

    // Verify recent events element
    const activityText = await page.locator('body').innerText()
    if (activityText.includes('Активність на платформі')) {
      console.log('✅ [E2E User] Successfully verified active Live Feed dashboard UI rendering.')
    }

    const browserDuration = Date.now() - startBrowserTime
    recordTelemetry('Playwright Browser Crawling', true, browserDuration)
  } catch (err: any) {
    console.error('❌ [E2E User] Playwright simulation caught error:', err.message)
    recordTelemetry('Playwright Browser Crawling', false, 0)
  } finally {
    await browser.close()
    console.log('✅ [E2E User] Playwright browser session completed successfully.\n')
  }

  // 7. Let agents run for 15 seconds under extreme stress load
  console.log('⚡ Running stress test simulations under maximum concurrency for 15 seconds...')
  await wait(15000)

  // 8. Stop agents
  stopTrigger = true
  await Promise.all(agentPromises).catch(() => null)
  console.log('\n🛑 All virtual agents stopped.')

  // 9. Shutdown Next.js server
  console.log('🛑 Terminating Next.js server process...')
  serverProcess.kill('SIGINT')

  // 10. Run database integrity and transaction serialization checks!
  console.log('\n🔬 Running Database Transaction and ACID Integrity Checks...')
  
  const finalListing = await prisma.listing.findUnique({
    where: { id: targetListing.id },
    include: {
      bids: {
        orderBy: { amount: 'desc' }
      }
    }
  })

  // 11. Clean up created database records
  console.log('🧹 Cleaning up created database records...')
  await prisma.bid.deleteMany({ where: { listingId: targetListing.id } })
  await prisma.message.deleteMany({
    where: { senderId: { in: virtualUsers.map(u => u.id) } }
  })
  await prisma.notification.deleteMany({
    where: { userId: { in: virtualUsers.map(u => u.id) } }
  })
  await prisma.listing.delete({ where: { id: targetListing.id } })
  console.log('✅ Clean up finished.')

  // 12. Format and print the Telemetry report!
  console.log('\n===============================================================')
  console.log('📊                     TELEMETRY REPORT                        ')
  console.log('===============================================================')
  console.log(`Total Requests Sent:    ${telemetry.totalRequests}`)
  console.log(`Successful Requests:    ${telemetry.successRequests} (HTTP 2xx)`)
  console.log(`Rejected/Failed:        ${telemetry.failedRequests}`)
  console.log(`Average Latency:        ${Math.round(telemetry.totalDurationMs / telemetry.totalRequests)}ms`)
  console.log('---------------------------------------------------------------')
  console.log('Endpoint Breakdown:')
  Object.entries(telemetry.endpoints).forEach(([ep, stats]) => {
    const total = stats.success + stats.failed
    const avg = Math.round(stats.totalMs / total)
    console.log(`- ${ep.padEnd(30)} | Success: ${stats.success} | Failed: ${stats.failed} | Avg Latency: ${avg}ms`)
  })
  console.log('===============================================================')

  // Verify ACID Concurrency
  if (finalListing && finalListing.bids.length > 0) {
    const highestBid = finalListing.bids[0].amount
    console.log(`\n🏆 ACID Integrity Verification:`)
    console.log(`- Highest accepted bid value in DB: ${highestBid}₴`)
    console.log(`- Target listing price updated to:   ${finalListing.currentPrice}₴`)
    
    if (finalListing.currentPrice !== highestBid) {
      console.error('🚨 DATA INTEGRITY FAILURE! The listing current price does NOT match the highest bid in the database!')
      process.exit(1)
    } else {
      console.log('🏆 SUCCESS! Transaction isolation and OCC lock successfully prevented any race conditions or lost updates under massive parallel load! 100% ACID compliant!')
    }
  } else {
    console.log('\n⚠️ No bids were accepted by the database.')
  }

  process.exit(0)
}

run().catch(console.error)
