import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/getCurrentUser'

const ALLOWED_STATUSES = ['pending', 'reviewed', 'dismissed', 'action_taken', 'resolved']

export async function GET(request: Request) {
  try {
    await requireAdmin()

    const reports = await prisma.report.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        listing: {
          select: {
            id: true,
            title: true,
            seller: { select: { name: true } }
          }
        }
      }
    })

    return NextResponse.json(reports)
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 })
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin()

    const { reportId, status } = await request.json()

    if (!reportId || !ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Invalid reportId or status' }, { status: 400 })
    }

    await prisma.report.update({
      where: { id: reportId },
      data: { status }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 })
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
