-- Update bulk pricing tiers policy to allow authenticated users
-- Drop existing policy
drop policy if exists "Admins can manage bulk pricing tiers" on public.bulk_pricing_tiers;

-- Create new policy allowing authenticated users to manage bulk pricing
create policy "Authenticated users can manage bulk pricing tiers"
  on public.bulk_pricing_tiers for all
  using (auth.uid() is not null);

-- Alternative: Allow users to manage tiers for their own products
-- Uncomment this if you want users to only manage tiers for products they own
/*
create policy "Users can manage bulk pricing for their products"
  on public.bulk_pricing_tiers for all
  using (
    exists (
      select 1 from public.products
      where products.id = bulk_pricing_tiers.product_id
      and products.created_by = auth.uid()
    )
  );
*/