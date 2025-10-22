const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function createSampleColorMapping() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log('🎨 Creating sample color-image mapping for testing...');

  // Get first product with colors that doesn't have mappings
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

  console.log(`📦 Using product: ${product.name}`);
  console.log(`🎨 Colors: [${product.colors.join(', ')}]`);
  console.log(`🖼️  Main image: ${product.image_url}`);

  if (product.colors.length === 0) {
    console.log('❌ No colors found for this product');
    return;
  }

  // Create a mapping for the first color using the main image as the color image
  const firstColor = product.colors[0];
  console.log(`\n🔗 Creating mapping for color: ${firstColor}`);

  const { data: mapping, error: mappingError } = await supabase
    .from('product_color_images')
    .insert({
      product_id: product.id,
      color_name: firstColor,
      image_url: product.image_url, // Use main image as color image for testing
      display_order: 1
    })
    .select()
    .single();

  if (mappingError) {
    console.error('❌ Error creating mapping:', mappingError);
  } else {
    console.log(`✅ Successfully created color mapping!`);
    console.log(`🎨 Color: ${mapping.color_name}`);
    console.log(`🖼️  Image: ${mapping.image_url}`);
    console.log('\n🧪 Now test the cart - you should see the color-specific image!');
  }
}

createSampleColorMapping().catch(console.error);
