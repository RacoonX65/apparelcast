-- =====================================================
-- SAFE MIGRATION: Sneakers → Shoes Category Change
-- =====================================================
-- This script safely changes all 'sneakers' references to 'shoes'
-- Run this in your Supabase SQL Editor Dashboard
-- 
-- IMPORTANT: Always backup your database before running migrations!
-- =====================================================

-- 1. BACKUP CHECK: View current data before changes
SELECT 'BEFORE MIGRATION - Products with sneakers category:' as info;
SELECT id, name, category, subcategory 
FROM public.products 
WHERE category = 'sneakers' 
ORDER BY id;

SELECT 'BEFORE MIGRATION - Category banners with sneakers:' as info;
SELECT id, category, title, description 
FROM public.category_banners 
WHERE category = 'sneakers';

-- 2. UPDATE PRODUCTS TABLE
-- Change all products from 'sneakers' to 'shoes'
UPDATE public.products 
SET category = 'shoes',
    updated_at = NOW()
WHERE category = 'sneakers';

-- 3. UPDATE CATEGORY BANNERS
-- Update banner information for the new category
UPDATE public.category_banners 
SET category = 'shoes',
    title = 'Premium Shoes',
    description = 'Step up your shoe game',
    updated_at = NOW()
WHERE category = 'sneakers';

-- 4. UPDATE CONSTRAINTS
-- Remove old constraints and add new ones with 'shoes'
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_category_check;
ALTER TABLE public.products ADD CONSTRAINT products_category_check 
CHECK (category IN ('clothing', 'shoes', 'perfumes', 'home', 'electronics'));

-- Update category banners constraint
ALTER TABLE public.category_banners DROP CONSTRAINT IF EXISTS category_banners_category_check;
ALTER TABLE public.category_banners ADD CONSTRAINT category_banners_category_check 
CHECK (category IN ('clothing', 'shoes', 'perfumes', 'home', 'electronics'));

-- 5. REFRESH INDEXES
-- Recreate category index for optimal performance
DROP INDEX IF EXISTS idx_products_category;
CREATE INDEX idx_products_category ON public.products(category);

-- 6. VERIFICATION QUERIES
-- Check that migration was successful
SELECT 'AFTER MIGRATION - All product categories:' as info;
SELECT category, COUNT(*) as product_count 
FROM public.products 
GROUP BY category 
ORDER BY category;

SELECT 'AFTER MIGRATION - Category banners:' as info;
SELECT category, title, description 
FROM public.category_banners 
ORDER BY category;

-- 7. FINAL CHECK
-- Ensure no 'sneakers' references remain
SELECT 'FINAL CHECK - Should return 0 rows:' as info;
SELECT COUNT(*) as remaining_sneakers_products 
FROM public.products 
WHERE category = 'sneakers';

SELECT COUNT(*) as remaining_sneakers_banners 
FROM public.category_banners 
WHERE category = 'sneakers';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- If all checks pass:
-- ✅ Products updated from 'sneakers' to 'shoes'
-- ✅ Category banners updated
-- ✅ Database constraints updated
-- ✅ Indexes refreshed
-- ✅ No remaining 'sneakers' references
-- =====================================================