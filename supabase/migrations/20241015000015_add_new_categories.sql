-- Add new product categories: Home and Electronics
-- Update the category constraint to include the new categories

-- First, drop the existing constraint
alter table public.products drop constraint if exists products_category_check;

-- Add the new constraint with additional categories
alter table public.products add constraint products_category_check 
  check (category in ('clothing', 'shoes', 'perfumes', 'home', 'electronics'));

-- Update the category index to include new categories
drop index if exists idx_products_category;
create index idx_products_category on public.products(category);

-- Add some sample home products
insert into public.products (name, description, price, category, subcategory, sizes, colors, image_url, stock_quantity, is_featured) values
-- Home category products
('Luxury Throw Blanket', 'Ultra-soft luxury throw blanket perfect for cozy evenings. Made from premium materials.', 599.00, 'home', 'blankets', array['Standard'], array['Cream', 'Grey', 'Blush Pink'], '/placeholder.svg?height=600&width=400', 30, true),
('Cotton Bed Sheet Set', 'Premium cotton bed sheet set with deep pockets. Includes fitted sheet, flat sheet, and pillowcases.', 899.00, 'home', 'bedding', array['Single', 'Double', 'Queen', 'King'], array['White', 'Ivory', 'Grey'], '/placeholder.svg?height=600&width=400', 25, true),
('Decorative Throw Pillows', 'Set of 2 decorative throw pillows with elegant designs. Perfect for sofas and beds.', 399.00, 'home', 'pillows', array['Standard'], array['Blush Pink', 'Gold', 'Navy', 'Cream'], '/placeholder.svg?height=600&width=400', 40, false),
('Weighted Comfort Blanket', 'Therapeutic weighted blanket for better sleep. Available in multiple weights.', 1299.00, 'home', 'blankets', array['5kg', '7kg', '9kg'], array['Grey', 'Navy', 'Cream'], '/placeholder.svg?height=600&width=400', 20, true),
('Bamboo Pillow Set', 'Eco-friendly bamboo pillows with hypoallergenic properties. Set of 2.', 799.00, 'home', 'pillows', array['Standard', 'King'], array['White'], '/placeholder.svg?height=600&width=400', 35, false),
('Fleece Throw Blanket', 'Cozy fleece throw blanket perfect for movie nights. Machine washable.', 299.00, 'home', 'blankets', array['Standard'], array['Blush Pink', 'Grey', 'Cream', 'Navy'], '/placeholder.svg?height=600&width=400', 50, false);

-- Note: Electronics category is added to the constraint but no sample products yet
-- This allows for future expansion when ready to add phones and other electronics