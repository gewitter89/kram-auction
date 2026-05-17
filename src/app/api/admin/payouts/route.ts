import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth-config'
import { listPendingReleases } from '@/lib/payment-release-service'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const releases = await listPendingReleases()
    return NextResponse.json({ releases })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error fetching payouts' }, { status: 500 })
  }
}
