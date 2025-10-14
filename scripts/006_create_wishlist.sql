-- Create wishlist table for user wishlists
create table if not exists public.wishlist (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  created_at timestamp with time zone default now(),
  unique(user_id, product_id) -- One wishlist entry per user per product
);

-- Create indexes for better performance
create index if not exists idx_wishlist_user_id on public.wishlist(user_id);
create index if not exists idx_wishlist_product_id on public.wishlist(product_id);
create index if not exists idx_wishlist_created_at on public.wishlist(created_at desc);
create index if not exists idx_wishlist_user_product on public.wishlist(user_id, product_id);

-- Enable Row Level Security
alter table public.wishlist enable row level security;

-- Wishlist policies
-- Users can only view their own wishlist items
create policy "Users can view own wishlist"
  on public.wishlist for select
  using (auth.uid() = user_id);

-- Users can add items to their own wishlist
create policy "Users can add to own wishlist"
  on public.wishlist for insert
  with check (auth.uid() = user_id);

-- Users can remove items from their own wishlist
create policy "Users can remove from own wishlist"
  on public.wishlist for delete
  using (auth.uid() = user_id);

-- Admins can view all wishlist items (for analytics)
create policy "Admins can view all wishlists"
  on public.wishlist for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.is_admin = true
    )
  );

-- Function to check if product is in user's wishlist
create or replace function is_product_in_wishlist(product_uuid uuid, user_uuid uuid)
returns boolean as $$
declare
  wishlist_exists boolean;
begin
  select exists(
    select 1 from public.wishlist
    where product_id = product_uuid
    and user_id = user_uuid
  ) into wishlist_exists;
  
  return wishlist_exists;
end;
$$ language plpgsql;

-- Function to get wishlist count for a user
create or replace function get_user_wishlist_count(user_uuid uuid)
returns integer as $$
declare
  wishlist_count integer;
begin
  select count(*) into wishlist_count
  from public.wishlist
  where user_id = user_uuid;
  
  return wishlist_count;
end;
$$ language plpgsql;

-- Function to toggle wishlist item (add if not exists, remove if exists)
create or replace function toggle_wishlist_item(product_uuid uuid, user_uuid uuid)
returns boolean as $$
declare
  item_exists boolean;
begin
  -- Check if item exists
  select exists(
    select 1 from public.wishlist
    where product_id = product_uuid
    and user_id = user_uuid
  ) into item_exists;
  
  if item_exists then
    -- Remove from wishlist
    delete from public.wishlist
    where product_id = product_uuid
    and user_id = user_uuid;
    return false; -- Item removed
  else
    -- Add to wishlist
    insert into public.wishlist (product_id, user_id)
    values (product_uuid, user_uuid);
    return true; -- Item added
  end if;
end;
$$ language plpgsql;