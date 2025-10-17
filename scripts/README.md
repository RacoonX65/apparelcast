# Product Slug Update Scripts

This directory contains scripts to update existing products with SEO-friendly slugs based on their product names.

## Available Scripts

### 1. SQL Script (`update-product-slugs.sql`)

**Direct database approach using SQL**

```bash
# Run via Supabase CLI
npx supabase db reset  # Optional: reset database first
# Then run the SQL script in your Supabase dashboard or via psql
```

**Features:**
- Creates/updates the slug generation functions
- Updates all products with slugs based on their names
- Ensures slug uniqueness
- Shows results and statistics
- Can be run directly in Supabase dashboard

### 2. Node.js Script (`update-product-slugs.js`)

**Programmatic approach using JavaScript**

```bash
# Install dependencies (if not already installed)
npm install @supabase/supabase-js dotenv

# Run the script
node scripts/update-product-slugs.js
```

**Features:**
- Connects to your Supabase database
- Shows current slug status
- Updates products without slugs
- Provides detailed progress logging
- Error handling and statistics
- Can be easily modified for custom logic

## Environment Setup

Make sure you have these environment variables in your `.env` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## How Slugs Are Generated

Both scripts use the same slug generation logic:

1. **Input:** Product name (e.g., "Nike Air Max 270 (Black/White)")
2. **Process:**
   - Convert to lowercase
   - Remove special characters (keep only letters, numbers, spaces, hyphens)
   - Replace spaces with hyphens
   - Remove multiple consecutive hyphens
   - Remove leading/trailing hyphens
3. **Output:** Clean slug (e.g., "nike-air-max-270-black-white")
4. **Uniqueness:** If slug exists, append number (e.g., "nike-air-max-270-black-white-2")

## Examples

**Before:**
```
Product: "Women's Summer Dress - Floral Print (Size M)"
URL: https://yoursite.com/products/123e4567-e89b-12d3-a456-426614174000
```

**After:**
```
Product: "Women's Summer Dress - Floral Print (Size M)"
Slug: "womens-summer-dress-floral-print-size-m"
URL: https://yoursite.com/products/womens-summer-dress-floral-print-size-m
```

## Usage Recommendations

1. **For one-time updates:** Use the SQL script for simplicity
2. **For ongoing maintenance:** Use the Node.js script for better control
3. **For production:** Test on a staging database first
4. **For large datasets:** The Node.js script provides better progress tracking

## Safety Notes

- Both scripts check for existing slugs to avoid duplicates
- The Node.js script by default only updates products without slugs
- To regenerate ALL slugs, modify the scripts to remove the existing slug check
- Always backup your database before running bulk updates
- Test on a staging environment first

## Adding to Package.json

You can add this to your `package.json` scripts section:

```json
{
  "scripts": {
    "update-slugs": "node scripts/update-product-slugs.js"
  }
}
```

Then run with: `npm run update-slugs`