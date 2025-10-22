const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkProducts() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log('🔍 Checking products with colors...');

  // Check products table for colors
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, name, colors, image_url')
    .limit(10);

  console.log('\n📦 Products with colors:');
  if (productsError) {
    console.error('❌ Error:', productsError);
  } else {
    products.forEach(p => {
      if (p.colors && p.colors.length > 0) {
        console.log(`- ${p.name}: colors=[${p.colors.join(', ')}], image=${p.image_url}`);
      }
    });
  }

  console.log('\n🎨 Checking product color images...');

  // Check product_color_images table
  const { data: colorImages, error: colorError } = await supabase
    .from('product_color_images')
    .select('*')
    .limit(20);

  console.log('\nProduct color images:');
  if (colorError) {
    console.error('❌ Error:', colorError);
  } else {
    if (colorImages.length === 0) {
      console.log('❌ No color-image mappings found!');
      console.log('💡 You need to set up color-image mappings in the admin panel');
    } else {
      colorImages.forEach(c => {
        console.log(`- Product ${c.product_id}: ${c.color_name} -> ${c.image_url}`);
      });

      // Check color matching
      console.log('\n🔍 Checking color matching...');
      const mappedColors = new Set(colorImages.map(c => c.color_name));

      products.forEach(p => {
        if (p.colors && p.colors.length > 0) {
          console.log(`\n📦 ${p.name}:`);
          p.colors.forEach(color => {
            if (mappedColors.has(color)) {
              console.log(`  ✅ ${color} - HAS MAPPING`);
            } else {
              console.log(`  ❌ ${color} - NO MAPPING`);
            }
          });
        }
      });
    }
  }

  console.log('\n✅ Database check complete!');
}

checkProducts().catch(console.error);
