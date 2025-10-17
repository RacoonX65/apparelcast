-- Script to update existing products with slugs based on product names
-- This script can be run manually to regenerate slugs for all products

-- Function to generate slug from product name (if not exists)
create or replace function generate_slug(input_text text)
returns text as $$
begin
  return lower(
    regexp_replace(
      regexp_replace(
        regexp_replace(
          regexp_replace(input_text, '[^\w\s-]', '', 'g'), -- Remove special chars except word chars, spaces, hyphens
          '\s+', '-', 'g' -- Replace spaces with hyphens
        ),
        '-+', '-', 'g' -- Replace multiple hyphens with single
      ),
      '^-|-$', '', 'g' -- Remove leading/trailing hyphens
    )
  );
end;
$$ language plpgsql;

-- Function to ensure unique slug (if not exists)
create or replace function ensure_unique_slug(base_slug text, product_id uuid default null)
returns text as $$
declare
  final_slug text := base_slug;
  counter integer := 1;
begin
  -- Check if slug already exists (excluding current product if updating)
  while exists (
    select 1 from public.products 
    where slug = final_slug 
    and (product_id is null or id != product_id)
  ) loop
    final_slug := base_slug || '-' || counter;
    counter := counter + 1;
  end loop;
  
  return final_slug;
end;
$$ language plpgsql;

-- Update all products to have slugs based on their names
-- This will regenerate slugs for ALL products, including those that already have slugs
update public.products 
set slug = ensure_unique_slug(generate_slug(name), id);

-- Alternative: Only update products that don't have slugs
-- Uncomment the line below and comment the line above if you only want to update products without slugs
-- update public.products set slug = ensure_unique_slug(generate_slug(name), id) where slug is null or slug = '';

-- Show results
select 
  id,
  name,
  slug,
  case 
    when slug is not null and slug != '' then '✓ Has slug'
    else '✗ Missing slug'
  end as status
from public.products 
order by name;

-- Count of products with and without slugs
select 
  count(*) as total_products,
  count(case when slug is not null and slug != '' then 1 end) as products_with_slugs,
  count(case when slug is null or slug = '' then 1 end) as products_without_slugs
from public.products;