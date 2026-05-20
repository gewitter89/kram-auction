import { prisma } from '@/lib/prisma'
import { analyzeListingRisk } from '@/lib/listing-risk'
import { notifyNewLot } from '@/lib/telegram'
import { notifySavedSearchMatches } from '@/lib/saved-searches'
import { postListingToTelegramChannel } from '@/lib/telegram-channel'

type ReviewOptions = {
  actorId?: string
  dryRun?: boolean
  limit?: number
  lotId?: string
}

export async function runListingModerationAutopilot(options: ReviewOptions = {}) {
  const where = options.lotId ? { id: options.lotId, status: 'pending_review' } : { status: 'pending_review' }
  const pendingLots = await prisma.listing.findMany({
    where,
    take: options.limit || 25,
    orderBy: { createdAt: 'asc' },
    include: {
      seller: { select: { id: true, verified: true, email: true, name: true } },
      category: { select: { slug: true, name: true } },
    },
  })

  const results = []

  for (const lot of pendingLots) {
    let images: string[] = []
    try { images = JSON.parse(lot.images || '[]') } catch {}

    const [existingListingsCount, completedDealsCount] = await Promise.all([
      prisma.listing.count({ where: { sellerId: lot.sellerId, id: { not: lot.id } } }),
      prisma.transaction.count({ where: { sellerId: lot.sellerId, status: 'COMPLETED' } }),
    ])

    const risk = analyzeListingRisk({
      title: lot.title,
      description: lot.description,
      startPrice: lot.startPrice,
      buyNowPrice: lot.buyNowPrice,
      images,
      existingListingsCount,
      sellerVerified: lot.seller.verified,
      sellerCompletedDealsCount: completedDealsCount,
      categorySlug: lot.category?.slug,
    })

    const decision = risk.blockers.length > 0
      ? 'manual_review'
      : risk.autoApproveEligible
        ? 'auto_approve'
        : 'manual_review'

    const result = {
      lotId: lot.id,
      title: lot.title,
      decision,
      riskLevel: risk.level,
      reasons: risk.reasons,
      autoApproveEligible: risk.autoApproveEligible,
      category: lot.category?.slug || null,
      sellerVerified: lot.seller.verified,
    }

    results.push(result)

    if (options.dryRun) continue

    if (decision === 'auto_approve') {
      const endsAt = new Date(Date.now() + Number(lot.duration || 7) * 24 * 60 * 60 * 1000)
      await prisma.listing.update({
        where: { id: lot.id },
        data: { status: 'active', endsAt },
      })

      await prisma.report.updateMany({
        where: { listingId: lot.id, reason: 'listing_moderation_required', status: 'pending' },
        data: {
          status: 'action_taken',
          comment: JSON.stringify({
            source: 'moderation_autopilot',
            decision,
            riskLevel: risk.level,
            reasons: risk.reasons,
          }),
        },
      }).catch(() => {})

      await prisma.notification.create({
        data: {
          userId: lot.sellerId,
          type: 'listing_approved',
          title: 'Лот автоматично опубліковано',
          message: `Ваш лот "${lot.title}" пройшов автоматичну перевірку та доступний у каталозі.`,
          listingId: lot.id,
        },
      }).catch(() => {})

      notifyNewLot({ title: lot.title, startPrice: lot.startPrice, id: lot.id }).catch(console.error)
      notifySavedSearchMatches(lot.id).catch(console.error)
      postListingToTelegramChannel(lot.id).catch(console.error)
    } else {
      await prisma.report.updateMany({
        where: { listingId: lot.id, reason: 'listing_moderation_required', status: 'pending' },
        data: {
          comment: JSON.stringify({
            source: 'moderation_autopilot',
            decision,
            riskLevel: risk.level,
            reasons: risk.reasons,
            blockers: risk.blockers,
            warnings: risk.warnings,
          }),
        },
      }).catch(() => {})
    }
  }

  if (!options.dryRun) {
    await prisma.auditLog.create({
      data: {
        userId: options.actorId,
        action: 'listing_moderation_autopilot',
        metadata: JSON.stringify({
          dryRun: Boolean(options.dryRun),
          lotId: options.lotId,
          total: results.length,
          autoApproved: results.filter(result => result.decision === 'auto_approve').length,
          manualReview: results.filter(result => result.decision === 'manual_review').length,
        }),
      },
    }).catch(() => {})
  }

  return {
    total: results.length,
    autoApproved: results.filter(result => result.decision === 'auto_approve').length,
    manualReview: results.filter(result => result.decision === 'manual_review').length,
    results,
  }
}
