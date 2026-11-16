import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const secret = process.env.RECAPTCHA_SECRET_KEY
  if (!secret) {
    return NextResponse.json({ error: 'CAPTCHA is not configured.' }, { status: 503 })
  }

  const body: unknown = await request.json().catch(() => null)
  const token =
    typeof body === 'object' && body !== null && 'token' in body && typeof body.token === 'string'
      ? body.token
      : ''
  const action =
    typeof body === 'object' && body !== null && 'action' in body &&
    (body.action === 'login' || body.action === 'signup')
      ? body.action
      : ''

  if (!token || token.length > 2048 || !action) {
    return NextResponse.json({ error: 'A valid CAPTCHA token and action are required.' }, { status: 400 })
  }

  const formData = new URLSearchParams({ secret, response: token })

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData,
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    })
    const result = (await response.json()) as {
      success?: boolean
      score?: number
      action?: string
    }
    if (
      !response.ok ||
      !result.success ||
      result.action !== action ||
      typeof result.score !== 'number' ||
      result.score < 0.5
    ) {
      return NextResponse.json({ error: 'CAPTCHA verification failed. Please try again.' }, { status: 400 })
    }
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'CAPTCHA verification is temporarily unavailable.' }, { status: 503 })
  }
}
