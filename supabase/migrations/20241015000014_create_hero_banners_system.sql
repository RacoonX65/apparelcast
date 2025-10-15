-- Create hero_banners table for managing dynamic hero slider content
CREATE TABLE hero_banners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  media_url TEXT NOT NULL, -- Cloudinary URL for image or video
  media_type VARCHAR(10) NOT NULL DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
  cta_text TEXT,
  cta_link TEXT,
  background_overlay_opacity DECIMAL(3,2) DEFAULT 0.4 CHECK (background_overlay_opacity >= 0 AND background_overlay_opacity <= 1),
  text_color VARCHAR(20) DEFAULT 'white' CHECK (text_color IN ('white', 'black', 'primary')),
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create index for efficient querying
CREATE INDEX idx_hero_banners_active_order ON hero_banners (is_active, display_order) WHERE is_active = true;
CREATE INDEX idx_hero_banners_dates ON hero_banners (start_date, end_date);

-- Add RLS policies
ALTER TABLE hero_banners ENABLE ROW LEVEL SECURITY;

-- Public can view active banners
CREATE POLICY "Anyone can view active hero banners" ON hero_banners
  FOR SELECT USING (
    is_active = true 
    AND (start_date IS NULL OR start_date <= NOW())
    AND (end_date IS NULL OR end_date >= NOW())
  );

-- Only admins can manage banners
CREATE POLICY "Admins can manage hero banners" ON hero_banners
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_hero_banners_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER hero_banners_updated_at
  BEFORE UPDATE ON hero_banners
  FOR EACH ROW
  EXECUTE FUNCTION update_hero_banners_updated_at();

-- Insert some sample hero banners
INSERT INTO hero_banners (title, subtitle, description, media_url, media_type, cta_text, cta_link, display_order, is_active) VALUES
(
  'Secure Fashion Shopping',
  'CIPC Registered Company',
  'Eliminating online fashion scams. Shop single items or bulk orders with complete confidence and legal protection.',
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&h=1080&fit=crop',
  'image',
  'Shop Securely',
  '/products',
  1,
  true
),
(
  'Bulk Orders Made Easy',
  'Wholesale Pricing Available',
  'Get the best deals on bulk fashion orders. Perfect for retailers, events, and corporate needs.',
  'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=1920&h=1080&fit=crop',
  'image',
  'Request Bulk Quote',
  '/contact',
  2,
  true
),
(
  'New Collection Arrived',
  'Latest Fashion Trends',
  'Discover our newest arrivals featuring the latest fashion trends and styles.',
  'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1920&h=1080&fit=crop',
  'image',
  'Shop New Arrivals',
  '/products?sort=newest',
  3,
  true
);