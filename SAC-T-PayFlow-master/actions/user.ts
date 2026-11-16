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
  if (!bankDetails || typeof bankDetails !== 'object') return { error: 'Invalid bank details.' }

  const accountHolder = bankDetails.account_holder?.trim()
  const accountNumber = bankDetails.account_number?.replace(/\s/g, '')
  const ifscCode = bankDetails.ifsc_code?.trim().toUpperCase()
  if (!accountHolder || accountHolder.length > 100 || !/^[0-9]{6,20}$/.test(accountNumber ?? '') || !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode ?? '')) {
    return { error: 'Enter a valid account holder, account number, and IFSC code.' }
  }
  const normalizedDetails = {
    ...bankDetails,
    account_holder: accountHolder,
    account_number: accountNumber,
    ifsc_code: ifscCode,
    bank_name: bankDetails.bank_name?.trim().slice(0, 100) ?? '',
    branch: bankDetails.branch?.trim().slice(0, 100) ?? '',
    upi_id: bankDetails.upi_id?.trim().slice(0, 100) ?? null,
  }

  const { error } = await supabase
    .from('user_bank_details')
    .upsert({ user_id: user.id, bank_details: encryptJSON(normalizedDetails) }, { onConflict: 'user_id' })

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
