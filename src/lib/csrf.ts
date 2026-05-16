import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const CSRF_TOKEN_NAME = 'csrf-token'

export function generateCsrfToken(): string {
  return crypto.randomUUID()
}

export async function setCsrfCookie(): Promise<string> {
  const token = generateCsrfToken()
  const cookieStore = await cookies()
  cookieStore.set(CSRF_TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 24 hours
  })
  return token
}

export async function validateCsrfToken(request: NextRequest): Promise<boolean> {
  // Skip for GET/HEAD requests
  if (['GET', 'HEAD'].includes(request.method)) {
    return true
  }

  const cookieStore = await cookies()
  const cookieToken = cookieStore.get(CSRF_TOKEN_NAME)?.value
  
  // Get token from header
  const headerToken = request.headers.get('x-csrf-token')
  
  if (!cookieToken || !headerToken) {
    return false
  }

  return cookieToken === headerToken
}

export async function csrfMiddleware(request: NextRequest) {
  if (!await validateCsrfToken(request)) {
    return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 })
  }
  return null
}
