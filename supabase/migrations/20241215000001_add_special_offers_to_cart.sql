-- Add special offer support to cart_items table
-- Migration: 20241215000001_add_special_offers_to_cart

-- Add special offer columns to cart_items table
alter table public.cart_items 
add column if not exists special_offer_id uuid references public.special_offers(id) on delete cascade,
add column if not exists special_offer_price decimal(10,2),
add column if not exists variant_id uuid references public.product_variants(id) on delete set null;

-- Create indexes for better query performance
create index if not exists idx_cart_items_special_offer on public.cart_items(special_offer_id);
create index if not exists idx_cart_items_variant on public.cart_items(variant_id);

-- Add comments for documentation
comment on column public.cart_items.special_offer_id is 'Reference to special offer if this cart item is part of a bundle deal';
comment on column public.cart_items.special_offer_price is 'Discounted price when item is part of a special offer bundle';
comment on column public.cart_items.variant_id is 'Reference to specific product variant (size/color combination)';

-- Create a view to get cart items with special offer details
create or replace view public.cart_items_with_offers as
select 
  ci.*,
  so.title as special_offer_title,
  so.discount_percentage as special_offer_discount,
  so.valid_until as special_offer_expires,
  p.name as product_name,
  p.price as product_original_price,
  p.image_url as product_image,
  pv.size as variant_size,
  pv.color as variant_color,
  pv.stock_quantity as variant_stock
from public.cart_items ci
left join public.special_offers so on ci.special_offer_id = so.id
left join public.products p on ci.product_id = p.id
left join public.product_variants pv on ci.variant_id = pv.id;

-- Grant permissions on the view
grant select on public.cart_items_with_offers to anon, authenticated;