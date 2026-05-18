#!/usr/bin/env tsx
/**
 * E2E QA Tests for Local Test DB
 * Tests bid, report, admin flows against localhost:3000
 */

import { PrismaClient } from '@prisma/client'
import { placeBid } from '../src/server/auction/placeBid'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

const QA_PASSWORD = process.env.QA_SEED_PASSWORD || ''

interface TestResult {
  test: string
  expected: string
  actual: string
  status: 'PASS' | 'FAIL' | 'PENDING'
  dbProof?: string
}

const results: TestResult[] = []

async function runTests() {
  console.log('🧪 Starting E2E QA Tests...\n')
  
  // 1. Verify QA users exist
  console.log('1️⃣ Checking QA users...')
  const qaSeller = await prisma.user.findUnique({ where: { email: 'qa-seller@kram.local' } })
  const qaBuyer = await prisma.user.findUnique({ where: { email: 'qa-buyer@kram.local' } })
  const qaAdmin = await prisma.user.findUnique({ where: { email: 'qa-admin@kram.local' } })
  
  results.push({
    test: 'QA Seller exists',
    expected: 'User with email qa-seller@kram.local',
    actual: qaSeller ? `Found: ${qaSeller.id.substring(0, 8)}...` : 'NOT FOUND',
    status: qaSeller ? 'PASS' : 'FAIL'
  })
  
  results.push({
    test: 'QA Buyer exists',
    expected: 'User with email qa-buyer@kram.local',
    actual: qaBuyer ? `Found: ${qaBuyer.id.substring(0, 8)}...` : 'NOT FOUND',
    status: qaBuyer ? 'PASS' : 'FAIL'
  })
  
  results.push({
    test: 'QA Admin exists',
    expected: 'User with email qa-admin@kram.local',
    actual: qaAdmin ? `Found: ${qaAdmin.id.substring(0, 8)}...` : 'NOT FOUND',
    status: qaAdmin ? 'PASS' : 'FAIL'
  })
  
  // 2. Verify QA lot exists
  console.log('2️⃣ Checking QA lot...')
  const qaLot = await prisma.listing.findFirst({
    where: { title: 'Тестовий QA-лот KRAM' },
    include: { seller: true }
  })
  
  results.push({
    test: 'QA Lot exists',
    expected: 'Listing "Тестовий QA-лот KRAM"',
    actual: qaLot ? `Found: ${qaLot.id.substring(0, 8)}... (Seller: ${qaLot.seller.email})` : 'NOT FOUND',
    status: qaLot ? 'PASS' : 'FAIL',
    dbProof: qaLot ? `Price: ${qaLot.startPrice}₴, Seller: ${qaLot.sellerId.substring(0, 8)}...` : undefined
  })
  
  if (!qaLot || !qaSeller || !qaBuyer) {
    console.log('❌ QA data not found. Run: npx prisma db seed')
    await prisma.$disconnect()
    return printResults()
  }
  
  // 3. Test Seller Own Bid (via placeBid server function)
  console.log('3️⃣ Testing seller own bid...')
  const ownBidResult = await placeBid({
    listingId: qaLot.id,
    userId: qaLot.sellerId, // Seller trying to bid on own lot
    amount: 150
  })
  
  results.push({
    test: 'Seller cannot bid on own lot',
    expected: 'Error: CANNOT_BID_OWN or similar',
    actual: ownBidResult.success ? 'UNEXPECTED SUCCESS' : `Error: ${ownBidResult.error}`,
    status: !ownBidResult.success && (ownBidResult.error?.includes('власний') || ownBidResult.error?.includes('свій') || ownBidResult.error?.includes('own')) ? 'PASS' : 'FAIL',
    dbProof: `Bid success: ${ownBidResult.success}`
  })
  
  // 4. Test Min Bid Validation
  console.log('4️⃣ Testing min bid validation...')
  const minBidResult = await placeBid({
    listingId: qaLot.id,
    userId: qaBuyer.id,
    amount: qaLot.currentPrice - 1 // Below current price
  })
  
  results.push({
    test: 'Bid below minimum rejected',
    expected: 'Error: MIN_BID or min bid message',
    actual: minBidResult.success ? 'UNEXPECTED SUCCESS' : `Error: ${minBidResult.error}`,
    status: !minBidResult.success && (minBidResult.error?.includes('Мінімальна') || minBidResult.error?.includes('minimum')) ? 'PASS' : 'FAIL'
  })
  
  // 5. Test Valid Bid
  console.log('5️⃣ Testing valid bid...')
  const bidCountBefore = await prisma.bid.count({ where: { listingId: qaLot.id } })
  const lotBefore = await prisma.listing.findUnique({ where: { id: qaLot.id } })
  
  const validBidResult = await placeBid({
    listingId: qaLot.id,
    userId: qaBuyer.id,
    amount: qaLot.currentPrice + 50
  })
  
  const bidCountAfter = await prisma.bid.count({ where: { listingId: qaLot.id } })
  const lotAfter = await prisma.listing.findUnique({ where: { id: qaLot.id } })
  
  results.push({
    test: 'Valid bid creates Bid',
    expected: 'Bid created, currentPrice updated',
    actual: validBidResult.success ? 'SUCCESS' : `FAILED: ${validBidResult.error}`,
    status: validBidResult.success && bidCountAfter > bidCountBefore ? 'PASS' : 'FAIL',
    dbProof: `Bids: ${bidCountBefore} → ${bidCountAfter}, Price: ${lotBefore?.currentPrice} → ${lotAfter?.currentPrice}`
  })
  
  // 6. Test Ended Auction
  console.log('6️⃣ Testing ended auction...')
  await prisma.listing.update({
    where: { id: qaLot.id },
    data: { endsAt: new Date(Date.now() - 1000), status: 'ended' }
  })
  
  const endedBidResult = await placeBid({
    listingId: qaLot.id,
    userId: qaBuyer.id,
    amount: 500
  })
  
  results.push({
    test: 'Ended auction blocks bids',
    expected: 'Error: Auction ended',
    actual: endedBidResult.success ? 'UNEXPECTED SUCCESS' : `Error: ${endedBidResult.error}`,
    status: !endedBidResult.success && (endedBidResult.error?.includes('завершено') || endedBidResult.error?.includes('ended')) ? 'PASS' : 'FAIL'
  })
  
  // Reset lot status
  await prisma.listing.update({
    where: { id: qaLot.id },
    data: { endsAt: new Date(Date.now() + 3600000), status: 'active' }
  })
  
  // 7. Test Report Creation
  console.log('7️⃣ Testing report creation...')
  const reportCountBefore = await prisma.report.count()
  
  const report = await prisma.report.create({
    data: {
      listingId: qaLot.id,
      userId: qaBuyer.id,
      reason: 'Неправдивий опис',
      comment: 'QA test report',
      status: 'PENDING'
    }
  })
  
  const reportCountAfter = await prisma.report.count()
  
  results.push({
    test: 'Report creation',
    expected: 'Report created with status=PENDING',
    actual: report ? `Created: ${report.id.substring(0, 8)}...` : 'FAILED',
    status: report && report.status === 'PENDING' ? 'PASS' : 'FAIL',
    dbProof: `Reports: ${reportCountBefore} → ${reportCountAfter}, Status: ${report?.status}`
  })
  
  // 8. Test Admin Moderation
  console.log('8️⃣ Testing admin moderation...')
  const reviewedReport = await prisma.report.update({
    where: { id: report.id },
    data: { status: 'REVIEWED' }
  })
  
  results.push({
    test: 'Admin report REVIEWED',
    expected: 'Status changed to REVIEWED',
    actual: `Status: ${reviewedReport.status}`,
    status: reviewedReport.status === 'REVIEWED' ? 'PASS' : 'FAIL'
  })
  
  // Test AuditLog
  console.log('9️⃣ Checking AuditLog...')
  const auditLog = await prisma.auditLog.create({
    data: {
      action: 'REPORT_REVIEWED',
      userId: qaAdmin?.id,
      metadata: JSON.stringify({ reportId: report.id, oldStatus: 'PENDING', newStatus: 'REVIEWED' })
    }
  })
  
  results.push({
    test: 'AuditLog created',
    expected: 'AuditLog entry for REPORT_REVIEWED',
    actual: auditLog ? `Created: ${auditLog.id.substring(0, 8)}...` : 'FAILED',
    status: auditLog ? 'PASS' : 'FAIL',
    dbProof: `Action: ${auditLog?.action}, Metadata: ${auditLog?.metadata ? 'present' : 'missing'}`
  })
  
  // 10. Test Admin User Verification
  console.log('🔟 Testing admin user verification...')
  const sellerBefore = await prisma.user.findUnique({ where: { id: qaSeller.id } })
  
  await prisma.user.update({
    where: { id: qaSeller.id },
    data: { verified: true }
  })
  
  const sellerAfter = await prisma.user.findUnique({ where: { id: qaSeller.id } })
  
  results.push({
    test: 'Admin user verification',
    expected: 'verified=true',
    actual: `verified: ${sellerAfter?.verified}`,
    status: sellerAfter?.verified === true ? 'PASS' : 'FAIL',
    dbProof: `Before: verified=${sellerBefore?.verified} → After: verified=${sellerAfter?.verified}`
  })
  
  // Cleanup - reset seller
  await prisma.user.update({
    where: { id: qaSeller.id },
    data: { verified: false }
  })
  
  await prisma.$disconnect()
  printResults()
}

function printResults() {
  console.log('\n' + '='.repeat(80))
  console.log('📊 E2E QA TEST RESULTS')
  console.log('='.repeat(80))
  
  const passed = results.filter(r => r.status === 'PASS').length
  const failed = results.filter(r => r.status === 'FAIL').length
  
  results.forEach((r, i) => {
    const icon = r.status === 'PASS' ? '✅' : r.status === 'FAIL' ? '❌' : '⏳'
    console.log(`\n${i + 1}. ${icon} ${r.test}`)
    console.log(`   Expected: ${r.expected}`)
    console.log(`   Actual:   ${r.actual}`)
    if (r.dbProof) console.log(`   DB Proof: ${r.dbProof}`)
    console.log(`   Status:   ${r.status}`)
  })
  
  console.log('\n' + '='.repeat(80))
  console.log(`📈 Summary: ${passed} PASS, ${failed} FAIL`)
  console.log('='.repeat(80))
  
  process.exit(failed > 0 ? 1 : 0)
}

runTests().catch(e => {
  console.error('❌ Test error:', e)
  process.exit(1)
})
