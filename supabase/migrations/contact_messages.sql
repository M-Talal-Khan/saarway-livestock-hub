-- FORCE RECREATE contact_messages
-- Run this in Supabase SQL Editor

-- 1. Drop existing table to ensure a clean slate
drop table if exists contact_messages cascade;

-- 2. Recreate the table with exact column names 
create table contact_messages (
  id uuid primary key default gen_random_uuid(),
  user_type text not null check (user_type in ('Farm Owner','General User')),
  name text not null,
  email text not null,
  phone text,
  message text not null,
  status text not null default 'Unread' check (status in ('Unread','Read','Resolved')),
  created_at timestamptz default now()
);

-- 3. Enable RLS
alter table contact_messages enable row level security;

-- 4. Policies
create policy "Allow public inserts" on contact_messages
  for insert with check (true);

create policy "Allow super admin full access" on contact_messages
  for all using (true);
  
-- 5. Force Postgres to notify PostgREST schema cache to reload
NOTIFY pgrst, 'reload schema';
