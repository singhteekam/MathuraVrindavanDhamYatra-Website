import crypto from 'crypto'

function secret() {
  return process.env.NEXTAUTH_SECRET ?? 'newsletter-fallback-secret'
}

export function generateUnsubscribeToken(userId: string): string {
  return crypto
    .createHmac('sha256', secret())
    .update(userId)
    .digest('base64url')
}

export function verifyUnsubscribeToken(userId: string, token: string): boolean {
  const expected = generateUnsubscribeToken(userId)
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(token),
    )
  } catch {
    return false
  }
}

export function buildUnsubscribeUrl(userId: string, baseUrl: string): string {
  const token = generateUnsubscribeToken(userId)
  return `${baseUrl}/api/newsletters/unsubscribe?userId=${userId}&token=${encodeURIComponent(token)}`
}
