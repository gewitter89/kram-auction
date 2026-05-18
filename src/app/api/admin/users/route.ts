import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/getCurrentUser'

export async function GET(request: Request) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { email: { contains: query } }
        ]
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        verified: true,
        verificationStatus: true,
        emailVerified: true,
        rating: true,
        createdAt: true,
        _count: {
          select: { listings: true, bids: true }
        }
      }
    })

    return NextResponse.json(users)
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

    const { userId, action, value } = await request.json()

    if (action === 'setRole') {
      await prisma.user.update({
        where: { id: userId },
        data: { role: value }
      })
    } else if (action === 'setVerificationStatus') {
      await prisma.user.update({
        where: { id: userId },
        data: { 
          verificationStatus: value,
          // Sync legacy field
          verified: value === 'VERIFIED'
        }
      })
      
      // Audit log (non-blocking)
      try {
        await prisma.auditLog.create({
          data: {
            userId: userId,
            action: value === 'VERIFIED' ? 'USER_VERIFICATION_APPROVED' : 
                    value === 'REJECTED' ? 'USER_VERIFICATION_REJECTED' : 'USER_VERIFICATION_RESET',
            metadata: JSON.stringify({ details: `Verification status changed to ${value}` })
          }
        })
      } catch {
        // Audit log failure should not block main action
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 })
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
