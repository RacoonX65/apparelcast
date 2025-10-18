-- Create product_color_images table for mapping colors to specific images
create table if not exists public.product_color_images (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references public.products(id) on delete cascade not null,
  color_name text not null,
  image_url text not null,
  display_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for better performance
create index if not exists idx_product_color_images_product_id on public.product_color_images(product_id);
create index if not exists idx_product_color_images_color_name on public.product_color_images(color_name);
create index if not exists idx_product_color_images_display_order on public.product_color_images(display_order);

-- Create unique constraint to prevent duplicate color-image mappings per product
create unique index if not exists idx_product_color_images_unique on public.product_color_images(product_id, color_name, image_url);

-- Enable RLS (Row Level Security)
alter table public.product_color_images enable row level security;

-- Create RLS policies
-- Allow public read access for product color images
create policy "Allow public read access to product color images" on public.product_color_images
  for select using (true);

-- Allow authenticated users with admin role to manage product color images
create policy "Admins can manage product color images"
  on public.product_color_images for all
  using (
    auth.role() = 'authenticated' and
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

-- Create function to automatically update updated_at timestamp
create or replace function public.handle_updated_at_product_color_images()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create trigger for updated_at
create trigger handle_updated_at_product_color_images
  before update on public.product_color_images
  for each row execute procedure public.handle_updated_at_product_color_images();

-- Add helpful comments
comment on table public.product_color_images is 'Maps product colors to specific images for color-based image switching';
comment on column public.product_color_images.product_id is 'Reference to the product';
comment on column public.product_color_images.color_name is 'Name of the color (should match colors array in products table)';
comment on column public.product_color_images.image_url is 'URL of the image associated with this color';
comment on column public.product_color_images.display_order is 'Order for displaying multiple images for the same color';