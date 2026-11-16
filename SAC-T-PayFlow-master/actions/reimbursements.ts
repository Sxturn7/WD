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

  const file = proofFile.get('proof')
  if (!(file instanceof File) || file.size === 0) return { error: 'Proof file is required' }
  if (file.size > 10 * 1024 * 1024) return { error: 'Proof file must be 10MB or smaller.' }

  const extensionByType: Record<string, string> = {
    'application/pdf': 'pdf',
    'image/png': 'png',
    'image/jpeg': 'jpg',
  }
  const fileExt = extensionByType[file.type]
  if (!fileExt) return { error: 'Upload a PDF, PNG, or JPG file.' }
  const signature = new Uint8Array(await file.slice(0, 8).arrayBuffer())
  const validSignature = file.type === 'application/pdf'
    ? signature[0] === 0x25 && signature[1] === 0x50 && signature[2] === 0x44 && signature[3] === 0x46
    : file.type === 'image/png'
      ? signature.slice(0, 8).join(',') === '137,80,78,71,13,10,26,10'
      : signature[0] === 0xff && signature[1] === 0xd8 && signature[2] === 0xff
  if (!validSignature) return { error: 'The file contents do not match its type.' }
  if (!eventName.trim() || eventName.trim().length > 120) return { error: 'Enter an event name under 120 characters.' }
  if (!Number.isFinite(amount) || amount <= 0 || amount > 10000000) return { error: 'Enter a valid reimbursement amount.' }

  const fileName = `${user.id}/${crypto.randomUUID()}.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from('reimbursement-proofs')
    .upload(fileName, file)

  if (uploadError) return { error: uploadError.message }

  const { error } = await supabase.from('reimbursements').insert({
    entity_id: user.id,
    event_name: eventName.trim(),
    amount,
    proof_url: fileName,
    status: 'pending',
  })

  if (error) {
    await supabase.storage.from('reimbursement-proofs').remove([fileName])
    return { error: 'Could not save the reimbursement request. Please try again.' }
  }

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

  return Promise.all((data ?? []).map(async (reimbursement) => {
    const { data: signed } = await supabase.storage
      .from('reimbursement-proofs')
      .createSignedUrl(reimbursement.proof_url, 60 * 60)
    return { ...reimbursement, proof_url: signed?.signedUrl ?? '' }
  }))
}
