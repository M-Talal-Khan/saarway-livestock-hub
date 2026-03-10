-- Creates the farm_billing table to persistently track super admin revenue per farm per month

create table if not exists farm_billing (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid references farms(id) not null,
  billing_period date not null, -- Stores the first of the month, e.g., '2023-10-01'
  animals_count integer not null default 0,
  listings_count integer not null default 0,
  amount_owed numeric not null default 0,
  amount_paid numeric not null default 0,
  status text not null default 'unpaid' check (status in ('unpaid', 'partial', 'paid')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Ensure only one billing record per farm per month
alter table farm_billing add constraint unique_farm_period unique (farm_id, billing_period);

-- Enable RLS
alter table farm_billing enable row level security;

-- Super admins have full access
create policy "Super admins have full access to farm_billing"
  on farm_billing
  for all
  to authenticated
  using (
    (select raw_user_meta_data->>'role' from auth.users where id = auth.uid()) = 'super_admin'
  )
  with check (
    (select raw_user_meta_data->>'role' from auth.users where id = auth.uid()) = 'super_admin'
  );
