import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth-config'
import { paymentsDisabledResponse, paymentsEnabled } from '@/lib/payments-mode'
import { markReleasePaid } from '@/lib/payment-release-service'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!paymentsEnabled()) {
      return NextResponse.json(paymentsDisabledResponse, { status: 410 })
    }

    const { id } = await params
    const { providerReference } = await request.json()

    const updated = await markReleasePaid(id, providerReference, session.user.id)

    return NextResponse.json({ success: true, release: updated })
  } catch (error: any) {
    console.error('Failed to mark release paid:', error)
    return NextResponse.json(
      { error: error.message || 'Internal error' },
      { status: 500 }
    )
  }
}
