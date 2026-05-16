import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth-config'
import { createTransactionFromBuyNow } from '@/lib/transaction-service'

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Необхідна авторизація' }, { status: 401 })
    }

    const { lotId, deliveryInfo } = await request.json()

    if (!lotId || !deliveryInfo) {
      return NextResponse.json({ error: 'Відсутні дані для замовлення' }, { status: 400 })
    }

    // Create transaction
    const transaction = await createTransactionFromBuyNow(
      lotId,
      session.user.id,
      {
        recipientName: deliveryInfo.fullName,
        recipientPhone: deliveryInfo.phone,
        deliveryCity: deliveryInfo.city,
        deliveryWarehouse: deliveryInfo.warehouse,
        deliveryAddress: deliveryInfo.address
      }
    )

    return NextResponse.json({ 
      success: true, 
      transactionId: transaction.id,
      amount: transaction.amount
    })
  } catch (error: any) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: error.message || 'Помилка при оформленні замовлення' },
      { status: 500 }
    )
  }
}
