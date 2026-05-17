import { prisma } from '@/lib/prisma'
import { placeBid } from '@/server/auction/placeBid'

async function run() {
  console.log('=== Starting Concurrency & OCC Stress Test ===')

  // 1. Ensure test users exist
  const seller = await prisma.user.upsert({
    where: { email: 'seller_test@kram.ua' },
    update: {},
    create: {
      email: 'seller_test@kram.ua',
      name: 'Seller Test',
      phone: '+380990000001',
      verified: true,
      passwordHash: 'dummy_hash'
    }
  })

  const bidderA = await prisma.user.upsert({
    where: { email: 'bidder_a@kram.ua' },
    update: {},
    create: {
      email: 'bidder_a@kram.ua',
      name: 'Bidder A',
      phone: '+380990000002',
      verified: true,
      passwordHash: 'dummy_hash'
    }
  })

  const bidderB = await prisma.user.upsert({
    where: { email: 'bidder_b@kram.ua' },
    update: {},
    create: {
      email: 'bidder_b@kram.ua',
      name: 'Bidder B',
      phone: '+380990000003',
      verified: true,
      passwordHash: 'dummy_hash'
    }
  })

  // 2. Create an active test listing
  const listing = await prisma.listing.create({
    data: {
      title: 'OCC Concurrency Test Lot',
      description: 'Stress testing transactional integrity',
      condition: 'new',
      status: 'active',
      type: 'auction',
      minIncrement: 50,
      currentPrice: 1000,
      startPrice: 1000,
      endsAt: new Date(Date.now() + 10 * 60000), // 10 minutes from now
      seller: { connect: { id: seller.id } },
      city: 'Kyiv',
      images: '[]',
      category: {
        connectOrCreate: {
          where: { slug: 'test-category' },
          create: { name: 'Test Category', slug: 'test-category', icon: 'icon' }
        }
      }
    }
  })

  console.log(`Created test listing ${listing.id} with currentPrice = 1000₴`)

  // 3. Fire 5 concurrent bids in the exact same millisecond!
  console.log('\nFiring 5 concurrent bids simultaneously...')
  
  const bids = [
    { userId: bidderA.id, amount: 1050 }, // Valid min bid (1000 + 50)
    { userId: bidderB.id, amount: 1100 }, // Valid min bid
    { userId: bidderA.id, amount: 1150 }, // Valid min bid
    { userId: bidderB.id, amount: 1200 }, // Valid min bid
    { userId: bidderA.id, amount: 1250 }, // Valid min bid
  ]

  const startTime = Date.now()
  const results = await Promise.all(
    bids.map(b => 
      placeBid({
        userId: b.userId,
        listingId: listing.id,
        amount: b.amount
      }).catch(err => ({ success: false, error: (err as any).message } as any))
    )
  )
  const duration = Date.now() - startTime

  console.log(`Concurrent calls completed in ${duration}ms.\n`)

  // 4. Print results of each bid
  results.forEach((res: any, i) => {
    const bidInfo = bids[i]
    if (res.success) {
      console.log(`✅ Bid of ${bidInfo.amount}₴ succeeded: ${res.message}`)
    } else {
      console.log(`❌ Bid of ${bidInfo.amount}₴ failed: ${res.error}`)
    }
  })

  // 5. Query final state of database
  const finalListing = await prisma.listing.findUnique({
    where: { id: listing.id },
    include: {
      bids: {
        orderBy: { amount: 'desc' }
      }
    }
  })

  console.log('\n=== Final Database State ===')
  console.log(`Listing Current Price: ${finalListing?.currentPrice}₴`)
  console.log(`Number of Bids Created: ${finalListing?.bids.length}`)
  if (finalListing?.bids && finalListing.bids.length > 0) {
    console.log(`Highest Bid in DB: ${finalListing.bids[0].amount}₴`)
  }

  // 6. Cleanup test listing and its bids
  await prisma.bid.deleteMany({ where: { listingId: listing.id } })
  await prisma.listing.delete({ where: { id: listing.id } })
  console.log('\nCleanup completed.')

  // 7. Verify integrity
  if (finalListing && finalListing.bids.length > 0) {
    const highestBid = finalListing.bids[0].amount
    if (finalListing.currentPrice !== highestBid) {
      console.error('\n🚨 DATA CORRUPTION DETECTED! listing.currentPrice does not match the highest bid!')
      process.exit(1)
    } else {
      console.log('\n🏆 SUCCESS! The listing currentPrice matches the highest bid in the database. No lost updates or overwrites!')
    }
  }
}

run().catch(console.error)
