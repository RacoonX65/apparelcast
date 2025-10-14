-- Create reviews table for product reviews and ratings
create table if not exists public.reviews (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references public.products(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  title text,
  comment text,
  is_verified_purchase boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(product_id, user_id) -- One review per user per product
);

-- Create indexes for better performance
create index if not exists idx_reviews_product_id on public.reviews(product_id);
create index if not exists idx_reviews_user_id on public.reviews(user_id);
create index if not exists idx_reviews_rating on public.reviews(rating);
create index if not exists idx_reviews_created_at on public.reviews(created_at desc);

-- Enable Row Level Security
alter table public.reviews enable row level security;

-- Reviews policies
-- Anyone can read reviews (public)
create policy "Anyone can view reviews"
  on public.reviews for select
  using (true);

-- Authenticated users can create reviews for products
create policy "Authenticated users can create reviews"
  on public.reviews for insert
  with check (auth.uid() = user_id);

-- Users can update their own reviews
create policy "Users can update own reviews"
  on public.reviews for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Users can delete their own reviews
create policy "Users can delete own reviews"
  on public.reviews for delete
  using (auth.uid() = user_id);

-- Admins can view all reviews
create policy "Admins can view all reviews"
  on public.reviews for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.is_admin = true
    )
  );

-- Admins can delete any review (moderation)
create policy "Admins can delete any review"
  on public.reviews for delete
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.is_admin = true
    )
  );

-- Function to update updated_at timestamp
create or replace function update_reviews_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to automatically update updated_at
create trigger update_reviews_timestamp
  before update on public.reviews
  for each row
  execute function update_reviews_updated_at();

-- Function to calculate average rating for a product
create or replace function get_product_average_rating(product_uuid uuid)
returns decimal as $$
declare
  avg_rating decimal;
begin
  select round(avg(rating), 1) into avg_rating
  from public.reviews
  where product_id = product_uuid;
  
  return coalesce(avg_rating, 0);
end;
$$ language plpgsql;

-- Function to get review count for a product
create or replace function get_product_review_count(product_uuid uuid)
returns integer as $$
declare
  review_count integer;
begin
  select count(*) into review_count
  from public.reviews
  where product_id = product_uuid;
  
  return review_count;
end;
$$ language plpgsql;