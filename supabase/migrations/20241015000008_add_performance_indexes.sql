-- Additional performance indexes for existing tables
-- These indexes will improve query performance for common operations

-- Products table indexes
create index if not exists idx_products_category on public.products(category);
create index if not exists idx_products_price on public.products(price);
create index if not exists idx_products_is_featured on public.products(is_featured);
create index if not exists idx_products_created_at on public.products(created_at desc);
create index if not exists idx_products_name_search on public.products using gin(to_tsvector('english', name));
create index if not exists idx_products_description_search on public.products using gin(to_tsvector('english', description));

-- Profiles table indexes
create index if not exists idx_profiles_is_admin on public.profiles(is_admin);
create index if not exists idx_profiles_created_at on public.profiles(created_at desc);
create index if not exists idx_profiles_full_name on public.profiles(full_name);
create index if not exists idx_profiles_phone on public.profiles(phone);

-- Orders table indexes
create index if not exists idx_orders_user_id on public.orders(user_id);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_created_at on public.orders(created_at desc);
create index if not exists idx_orders_total_amount on public.orders(total_amount);
create index if not exists idx_orders_user_status on public.orders(user_id, status);
create index if not exists idx_orders_user_created on public.orders(user_id, created_at desc);

-- Order items table indexes
create index if not exists idx_order_items_order_id on public.order_items(order_id);
create index if not exists idx_order_items_product_id on public.order_items(product_id);
create index if not exists idx_order_items_order_product on public.order_items(order_id, product_id);

-- Cart items table indexes
create index if not exists idx_cart_items_user_id on public.cart_items(user_id);
create index if not exists idx_cart_items_product_id on public.cart_items(product_id);
create index if not exists idx_cart_items_user_product on public.cart_items(user_id, product_id);
create index if not exists idx_cart_items_created_at on public.cart_items(created_at desc);

-- Addresses table indexes
create index if not exists idx_addresses_user_id on public.addresses(user_id);
create index if not exists idx_addresses_is_default on public.addresses(is_default);
create index if not exists idx_addresses_user_default on public.addresses(user_id, is_default);

-- Composite indexes for common query patterns
-- Products with category and price range queries
create index if not exists idx_products_category_price on public.products(category, price);

-- Orders with user and date range queries
create index if not exists idx_orders_user_date_status on public.orders(user_id, created_at desc, status);

-- Cart items with user and recent items
create index if not exists idx_cart_items_user_recent on public.cart_items(user_id, created_at desc);

-- Performance optimization: Partial indexes
-- Index only active products
create index if not exists idx_products_active_category on public.products(category) 
where is_featured = true;

-- Index only completed orders
create index if not exists idx_orders_completed_date on public.orders(created_at desc) 
where status = 'completed';

-- Index only default addresses
create index if not exists idx_addresses_default_user on public.addresses(user_id) 
where is_default = true;