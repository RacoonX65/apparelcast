-- Add bulk pricing fields to cart_items table
alter table public.cart_items 
add column is_bulk_order boolean default false,
add column bulk_tier_id uuid references public.bulk_pricing_tiers(id) on delete set null,
add column original_price decimal(10, 2),
add column bulk_price decimal(10, 2),
add column bulk_savings decimal(10, 2) default 0;

-- Add comment to explain the new fields
comment on column public.cart_items.is_bulk_order is 'Indicates if this cart item was added as part of a bulk order';
comment on column public.cart_items.bulk_tier_id is 'Reference to the bulk pricing tier used for this item';
comment on column public.cart_items.original_price is 'Original price per unit before bulk discount';
comment on column public.cart_items.bulk_price is 'Discounted price per unit from bulk pricing';
comment on column public.cart_items.bulk_savings is 'Total savings amount for this cart item (original_price - bulk_price) * quantity';

-- Create index for better query performance
create index idx_cart_items_bulk_order on public.cart_items(is_bulk_order) where is_bulk_order = true;
create index idx_cart_items_bulk_tier on public.cart_items(bulk_tier_id) where bulk_tier_id is not null;