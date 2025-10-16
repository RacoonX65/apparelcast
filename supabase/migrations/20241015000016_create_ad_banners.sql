-- Create table for homepage ad banners with two featured slots
-- Mirrors conventions used by hero_banners, with video/image support

BEGIN;

CREATE TABLE IF NOT EXISTS public.ad_banners (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    title text,
    subtitle text,
    media_url text NOT NULL,
    media_type text NOT NULL DEFAULT 'image' CHECK (media_type IN ('image','video')),
    cta_text text,
    cta_link text,
    display_order integer NOT NULL DEFAULT 0,
    is_active boolean NOT NULL DEFAULT true,
    -- Featured slots to drive two-up grid; only ranks 1 and 2 allowed
    featured_rank smallint CHECK (featured_rank IN (1,2)),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid REFERENCES auth.users(id)
);

-- Indexes for efficient homepage queries
CREATE INDEX IF NOT EXISTS ad_banners_active_order_idx
    ON public.ad_banners (is_active, display_order);

-- Only a single banner per featured slot (1 and 2)
CREATE UNIQUE INDEX IF NOT EXISTS ad_banners_featured_rank_unique
    ON public.ad_banners (featured_rank)
    WHERE featured_rank IS NOT NULL;

-- RLS
ALTER TABLE public.ad_banners ENABLE ROW LEVEL SECURITY;

-- Anyone can view active ad banners
DROP POLICY IF EXISTS "View active ad banners" ON public.ad_banners;
CREATE POLICY "View active ad banners" ON public.ad_banners
    FOR SELECT
    USING (is_active = true);

-- Only admins can insert/update/delete (assumes profiles.is_admin boolean)
DROP POLICY IF EXISTS "Admins manage ad banners (insert)" ON public.ad_banners;
CREATE POLICY "Admins manage ad banners (insert)" ON public.ad_banners
    FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.is_admin = true
    ));

DROP POLICY IF EXISTS "Admins manage ad banners (update)" ON public.ad_banners;
CREATE POLICY "Admins manage ad banners (update)" ON public.ad_banners
    FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.is_admin = true
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.is_admin = true
    ));

DROP POLICY IF EXISTS "Admins manage ad banners (delete)" ON public.ad_banners;
CREATE POLICY "Admins manage ad banners (delete)" ON public.ad_banners
    FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.is_admin = true
    ));

-- Trigger to keep updated_at current
CREATE OR REPLACE FUNCTION public.update_ad_banners_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ad_banners_updated_at ON public.ad_banners;
CREATE TRIGGER ad_banners_updated_at
    BEFORE UPDATE ON public.ad_banners
    FOR EACH ROW
    EXECUTE FUNCTION public.update_ad_banners_updated_at();

COMMIT;