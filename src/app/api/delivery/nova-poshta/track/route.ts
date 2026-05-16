import { NextResponse } from 'next/server'
import { trackDocument, getTrackingStatusDescription, isNovaPoshtaConfigured } from '@/lib/nova-poshta-service'

// GET /api/delivery/nova-poshta/track?number=59000000000000
export async function GET(request: Request) {
  try {
    if (!isNovaPoshtaConfigured()) {
      return NextResponse.json(
        { error: 'Nova Poshta API не налаштовано' },
        { status: 503 }
      )
    }

    const { searchParams } = new URL(request.url)
    const number = searchParams.get('number')

    if (!number) {
      return NextResponse.json(
        { error: 'Вкажіть номер ТТН' },
        { status: 400 }
      )
    }

    const document = await trackDocument(number)
    
    if (!document) {
      return NextResponse.json(
        { error: 'Накладну не знайдено', status: null },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      number: document.Number,
      statusCode: document.StatusCode,
      status: document.Status,
      statusDescription: getTrackingStatusDescription(document.StatusCode),
      createdAt: document.DateCreated,
      recipient: document.RecipientFullName,
      weight: document.DocumentWeight,
      cost: document.DocumentCost,
      actualDeliveryDate: document.ActualDeliveryDate,
    })
  } catch (error: any) {
    console.error('Nova Poshta track error:', error)
    return NextResponse.json(
      { error: 'Помилка відстеження' },
      { status: 500 }
    )
  }
}
