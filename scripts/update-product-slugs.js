#!/usr/bin/env node

/**
 * Script to update existing products with slugs based on their names
 * This script connects to your Supabase database and updates products
 * 
 * Usage:
 * node scripts/update-product-slugs.js
 * 
 * Or with npm:
 * npm run update-slugs (if you add this to package.json scripts)
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role key for admin operations

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in environment variables');
  console.error('Make sure you have NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Generate a slug from product name
 */
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters except word chars, spaces, hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Ensure slug is unique by appending a number if necessary
 */
async function ensureUniqueSlug(baseSlug, productId = null) {
  let finalSlug = baseSlug;
  let counter = 1;

  while (true) {
    const { data, error } = await supabase
      .from('products')
      .select('id')
      .eq('slug', finalSlug)
      .neq('id', productId || '00000000-0000-0000-0000-000000000000');

    if (error) {
      console.error('Error checking slug uniqueness:', error);
      throw error;
    }

    if (data.length === 0) {
      break; // Slug is unique
    }

    finalSlug = `${baseSlug}-${counter}`;
    counter++;
  }

  return finalSlug;
}

/**
 * Update products with slugs
 */
async function updateProductSlugs() {
  console.log('🚀 Starting product slug update...\n');

  try {
    // Fetch all products
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('id, name, slug')
      .order('name');

    if (fetchError) {
      console.error('❌ Error fetching products:', fetchError);
      return;
    }

    console.log(`📦 Found ${products.length} products to process\n`);

    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const product of products) {
      try {
        // Check if product already has a slug (optional - remove this check to regenerate all slugs)
        if (product.slug && product.slug.trim() !== '') {
          console.log(`⏭️  Skipping "${product.name}" - already has slug: ${product.slug}`);
          skippedCount++;
          continue;
        }

        // Generate slug from product name
        const baseSlug = generateSlug(product.name);
        const uniqueSlug = await ensureUniqueSlug(baseSlug, product.id);

        // Update the product with the new slug
        const { error: updateError } = await supabase
          .from('products')
          .update({ slug: uniqueSlug })
          .eq('id', product.id);

        if (updateError) {
          console.error(`❌ Error updating product "${product.name}":`, updateError);
          errorCount++;
          continue;
        }

        console.log(`✅ Updated "${product.name}" → slug: "${uniqueSlug}"`);
        updatedCount++;

      } catch (error) {
        console.error(`❌ Error processing product "${product.name}":`, error);
        errorCount++;
      }
    }

    console.log('\n📊 Summary:');
    console.log(`✅ Updated: ${updatedCount} products`);
    console.log(`⏭️  Skipped: ${skippedCount} products (already had slugs)`);
    console.log(`❌ Errors: ${errorCount} products`);
    console.log(`📦 Total: ${products.length} products processed`);

    if (updatedCount > 0) {
      console.log('\n🎉 Slug update completed successfully!');
      console.log('Your products now have SEO-friendly URLs like:');
      console.log('https://yoursite.com/products/nike-air-max-270-black-white');
    }

  } catch (error) {
    console.error('❌ Fatal error during slug update:', error);
  }
}

/**
 * Show current slug status
 */
async function showSlugStatus() {
  try {
    const { data: stats, error } = await supabase
      .from('products')
      .select('slug')
      .not('slug', 'is', null);

    if (error) {
      console.error('Error fetching slug stats:', error);
      return;
    }

    const { count: totalCount, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error fetching total count:', countError);
      return;
    }

    const withSlugs = stats.filter(p => p.slug && p.slug.trim() !== '').length;
    const withoutSlugs = totalCount - withSlugs;

    console.log('\n📊 Current Slug Status:');
    console.log(`📦 Total products: ${totalCount}`);
    console.log(`✅ With slugs: ${withSlugs}`);
    console.log(`❌ Without slugs: ${withoutSlugs}`);
  } catch (error) {
    console.error('Error showing slug status:', error);
  }
}

// Main execution
async function main() {
  console.log('🔧 Product Slug Updater\n');
  
  // Show current status
  await showSlugStatus();
  
  // Ask for confirmation (in a real scenario, you might want to add readline for user input)
  console.log('\n⚠️  This will update products that don\'t have slugs.');
  console.log('To regenerate ALL slugs, modify the script to remove the slug check.\n');
  
  // Update slugs
  await updateProductSlugs();
  
  // Show final status
  await showSlugStatus();
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { generateSlug, ensureUniqueSlug, updateProductSlugs };