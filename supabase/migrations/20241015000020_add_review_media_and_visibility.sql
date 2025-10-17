-- Add media attachments and visibility control to reviews table
alter table public.reviews 
  add column if not exists media jsonb,
  add column if not exists is_hidden boolean default false;

-- Optional: add a check to ensure media is an array of objects
-- This is a lightweight constraint; real validation happens at application level
alter table public.reviews
  add constraint reviews_media_is_json check (media is null or jsonb_typeof(media) = 'array');

-- Index to help queries that filter out hidden reviews
create index if not exists idx_reviews_is_hidden on public.reviews(is_hidden);