import { paymentsEnabled } from '@/lib/payments-mode'

export const isClassifiedMode =
  process.env.KRAM_BETA_CLASSIFIED_MODE === 'true' ||
  process.env.NEXT_PUBLIC_KRAM_BETA_CLASSIFIED_MODE === 'true' ||
  !paymentsEnabled()

export const platformFeeLabel = isClassifiedMode ? '0 ₴' : 'За тарифами KRAM'

export const directDealNotice =
  'KRAM фіксує лоти, ставки, повідомлення та скарги, але не приймає оплату і не утримує кошти. Оплату й доставку сторони погоджують напряму.'
