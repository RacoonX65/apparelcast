-- Add missing discount columns to orders table
-- This script adds the discount_code_id and discount_amount columns that were missing from the original schema

-- Add discount_code_id column (foreign key to discount_codes table)
alter table public.orders 
add column if not exists discount_code_id uuid references public.discount_codes(id);

-- Add discount_amount column (stores the actual discount applied)
alter table public.orders 
add column if not exists discount_amount decimal(10, 2) default 0;

-- Add index for better performance on discount queries
create index if not exists idx_orders_discount_code_id on public.orders(discount_code_id);