'use server'

import { createClient } from '@/lib/supabase/server'
import { decryptJSON } from '@/lib/crypto'
import type { BankDetails } from '@/types'

export async function getStudentClaims() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('claims')
    .select(`*, event:events(*)`)
    .eq('student_id', user.id)
    .order('created_at', { ascending: false })

  return (data ?? []).map((claim) => ({
    ...claim,
    bank_details_snapshot: claim.bank_details_snapshot
      ? decryptJSON<BankDetails>(claim.bank_details_snapshot)
      : null,
  }))
}
