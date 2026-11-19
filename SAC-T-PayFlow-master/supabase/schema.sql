-- ============================================================
-- SAC Treasury Portal — Supabase Schema
-- Run this in Supabase SQL Editor (project > SQL Editor)
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- USERS TABLE
-- ============================================================
create table public.users (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text not null unique,
  full_name    text,
  roll_number  text,
  role         text not null default 'student' check (role in ('student', 'entity', 'treasury')),
  bank_details jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Domain constraint — only @iimidr.ac.in emails
alter table public.users
  add constraint users_email_domain
  check (email like '%@iimidr.ac.in');

-- ============================================================
-- EVENTS TABLE
-- ============================================================
create table public.events (
  id           uuid primary key default uuid_generate_v4(),
  name         text not null,
  description  text,
  code         char(4) not null unique,
  entity_id    uuid not null references public.users(id) on delete cascade,
  status       text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  winners_count int not null default 1,
  prizes       jsonb not null default '[]',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index events_entity_id_idx on public.events(entity_id);
create index events_status_idx on public.events(status);

-- ============================================================
-- CLAIMS TABLE
-- ============================================================
create table public.claims (
  id                    uuid primary key default uuid_generate_v4(),
  student_id            uuid not null references public.users(id) on delete cascade,
  event_id              uuid not null references public.events(id) on delete cascade,
  prize_position        text not null,
  prize_amount          numeric(12, 2) not null,
  bank_details_snapshot jsonb not null,
  status                text not null default 'winners_announced'
    check (status in (
      'winners_announced',
      'entity_approved',
      'treasury_verified',
      'bank_details_shared',
      'payment_completed'
    )),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  -- prevent duplicate claims per student per event
  unique (student_id, event_id)
);

create index claims_student_id_idx on public.claims(student_id);
create index claims_event_id_idx on public.claims(event_id);
create index claims_status_idx on public.claims(status);

-- ============================================================
-- REIMBURSEMENTS TABLE
-- ============================================================
create table public.reimbursements (
  id         uuid primary key default uuid_generate_v4(),
  entity_id  uuid not null references public.users(id) on delete cascade,
  event_name text not null,
  amount     numeric(12, 2) not null,
  proof_url  text not null,
  status     text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  notes      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index reimbursements_entity_id_idx on public.reimbursements(entity_id);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger users_updated_at
  before update on public.users
  for each row execute procedure update_updated_at();

create trigger events_updated_at
  before update on public.events
  for each row execute procedure update_updated_at();

create trigger claims_updated_at
  before update on public.claims
  for each row execute procedure update_updated_at();

create trigger reimbursements_updated_at
  before update on public.reimbursements
  for each row execute procedure update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
alter table public.users enable row level security;
alter table public.events enable row level security;
alter table public.claims enable row level security;
alter table public.reimbursements enable row level security;

-- Helper: get current user role
create or replace function get_user_role(uid uuid)
returns text as $$
  select role from public.users where id = uid;
$$ language sql security definer;

-- ============================================================
-- USERS POLICIES
-- ============================================================
-- Users can read their own row
create policy "users_select_own" on public.users
  for select using (auth.uid() = id);

-- Treasury can read all users
create policy "users_select_treasury" on public.users
  for select using (get_user_role(auth.uid()) = 'treasury');

-- Entity can read student profiles (for claim verification)
create policy "users_select_entity" on public.users
  for select using (get_user_role(auth.uid()) = 'entity');

-- Users can update their own row
create policy "users_update_own" on public.users
  for update using (auth.uid() = id);

-- Insert via auth callback only (service role)
create policy "users_insert_own" on public.users
  for insert with check (auth.uid() = id);

-- ============================================================
-- EVENTS POLICIES
-- ============================================================
-- Approved events visible to all authenticated users (for student claims)
create policy "events_select_approved" on public.events
  for select using (
    status = 'approved'
    or entity_id = auth.uid()
    or get_user_role(auth.uid()) = 'treasury'
  );

-- Only entity can insert their own events
create policy "events_insert_entity" on public.events
  for insert with check (
    entity_id = auth.uid()
    and get_user_role(auth.uid()) = 'entity'
  );

-- Entity can update their own events
create policy "events_update_entity" on public.events
  for update using (
    entity_id = auth.uid()
    or get_user_role(auth.uid()) = 'treasury'
  );

-- ============================================================
-- CLAIMS POLICIES
-- ============================================================
-- Students see only their own claims
create policy "claims_select_student" on public.claims
  for select using (
    student_id = auth.uid()
    or get_user_role(auth.uid()) in ('treasury', 'entity')
  );

-- Students can insert claims
create policy "claims_insert_student" on public.claims
  for insert with check (
    student_id = auth.uid()
    and get_user_role(auth.uid()) = 'student'
  );

-- Entity and treasury can update claim status
create policy "claims_update" on public.claims
  for update using (
    get_user_role(auth.uid()) in ('entity', 'treasury')
  );

-- ============================================================
-- REIMBURSEMENTS POLICIES
-- ============================================================
-- Entity sees only their own reimbursements; treasury sees all
create policy "reimbursements_select" on public.reimbursements
  for select using (
    entity_id = auth.uid()
    or get_user_role(auth.uid()) = 'treasury'
  );

-- Only entities can insert
create policy "reimbursements_insert" on public.reimbursements
  for insert with check (
    entity_id = auth.uid()
    and get_user_role(auth.uid()) = 'entity'
  );

-- Treasury can update (approve/reject)
create policy "reimbursements_update" on public.reimbursements
  for update using (
    get_user_role(auth.uid()) = 'treasury'
  );

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
-- Run this after creating the bucket in Supabase Storage UI
-- Bucket name: reimbursement-proofs (public)

insert into storage.buckets (id, name, public)
values ('reimbursement-proofs', 'reimbursement-proofs', true)
on conflict (id) do nothing;

create policy "reimbursement_proofs_insert" on storage.objects
  for insert with check (
    bucket_id = 'reimbursement-proofs'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "reimbursement_proofs_select" on storage.objects
  for select using (bucket_id = 'reimbursement-proofs');

-- ============================================================
-- GOOGLE OAUTH TRIGGER — auto-create user on first login
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- Only insert if email ends with @iimidr.ac.in
  if new.email like '%@iimidr.ac.in' then
    insert into public.users (id, email, full_name, role)
    values (
      new.id,
      new.email,
      coalesce(new.raw_user_meta_data->>'full_name', null),
      'student'
    )
    on conflict (id) do nothing;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
