-- Add timestamp update triggers for tables missing them
-- This ensures updated_at fields are automatically maintained

-- Function to update updated_at timestamp (reusable)
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Add updated_at triggers for existing tables that don't have them

-- Products table trigger
drop trigger if exists update_products_timestamp on public.products;
create trigger update_products_timestamp
  before update on public.products
  for each row
  execute function update_updated_at_column();

-- Profiles table trigger
drop trigger if exists update_profiles_timestamp on public.profiles;
create trigger update_profiles_timestamp
  before update on public.profiles
  for each row
  execute function update_updated_at_column();

-- Orders table trigger
drop trigger if exists update_orders_timestamp on public.orders;
create trigger update_orders_timestamp
  before update on public.orders
  for each row
  execute function update_updated_at_column();

-- Addresses table trigger
drop trigger if exists update_addresses_timestamp on public.addresses;
create trigger update_addresses_timestamp
  before update on public.addresses
  for each row
  execute function update_updated_at_column();

-- Order items table trigger (if it has updated_at column)
-- Note: Check if order_items table has updated_at column before creating trigger
do $$
begin
  if exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' 
    and table_name = 'order_items' 
    and column_name = 'updated_at'
  ) then
    execute 'drop trigger if exists update_order_items_timestamp on public.order_items';
    execute 'create trigger update_order_items_timestamp
      before update on public.order_items
      for each row
      execute function update_updated_at_column()';
  end if;
end $$;

-- Cart items table trigger (if it has updated_at column)
do $$
begin
  if exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' 
    and table_name = 'cart_items' 
    and column_name = 'updated_at'
  ) then
    execute 'drop trigger if exists update_cart_items_timestamp on public.cart_items';
    execute 'create trigger update_cart_items_timestamp
      before update on public.cart_items
      for each row
      execute function update_updated_at_column()';
  end if;
end $$;

-- Add updated_at columns to tables that might be missing them
-- This is a safe operation that only adds the column if it doesn't exist

-- Add updated_at to order_items if missing
do $$
begin
  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' 
    and table_name = 'order_items' 
    and column_name = 'updated_at'
  ) then
    alter table public.order_items add column updated_at timestamp with time zone default now();
    
    -- Create the trigger now that the column exists
    create trigger update_order_items_timestamp
      before update on public.order_items
      for each row
      execute function update_updated_at_column();
  end if;
end $$;

-- Add updated_at to cart_items if missing
do $$
begin
  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' 
    and table_name = 'cart_items' 
    and column_name = 'updated_at'
  ) then
    alter table public.cart_items add column updated_at timestamp with time zone default now();
    
    -- Create the trigger now that the column exists
    create trigger update_cart_items_timestamp
      before update on public.cart_items
      for each row
      execute function update_updated_at_column();
  end if;
end $$;