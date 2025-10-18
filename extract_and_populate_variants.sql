-- Extract and Populate Product Variants Script
-- This script analyzes your existing products and creates variants based on actual sizes and colors in your database

-- First, let's see what sizes and colors we have in the database
DO $$
DECLARE
    product_record RECORD;
    size_item TEXT;
    color_item TEXT;
    variant_stock INTEGER;
    total_combinations INTEGER;
    all_sizes TEXT[] := ARRAY[]::TEXT[];
    all_colors TEXT[] := ARRAY[]::TEXT[];
    unique_size TEXT;
    unique_color TEXT;
BEGIN
    -- Extract all unique sizes from all products
    RAISE NOTICE '=== EXTRACTING UNIQUE SIZES ===';
    FOR product_record IN 
        SELECT DISTINCT unnest(sizes) as size_value 
        FROM public.products 
        WHERE sizes IS NOT NULL AND array_length(sizes, 1) > 0
        ORDER BY size_value
    LOOP
        all_sizes := array_append(all_sizes, product_record.size_value);
        RAISE NOTICE 'Found size: %', product_record.size_value;
    END LOOP;
    
    -- Extract all unique colors from all products
    RAISE NOTICE '=== EXTRACTING UNIQUE COLORS ===';
    FOR product_record IN 
        SELECT DISTINCT unnest(colors) as color_value 
        FROM public.products 
        WHERE colors IS NOT NULL AND array_length(colors, 1) > 0
        ORDER BY color_value
    LOOP
        all_colors := array_append(all_colors, product_record.color_value);
        RAISE NOTICE 'Found color: %', product_record.color_value;
    END LOOP;
    
    RAISE NOTICE '=== SUMMARY ===';
    RAISE NOTICE 'Total unique sizes found: %', array_length(all_sizes, 1);
    RAISE NOTICE 'Total unique colors found: %', array_length(all_colors, 1);
    RAISE NOTICE 'All sizes: %', array_to_string(all_sizes, ', ');
    RAISE NOTICE 'All colors: %', array_to_string(all_colors, ', ');
    
    RAISE NOTICE '=== CREATING PRODUCT VARIANTS ===';
    
    -- Now populate variants for each product
    FOR product_record IN 
        SELECT id, name, sizes, colors, stock_quantity, category
        FROM public.products 
        ORDER BY name
    LOOP
        RAISE NOTICE 'Processing product: % (Category: %)', product_record.name, product_record.category;
        
        -- Handle products with both sizes and colors
        IF array_length(product_record.sizes, 1) > 0 AND array_length(product_record.colors, 1) > 0 THEN
            total_combinations := array_length(product_record.sizes, 1) * array_length(product_record.colors, 1);
            variant_stock := GREATEST(1, product_record.stock_quantity / total_combinations);
            
            RAISE NOTICE '  - Has % sizes and % colors (% combinations)', 
                array_length(product_record.sizes, 1), 
                array_length(product_record.colors, 1), 
                total_combinations;
            
            FOREACH size_item IN ARRAY product_record.sizes
            LOOP
                FOREACH color_item IN ARRAY product_record.colors
                LOOP
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
                    
                    RAISE NOTICE '    Created variant: % - %', size_item, color_item;
                END LOOP;
            END LOOP;
            
        -- Handle products with only sizes (no colors)
        ELSIF array_length(product_record.sizes, 1) > 0 THEN
            variant_stock := GREATEST(1, product_record.stock_quantity / array_length(product_record.sizes, 1));
            
            RAISE NOTICE '  - Has % sizes, no colors', array_length(product_record.sizes, 1);
            
            FOREACH size_item IN ARRAY product_record.sizes
            LOOP
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
                    'Default',
                    variant_stock,
                    0,
                    true
                )
                ON CONFLICT (product_id, size, color) DO UPDATE SET
                    stock_quantity = EXCLUDED.stock_quantity,
                    updated_at = NOW();
                
                RAISE NOTICE '    Created variant: % - Default', size_item;
            END LOOP;
            
        -- Handle products with only colors (no sizes)
        ELSIF array_length(product_record.colors, 1) > 0 THEN
            variant_stock := GREATEST(1, product_record.stock_quantity / array_length(product_record.colors, 1));
            
            RAISE NOTICE '  - Has % colors, no sizes', array_length(product_record.colors, 1);
            
            FOREACH color_item IN ARRAY product_record.colors
            LOOP
                INSERT INTO public.product_variants (
                    product_id,
                    size,
                    color,
                    stock_quantity,
                    price_adjustment,
                    is_active
                ) VALUES (
                    product_record.id,
                    'One Size',
                    color_item,
                    variant_stock,
                    0,
                    true
                )
                ON CONFLICT (product_id, size, color) DO UPDATE SET
                    stock_quantity = EXCLUDED.stock_quantity,
                    updated_at = NOW();
                
                RAISE NOTICE '    Created variant: One Size - %', color_item;
            END LOOP;
            
        -- Handle products with no sizes or colors (like perfumes)
        ELSE
            RAISE NOTICE '  - No sizes or colors, creating default variant';
            
            INSERT INTO public.product_variants (
                product_id,
                size,
                color,
                stock_quantity,
                price_adjustment,
                is_active
            ) VALUES (
                product_record.id,
                'Standard',
                'Default',
                product_record.stock_quantity,
                0,
                true
            )
            ON CONFLICT (product_id, size, color) DO UPDATE SET
                stock_quantity = EXCLUDED.stock_quantity,
                updated_at = NOW();
            
            RAISE NOTICE '    Created variant: Standard - Default';
        END IF;
    END LOOP;
    
    RAISE NOTICE '=== FINAL STATISTICS ===';
    
    -- Show final statistics
    FOR product_record IN 
        SELECT 
            p.name,
            p.category,
            COUNT(pv.id) as variant_count,
            SUM(pv.stock_quantity) as total_variant_stock,
            p.stock_quantity as original_stock
        FROM public.products p
        LEFT JOIN public.product_variants pv ON p.id = pv.product_id
        GROUP BY p.id, p.name, p.category, p.stock_quantity
        ORDER BY p.name
    LOOP
        RAISE NOTICE 'Product: % | Category: % | Variants: % | Total Stock: % | Original: %', 
            product_record.name, 
            product_record.category,
            product_record.variant_count, 
            product_record.total_variant_stock,
            product_record.original_stock;
    END LOOP;
    
END $$;

-- Show a summary of what was created
SELECT 
    'SUMMARY' as info,
    COUNT(DISTINCT product_id) as products_processed,
    COUNT(*) as total_variants_created,
    SUM(stock_quantity) as total_stock_distributed
FROM public.product_variants;

-- Show variants by category
SELECT 
    p.category,
    COUNT(pv.id) as variant_count,
    COUNT(DISTINCT pv.product_id) as products_with_variants,
    SUM(pv.stock_quantity) as total_stock
FROM public.products p
JOIN public.product_variants pv ON p.id = pv.product_id
GROUP BY p.category
ORDER BY p.category;

-- Show all unique size-color combinations created
SELECT DISTINCT 
    size,
    color,
    COUNT(*) as products_with_this_combination
FROM public.product_variants
GROUP BY size, color
ORDER BY size, color;