'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function submitReimbursement(
  eventName: string,
  amount: number,
  proofFile: FormData
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const file = proofFile.get('proof') as File
  if (!file) return { error: 'Proof file is required' }

  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}/${Date.now()}.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from('reimbursement-proofs')
    .upload(fileName, file)

  if (uploadError) return { error: uploadError.message }

  const {
    data: { publicUrl },
  } = supabase.storage
    .from('reimbursement-proofs')
    .getPublicUrl(fileName)

  const { error } = await supabase.from('reimbursements').insert({
    entity_id: user.id,
    event_name: eventName,
    amount,
    proof_url: publicUrl,
    status: 'pending',
  })

  if (error) return { error: error.message }

  revalidatePath('/entity/reimbursement')
  return { success: true }
}

export async function getEntityReimbursements() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('reimbursements')
    .select('*')
    .eq('entity_id', user.id)
    .order('created_at', { ascending: false })

  return data ?? []
}
