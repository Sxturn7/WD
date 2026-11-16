import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) {
    return NextResponse.json({ error: 'CAPTCHA is not configured.' }, { status: 503 })
  }

  const body: unknown = await request.json().catch(() => null)
  const token =
    typeof body === 'object' && body !== null && 'token' in body && typeof body.token === 'string'
      ? body.token
      : ''

  if (!token || token.length > 2048) {
    return NextResponse.json({ error: 'Complete the CAPTCHA challenge.' }, { status: 400 })
  }

  const formData = new FormData()
  formData.set('secret', secret)
  formData.set('response', token)

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    })
    const result = (await response.json()) as { success?: boolean }
    if (!response.ok || !result.success) {
      return NextResponse.json({ error: 'CAPTCHA verification failed. Please try again.' }, { status: 400 })
    }
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'CAPTCHA verification is temporarily unavailable.' }, { status: 503 })
  }
}
