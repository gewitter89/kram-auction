import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/getCurrentUser'
import { ensureCoreCategories } from '@/lib/marketplace-checks'

export async function POST() {
  try {
    await requireAdmin()
    return NextResponse.json({ success: true, ...(await ensureCoreCategories()) })
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 })
    }
    console.error('Ensure categories error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
