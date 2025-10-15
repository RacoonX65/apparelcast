-- Ensure required extensions are available
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Create canonical brands table with RLS and seeding from products
create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  constraint brands_name_not_empty check (length(trim(name)) > 0)
);

-- Prevent duplicate brand names regardless of case/whitespace
create unique index if not exists brands_name_ci_unique on public.brands (lower(trim(name)));

-- Trigger to update updated_at on change
create or replace function public.update_brands_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_brands_updated on public.brands;
create trigger on_brands_updated
  before update on public.brands
  for each row
  execute function public.update_brands_updated_at();

-- Enable RLS
alter table public.brands enable row level security;

-- Policies: public read, admin write
drop policy if exists "Anyone can view brands" on public.brands;
create policy "Anyone can view brands"
  on public.brands for select
  using (true);

drop policy if exists "Admins can insert brands" on public.brands;
create policy "Admins can insert brands"
  on public.brands for insert
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.is_admin = true
    )
  );

drop policy if exists "Admins can update brands" on public.brands;
create policy "Admins can update brands"
  on public.brands for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.is_admin = true
    )
  );

drop policy if exists "Admins can delete brands" on public.brands;
create policy "Admins can delete brands"
  on public.brands for delete
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.is_admin = true
    )
  );

-- Seed canonical brands from existing products (normalized)
insert into public.brands (name)
select distinct initcap(trim(brand))
from public.products
where brand is not null and trim(brand) <> ''
on conflict do nothing;