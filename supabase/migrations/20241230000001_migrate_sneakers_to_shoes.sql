-- Migration: Change 'sneakers' category to 'shoes'
-- This migration safely updates all references from 'sneakers' to 'shoes'
-- Created: 2024-12-30

-- Step 1: Update all products with category 'sneakers' to 'shoes'
UPDATE public.products 
SET category = 'shoes' 
WHERE category = 'sneakers';

-- Step 2: Update category banners
UPDATE public.category_banners 
SET category = 'shoes',
    title = 'Premium Shoes',
    description = 'Step up your shoe game'
WHERE category = 'sneakers';

-- Step 3: Update any other tables that might reference the old category
-- (Add more UPDATE statements here if you have other tables with category references)

-- Step 4: Drop the old constraint and add the new one
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_category_check;
ALTER TABLE public.products ADD CONSTRAINT products_category_check 
CHECK (category IN ('clothing', 'shoes', 'perfumes', 'home', 'electronics'));

-- Step 5: Update category banners constraint
ALTER TABLE public.category_banners DROP CONSTRAINT IF EXISTS category_banners_category_check;
ALTER TABLE public.category_banners ADD CONSTRAINT category_banners_category_check 
CHECK (category IN ('clothing', 'shoes', 'perfumes', 'home', 'electronics'));

-- Step 6: Update any indexes that might be affected
DROP INDEX IF EXISTS idx_products_category;
CREATE INDEX idx_products_category ON public.products(category);

-- Verification queries (uncomment to run after migration)
-- SELECT category, COUNT(*) FROM public.products GROUP BY category;
-- SELECT category, title FROM public.category_banners WHERE category = 'shoes';