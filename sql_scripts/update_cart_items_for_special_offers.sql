-- Update cart_items table to support special offers
-- Add special offer columns to cart_items table

-- Add special_offer_id column to reference special offers
ALTER TABLE public.cart_items 
ADD COLUMN IF NOT EXISTS special_offer_id UUID REFERENCES public.special_offers(id) ON DELETE CASCADE;

-- Add special_offer_price column to store the discounted price for special offer items
ALTER TABLE public.cart_items 
ADD COLUMN IF NOT EXISTS special_offer_price DECIMAL(10,2);

-- Create index for special offer lookups
CREATE INDEX IF NOT EXISTS idx_cart_items_special_offer ON public.cart_items(special_offer_id);

-- Update RLS policies to handle special offers
-- The existing policies should already cover this, but let's ensure they're comprehensive

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can manage their own cart items" ON public.cart_items;

-- Create comprehensive policy for cart items
CREATE POLICY "Users can manage their own cart items" ON public.cart_items
  FOR ALL USING (auth.uid() = user_id);

-- Ensure the table has proper permissions
GRANT ALL ON public.cart_items TO authenticated;

-- Add comments for documentation
COMMENT ON COLUMN public.cart_items.special_offer_id IS 'Reference to special offer if this cart item is part of a bundle deal';
COMMENT ON COLUMN public.cart_items.special_offer_price IS 'Discounted price when item is part of a special offer bundle';

-- Create a view to get cart items with special offer details
CREATE OR REPLACE VIEW public.cart_items_with_offers AS
SELECT 
  ci.*,
  so.title as special_offer_title,
  so.discount_percentage as special_offer_discount,
  so.end_date as special_offer_expires,
  p.name as product_name,
  p.price as product_original_price,
  p.image_url as product_image
FROM public.cart_items ci
LEFT JOIN public.special_offers so ON ci.special_offer_id = so.id
LEFT JOIN public.products p ON ci.product_id = p.id;

-- Grant permissions on the view
GRANT SELECT ON public.cart_items_with_offers TO anon, authenticated;