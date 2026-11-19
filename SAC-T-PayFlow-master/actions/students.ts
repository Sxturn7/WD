'use server'

import { createClient } from '@/lib/supabase/server'

export async function searchStudents(query: string) {
  const clean = query?.trim().replace(/[,]/g, '')
  if (!clean || clean.length < 2) return []
  const supabase = await createClient()
  const { data } = await supabase
    .from('student_directory')
    .select('id, full_name, email, roll_number')
    .or(`full_name.ilike.%${clean}%,email.ilike.%${clean}%,roll_number.ilike.%${clean}%`)
    .limit(8)
  return data ?? []
}
