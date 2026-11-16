'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { encryptJSON } from '@/lib/crypto'
import type { BankDetails } from '@/types'

export async function updateBankDetails(bankDetails: BankDetails) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('users')
    .update({ bank_details: encryptJSON(bankDetails) })
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/student/account')
  revalidatePath('/entity/account')
  return { success: true }
}

export async function updateEntityProfile(fullName: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('users')
    .update({ full_name: fullName })
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/entity/account')
  return { success: true }
}

export async function updateProfile(fullName: string, rollNumber: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('users')
    .update({ full_name: fullName, roll_number: rollNumber })
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/student/account')
  return { success: true }
}

export async function updateDisplayName(fullName: string, revalidateTo: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('users')
    .update({ full_name: fullName })
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath(revalidateTo)
  return { success: true }
}
