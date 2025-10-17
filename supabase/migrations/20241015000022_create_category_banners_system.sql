-- Create category banners table for managing category badges with background images
CREATE TABLE IF NOT EXISTS public.category_banners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    background_image_url TEXT NOT NULL,
    text_color VARCHAR(20) DEFAULT 'white' CHECK (text_color IN ('white', 'black', 'gray')),
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT category_banners_category_check CHECK (category IN ('clothing', 'shoes', 'perfumes', 'home', 'electronics'))
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_category_banners_category ON public.category_banners(category);
CREATE INDEX IF NOT EXISTS idx_category_banners_active ON public.category_banners(is_active);
CREATE INDEX IF NOT EXISTS idx_category_banners_order ON public.category_banners(display_order);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_category_banners_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Ensure idempotent trigger creation to avoid duplicate errors
DROP TRIGGER IF EXISTS update_category_banners_updated_at ON public.category_banners;

CREATE TRIGGER update_category_banners_updated_at
    BEFORE UPDATE ON public.category_banners
    FOR EACH ROW
    EXECUTE FUNCTION update_category_banners_updated_at();

-- Insert sample category banners
-- Idempotent inserts: only insert sample rows if they don't already exist
INSERT INTO public.category_banners (category, title, description, background_image_url, text_color, display_order)
SELECT 'clothing', 'Fashion & Style', 'Discover the latest trends in clothing', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=400&fit=crop', 'white', 1
WHERE NOT EXISTS (
    SELECT 1 FROM public.category_banners WHERE category = 'clothing'
);

INSERT INTO public.category_banners (category, title, description, background_image_url, text_color, display_order)
SELECT 'shoes', 'Premium Shoes', 'Step up your shoe game', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&h=400&fit=crop', 'white', 2
WHERE NOT EXISTS (
    SELECT 1 FROM public.category_banners WHERE category = 'shoes'
);

INSERT INTO public.category_banners (category, title, description, background_image_url, text_color, display_order)
SELECT 'perfumes', 'Luxury Fragrances', 'Find your signature scent', 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&h=400&fit=crop', 'white', 3
WHERE NOT EXISTS (
    SELECT 1 FROM public.category_banners WHERE category = 'perfumes'
);

INSERT INTO public.category_banners (category, title, description, background_image_url, text_color, display_order)
SELECT 'home', 'Home Essentials', 'Comfort meets style', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=400&fit=crop', 'white', 4
WHERE NOT EXISTS (
    SELECT 1 FROM public.category_banners WHERE category = 'home'
);

INSERT INTO public.category_banners (category, title, description, background_image_url, text_color, display_order)
SELECT 'electronics', 'Tech & Gadgets', 'Latest technology trends', 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&h=400&fit=crop', 'white', 5
WHERE NOT EXISTS (
    SELECT 1 FROM public.category_banners WHERE category = 'electronics'
);

-- Enable RLS
ALTER TABLE public.category_banners ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Drop existing policies to allow idempotent creation
DROP POLICY IF EXISTS "Category banners are viewable by everyone" ON public.category_banners;
DROP POLICY IF EXISTS "Only admins can insert category banners" ON public.category_banners;
DROP POLICY IF EXISTS "Only admins can update category banners" ON public.category_banners;
DROP POLICY IF EXISTS "Only admins can delete category banners" ON public.category_banners;

CREATE POLICY "Category banners are viewable by everyone" ON public.category_banners
    FOR SELECT USING (true);

CREATE POLICY "Only admins can insert category banners" ON public.category_banners
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

CREATE POLICY "Only admins can update category banners" ON public.category_banners
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

CREATE POLICY "Only admins can delete category banners" ON public.category_banners
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND is_admin = true
        )
    );