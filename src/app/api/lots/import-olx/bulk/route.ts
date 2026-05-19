import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth-config'

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Необхідна авторизація' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const urls = Array.isArray(body.olxUrls)
    ? body.olxUrls.map((url: unknown) => String(url).trim()).filter(Boolean)
    : String(body.olxUrls || body.olxUrl || '').split(/\s+/).map(url => url.trim()).filter(Boolean)
  const uniqueUrls = [...new Set(urls)].slice(0, 10)
  if (uniqueUrls.length === 0) return NextResponse.json({ error: 'Додайте хоча б одне OLX-посилання.' }, { status: 400 })

  const origin = new URL(request.url).origin
  const cookie = request.headers.get('cookie') || ''
  const results = []
  for (const olxUrl of uniqueUrls) {
    try {
      const res = await fetch(`${origin}/api/lots/import-olx`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', cookie },
        body: JSON.stringify({ olxUrl }),
      })
      const data = await res.json().catch(() => ({}))
      results.push({ olxUrl, ok: res.ok, ...data })
    } catch {
      results.push({ olxUrl, ok: false, error: 'Помилка імпорту' })
    }
  }
  return NextResponse.json({ results })
}
