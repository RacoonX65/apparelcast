-- Fix RLS policies for guest checkout
-- The current policies are incorrectly requiring authentication for guest orders

-- Drop the existing problematic policies
DROP POLICY IF EXISTS "Users can insert their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;

-- Drop order_items policies that also need fixing
DROP POLICY IF EXISTS "Users can insert their own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can view their own order items" ON public.order_items;

-- Create new policies that properly handle guest orders
-- Policy for inserting orders (both authenticated and guest)
CREATE POLICY "Allow order insertion for authenticated users and guests" ON public.orders
  FOR INSERT WITH CHECK (
    -- For authenticated users: must match their user_id
    (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
    -- For guest users: user_id must be null and guest info must be provided
    (auth.uid() IS NULL AND user_id IS NULL AND guest_email IS NOT NULL AND guest_first_name IS NOT NULL AND guest_last_name IS NOT NULL)
  );

-- Policy for updating orders (both authenticated and guest)
CREATE POLICY "Allow order updates for authenticated users and guests" ON public.orders
  FOR UPDATE USING (
    -- For authenticated users: must match their user_id
    (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
    -- For guest users: user_id must be null and guest info must be provided
    (auth.uid() IS NULL AND user_id IS NULL AND guest_email IS NOT NULL)
  );

-- Policy for selecting orders (both authenticated and guest)
CREATE POLICY "Allow order viewing for authenticated users and guests" ON public.orders
  FOR SELECT USING (
    -- For authenticated users: must match their user_id
    (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
    -- For guest users: user_id must be null (guest orders are viewable by anyone with the order ID)
    (auth.uid() IS NULL AND user_id IS NULL)
  );

-- Create order_items policies that work with both authenticated and guest orders
CREATE POLICY "Allow order items insertion for authenticated users and guests" ON public.order_items
  FOR INSERT WITH CHECK (
    -- Check if the associated order belongs to the authenticated user or is a guest order
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND (
        -- Authenticated user order
        (auth.uid() IS NOT NULL AND orders.user_id = auth.uid()) OR
        -- Guest order
        (auth.uid() IS NULL AND orders.user_id IS NULL AND orders.guest_email IS NOT NULL)
      )
    )
  );

CREATE POLICY "Allow order items viewing for authenticated users and guests" ON public.order_items
  FOR SELECT USING (
    -- Check if the associated order belongs to the authenticated user or is a guest order
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND (
        -- Authenticated user order
        (auth.uid() IS NOT NULL AND orders.user_id = auth.uid()) OR
        -- Guest order
        (auth.uid() IS NULL AND orders.user_id IS NULL AND orders.guest_email IS NOT NULL)
      )
    )
  );

-- Verify the policies are created correctly
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('orders', 'order_items')
ORDER BY tablename, policyname;