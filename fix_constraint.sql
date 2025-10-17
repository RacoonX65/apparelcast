-- COMPREHENSIVE FIX: Check and update constraints properly
-- Run this in your Supabase SQL Editor Dashboard

-- Step 1: Check current constraint definition
SELECT conname, pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.products'::regclass 
AND conname = 'products_category_check';

-- Step 2: Force drop ALL category constraints on products table
DO $$ 
BEGIN
    -- Drop products_category_check if it exists
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_category_check') THEN
        ALTER TABLE public.products DROP CONSTRAINT products_category_check;
    END IF;
    
    -- Drop any other category constraints that might exist
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_category_constraint') THEN
        ALTER TABLE public.products DROP CONSTRAINT products_category_constraint;
    END IF;
END $$;

-- Step 3: Update all existing 'sneakers' products to 'shoes'
UPDATE public.products 
SET category = 'shoes' 
WHERE category = 'sneakers';

-- Step 4: Add the NEW constraint with 'shoes'
ALTER TABLE public.products 
ADD CONSTRAINT products_category_check 
CHECK (category IN ('clothing', 'shoes', 'perfumes', 'home', 'electronics'));

-- Step 5: Also fix category_banners table
DO $$ 
BEGIN
    -- Drop category_banners constraints if they exist
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'category_banners_category_check') THEN
        ALTER TABLE public.category_banners DROP CONSTRAINT category_banners_category_check;
    END IF;
END $$;

UPDATE public.category_banners 
SET category = 'shoes' 
WHERE category = 'sneakers';

ALTER TABLE public.category_banners 
ADD CONSTRAINT category_banners_category_check 
CHECK (category IN ('clothing', 'shoes', 'perfumes', 'home', 'electronics'));

-- Step 6: Verify the new constraints
SELECT 'NEW CONSTRAINT DEFINITION:' as info;
SELECT conname, pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.products'::regclass 
AND conname = 'products_category_check';

-- Step 7: Test that 'shoes' is now allowed
SELECT 'Testing shoes category:' as test;
SELECT COUNT(*) as shoes_count FROM public.products WHERE category = 'shoes';

-- Step 8: Show all categories
SELECT 'All categories in use:' as info;
SELECT category, COUNT(*) as count 
FROM public.products 
GROUP BY category 
ORDER BY category;