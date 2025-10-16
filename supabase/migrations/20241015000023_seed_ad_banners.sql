-- Seed sample ad banners with featured slots and regular banners
-- Safe to run multiple times (uses upserts and conditional inserts)

BEGIN;

-- Featured slot 1 (image) — delete and insert to ensure clean state
DELETE FROM public.ad_banners WHERE featured_rank = 1;
INSERT INTO public.ad_banners (
  featured_rank, title, subtitle, media_url, media_type,
  cta_text, cta_link, display_order, is_active
)
VALUES (
  1,
  'Holiday Sale',
  'Up to 50% Off Everything',
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&h=1080&fit=crop',
  'image',
  'Shop Now',
  '/products?promo=holiday',
  1,
  true
);

-- Featured slot 2 (video) — delete and insert to ensure clean state
DELETE FROM public.ad_banners WHERE featured_rank = 2;
INSERT INTO public.ad_banners (
  featured_rank, title, subtitle, media_url, media_type,
  cta_text, cta_link, display_order, is_active
)
VALUES (
  2,
  'New Arrivals',
  'Fresh styles every week',
  'https://res.cloudinary.com/demo/video/upload/w_1280/horse.mp4',
  'video',
  'Explore Collection',
  '/products?sort=newest',
  2,
  true
);

-- Non-featured sample 1 (image) — insert only if not present
INSERT INTO public.ad_banners (
  title, subtitle, media_url, media_type,
  cta_text, cta_link, display_order, is_active
)
SELECT
  'Weekend Specials',
  'Limited-time offers',
  'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=1920&h=1080&fit=crop',
  'image',
  'Shop Deals',
  '/products?tag=weekend-sale',
  10,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.ad_banners WHERE title = 'Weekend Specials'
);

-- Non-featured sample 2 (image) — insert only if not present
INSERT INTO public.ad_banners (
  title, subtitle, media_url, media_type,
  cta_text, cta_link, display_order, is_active
)
SELECT
  'Clearance Event',
  'Last chance savings up to 70% off',
  'https://images.unsplash.com/photo-1541643600914-78b084683601?w=1920&h=1080&fit=crop',
  'image',
  'Clearance Rack',
  '/products?tag=clearance',
  20,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.ad_banners WHERE title = 'Clearance Event'
);

-- Non-featured sample 3 (image) — insert only if not present
INSERT INTO public.ad_banners (
  title, subtitle, media_url, media_type,
  cta_text, cta_link, display_order, is_active
)
SELECT
  'Summer Collection',
  'Beat the heat in style',
  'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1920&h=1080&fit=crop',
  'image',
  'Shop Summer',
  '/products?category=summer',
  30,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.ad_banners WHERE title = 'Summer Collection'
);

COMMIT;