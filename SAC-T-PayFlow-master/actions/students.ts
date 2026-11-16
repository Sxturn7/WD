'use server'

import { createClient } from '@/lib/supabase/server'

export async function searchStudents(query: string) {
  if (!query || query.length < 2) return []
  const supabase = await createClient()
  const { data } = await supabase
    .from('users')
    .select('id, full_name, email, roll_number')
    .eq('role', 'student')
    .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
    .limit(8)
  return data ?? []
}
