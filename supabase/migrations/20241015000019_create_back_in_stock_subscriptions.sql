-- Back-in-stock subscriptions table
create extension if not exists "pgcrypto";
create table if not exists public.back_in_stock_subscriptions (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  created_at timestamp with time zone default now(),
  notified_at timestamp with time zone,
  unique (product_id, email)
);

alter table public.back_in_stock_subscriptions enable row level security;

-- Allow anyone to subscribe (guests or logged-in users)
create policy "Anyone can insert subscription" on public.back_in_stock_subscriptions
  for insert with check (true);

-- Allow users to view their own subscriptions when logged in
create policy "Users can view their own subscriptions" on public.back_in_stock_subscriptions
  for select using (auth.uid() = user_id);

-- Indexes for efficient lookups
create index if not exists idx_back_in_stock_product on public.back_in_stock_subscriptions(product_id);
create index if not exists idx_back_in_stock_notified on public.back_in_stock_subscriptions(notified_at);