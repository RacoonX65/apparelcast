const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testColorImage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log('🔍 Testing color-specific image functionality...');

  // Get first product with colors
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('id, name, colors, image_url')
    .not('colors', 'is', null)
    .limit(1)
    .single();

  if (productError || !product) {
    console.error('❌ No products with colors found');
    return;
  }

  console.log(`📦 Testing with: ${product.name}`);
  console.log(`🎨 Available colors: [${product.colors.join(', ')}]`);
  console.log(`🖼️  Main image: ${product.image_url}`);

  // Test the getProductImageForColor function logic
  const firstColor = product.colors[0];
  console.log(`\n🧪 Testing color: ${firstColor}`);

  const { data: colorMapping, error: mappingError } = await supabase
    .from('product_color_images')
    .select('image_url')
    .eq('product_id', product.id)
    .eq('color_name', firstColor)
    .limit(1)
    .maybeSingle();

  if (mappingError) {
    console.error('❌ Database error:', mappingError);
    return;
  }

  if (colorMapping) {
    console.log(`✅ Color mapping found!`);
    console.log(`🎨 Color: ${firstColor}`);
    console.log(`🖼️  Color image: ${colorMapping.image_url}`);
    console.log(`📸 Main image: ${product.image_url}`);
  } else {
    console.log(`❌ No mapping found for color: ${firstColor}`);
    console.log(`💡 You need to add a color-image mapping in the admin panel`);
  }

  console.log('\n📋 To fix this:');
  console.log('1. Go to /admin/products in your browser');
  console.log('2. Find your product and click the 🎨 (palette) icon');
  console.log('3. Upload images for each color variant');
  console.log('4. Test again - it should work!');
}

testColorImage().catch(console.error);
