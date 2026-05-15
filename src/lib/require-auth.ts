/**
 * Helper for protected actions on public pages.
 * If user is not logged in, redirect to login with callback.
 */
export function requireAuthAction(callbackUrl: string, action?: string): string {
  const params = new URLSearchParams({ callbackUrl })
  if (action) params.set('action', action)
  return `/auth/login?${params.toString()}`
}

/**
 * Check if OAuth provider is configured
 */
export function isOAuthConfigured(provider: 'google' | 'apple'): boolean {
  if (provider === 'google') {
    const id = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    return !!id && id !== 'replace_me' && id.length > 10
  }
  if (provider === 'apple') {
    const id = process.env.NEXT_PUBLIC_APPLE_CLIENT_ID
    return !!id && id !== 'replace_me' && id.length > 10
  }
  return false
}
