-- Create the platform_settings table to store global configurations

create table if not exists platform_settings (
  id integer primary key default 1
);

-- Safely add columns if they don't exist yet
alter table platform_settings 
  add column if not exists sub_fee_per_animal numeric not null default 50,
  add column if not exists list_fee_per_listing numeric not null default 50,
  add column if not exists platform_name text not null default 'Saarway',
  add column if not exists contact_email text not null default 'info@saarway.com',
  add column if not exists updated_at timestamptz default now();

-- Ensure only one row exists (drop and recreate to be safe)
alter table platform_settings drop constraint if exists single_row;
alter table platform_settings add constraint single_row check (id = 1);

-- Enable RLS
alter table platform_settings enable row level security;

-- Super admins have full access (drop and recreate policy)
drop policy if exists "Super admins have full access to platform_settings" on platform_settings;
create policy "Super admins have full access to platform_settings"
  on platform_settings
  for all
  to authenticated
  using (
    (select raw_user_meta_data->>'role' from auth.users where id = auth.uid()) = 'super_admin'
  )
  with check (
    (select raw_user_meta_data->>'role' from auth.users where id = auth.uid()) = 'super_admin'
  );

-- Insert default row if it doesn't exist
insert into platform_settings (id, sub_fee_per_animal, list_fee_per_listing, platform_name, contact_email) 
values (1, 50, 50, 'Saarway', 'info@saarway.com') 
on conflict (id) do nothing;
