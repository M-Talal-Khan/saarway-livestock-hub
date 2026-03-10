-- Add tracking columns to farm_billing to support advanced period snapshots

alter table farm_billing
  add column if not exists previous_animals integer not null default 0,
  add column if not exists new_animals integer not null default 0,
  add column if not exists removed_animals integer not null default 0;

-- Optionally, we can define how 'animals_count' is calculated logically, but for now 
-- it's simply: previous_animals + new_animals - removed_animals
