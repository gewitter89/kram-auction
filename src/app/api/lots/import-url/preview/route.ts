import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth-config'
import { fetchMarketplaceListing } from '@/lib/marketplace-import'

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Необхідна авторизація' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const urls = Array.isArray(body.urls) ? body.urls : Array.isArray(body.olxUrls) ? body.olxUrls : String(body.url || body.olxUrl || '').split(/\s+/)
  const uniqueUrls: string[] = [...new Set(urls.map((url: unknown) => String(url).trim()).filter(Boolean) as string[])].slice(0, 10)
  if (uniqueUrls.length === 0) return NextResponse.json({ error: 'Додайте хоча б одне посилання на маркетплейс.' }, { status: 400 })

  const results = await Promise.all(uniqueUrls.map(async sourceUrl => {
    try {
      const item = await fetchMarketplaceListing(sourceUrl)
      return { ok: true, item }
    } catch (error) {
      const code = error instanceof Error ? error.message : ''
      return {
        ok: false,
        sourceUrl,
        olxUrl: sourceUrl,
        error: code === 'INVALID_MARKETPLACE_URL' ? 'Некоректне посилання' : 'Не вдалося прочитати оголошення',
      }
    }
  }))

  return NextResponse.json({ results })
}
