import { NextResponse } from 'next/server'
import { isLiqPayConfigured } from '@/lib/liqpay-service'
import { paymentsEnabled } from '@/lib/payments-mode'

// GET /api/liqpay/status - Check if LiqPay is enabled/configured
export async function GET() {
  const enabled = paymentsEnabled()
  return NextResponse.json({
    enabled,
    configured: enabled && isLiqPayConfigured(),
    sandbox: enabled ? process.env.LIQPAY_SANDBOX !== 'false' : null,
  })
}
