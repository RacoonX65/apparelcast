# 🚀 Apparel Cast Local Setup Guide

This guide will walk you through setting up the Apparel Cast e-commerce platform on your local machine step by step.

## Prerequisites Checklist

Before starting, make sure you have:

- [ ] Node.js 18.x or higher installed
- [ ] npm or pnpm installed
- [ ] Git installed
- [ ] A code editor (VS Code recommended)
- [ ] A Supabase account
- [ ] A Paystack account
- [ ] A Resend account

## Step 1: Clone the Repository

\`\`\`bash
git clone https://github.com/yourusername/apparelcast-ecommerce.git
cd apparelcast-ecommerce
\`\`\`

## Step 2: Install Dependencies

\`\`\`bash
npm install
\`\`\`

This will install all required packages including Next.js, React, Supabase client, and UI components.

## Step 3: Set Up Supabase

### 3.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in:
   - Project name: `apparelcast-ecommerce`
   - Database password: (save this securely)
   - Region: Choose closest to South Africa
4. Click "Create new project"
5. Wait for project to be ready (2-3 minutes)

### 3.2 Get Supabase Credentials

1. Go to Project Settings → API
2. Copy the following:
   - Project URL (looks like: `https://xxxxx.supabase.co`)
   - `anon` public key
   - `service_role` secret key

### 3.3 Run Database Scripts

1. Go to SQL Editor in Supabase dashboard
2. Create a new query
3. Copy and paste the content of each script file in order:

**Script 1: `scripts/000_create_base_tables.sql`**
- Creates all base tables (profiles, products, orders, cart_items, addresses, order_items)
- **MUST RUN FIRST** - All other scripts depend on these tables
- Click "Run"

**Script 2: `scripts/001_setup_profiles_trigger.sql`**
- Sets up automatic profile creation on signup
- Click "Run"

**Script 3: `scripts/002_setup_rls_policies.sql`**
- Sets up Row Level Security for all tables
- Click "Run"

**Script 4: `scripts/003_create_reviews_table.sql`**
- Creates reviews table with RLS
- Click "Run"

**Script 5: `scripts/004_create_discount_codes_table.sql`**
- Creates discount codes tables with RLS
- Click "Run"

**Script 6: `scripts/005_create_wishlist_table.sql`**
- Creates wishlist table with RLS
- Click "Run"

### 3.4 Verify Tables

Go to Table Editor and verify these tables exist:
- profiles
- products
- cart_items
- orders
- order_items
- addresses
- reviews
- discount_codes
- discount_usage
- wishlist

## Step 4: Set Up Paystack

### 4.1 Create Paystack Account

1. Go to [paystack.com](https://paystack.com)
2. Sign up for an account
3. Complete verification (required for live payments)

### 4.2 Get Test API Keys

1. Go to Settings → API Keys & Webhooks
2. Copy:
   - Test Public Key (starts with `pk_test_`)
   - Test Secret Key (starts with `sk_test_`)

**Note:** Use test keys for development. Switch to live keys only when ready for production.

## Step 5: Set Up Resend

### 5.1 Create Resend Account

1. Go to [resend.com](https://resend.com)
2. Sign up for an account
3. Verify your email

### 5.2 Get API Key

1. Go to API Keys
2. Click "Create API Key"
3. Name it "Apparel Cast Development"
4. Copy the API key (starts with `re_`)

### 5.3 Verify Sender Email

1. Go to Domains
2. Add your domain or use Resend's test domain
3. For testing, you can use `onboarding@resend.dev`

## Step 6: Configure Environment Variables

### 6.1 Create .env.local File

\`\`\`bash
cp .env.example .env.local
\`\`\`

### 6.2 Fill in Variables

Open `.env.local` and add your credentials:

\`\`\`env
# Supabase (from Step 3.2)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000

# Paystack (from Step 4.2)
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_key_here
PAYSTACK_SECRET_KEY=sk_test_your_key_here

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Resend (from Step 5.2)
RESEND_API_KEY=re_your_key_here
\`\`\`

## Step 7: Run the Development Server

\`\`\`bash
npm run dev
\`\`\`

You should see:
\`\`\`
▲ Next.js 15.x.x
- Local:        http://localhost:3000
- Ready in X.Xs
\`\`\`

## Step 8: Create Your First Admin Account

### 8.1 Sign Up

1. Open [http://localhost:3000](http://localhost:3000)
2. Click "Sign In" → "Sign Up"
3. Enter your email and password
4. Check your email for confirmation link
5. Click the confirmation link

### 8.2 Make Yourself Admin

1. Go to Supabase Dashboard → Table Editor → profiles
2. Find your user record (by email)
3. Click to edit
4. Set `is_admin` to `true`
5. Save

### 8.3 Access Admin Dashboard

1. Go to [http://localhost:3000/admin](http://localhost:3000/admin)
2. You should see the admin dashboard

## Step 9: Add Test Products

### 9.1 Via Admin Dashboard

1. Go to `/admin/products`
2. Click "Add Product"
3. Fill in:
   - Name: "Classic White T-Shirt"
   - Description: "Comfortable cotton t-shirt"
   - Price: 299.00
   - Category: Clothing
   - Subcategory: Tops
   - Stock: 50
   - Sizes: S, M, L, XL
   - Colors: White, Black
   - Image URL: Use a placeholder or real image URL
4. Click "Add Product"

### 9.2 Via SQL (Bulk Import)

Run this in Supabase SQL Editor:

\`\`\`sql
INSERT INTO products (name, description, price, category, subcategory, stock, sizes, colors, images)
VALUES 
  ('Classic White T-Shirt', 'Comfortable cotton t-shirt', 299.00, 'Clothing', 'Tops', 50, 
   ARRAY['S', 'M', 'L', 'XL'], ARRAY['White', 'Black'], 
   ARRAY['https://via.placeholder.com/400x500/FFFFFF/000000?text=White+T-Shirt']),
  ('Blue Denim Jeans', 'Stylish slim-fit jeans', 799.00, 'Clothing', 'Bottoms', 30,
   ARRAY['28', '30', '32', '34'], ARRAY['Blue', 'Black'],
   ARRAY['https://via.placeholder.com/400x500/4169E1/FFFFFF?text=Denim+Jeans']),
  ('Running Sneakers', 'Comfortable athletic shoes', 1299.00, 'Sneakers', 'Athletic', 25,
   ARRAY['6', '7', '8', '9', '10'], ARRAY['White', 'Black', 'Pink'],
   ARRAY['https://via.placeholder.com/400x500/FFFFFF/000000?text=Sneakers']);
\`\`\`

## Step 10: Test the Application

### 10.1 Customer Flow

1. Browse products on homepage
2. Click on a product to view details
3. Add to cart with size and color
4. Go to cart
5. Proceed to checkout
6. Add delivery address
7. Use test discount code (create one in admin first)
8. Complete payment with Paystack test card: `4084084084084081`
9. View order confirmation

### 10.2 Admin Flow

1. Go to `/admin`
2. View analytics dashboard
3. Manage products (add, edit, delete)
4. View orders
5. Update order status
6. Create discount codes
7. View reviews
8. View users

## Step 11: Create Test Discount Code

1. Go to `/admin/discounts`
2. Click "Add Discount Code"
3. Fill in:
   - Code: `WELCOME10`
   - Type: Percentage
   - Value: 10
   - Max Uses: 100
   - Expires: (set to future date)
4. Click "Add Discount Code"
5. Test it at checkout

## Troubleshooting

### Port 3000 Already in Use

\`\`\`bash
# Kill the process using port 3000
npx kill-port 3000

# Or use a different port
npm run dev -- -p 3001
\`\`\`

### Database Connection Error

- Check Supabase credentials in `.env.local`
- Verify project is active in Supabase dashboard
- Check internet connection

### Payment Fails

- Verify Paystack test keys are correct
- Use test card: `4084084084084081`
- Check browser console for errors

### Email Not Sending

- Verify Resend API key
- Check sender email is verified
- Look for errors in terminal

### Can't Access Admin Dashboard

- Verify `is_admin = true` in profiles table
- Clear browser cache and cookies
- Check middleware.ts is not blocking the route

## Next Steps

Now that you have Apparel Cast running locally:

1. **Customize Design** - Update colors in `app/globals.css`
2. **Add More Products** - Build your product catalog
3. **Test All Features** - Go through complete user journey
4. **Configure Email Templates** - Customize email designs
5. **Set Up Analytics** - Add Google Analytics or similar
6. **Prepare for Deployment** - Review deployment checklist

## Getting Help

If you encounter issues:

1. Check the main README.md
2. Review error messages in terminal
3. Check browser console for client-side errors
4. Verify all environment variables are set
5. Ensure all SQL scripts ran successfully

---

Happy coding! 🚀
