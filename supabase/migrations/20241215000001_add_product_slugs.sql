-- Add slug field to products table for SEO-friendly URLs
-- This migration adds a slug column and generates slugs for existing products

-- Add slug column to products table
alter table public.products add column if not exists slug text;

-- Create unique index on slug for fast lookups and uniqueness
create unique index if not exists idx_products_slug on public.products(slug);

-- Function to generate slug from product name
create or replace function generate_slug(input_text text)
returns text as $$
begin
  return lower(
    regexp_replace(
      regexp_replace(
        regexp_replace(input_text, '[^a-zA-Z0-9\s-]', '', 'g'), -- Remove special chars
        '\s+', '-', 'g' -- Replace spaces with hyphens
      ),
      '-+', '-', 'g' -- Replace multiple hyphens with single
    )
  );
end;
$$ language plpgsql;

-- Function to ensure unique slug
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

-- Generate slugs for existing products
update public.products 
set slug = ensure_unique_slug(generate_slug(name), id)
where slug is null;

-- Add constraint to ensure slug is not null for new products
alter table public.products alter column slug set not null;

-- Create trigger to automatically generate slug on insert/update
create or replace function auto_generate_slug()
returns trigger as $$
begin
  -- Only generate slug if it's not provided or if name changed
  if NEW.slug is null or (TG_OP = 'UPDATE' and OLD.name != NEW.name and NEW.slug = OLD.slug) then
    NEW.slug := ensure_unique_slug(generate_slug(NEW.name), NEW.id);
  end if;
  return NEW;
end;
$$ language plpgsql;

-- Create trigger
drop trigger if exists trigger_auto_generate_slug on public.products;
create trigger trigger_auto_generate_slug
  before insert or update on public.products
  for each row execute function auto_generate_slug();