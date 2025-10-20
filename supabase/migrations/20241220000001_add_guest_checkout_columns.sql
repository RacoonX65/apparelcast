-- Add guest checkout columns to orders table
-- This migration adds columns needed for guest checkout functionality

-- Add guest information columns
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS guest_email text,
ADD COLUMN IF NOT EXISTS guest_phone text,
ADD COLUMN IF NOT EXISTS guest_first_name text,
ADD COLUMN IF NOT EXISTS guest_last_name text,
ADD COLUMN IF NOT EXISTS guest_address text,
ADD COLUMN IF NOT EXISTS guest_city text,
ADD COLUMN IF NOT EXISTS guest_province text,
ADD COLUMN IF NOT EXISTS guest_postal_code text;

-- Add comments for documentation
COMMENT ON COLUMN public.orders.guest_email IS 'Email address for guest checkout orders';
COMMENT ON COLUMN public.orders.guest_phone IS 'Phone number for guest checkout orders';
COMMENT ON COLUMN public.orders.guest_first_name IS 'First name for guest checkout orders';
COMMENT ON COLUMN public.orders.guest_last_name IS 'Last name for guest checkout orders';
COMMENT ON COLUMN public.orders.guest_address IS 'Delivery address for guest checkout orders';
COMMENT ON COLUMN public.orders.guest_city IS 'City for guest checkout delivery address';
COMMENT ON COLUMN public.orders.guest_province IS 'Province for guest checkout delivery address';
COMMENT ON COLUMN public.orders.guest_postal_code IS 'Postal code for guest checkout delivery address';

-- Modify user_id constraint to allow null for guest orders
-- First, we need to drop the existing constraint if it exists
ALTER TABLE public.orders 
DROP CONSTRAINT IF EXISTS orders_user_id_not_null;

-- Make user_id nullable to support guest orders
ALTER TABLE public.orders 
ALTER COLUMN user_id DROP NOT NULL;

-- Add constraint to ensure either user_id is provided OR guest information is complete
ALTER TABLE public.orders 
ADD CONSTRAINT orders_user_or_guest_check 
CHECK (
  (user_id IS NOT NULL) OR 
  (guest_email IS NOT NULL AND guest_first_name IS NOT NULL AND guest_last_name IS NOT NULL AND guest_address IS NOT NULL AND guest_city IS NOT NULL AND guest_province IS NOT NULL AND guest_postal_code IS NOT NULL)
);

-- Update RLS policies to allow guest orders
-- Drop existing policies that require authentication
DROP POLICY IF EXISTS "Users can insert their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON public.orders;

-- Create new policies that handle both authenticated and guest orders
CREATE POLICY "Users can insert their own orders" ON public.orders
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR 
    (user_id IS NULL AND guest_email IS NOT NULL)
  );

CREATE POLICY "Users can update their own orders" ON public.orders
  FOR UPDATE USING (
    auth.uid() = user_id OR 
    (user_id IS NULL AND guest_email IS NOT NULL)
  );

-- Create index for guest order lookups by email
CREATE INDEX IF NOT EXISTS idx_orders_guest_email ON public.orders(guest_email) WHERE guest_email IS NOT NULL;

-- Create index for order status queries that include guest orders
CREATE INDEX IF NOT EXISTS idx_orders_status_guest ON public.orders(status, guest_email) WHERE guest_email IS NOT NULL;