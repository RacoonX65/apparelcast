-- Create bulk pricing tiers table
create table if not exists public.bulk_pricing_tiers (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references public.products(id) on delete cascade not null,
  min_quantity integer not null check (min_quantity > 0),
  max_quantity integer check (max_quantity is null or max_quantity >= min_quantity),
  discount_type text not null check (discount_type in ('percentage', 'fixed_amount', 'fixed_price')),
  discount_value decimal(10,2) not null check (discount_value >= 0),
  price_per_unit decimal(10,2) not null check (price_per_unit > 0),
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(product_id, min_quantity)
);

-- Add bulk pricing configuration to products table
alter table public.products add column if not exists enable_bulk_pricing boolean default false;
alter table public.products add column if not exists min_bulk_quantity integer default 10;
alter table public.products add column if not exists bulk_discount_note text;

-- Add bulk order tracking to order_items
alter table public.order_items add column if not exists is_bulk_order boolean default false;
alter table public.order_items add column if not exists bulk_tier_id uuid references public.bulk_pricing_tiers(id);
alter table public.order_items add column if not exists original_unit_price decimal(10,2);
alter table public.order_items add column if not exists bulk_discount_amount decimal(10,2) default 0;

-- Create indexes for performance
create index if not exists idx_bulk_pricing_tiers_product_id on public.bulk_pricing_tiers(product_id);
create index if not exists idx_bulk_pricing_tiers_quantity_range on public.bulk_pricing_tiers(product_id, min_quantity, max_quantity);
create index if not exists idx_products_bulk_enabled on public.products(enable_bulk_pricing);
create index if not exists idx_order_items_bulk on public.order_items(is_bulk_order);

-- Enable Row Level Security
alter table public.bulk_pricing_tiers enable row level security;

-- Bulk pricing tiers policies
-- Anyone can view active bulk pricing tiers
create policy "Anyone can view active bulk pricing tiers"
  on public.bulk_pricing_tiers for select
  using (is_active = true);

-- Only admins can manage bulk pricing tiers
create policy "Admins can manage bulk pricing tiers"
  on public.bulk_pricing_tiers for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.is_admin = true
    )
  );

-- Function to calculate bulk pricing for a product and quantity
create or replace function get_bulk_pricing(product_uuid uuid, quantity_param integer)
returns table(
  tier_id uuid,
  min_quantity integer,
  max_quantity integer,
  price_per_unit decimal(10,2),
  total_price decimal(10,2),
  discount_amount decimal(10,2),
  discount_percentage decimal(5,2)
) as $$
declare
  base_price decimal(10,2);
  tier_record record;
begin
  -- Get base product price
  select price into base_price from public.products where id = product_uuid;
  
  if base_price is null then
    return;
  end if;
  
  -- Find applicable bulk pricing tier
  select * into tier_record
  from public.bulk_pricing_tiers
  where product_id = product_uuid
    and is_active = true
    and min_quantity <= quantity_param
    and (max_quantity is null or max_quantity >= quantity_param)
  order by min_quantity desc
  limit 1;
  
  if tier_record.id is not null then
    -- Return bulk pricing
    return query select
      tier_record.id,
      tier_record.min_quantity,
      tier_record.max_quantity,
      tier_record.price_per_unit,
      tier_record.price_per_unit * quantity_param,
      (base_price - tier_record.price_per_unit) * quantity_param,
      round(((base_price - tier_record.price_per_unit) / base_price * 100)::numeric, 2);
  else
    -- Return regular pricing
    return query select
      null::uuid,
      1,
      null::integer,
      base_price,
      base_price * quantity_param,
      0::decimal(10,2),
      0::decimal(5,2);
  end if;
end;
$$ language plpgsql;

-- Function to get all bulk tiers for a product (for display)
create or replace function get_product_bulk_tiers(product_uuid uuid)
returns table(
  tier_id uuid,
  min_quantity integer,
  max_quantity integer,
  discount_type text,
  discount_value decimal(10,2),
  price_per_unit decimal(10,2),
  savings_per_unit decimal(10,2),
  savings_percentage decimal(5,2)
) as $$
declare
  base_price decimal(10,2);
begin
  -- Get base product price
  select price into base_price from public.products where id = product_uuid;
  
  if base_price is null then
    return;
  end if;
  
  return query
  select
    bpt.id,
    bpt.min_quantity,
    bpt.max_quantity,
    bpt.discount_type,
    bpt.discount_value,
    bpt.price_per_unit,
    (base_price - bpt.price_per_unit) as savings_per_unit,
    round(((base_price - bpt.price_per_unit) / base_price * 100)::numeric, 2) as savings_percentage
  from public.bulk_pricing_tiers bpt
  where bpt.product_id = product_uuid
    and bpt.is_active = true
  order by bpt.min_quantity;
end;
$$ language plpgsql;

-- Trigger to update updated_at timestamp
create or replace function update_bulk_pricing_tiers_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_bulk_pricing_tiers_timestamp
  before update on public.bulk_pricing_tiers
  for each row
  execute function update_bulk_pricing_tiers_updated_at();

-- Insert sample bulk pricing tiers for existing products
-- This will add default bulk pricing to all existing products
insert into public.bulk_pricing_tiers (product_id, min_quantity, max_quantity, discount_type, discount_value, price_per_unit)
select 
  p.id,
  10,
  24,
  'percentage',
  10.00,
  round((p.price * 0.90)::numeric, 2)
from public.products p
where not exists (
  select 1 from public.bulk_pricing_tiers bpt 
  where bpt.product_id = p.id and bpt.min_quantity = 10
);

insert into public.bulk_pricing_tiers (product_id, min_quantity, max_quantity, discount_type, discount_value, price_per_unit)
select 
  p.id,
  25,
  49,
  'percentage',
  15.00,
  round((p.price * 0.85)::numeric, 2)
from public.products p
where not exists (
  select 1 from public.bulk_pricing_tiers bpt 
  where bpt.product_id = p.id and bpt.min_quantity = 25
);

insert into public.bulk_pricing_tiers (product_id, min_quantity, max_quantity, discount_type, discount_value, price_per_unit)
select 
  p.id,
  50,
  null,
  'percentage',
  20.00,
  round((p.price * 0.80)::numeric, 2)
from public.products p
where not exists (
  select 1 from public.bulk_pricing_tiers bpt 
  where bpt.product_id = p.id and bpt.min_quantity = 50
);

-- Enable bulk pricing for all products by default
update public.products set enable_bulk_pricing = true where enable_bulk_pricing is null or enable_bulk_pricing = false;