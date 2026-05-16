// Payment Release Service for KRAM
// Handles seller payout logic: funds available only after buyer confirms receipt

import { prisma } from './prisma'

/**
 * Create a pending payment release when transaction is paid
 * Funds will be available to seller only after buyer confirms receipt
 */
export async function createPendingRelease(
  transactionId: string,
  paymentId: string,
  sellerId: string,
  amount: number,
  currency: string = 'UAH'
) {
  // Check if release already exists
  const existing = await prisma.paymentRelease.findFirst({
    where: { transactionId },
  })

  if (existing) {
    return existing
  }

  const release = await prisma.paymentRelease.create({
    data: {
      transactionId,
      paymentId,
      sellerId,
      amount,
      currency,
      status: 'PENDING',
      // availableAt will be set when buyer confirms receipt
    },
  })

  return release
}

/**
 * Make funds available to seller after buyer confirms receipt
 */
export async function makeFundsAvailable(transactionId: string) {
  const release = await prisma.paymentRelease.findFirst({
    where: { transactionId, status: 'PENDING' },
    include: { transaction: true },
  })

  if (!release) {
    throw new Error('RELEASE_NOT_FOUND')
  }

  // Check transaction is completed
  if (release.transaction.status !== 'COMPLETED') {
    throw new Error('TRANSACTION_NOT_COMPLETED')
  }

  const updated = await prisma.paymentRelease.update({
    where: { id: release.id },
    data: {
      status: 'APPROVED',
      availableAt: new Date(),
    },
  })

  return updated
}

/**
 * Mark release as paid to seller
 * Called when admin/system actually transfers money to seller
 */
export async function markReleasePaid(
  releaseId: string,
  providerReference?: string,
  approvedBy?: string
) {
  const updated = await prisma.paymentRelease.update({
    where: { id: releaseId },
    data: {
      status: 'PAID',
      paidAt: new Date(),
      providerReference,
      approvedBy,
    },
  })

  return updated
}

/**
 * Cancel release (e.g., if transaction refunded)
 */
export async function cancelRelease(transactionId: string, reason?: string) {
  const release = await prisma.paymentRelease.findFirst({
    where: { transactionId, status: { in: ['PENDING', 'APPROVED'] } },
  })

  if (!release) {
    return null
  }

  const updated = await prisma.paymentRelease.update({
    where: { id: release.id },
    data: {
      status: 'CANCELLED',
      notes: reason || 'Transaction cancelled or refunded',
    },
  })

  return updated
}

/**
 * Get release status for a transaction
 */
export async function getReleaseStatus(transactionId: string) {
  const release = await prisma.paymentRelease.findFirst({
    where: { transactionId },
  })

  if (!release) {
    return null
  }

  return {
    status: release.status,
    amount: release.amount,
    currency: release.currency,
    availableAt: release.availableAt,
    paidAt: release.paidAt,
    canBePaid: release.status === 'APPROVED' && !release.paidAt,
  }
}

/**
 * List pending releases for admin payout
 */
export async function listPendingReleases() {
  const releases = await prisma.paymentRelease.findMany({
    where: { status: 'APPROVED', paidAt: null },
    include: {
      transaction: {
        include: {
          listing: { select: { title: true } },
          seller: { select: { name: true, email: true } },
        },
      },
    },
    orderBy: { availableAt: 'asc' },
  })

  return releases
}
