import { NextResponse } from 'next/server'
import { searchCities, isNovaPoshtaConfigured } from '@/lib/nova-poshta-service'

// GET /api/delivery/nova-poshta/cities?query=Київ
export async function GET(request: Request) {
  try {
    if (!isNovaPoshtaConfigured()) {
      return NextResponse.json(
        { error: 'Nova Poshta API не налаштовано', cities: [] },
        { status: 503 }
      )
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')

    if (!query || query.length < 2) {
      return NextResponse.json({ cities: [] })
    }

    const cities = await searchCities(query)
    
    return NextResponse.json({ 
      cities: cities || [],
      query 
    })
  } catch (error: any) {
    console.error('Nova Poshta cities error:', error)
    return NextResponse.json(
      { error: 'Помилка пошуку міст', cities: [] },
      { status: 500 }
    )
  }
}
