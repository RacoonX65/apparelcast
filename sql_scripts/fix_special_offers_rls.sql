-- Fix RLS policies for special offers system
-- The current policies are checking auth.jwt() ->> 'role' = 'admin' which is incorrect
-- Admin status is stored in the profiles table with is_admin column

-- Drop existing incorrect policies
DROP POLICY IF EXISTS "Admin can manage special offers" ON public.special_offers;
DROP POLICY IF EXISTS "Admin can manage special offer products" ON public.special_offer_products;

-- Create correct policies that check the profiles table for admin status

-- Policy for special_offers table - admin management
CREATE POLICY "Admin can manage special offers" ON public.special_offers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

-- Policy for special_offer_products table - admin management
CREATE POLICY "Admin can manage special offer products" ON public.special_offer_products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

-- Verify the policies are created correctly
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('special_offers', 'special_offer_products')
ORDER BY tablename, policyname;