import crypto from 'crypto'

export function createToken() {
  const token = crypto.randomBytes(32).toString('hex')
  const hash = crypto.createHash('sha256').update(token).digest('hex')
  return { token, hash }
}

export function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export function tokenExpiry(hours = 24) {
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString()
}

export function isExpired(iso?: string) {
  return !iso || new Date(iso).getTime() < Date.now()
}
