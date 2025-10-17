-- Special Offers System Database Schema
-- This creates tables for managing bundle deals and special pricing

-- Create special_offers table for bundle deals
CREATE TABLE IF NOT EXISTS public.special_offers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    banner_image_url TEXT,
    special_price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    discount_percentage INTEGER,
    offer_type VARCHAR(50) DEFAULT 'bundle', -- 'bundle', 'bogo', 'discount'
    is_active BOOLEAN DEFAULT true,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    max_uses INTEGER, -- Optional limit on how many times this offer can be used
    current_uses INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create special_offer_products junction table for bundle products
CREATE TABLE IF NOT EXISTS public.special_offer_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    special_offer_id UUID REFERENCES public.special_offers(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1, -- How many of this product in the bundle
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(special_offer_id, product_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_special_offers_active ON public.special_offers(is_active);
CREATE INDEX IF NOT EXISTS idx_special_offers_dates ON public.special_offers(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_special_offer_products_offer ON public.special_offer_products(special_offer_id);
CREATE INDEX IF NOT EXISTS idx_special_offer_products_product ON public.special_offer_products(product_id);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.special_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.special_offer_products ENABLE ROW LEVEL SECURITY;

-- Policy for public read access to active offers
CREATE POLICY "Public can view active special offers" ON public.special_offers
    FOR SELECT USING (is_active = true AND (end_date IS NULL OR end_date > NOW()));

-- Policy for public read access to offer products
CREATE POLICY "Public can view special offer products" ON public.special_offer_products
    FOR SELECT USING (true);

-- Policy for authenticated users to manage offers (admin only)
CREATE POLICY "Admin can manage special offers" ON public.special_offers
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can manage special offer products" ON public.special_offer_products
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Create a view for easy querying of offers with their products
CREATE OR REPLACE VIEW public.special_offers_with_products AS
SELECT 
    so.*,
    COALESCE(
        json_agg(
            json_build_object(
                'product_id', sop.product_id,
                'quantity', sop.quantity,
                'product_name', p.name,
                'product_price', p.price,
                'product_image', p.image_url,
                'product_slug', p.slug
            )
        ) FILTER (WHERE sop.product_id IS NOT NULL), 
        '[]'::json
    ) as products
FROM public.special_offers so
LEFT JOIN public.special_offer_products sop ON so.id = sop.special_offer_id
LEFT JOIN public.products p ON sop.product_id = p.id
GROUP BY so.id, so.title, so.description, so.banner_image_url, so.special_price, 
         so.original_price, so.discount_percentage, so.offer_type, so.is_active, 
         so.start_date, so.end_date, so.max_uses, so.current_uses, 
         so.created_at, so.updated_at;

-- Grant permissions
GRANT SELECT ON public.special_offers_with_products TO anon, authenticated;
GRANT ALL ON public.special_offers TO authenticated;
GRANT ALL ON public.special_offer_products TO authenticated;

-- Insert some sample data for testing
INSERT INTO public.special_offers (title, description, special_price, original_price, discount_percentage, offer_type, banner_image_url) VALUES
('Summer Bundle Deal', 'Get 2 premium shoes for the price of 1! Limited time offer.', 299.99, 599.98, 50, 'bundle', 'https://via.placeholder.com/800x400/FF6B6B/FFFFFF?text=Summer+Bundle'),
('Buy One Get One Free', 'Purchase any sneaker and get another one absolutely free!', 199.99, 399.98, 50, 'bogo', 'https://via.placeholder.com/800x400/4ECDC4/FFFFFF?text=BOGO+Deal'),
('Weekend Special', 'Complete outfit bundle - shirt, pants, and accessories for one low price!', 149.99, 249.97, 40, 'bundle', 'https://via.placeholder.com/800x400/45B7D1/FFFFFF?text=Weekend+Special');

COMMIT;