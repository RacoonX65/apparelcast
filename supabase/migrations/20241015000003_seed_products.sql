-- Insert sample products for Caarl store
insert into public.products (name, description, price, category, subcategory, sizes, colors, image_url, stock_quantity, is_featured) values
-- Clothing
('Elegant Midi Dress', 'Flowing midi dress perfect for any occasion. Soft fabric with a flattering silhouette.', 899.00, 'clothing', 'dresses', array['XS', 'S', 'M', 'L', 'XL'], array['Blush Pink', 'Ivory', 'Navy'], '/placeholder.svg?height=600&width=400', 50, true),
('Classic White Blouse', 'Timeless white blouse with delicate button details. Perfect for work or casual wear.', 549.00, 'clothing', 'tops', array['XS', 'S', 'M', 'L', 'XL'], array['White', 'Cream'], '/placeholder.svg?height=600&width=400', 75, true),
('High-Waist Tailored Trousers', 'Sophisticated high-waist trousers with a tailored fit. Versatile and comfortable.', 799.00, 'clothing', 'bottoms', array['XS', 'S', 'M', 'L', 'XL'], array['Black', 'Beige', 'Navy'], '/placeholder.svg?height=600&width=400', 60, false),
('Soft Cashmere Sweater', 'Luxuriously soft cashmere sweater. Perfect for layering or wearing alone.', 1299.00, 'clothing', 'tops', array['XS', 'S', 'M', 'L', 'XL'], array['Blush Pink', 'Cream', 'Grey'], '/placeholder.svg?height=600&width=400', 40, true),
('Flowy Maxi Skirt', 'Elegant maxi skirt with a flowy silhouette. Comfortable and stylish.', 699.00, 'clothing', 'bottoms', array['XS', 'S', 'M', 'L', 'XL'], array['Blush Pink', 'Black', 'Ivory'], '/placeholder.svg?height=600&width=400', 55, false),
('Linen Summer Dress', 'Breathable linen dress perfect for warm weather. Effortlessly chic.', 849.00, 'clothing', 'dresses', array['XS', 'S', 'M', 'L', 'XL'], array['White', 'Beige', 'Light Blue'], '/placeholder.svg?height=600&width=400', 45, false),

-- Sneakers
('Classic White Sneakers', 'Minimalist white sneakers that go with everything. Comfortable all-day wear.', 1199.00, 'sneakers', 'casual', array['36', '37', '38', '39', '40', '41'], array['White'], '/placeholder.svg?height=600&width=400', 80, true),
('Blush Pink Trainers', 'Stylish trainers in soft blush pink. Perfect for casual outings.', 1099.00, 'sneakers', 'casual', array['36', '37', '38', '39', '40', '41'], array['Blush Pink', 'White'], '/placeholder.svg?height=600&width=400', 65, true),
('Leather Low-Top Sneakers', 'Premium leather sneakers with a sleek design. Timeless and versatile.', 1499.00, 'sneakers', 'casual', array['36', '37', '38', '39', '40', '41'], array['White', 'Black', 'Beige'], '/placeholder.svg?height=600&width=400', 50, false),
('Platform Canvas Sneakers', 'Trendy platform sneakers for added height. Comfortable and fashionable.', 899.00, 'sneakers', 'casual', array['36', '37', '38', '39', '40', '41'], array['White', 'Black'], '/placeholder.svg?height=600&width=400', 70, false),

-- Perfumes
('Rose Garden Eau de Parfum', 'Delicate floral fragrance with notes of rose, jasmine, and vanilla. Long-lasting and elegant.', 1899.00, 'perfumes', 'floral', array['50ml', '100ml'], array['N/A'], '/placeholder.svg?height=600&width=400', 100, true),
('Citrus Bloom Eau de Toilette', 'Fresh and vibrant citrus scent with hints of bergamot and orange blossom.', 1499.00, 'perfumes', 'citrus', array['50ml', '100ml'], array['N/A'], '/placeholder.svg?height=600&width=400', 90, false),
('Vanilla Dreams Perfume', 'Warm and comforting vanilla fragrance with subtle woody notes.', 1699.00, 'perfumes', 'oriental', array['50ml', '100ml'], array['N/A'], '/placeholder.svg?height=600&width=400', 85, true),
('Fresh Linen Eau de Parfum', 'Clean and airy scent reminiscent of fresh laundry. Perfect for everyday wear.', 1599.00, 'perfumes', 'fresh', array['50ml', '100ml'], array['N/A'], '/placeholder.svg?height=600&width=400', 95, false);
