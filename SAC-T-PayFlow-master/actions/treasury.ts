'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { decryptJSON } from '@/lib/crypto'
import type { ClaimStatus, BankDetails } from '@/types'

export async function getAllClaims(filter?: 'pending' | 'processing' | 'completed') {
  const supabase = await createClient()

  let query = supabase
    .from('claims')
    .select(
      `*, student:users!claims_student_id_fkey(full_name, email, roll_number), event:events(*)`
    )
    .order('updated_at', { ascending: false })

  if (filter === 'pending') {
    query = query.eq('status', 'winners_announced')
  } else if (filter === 'processing') {
    query = query.in('status', ['treasury_verified', 'bank_details_shared'])
  } else if (filter === 'completed') {
    query = query.eq('status', 'payment_completed')
  }

  const { data } = await query

  // Decrypt bank_details_snapshot for treasury view
  return (data ?? []).map((claim) => ({
    ...claim,
    bank_details_snapshot: claim.bank_details_snapshot
      ? decryptJSON<BankDetails>(claim.bank_details_snapshot)
      : null,
  }))
}

export async function updateClaimStatus(claimId: string, status: ClaimStatus) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('claims')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', claimId)

  if (error) return { error: error.message }

  revalidatePath('/treasury/queue')
  revalidatePath('/student/tracker')
  return { success: true }
}

export async function markClaimPaid(claimId: string) {
  return updateClaimStatus(claimId, 'payment_completed')
}

export async function getAllReimbursements() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('reimbursements')
    .select(`*, entity:users!reimbursements_entity_id_fkey(full_name, email, bank_details)`)
    .order('created_at', { ascending: false })

  // Decrypt entity bank_details for treasury view
  return (data ?? []).map((r) => ({
    ...r,
    entity: r.entity
      ? {
          ...r.entity,
          bank_details: r.entity.bank_details
            ? decryptJSON<BankDetails>(r.entity.bank_details)
            : null,
        }
      : null,
  }))
}

export async function approveReimbursement(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('reimbursements')
    .update({ status: 'approved', updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/treasury/reimbursements')
  revalidatePath('/entity/reimbursement')
  return { success: true }
}

export async function rejectReimbursement(id: string, notes?: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('reimbursements')
    .update({ status: 'rejected', notes: notes ?? null, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/treasury/reimbursements')
  revalidatePath('/entity/reimbursement')
  return { success: true }
}
