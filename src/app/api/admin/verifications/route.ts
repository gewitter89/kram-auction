import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/getCurrentUser'

function parseDetails(comment: string | null) {
  if (!comment) return {}
  try { return JSON.parse(comment) } catch { return { goods: comment } }
}

export async function GET() {
  try {
    await requireAdmin()
    const requests = await prisma.report.findMany({
      where: { reason: 'seller_verification_request' },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true, verified: true, verificationStatus: true } }
      },
      take: 100,
    })

    return NextResponse.json({
      requests: requests.map(item => ({
        id: item.id,
        status: item.status,
        createdAt: item.createdAt,
        user: item.user,
        details: parseDetails(item.comment),
      }))
    })
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 })
    }
    console.error('Admin verifications GET error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin()
    const { requestId, decision } = await request.json()
    if (!requestId || !['approve', 'reject'].includes(decision)) {
      return NextResponse.json({ error: 'Invalid requestId or decision' }, { status: 400 })
    }

    const item = await prisma.report.findUnique({ where: { id: requestId }, select: { id: true, userId: true, reason: true } })
    if (!item || item.reason !== 'seller_verification_request') {
      return NextResponse.json({ error: 'Verification request not found' }, { status: 404 })
    }

    const approved = decision === 'approve'

    await prisma.$transaction(async tx => {
      await tx.report.update({
        where: { id: requestId },
        data: { status: approved ? 'action_taken' : 'dismissed' }
      })

      await tx.user.update({
        where: { id: item.userId },
        data: {
          verified: approved,
          role: approved ? 'seller' : 'user',
          verificationStatus: approved ? 'VERIFIED' : 'REJECTED',
        },
        select: { id: true }
      })

      await tx.notification.create({
        data: {
          userId: item.userId,
          type: 'verification',
          title: approved ? 'Профіль продавця підтверджено' : 'Верифікацію продавця відхилено',
          message: approved
            ? 'Ви можете публікувати лоти на KRAM.'
            : 'Модератор відхилив заявку. Оновіть дані профілю або зверніться в підтримку.',
        }
      })

      await tx.auditLog.create({
        data: {
          userId: item.userId,
          action: approved ? 'SELLER_VERIFICATION_APPROVED' : 'SELLER_VERIFICATION_REJECTED',
          metadata: JSON.stringify({ requestId })
        }
      })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 })
    }
    console.error('Admin verifications PATCH error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
