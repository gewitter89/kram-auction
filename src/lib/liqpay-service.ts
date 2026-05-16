// LiqPay integration service for KRAM
// https://www.liqpay.ua/documentation

import crypto from 'crypto'

const LIQPAY_PUBLIC_KEY = process.env.LIQPAY_PUBLIC_KEY || ''
const LIQPAY_PRIVATE_KEY = process.env.LIQPAY_PRIVATE_KEY || ''
const LIQPAY_SANDBOX = process.env.LIQPAY_SANDBOX !== 'false' // Default to sandbox

export interface LiqPayPaymentData {
  version: number
  public_key: string
  action: 'pay' | 'hold' | 'subscribe' | 'paydonate'
  amount: number
  currency: 'UAH' | 'USD' | 'EUR'
  description: string
  order_id: string
  sandbox?: string
  server_url?: string // Callback URL
  result_url?: string // Return URL after payment
  language?: 'uk' | 'en'
}

export interface LiqPaySignature {
  data: string
  signature: string
}

/**
 * Generate base64 string from JSON data
 */
function toBase64(data: object): string {
  return Buffer.from(JSON.stringify(data)).toString('base64')
}

/**
 * Generate LiqPay signature
 */
function generateSignature(data: string): string {
  const signatureString = LIQPAY_PRIVATE_KEY + data + LIQPAY_PRIVATE_KEY
  return crypto.createHash('sha1').update(signatureString).digest('base64')
}

/**
 * Create LiqPay payment form data
 */
export function createPaymentForm(
  amount: number,
  orderId: string,
  description: string,
  serverUrl: string,
  resultUrl: string,
  currency: 'UAH' | 'USD' | 'EUR' = 'UAH',
  action: 'pay' | 'hold' = 'pay'
): LiqPaySignature {
  const data: LiqPayPaymentData = {
    version: 3,
    public_key: LIQPAY_PUBLIC_KEY,
    action,
    amount,
    currency,
    description,
    order_id: orderId,
    language: 'uk',
    server_url: serverUrl,
    result_url: resultUrl,
  }

  // Add sandbox mode if enabled
  if (LIQPAY_SANDBOX) {
    data.sandbox = '1'
  }

  const dataBase64 = toBase64(data)
  const signature = generateSignature(dataBase64)

  return {
    data: dataBase64,
    signature,
  }
}

/**
 * Verify LiqPay callback signature
 */
export function verifyCallback(data: string, signature: string): boolean {
  const expectedSignature = generateSignature(data)
  return signature === expectedSignature
}

/**
 * Decode callback data from LiqPay
 */
type LiqPayCallbackPayload = {
  order_id?: string
  payment_id?: string
  status?: LiqPayStatus
  amount?: number
  currency?: string
  transaction_id?: string
  sender_card_mask?: string
}

export function decodeCallback(data: string): LiqPayCallbackPayload | null {
  try {
    const decoded = JSON.parse(Buffer.from(data, 'base64').toString('utf-8')) as unknown
    if (!decoded || typeof decoded !== 'object') return null
    return decoded as LiqPayCallbackPayload
  } catch {
    return null
  }
}

/**
 * Check if LiqPay is configured
 */
export function isLiqPayConfigured(): boolean {
  return !!LIQPAY_PUBLIC_KEY && !!LIQPAY_PRIVATE_KEY
}

export function isLiqPaySandbox(): boolean {
  return LIQPAY_SANDBOX
}

// LiqPay payment status types
export type LiqPayStatus = 
  | 'success'      // Payment successful
  | 'failure'      // Payment failed
  | 'processing'   // Processing
  | 'wait_accept'  // Waiting for merchant confirmation
  | 'wait_secure'  // 3DS verification
  | 'sandbox'      // Sandbox mode

/**
 * Parse LiqPay callback and extract payment info
 */
export function parseCallback(data: string, signature: string): {
  valid: boolean
  payment?: {
    orderId: string
    paymentId: string
    status: LiqPayStatus
    amount: number
    currency: string
    transactionId?: string
    senderCardMask?: string
    paymentTime: string
  }
} {
  if (!verifyCallback(data, signature)) {
    return { valid: false }
  }

  const decoded = decodeCallback(data)
  if (!decoded?.order_id || !decoded.payment_id || !decoded.status || typeof decoded.amount !== 'number' || !decoded.currency) {
    return { valid: false }
  }

  return {
    valid: true,
    payment: {
      orderId: decoded.order_id,
      paymentId: decoded.payment_id,
      status: decoded.status,
      amount: decoded.amount,
      currency: decoded.currency,
      transactionId: decoded.transaction_id,
      senderCardMask: decoded.sender_card_mask,
      paymentTime: new Date().toISOString(),
    },
  }
}
