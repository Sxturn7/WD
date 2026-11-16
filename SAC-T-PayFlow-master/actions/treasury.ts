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
  const claims = data ?? []
  const studentIds = [...new Set(claims.map((claim) => claim.student_id))]
  const { data: bankRecords } = studentIds.length
    ? await supabase.from('user_bank_details').select('user_id, bank_details').in('user_id', studentIds)
    : { data: [] }
  const bankDetailsByUser = new Map((bankRecords ?? []).map((record) => [record.user_id, record.bank_details]))

  return claims.map((claim) => ({
    ...claim,
    bank_details_snapshot: decryptJSON<BankDetails>(
      claim.bank_details_snapshot ?? bankDetailsByUser.get(claim.student_id)
    ),
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
    .select('*, entity:users!reimbursements_entity_id_fkey(id, full_name, email)')
    .order('created_at', { ascending: false })

  const reimbursements = data ?? []
  const entityIds = [...new Set(reimbursements.map((item) => item.entity_id))]
  const { data: bankRecords } = entityIds.length
    ? await supabase.from('user_bank_details').select('user_id, bank_details').in('user_id', entityIds)
    : { data: [] }
  const bankDetailsByUser = new Map((bankRecords ?? []).map((record) => [record.user_id, record.bank_details]))

  return Promise.all(reimbursements.map(async (reimbursement) => {
    const [{ data: signed }, entityBankDetails] = await Promise.all([
      supabase.storage.from('reimbursement-proofs').createSignedUrl(reimbursement.proof_url, 60 * 60),
      Promise.resolve(decryptJSON<BankDetails>(bankDetailsByUser.get(reimbursement.entity_id))),
    ])
    return {
      ...reimbursement,
      proof_url: signed?.signedUrl ?? '',
      entity: reimbursement.entity ? { ...reimbursement.entity, bank_details: entityBankDetails } : null,
    }
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
