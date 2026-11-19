'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { generateEventCode } from '@/lib/utils'
import type { PrizeTier } from '@/types'

export async function proposeEvent(
  name: string,
  description: string,
  winnersCount: number,
  prizes: PrizeTier[]
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Generate unique code
  let code = generateEventCode()
  let attempts = 0
  while (attempts < 10) {
    const { data: existing } = await supabase
      .from('events')
      .select('id')
      .eq('code', code)
      .single()
    if (!existing) break
    code = generateEventCode()
    attempts++
  }

  const { error } = await supabase.from('events').insert({
    name,
    description,
    code,
    entity_id: user.id,
    winners_count: winnersCount,
    prizes,
    status: 'pending',
  })

  if (error) return { error: error.message }

  revalidatePath('/entity')
  revalidatePath('/entity/proposals')
  return { success: true, code }
}

export async function getEntityEvents() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('events')
    .select('*')
    .eq('entity_id', user.id)
    .order('created_at', { ascending: false })

  return data ?? []
}

export async function announceWinners(
  eventId: string,
  winners: { student_email: string; prize_position: string; prize_amount: number }[]
) {
  const supabase = await createClient()

  const rows = await Promise.all(
    winners.map(async (winner) => {
      const { data } = await supabase
        .from('users')
        .select('id')
        .eq('email', winner.student_email.trim().toLowerCase())
        .maybeSingle()
      return {
        event_id: eventId,
        student_id: data?.id ?? null,
        student_email: winner.student_email.trim().toLowerCase(),
        prize_position: winner.prize_position,
        prize_amount: winner.prize_amount,
      }
    })
  )

  const { error } = await supabase
    .from('event_winners')
    .upsert(
      rows.map((row) => ({
        event_id: row.event_id,
        student_id: row.student_id,
        student_email: row.student_email,
        prize_position: row.prize_position,
        prize_amount: row.prize_amount,
      })),
      { onConflict: 'event_id,student_email' }
    )

  if (error) return { error: error.message }

  for (const row of rows) {
    if (!row.student_id) continue

    // Skip if claim already exists
    const { data: existing } = await supabase
      .from('claims')
      .select('id')
      .eq('student_id', row.student_id)
      .eq('event_id', eventId)
      .single()

    if (existing) continue

    // If student already has bank details saved, snapshot them
    const { data: bankRecord } = await supabase
      .from('user_bank_details')
      .select('bank_details')
      .eq('user_id', row.student_id)
      .maybeSingle()

    await supabase.from('claims').insert({
      student_id: row.student_id,
      event_id: eventId,
      prize_position: row.prize_position,
      prize_amount: row.prize_amount,
      bank_details_snapshot: bankRecord?.bank_details ?? null,
      status: 'winners_announced',
    })
  }

  revalidatePath('/entity/proposals')
  revalidatePath('/student')
  revalidatePath('/treasury/queue')
  return { success: true }
}

export async function getEntityEventWinners() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('event_winners')
    .select('*, student:users!event_winners_student_id_fkey(full_name, email)')

  // Group by event_id
  const map: Record<string, typeof data> = {}
  for (const row of data ?? []) {
    if (!map[row.event_id]) map[row.event_id] = []
    map[row.event_id]!.push(row)
  }
  return map
}
