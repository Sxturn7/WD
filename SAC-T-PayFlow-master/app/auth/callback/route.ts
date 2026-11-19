import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isIIMEmail } from '@/lib/utils'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const requestedNext = searchParams.get('next')
  const next = requestedNext?.startsWith('/') && !requestedNext.startsWith('//') ? requestedNext : null

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const email = user.email ?? ''

        // Enforce domain
        if (!isIIMEmail(email)) {
          await supabase.auth.signOut()
          return NextResponse.redirect(`${origin}/?error=domain`)
        }

        // Upsert user profile
        await supabase.from('users').upsert(
          {
            id: user.id,
            email: email.toLowerCase(),
            full_name: user.user_metadata?.full_name ?? null,
            role: 'student',
          },
          { onConflict: 'id', ignoreDuplicates: true }
        )

        // Get role and redirect
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single()

        const role = profile?.role ?? 'student'
        return NextResponse.redirect(new URL(next ?? `/${role}`, origin))
      }
    }
  }

  return NextResponse.redirect(`${origin}/?error=auth`)
}
