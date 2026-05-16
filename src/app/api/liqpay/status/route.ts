import { NextResponse } from 'next/server'
import { isLiqPayConfigured } from '@/lib/liqpay-service'

// GET /api/liqpay/status - Check if LiqPay is configured
export async function GET() {
  return NextResponse.json({
    configured: isLiqPayConfigured(),
    sandbox: true, // Always sandbox for now
  })
}
