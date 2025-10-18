-- Add missing bulk pricing columns to order_items table
-- This migration adds columns that are referenced in the checkout process but missing from the schema

-- Add bulk_price column to store the bulk price per unit
alter table public.order_items add column if not exists bulk_price decimal(10,2);

-- Add bulk_savings column to store savings amount per item
alter table public.order_items add column if not exists bulk_savings decimal(10,2) default 0;

-- Add original_price column to store the original unit price before bulk discount
alter table public.order_items add column if not exists original_price decimal(10,2);

-- Add comment to explain the columns
comment on column public.order_items.bulk_price is 'Price per unit when item is part of a bulk order';
comment on column public.order_items.bulk_savings is 'Amount saved per item due to bulk pricing';
comment on column public.order_items.original_price is 'Original unit price before any bulk discounts';