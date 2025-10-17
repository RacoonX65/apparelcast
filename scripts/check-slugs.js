const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkProductSlugs() {
  try {
    console.log('🔍 Checking product slugs...\n');
    
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, slug')
      .order('name');

    if (error) {
      console.error('❌ Error fetching products:', error);
      return;
    }

    if (!products || products.length === 0) {
      console.log('📭 No products found in the database.');
      return;
    }

    console.log(`📊 Found ${products.length} products:\n`);
    console.log('ID'.padEnd(36) + ' | ' + 'Name'.padEnd(30) + ' | ' + 'Slug');
    console.log('-'.repeat(36) + '-+-' + '-'.repeat(30) + '-+-' + '-'.repeat(40));

    products.forEach(product => {
      const id = product.id || 'N/A';
      const name = (product.name || 'N/A').substring(0, 30);
      const slug = product.slug || '❌ NO SLUG';
      
      console.log(
        id.padEnd(36) + ' | ' + 
        name.padEnd(30) + ' | ' + 
        slug
      );
    });

    const productsWithSlugs = products.filter(p => p.slug);
    const productsWithoutSlugs = products.filter(p => !p.slug);

    console.log(`\n📈 Summary:`);
    console.log(`✅ Products with slugs: ${productsWithSlugs.length}`);
    console.log(`❌ Products without slugs: ${productsWithoutSlugs.length}`);

    if (productsWithSlugs.length > 0) {
      console.log('\n🔗 Example URLs:');
      productsWithSlugs.slice(0, 3).forEach(product => {
        console.log(`   • ${product.name}: http://localhost:3000/products/${product.slug}`);
      });
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

checkProductSlugs();