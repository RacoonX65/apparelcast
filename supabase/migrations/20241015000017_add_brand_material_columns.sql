-- Add brand and material columns to products table for enhanced filtering
-- This migration adds new columns to support brand and material filtering

-- Add brand column
alter table public.products add column if not exists brand text;

-- Add material column  
alter table public.products add column if not exists material text;

-- Add indexes for better performance on brand and material queries
create index if not exists idx_products_brand on public.products(brand);
create index if not exists idx_products_material on public.products(material);

-- Update existing products with sample brand and material data
update public.products set 
  brand = case 
    when category = 'clothing' then 
      case 
        when name ilike '%dress%' then 'CAARL Couture'
        when name ilike '%shirt%' then 'CAARL Basics'
        when name ilike '%jacket%' then 'CAARL Premium'
        else 'CAARL'
      end
    when category = 'sneakers' then
      case 
        when name ilike '%classic%' then 'CAARL Sport'
        when name ilike '%leather%' then 'CAARL Premium'
        when name ilike '%canvas%' then 'CAARL Casual'
        else 'CAARL'
      end
    when category = 'perfumes' then 'CAARL Fragrance'
    when category = 'home' then 'CAARL Home'
    when category = 'electronics' then 'CAARL Tech'
    else 'CAARL'
  end,
  material = case 
    when category = 'clothing' then 
      case 
        when name ilike '%cotton%' then 'Cotton'
        when name ilike '%linen%' then 'Linen'
        when name ilike '%silk%' then 'Silk'
        when name ilike '%wool%' then 'Wool'
        else 'Cotton Blend'
      end
    when category = 'sneakers' then
      case 
        when name ilike '%leather%' then 'Leather'
        when name ilike '%canvas%' then 'Canvas'
        else 'Synthetic'
      end
    when category = 'perfumes' then 'Fragrance'
    when category = 'home' then 
      case 
        when name ilike '%cotton%' then 'Cotton'
        when name ilike '%blanket%' then 'Microfiber'
        else 'Mixed Materials'
      end
    when category = 'electronics' then 'Electronic Components'
    else 'Mixed Materials'
  end
where brand is null or material is null;