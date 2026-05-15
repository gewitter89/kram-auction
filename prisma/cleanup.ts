import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Keep only listings created by real Google-auth users (non-test accounts)
  // Test seller emails from seed
  const testEmails = [
    'admin@kram.ua',
    'tech@test.com',
    'apple@test.com',
    'game@test.com',
    'home@test.com',
    'ivan@test.com',
    'maria@test.com',
    'drone@test.com',
    'bike@test.com',
    'alex@test.com',
    'admin@lotva.ua',
  ]

  const testUsers = await prisma.user.findMany({
    where: { email: { in: testEmails } },
    select: { id: true }
  })
  const testUserIds = testUsers.map(u => u.id)

  console.log(`Found ${testUserIds.length} test users`)

  // Find listings from test users
  const testListings = await prisma.listing.findMany({
    where: { sellerId: { in: testUserIds } },
    select: { id: true, title: true }
  })
  console.log(`Found ${testListings.length} test listings to delete:`)
  testListings.forEach(l => console.log(`  - ${l.title}`))

  // Delete related records first (cascade)
  const testListingIds = testListings.map(l => l.id)
  
  await prisma.bid.deleteMany({ where: { listingId: { in: testListingIds } } })
  await prisma.favorite.deleteMany({ where: { listingId: { in: testListingIds } } })
  await prisma.message.deleteMany({ where: { listingId: { in: testListingIds } } })
  await prisma.report.deleteMany({ where: { listingId: { in: testListingIds } } })
  await prisma.transaction.deleteMany({ where: { listingId: { in: testListingIds } } })
  await prisma.listing.deleteMany({ where: { id: { in: testListingIds } } })

  console.log(`\n✅ Deleted ${testListings.length} test listings`)

  // Show remaining real listings
  const remaining = await prisma.listing.findMany({
    include: { seller: { select: { email: true, name: true } } }
  })
  console.log(`\n✅ Remaining real listings: ${remaining.length}`)
  remaining.forEach(l => console.log(`  - "${l.title}" by ${l.seller.name} (${l.seller.email})`))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
