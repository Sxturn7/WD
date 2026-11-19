'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { encryptJSON, decryptJSON } from '@/lib/crypto'
import type { BankDetails } from '@/types'

export async function getStudentClaims() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const userEmail = user.email?.trim().toLowerCase()
  if (userEmail) {
    // 1. Link any unlinked event_winners matching this student's email
    const { data: unlinkedWinners } = await supabase
      .from('event_winners')
      .select('event_id, prize_position, prize_amount')
      .eq('student_email', userEmail)
      .is('student_id', null)

    if (unlinkedWinners && unlinkedWinners.length > 0) {
      await supabase
        .from('event_winners')
        .update({ student_id: user.id })
        .eq('student_email', userEmail)
        .is('student_id', null)

      // Fetch student's saved bank details if available
      const { data: bankRecord } = await supabase
        .from('user_bank_details')
        .select('bank_details')
        .eq('user_id', user.id)
        .maybeSingle()

      // Create claims for any winning events that don't have one yet
      for (const winner of unlinkedWinners) {
        const { data: existing } = await supabase
          .from('claims')
          .select('id')
          .eq('student_id', user.id)
          .eq('event_id', winner.event_id)
          .maybeSingle()

        if (!existing) {
          await supabase.from('claims').insert({
            student_id: user.id,
            event_id: winner.event_id,
            prize_position: winner.prize_position,
            prize_amount: winner.prize_amount,
            bank_details_snapshot: bankRecord?.bank_details ?? null,
            status: 'winners_announced',
          })
        }
      }
    }
  }

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

export async function submitPrizeClaim({
  claimId,
  bankDetails,
}: {
  claimId: string
  bankDetails: BankDetails
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const accountHolder = bankDetails.account_holder?.trim()
  const accountNumber = bankDetails.account_number?.replace(/\s/g, '')
  const ifscCode = bankDetails.ifsc_code?.trim().toUpperCase()

  if (!accountHolder) {
    return { error: 'Account holder name is required' }
  }
  if (!accountNumber || !/^[0-9A-Za-z]{6,25}$/.test(accountNumber)) {
    return { error: 'Please enter a valid account number' }
  }
  if (!ifscCode || !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode)) {
    return { error: 'Please enter a valid 11-character IFSC code (e.g. SBIN0001234)' }
  }

  const normalizedDetails: BankDetails = {
    account_holder: accountHolder,
    account_number: accountNumber,
    ifsc_code: ifscCode,
    bank_name: bankDetails.bank_name?.trim() || '',
    branch: bankDetails.branch?.trim() || '',
    upi_id: bankDetails.upi_id?.trim() || null,
  }

  const encrypted = encryptJSON(normalizedDetails)

  // 1. Save to user_bank_details so future claims pre-fill automatically
  await supabase
    .from('user_bank_details')
    .upsert({ user_id: user.id, bank_details: encrypted }, { onConflict: 'user_id' })

  // 2. Update claim's snapshot and advance status to bank_details_shared
  const { error } = await supabase
    .from('claims')
    .update({
      bank_details_snapshot: encrypted,
      status: 'bank_details_shared',
    })
    .eq('id', claimId)
    .eq('student_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/student')
  revalidatePath('/student/claims')
  revalidatePath('/student/tracker')
  revalidatePath('/treasury/queue')
  return { success: true }
}
