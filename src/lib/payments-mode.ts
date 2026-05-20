export function paymentsEnabled() {
  return process.env.PAYMENTS_ENABLED === 'true'
}

export const paymentsDisabledResponse = {
  error: 'Онлайн-оплата через KRAM вимкнена. Оплату й доставку сторони погоджують напряму.',
}
