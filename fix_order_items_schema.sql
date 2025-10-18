-- Add missing bulk pricing columns to order_items table
-- Run this script directly on the database to fix the schema

-- Add bulk_price column to store the bulk price per unit
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS bulk_price decimal(10,2);

-- Add bulk_savings column to store savings amount per item
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS bulk_savings decimal(10,2) DEFAULT 0;

-- Add original_price column to store the original unit price before bulk discount
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS original_price decimal(10,2);

-- Add comments to explain the columns
COMMENT ON COLUMN public.order_items.bulk_price IS 'Price per unit when item is part of a bulk order';
COMMENT ON COLUMN public.order_items.bulk_savings IS 'Amount saved per item due to bulk pricing';
COMMENT ON COLUMN public.order_items.original_price IS 'Original unit price before any bulk discounts';

-- Verify the columns were added
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'order_items' 
AND table_schema = 'public'
ORDER BY ordinal_position;