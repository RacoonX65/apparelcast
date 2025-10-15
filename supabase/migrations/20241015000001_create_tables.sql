-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create products table
create table if not exists public.products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  price decimal(10, 2) not null,
  category text not null check (category in ('clothing', 'sneakers', 'perfumes')),
  subcategory text,
  sizes text[] default array[]::text[],
  colors text[] default array[]::text[],
  image_url text not null,
  additional_images text[] default array[]::text[],
  stock_quantity integer not null default 0,
  is_featured boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create profiles table (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create addresses table
create table if not exists public.addresses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  full_name text not null,
  phone text not null,
  street_address text not null,
  city text not null,
  province text not null,
  postal_code text not null,
  is_default boolean default false,
  created_at timestamp with time zone default now()
);

-- Create orders table
create table if not exists public.orders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  order_number text unique not null,
  status text not null default 'pending' check (status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  total_amount decimal(10, 2) not null,
  delivery_method text not null check (delivery_method in ('courier_guy', 'pudo')),
  delivery_fee decimal(10, 2) not null,
  address_id uuid references public.addresses(id),
  discount_code_id uuid,
  discount_amount decimal(10, 2) default 0,
  payment_reference text,
  payment_status text default 'pending' check (payment_status in ('pending', 'paid', 'failed')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create order_items table
create table if not exists public.order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id) not null,
  quantity integer not null,
  size text,
  color text,
  price decimal(10, 2) not null,
  created_at timestamp with time zone default now()
);

-- Create cart table
create table if not exists public.cart_items (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  quantity integer not null default 1,
  size text,
  color text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id, product_id, size, color)
);

-- Enable Row Level Security
alter table public.products enable row level security;
alter table public.profiles enable row level security;
alter table public.addresses enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.cart_items enable row level security;

-- Products policies (public read, admin write)
create policy "Anyone can view products"
  on public.products for select
  using (true);

create policy "Only admins can insert products"
  on public.products for insert
  with check (false); -- Will be updated when admin role is implemented

create policy "Only admins can update products"
  on public.products for update
  using (false);

create policy "Only admins can delete products"
  on public.products for delete
  using (false);

-- Profiles policies
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Addresses policies
create policy "Users can view their own addresses"
  on public.addresses for select
  using (auth.uid() = user_id);

create policy "Users can insert their own addresses"
  on public.addresses for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own addresses"
  on public.addresses for update
  using (auth.uid() = user_id);

create policy "Users can delete their own addresses"
  on public.addresses for delete
  using (auth.uid() = user_id);

-- Orders policies
create policy "Users can view their own orders"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "Users can insert their own orders"
  on public.orders for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own orders"
  on public.orders for update
  using (auth.uid() = user_id);

-- Order items policies
create policy "Users can view their own order items"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
    )
  );

create policy "Users can insert their own order items"
  on public.order_items for insert
  with check (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
    )
  );

-- Cart items policies
create policy "Users can view their own cart items"
  on public.cart_items for select
  using (auth.uid() = user_id);

create policy "Users can insert their own cart items"
  on public.cart_items for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own cart items"
  on public.cart_items for update
  using (auth.uid() = user_id);

create policy "Users can delete their own cart items"
  on public.cart_items for delete
  using (auth.uid() = user_id);
