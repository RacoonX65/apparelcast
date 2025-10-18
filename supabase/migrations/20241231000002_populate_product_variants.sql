-- Populate Product Variants with Existing Data
-- Migration: 20241231000002_populate_product_variants

-- Function to populate product variants from existing products
CREATE OR REPLACE FUNCTION populate_product_variants()
RETURNS void AS $$
DECLARE
    product_record RECORD;
    size_item TEXT;
    color_item TEXT;
    variant_stock INTEGER;
    total_combinations INTEGER;
BEGIN
    -- Loop through all products
    FOR product_record IN 
        SELECT id, sizes, colors, stock_quantity 
        FROM public.products 
        WHERE array_length(sizes, 1) > 0 AND array_length(colors, 1) > 0
    LOOP
        -- Calculate total number of size-color combinations
        total_combinations := array_length(product_record.sizes, 1) * array_length(product_record.colors, 1);
        
        -- Calculate stock per variant (distribute evenly, with remainder going to first variants)
        variant_stock := CASE 
            WHEN total_combinations > 0 THEN product_record.stock_quantity / total_combinations
            ELSE 0
        END;
        
        -- Create variants for each size-color combination
        FOREACH size_item IN ARRAY product_record.sizes
        LOOP
            FOREACH color_item IN ARRAY product_record.colors
            LOOP
                -- Insert variant with calculated stock
                INSERT INTO public.product_variants (
                    product_id,
                    size,
                    color,
                    stock_quantity,
                    price_adjustment,
                    is_active
                ) VALUES (
                    product_record.id,
                    size_item,
                    color_item,
                    variant_stock,
                    0,
                    true
                )
                ON CONFLICT (product_id, size, color) DO UPDATE SET
                    stock_quantity = EXCLUDED.stock_quantity,
                    updated_at = NOW();
            END LOOP;
        END LOOP;
        
        -- Handle remainder stock by adding it to the first variant
        IF total_combinations > 0 THEN
            UPDATE public.product_variants 
            SET stock_quantity = stock_quantity + (product_record.stock_quantity % total_combinations)
            WHERE product_id = product_record.id
            AND size = product_record.sizes[1]
            AND color = product_record.colors[1];
        END IF;
    END LOOP;
    
    -- Handle products with no sizes or colors (like perfumes)
    FOR product_record IN 
        SELECT id, sizes, colors, stock_quantity 
        FROM public.products 
        WHERE (array_length(sizes, 1) IS NULL OR array_length(sizes, 1) = 0)
           OR (array_length(colors, 1) IS NULL OR array_length(colors, 1) = 0)
    LOOP
        -- For products without size/color variants, create a default variant
        INSERT INTO public.product_variants (
            product_id,
            size,
            color,
            stock_quantity,
            price_adjustment,
            is_active
        ) VALUES (
            product_record.id,
            COALESCE(product_record.sizes[1], 'One Size'),
            COALESCE(product_record.colors[1], 'Default'),
            product_record.stock_quantity,
            0,
            true
        )
        ON CONFLICT (product_id, size, color) DO UPDATE SET
            stock_quantity = EXCLUDED.stock_quantity,
            updated_at = NOW();
    END LOOP;
    
    RAISE NOTICE 'Product variants populated successfully';
END;
$$ LANGUAGE plpgsql;

-- Execute the population function
SELECT populate_product_variants();

-- Drop the temporary function
DROP FUNCTION populate_product_variants();

-- Verify the population worked correctly
DO $$
DECLARE
    product_count INTEGER;
    variant_count INTEGER;
    total_stock_products INTEGER;
    total_stock_variants INTEGER;
BEGIN
    SELECT COUNT(*) INTO product_count FROM public.products;
    SELECT COUNT(*) INTO variant_count FROM public.product_variants;
    SELECT SUM(stock_quantity) INTO total_stock_products FROM public.products;
    SELECT SUM(stock_quantity) INTO total_stock_variants FROM public.product_variants;
    
    RAISE NOTICE 'Migration Summary:';
    RAISE NOTICE '- Products: %', product_count;
    RAISE NOTICE '- Variants created: %', variant_count;
    RAISE NOTICE '- Total stock in products table: %', total_stock_products;
    RAISE NOTICE '- Total stock in variants table: %', total_stock_variants;
    
    -- The totals should match after the trigger updates the products table
END;
$$;

-- Create some sample variant data with realistic stock distribution
-- This gives us more realistic inventory scenarios for testing

-- Update some variants to have different stock levels (simulating real inventory)
UPDATE public.product_variants 
SET stock_quantity = CASE 
    WHEN size IN ('XS', '36') THEN GREATEST(stock_quantity - 5, 0)  -- Smaller sizes less stock
    WHEN size IN ('XL', '41') THEN GREATEST(stock_quantity - 3, 0)  -- Larger sizes less stock
    WHEN color = 'Black' THEN stock_quantity + 2  -- Black color more popular
    WHEN color = 'White' THEN stock_quantity + 1  -- White color popular
    ELSE stock_quantity
END
WHERE product_id IN (
    SELECT id FROM public.products 
    WHERE category IN ('clothing', 'shoes')
    LIMIT 5
);

-- Set some variants to out of stock for testing
UPDATE public.product_variants 
SET stock_quantity = 0
WHERE product_id IN (
    SELECT id FROM public.products LIMIT 2
) 
AND size IN ('XS', '36')
AND color IN ('Beige', 'Navy');

-- Add some high-stock variants for bulk order testing
UPDATE public.product_variants 
SET stock_quantity = stock_quantity + 50
WHERE product_id IN (
    SELECT id FROM public.products 
    WHERE enable_bulk_pricing = true
    LIMIT 3
)
AND size IN ('M', '38', '39')
AND color IN ('White', 'Black');

-- Product variants populated and sample data created successfully!