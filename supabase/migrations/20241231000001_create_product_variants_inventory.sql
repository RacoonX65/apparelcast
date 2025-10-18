-- Create Product Variants Inventory Management System
-- Migration: 20241231000001_create_product_variants_inventory

-- Create product_variants table to track individual size-color combination quantities
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    size TEXT NOT NULL,
    color TEXT NOT NULL,
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    price_adjustment DECIMAL(10,2) DEFAULT 0, -- Optional price adjustment for specific variants
    sku TEXT, -- Optional SKU for variant tracking
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique combination of product, size, and color
    UNIQUE(product_id, size, color)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_stock ON public.product_variants(stock_quantity);
CREATE INDEX IF NOT EXISTS idx_product_variants_active ON public.product_variants(is_active);
CREATE INDEX IF NOT EXISTS idx_product_variants_size_color ON public.product_variants(size, color);

-- Create a function to automatically update product total stock when variants change
CREATE OR REPLACE FUNCTION update_product_total_stock()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the main product's stock_quantity to be the sum of all variant quantities
    UPDATE public.products 
    SET stock_quantity = (
        SELECT COALESCE(SUM(stock_quantity), 0) 
        FROM public.product_variants 
        WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
        AND is_active = true
    ),
    updated_at = NOW()
    WHERE id = COALESCE(NEW.product_id, OLD.product_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update product stock when variants change
CREATE TRIGGER trigger_update_product_stock_on_variant_insert
    AFTER INSERT ON public.product_variants
    FOR EACH ROW EXECUTE FUNCTION update_product_total_stock();

CREATE TRIGGER trigger_update_product_stock_on_variant_update
    AFTER UPDATE ON public.product_variants
    FOR EACH ROW EXECUTE FUNCTION update_product_total_stock();

CREATE TRIGGER trigger_update_product_stock_on_variant_delete
    AFTER DELETE ON public.product_variants
    FOR EACH ROW EXECUTE FUNCTION update_product_total_stock();

-- Create a function to get available stock for a specific variant
CREATE OR REPLACE FUNCTION get_variant_stock(
    product_uuid UUID,
    variant_size TEXT,
    variant_color TEXT
)
RETURNS INTEGER AS $$
DECLARE
    variant_stock INTEGER;
BEGIN
    SELECT stock_quantity INTO variant_stock
    FROM public.product_variants
    WHERE product_id = product_uuid
    AND size = variant_size
    AND color = variant_color
    AND is_active = true;
    
    RETURN COALESCE(variant_stock, 0);
END;
$$ LANGUAGE plpgsql;

-- Create a function to reserve stock for cart/order operations
CREATE OR REPLACE FUNCTION reserve_variant_stock(
    product_uuid UUID,
    variant_size TEXT,
    variant_color TEXT,
    quantity_to_reserve INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
    current_stock INTEGER;
    variant_exists BOOLEAN;
BEGIN
    -- Check if variant exists and get current stock
    SELECT stock_quantity, true INTO current_stock, variant_exists
    FROM public.product_variants
    WHERE product_id = product_uuid
    AND size = variant_size
    AND color = variant_color
    AND is_active = true;
    
    -- If variant doesn't exist, return false
    IF NOT variant_exists THEN
        RETURN false;
    END IF;
    
    -- Check if we have enough stock
    IF current_stock >= quantity_to_reserve THEN
        -- Reserve the stock by reducing quantity
        UPDATE public.product_variants
        SET stock_quantity = stock_quantity - quantity_to_reserve,
            updated_at = NOW()
        WHERE product_id = product_uuid
        AND size = variant_size
        AND color = variant_color;
        
        RETURN true;
    ELSE
        RETURN false;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create a view to easily get product variants with stock information
CREATE OR REPLACE VIEW public.products_with_variants AS
SELECT 
    p.*,
    COALESCE(
        json_agg(
            json_build_object(
                'id', pv.id,
                'size', pv.size,
                'color', pv.color,
                'stock_quantity', pv.stock_quantity,
                'price_adjustment', pv.price_adjustment,
                'sku', pv.sku,
                'is_active', pv.is_active
            ) ORDER BY pv.size, pv.color
        ) FILTER (WHERE pv.id IS NOT NULL),
        '[]'::json
    ) as variants
FROM public.products p
LEFT JOIN public.product_variants pv ON p.id = pv.product_id AND pv.is_active = true
GROUP BY p.id;

-- Enable Row Level Security
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for product_variants
-- Anyone can view active product variants
CREATE POLICY "Anyone can view active product variants"
    ON public.product_variants FOR SELECT
    USING (is_active = true);

-- Only admins can manage product variants
CREATE POLICY "Admins can manage product variants"
    ON public.product_variants FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );

-- Grant permissions
GRANT SELECT ON public.product_variants TO anon, authenticated;
GRANT SELECT ON public.products_with_variants TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_variant_stock(UUID, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION reserve_variant_stock(UUID, TEXT, TEXT, INTEGER) TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE public.product_variants IS 'Tracks inventory for individual product size-color combinations';
COMMENT ON COLUMN public.product_variants.stock_quantity IS 'Available quantity for this specific size-color combination';
COMMENT ON COLUMN public.product_variants.price_adjustment IS 'Optional price adjustment for this variant (can be positive or negative)';
COMMENT ON FUNCTION get_variant_stock(UUID, TEXT, TEXT) IS 'Returns available stock for a specific product variant';
COMMENT ON FUNCTION reserve_variant_stock(UUID, TEXT, TEXT, INTEGER) IS 'Reserves stock for a variant, returns true if successful';