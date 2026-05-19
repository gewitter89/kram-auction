import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/getCurrentUser'
import { getProductionReadiness } from '@/lib/marketplace-checks'

export async function GET() {
  try {
    await requireAdmin()
    return NextResponse.json(await getProductionReadiness())
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 })
    }
    console.error('Readiness error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
