import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth-config'
import { fetchOlxListing } from '@/lib/olx-import'

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Необхідна авторизація' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const urls = Array.isArray(body.olxUrls) ? body.olxUrls : String(body.olxUrl || '').split(/\s+/)
  const uniqueUrls: string[] = [...new Set(urls.map((url: unknown) => String(url).trim()).filter(Boolean) as string[])].slice(0, 10)
  if (uniqueUrls.length === 0) return NextResponse.json({ error: 'Додайте хоча б одне OLX-посилання.' }, { status: 400 })

  const results = await Promise.all(uniqueUrls.map(async olxUrl => {
    try {
      const item = await fetchOlxListing(olxUrl)
      return { ok: true, item }
    } catch (error) {
      return { ok: false, olxUrl, error: error instanceof Error && error.message === 'INVALID_OLX_URL' ? 'Некоректне OLX-посилання' : 'Не вдалося прочитати оголошення' }
    }
  }))

  return NextResponse.json({ results })
}
