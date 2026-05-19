import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
🔧 KRAM User Management Tool
Usage:
  npx tsx scripts/manage-user.ts <email> [options]

Options:
  --role <user|seller|admin>   Set user role
  --verify                     Set verificationStatus to VERIFIED (and verified=true)
  --reject                     Set verificationStatus to REJECTED (and verified=false)
  --reset-verify               Set verificationStatus to NONE (and verified=false)
  --info                       Show user details (default)

Examples:
  npx tsx scripts/manage-user.ts user@example.com --role admin --verify
  npx tsx scripts/manage-user.ts user@example.com --info
    `)
    return
  }

  const email = args[0]
  
  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      _count: {
        select: { listings: true, bids: true }
      }
    }
  })

  if (!user) {
    console.error(`❌ User not found with email: ${email}`)
    process.exit(1)
  }

  console.log(`\n👤 User Found:`)
  console.log(`   ID:                  ${user.id}`)
  console.log(`   Name:                ${user.name}`)
  console.log(`   Email:               ${user.email}`)
  console.log(`   Phone:               ${user.phone || 'None'}`)
  console.log(`   Role:                ${user.role} (default: user, seller, admin)`)
  console.log(`   Verification Status: ${user.verificationStatus} (legacy verified: ${user.verified})`)
  console.log(`   Email Verified:      ${user.emailVerified}`)
  console.log(`   Listings count:      ${user._count.listings}`)
  console.log(`   Bids count:          ${user._count.bids}`)
  console.log(`   Created At:          ${user.createdAt}\n`)

  let updated = false
  const updateData: any = {}

  // Parse arguments
  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--role') {
      const role = args[i + 1]
      if (role === 'user' || role === 'seller' || role === 'admin') {
        updateData.role = role
        updated = true
        i++
      } else {
        console.error(`❌ Invalid role: ${role}. Must be user, seller, or admin.`)
        process.exit(1)
      }
    } else if (args[i] === '--verify') {
      updateData.verificationStatus = 'VERIFIED'
      updateData.verified = true
      updated = true
    } else if (args[i] === '--reject') {
      updateData.verificationStatus = 'REJECTED'
      updateData.verified = false
      updated = true
    } else if (args[i] === '--reset-verify') {
      updateData.verificationStatus = 'NONE'
      updateData.verified = false
      updated = true
    }
  }

  if (updated) {
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData
    })
    console.log(`🎉 User updated successfully!`)
    console.log(`   New Role:                ${updatedUser.role}`)
    console.log(`   New Verification Status: ${updatedUser.verificationStatus} (legacy verified: ${updatedUser.verified})`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
