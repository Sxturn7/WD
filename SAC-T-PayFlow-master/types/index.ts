export type UserRole = 'student' | 'entity' | 'treasury'

export type ClaimStatus =
  | 'winners_announced'
  | 'treasury_verified'
  | 'bank_details_shared'
  | 'payment_completed'

export type EventStatus = 'pending' | 'approved' | 'rejected'

export interface User {
  id: string
  email: string
  full_name: string | null
  roll_number: string | null
  role: UserRole
  created_at: string
}

export interface BankDetails {
  account_holder: string
  account_number: string
  ifsc_code: string
  bank_name: string
  branch: string
  upi_id?: string | null
}

export interface Event {
  id: string
  name: string
  code: string
  entity_id: string
  status: EventStatus
  winners_count: number
  prizes: PrizeTier[]
  description?: string | null
  created_at: string
  entity?: User
}

export interface PrizeTier {
  position: string
  amount: number
}

export interface Claim {
  id: string
  student_id: string
  event_id: string
  prize_position: string
  prize_amount: number
  bank_details_snapshot: BankDetails
  status: ClaimStatus
  created_at: string
  updated_at: string
  student?: User
  event?: Event
}

export interface EventWinner {
  id: string
  event_id: string
  student_id: string | null
  student_email: string
  prize_position: string
  prize_amount: number
  created_at: string
  student?: { full_name: string | null; email: string } | null
}

export interface Reimbursement {
  id: string
  entity_id: string
  event_name: string
  amount: number
  proof_url: string
  status: 'pending' | 'approved' | 'rejected'
  notes?: string | null
  created_at: string
  entity?: User
}
