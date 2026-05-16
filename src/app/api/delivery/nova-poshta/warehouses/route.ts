import { NextResponse } from 'next/server'
import { getWarehouses, getPostomats, isNovaPoshtaConfigured } from '@/lib/nova-poshta-service'

// GET /api/delivery/nova-poshta/warehouses?cityRef=xxx&query=№5&type=warehouse|postomat
export async function GET(request: Request) {
  try {
    if (!isNovaPoshtaConfigured()) {
      return NextResponse.json(
        { error: 'Nova Poshta API не налаштовано', warehouses: [] },
        { status: 503 }
      )
    }

    const { searchParams } = new URL(request.url)
    const cityRef = searchParams.get('cityRef')
    const query = searchParams.get('query')
    const type = searchParams.get('type') || 'warehouse'

    if (!cityRef) {
      return NextResponse.json(
        { error: 'Вкажіть cityRef', warehouses: [] },
        { status: 400 }
      )
    }

    let warehouses = []
    
    if (type === 'postomat') {
      warehouses = await getPostomats(cityRef)
    } else {
      warehouses = await getWarehouses(cityRef, query || undefined)
    }
    
    return NextResponse.json({ 
      warehouses: warehouses || [],
      cityRef,
      type 
    })
  } catch (error: any) {
    console.error('Nova Poshta warehouses error:', error)
    return NextResponse.json(
      { error: 'Помилка отримання відділень', warehouses: [] },
      { status: 500 }
    )
  }
}
