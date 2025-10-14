# 🛍️ Caarl - South African Women's Fashion E-commerce

A modern, full-featured e-commerce platform built with Next.js 15, Supabase, Paystack, and Cloudinary. Designed specifically for South African women's fashion retail with a focus on elegant design and seamless shopping experience.

![Caarl E-commerce](https://via.placeholder.com/1200x400/FADADD/000000?text=Caarl+Fashion+Store)

## ✨ Features

### Customer Features
- 🛍️ **Product Catalog** - Browse clothing, sneakers, and perfumes with beautiful product cards
- 🔍 **Smart Search** - Real-time search with autocomplete suggestions
- 🎯 **Advanced Filtering** - Filter by category, subcategory, price range, and sort options
- ⭐ **Reviews & Ratings** - Customer reviews with verified purchase badges
- ❤️ **Wishlist** - Save favorite products for later
- 🛒 **Shopping Cart** - Add products with size and color selection
- 💳 **Secure Checkout** - Paystack payment integration with ZAR support
- 🎟️ **Discount Codes** - Apply promotional codes at checkout
- 📦 **Order Tracking** - View order history and status updates
- 👤 **User Accounts** - Profile management and order history
- 📍 **Multiple Addresses** - Save and manage delivery addresses
- 🚚 **Delivery Options** - Choose between Courier Guy and Pudo delivery

### Admin Features
- 📊 **Analytics Dashboard** - Revenue charts, sales trends, and key metrics
- 📦 **Product Management** - Full CRUD operations for products
- 🛍️ **Order Management** - View, update status, and manage orders
- ⭐ **Review Moderation** - View and delete inappropriate reviews
- 👥 **User Management** - View customer accounts and order statistics
- 🎟️ **Discount Management** - Create and manage promotional codes
- 📧 **Email Notifications** - Automated order confirmations via Resend
- 💬 **WhatsApp Integration** - Quick customer messaging with pre-formatted templates

### Security Features
- 🔒 **Row Level Security** - Database-level security with Supabase RLS
- 🔐 **Authentication** - Secure email/password authentication
- 👮 **Admin Protection** - Middleware-protected admin routes
- 🛡️ **Data Privacy** - Users can only access their own data

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **npm** or **pnpm** (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))

You'll also need accounts for:
- **Supabase** ([Sign up](https://supabase.com/)) - Database and authentication
- **Paystack** ([Sign up](https://paystack.com/)) - Payment processing
- **Resend** ([Sign up](https://resend.com/)) - Email notifications
- **Cloudinary** ([Sign up](https://cloudinary.com/)) - Image hosting and management

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/yourusername/caarl-ecommerce.git
   cd caarl-ecommerce
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   # or
   pnpm install
   \`\`\`

3. **Set up environment variables**
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`
   
   Then edit `.env.local` and fill in your credentials (see [Environment Variables](#environment-variables) section below)

4. **Set up Supabase database**
   
   Run the SQL scripts in order to set up your database:
   
   a. Go to your Supabase project dashboard
   b. Navigate to the SQL Editor
   c. Run each script in the `/scripts` folder in order:
   
   \`\`\`sql
   -- 1. Run scripts/001_setup_profiles_trigger.sql
   -- 2. Run scripts/002_setup_rls_policies.sql
   -- 3. Run scripts/003_create_reviews_table.sql
   -- 4. Run scripts/004_create_discount_codes_table.sql
   -- 5. Run scripts/005_create_wishlist_table.sql
   \`\`\`

5. **Run the development server**
   \`\`\`bash
   npm run dev
   # or
   pnpm dev
   \`\`\`

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Environment Variables

Create a `.env.local` file in the root directory with the following variables:

### Supabase Configuration

Get these from your Supabase project settings:
- Dashboard → Project Settings → API

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
\`\`\`

### Paystack Configuration

Get these from your Paystack dashboard:
- Dashboard → Settings → API Keys & Webhooks

\`\`\`env
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_public_key
PAYSTACK_SECRET_KEY=sk_test_your_secret_key
\`\`\`

**Note:** Use test keys (pk_test_/sk_test_) for development and live keys (pk_live_/sk_live_) for production.

### Cloudinary Configuration

Get these from your Cloudinary dashboard:
- Dashboard → Settings → Upload

\`\`\`env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
\`\`\`

**Note:** The upload preset must be set to "Unsigned" for client-side uploads. See [CLOUDINARY_SETUP.md](./CLOUDINARY_SETUP.md) for detailed setup instructions.

### Application Configuration

\`\`\`env
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

Change this to your production domain when deploying.

### Email Configuration (Resend)

Get your API key from Resend:
- Dashboard → API Keys

\`\`\`env
RESEND_API_KEY=re_your_resend_api_key
\`\`\`

## 📊 Database Schema

The application uses the following Supabase tables:

| Table | Description |
|-------|-------------|
| `profiles` | User profiles with admin flags |
| `products` | Product catalog with images, pricing, and inventory |
| `cart_items` | Shopping cart items linked to users |
| `orders` | Order records with status and totals |
| `order_items` | Individual items within orders |
| `addresses` | User delivery addresses |
| `reviews` | Product reviews and ratings |
| `discount_codes` | Promotional discount codes |
| `discount_usage` | Tracking of discount code usage |
| `wishlist` | User saved products |

All tables have Row Level Security (RLS) enabled for data protection.

## 👨‍💼 Admin Setup

To access the admin dashboard:

1. **Create an account** on the website
2. **Update the database** to grant admin access:
   - Go to Supabase Dashboard → Table Editor → profiles
   - Find your user record
   - Set `is_admin = true`
3. **Access admin dashboard** at `/admin`

Admin routes are protected by middleware that checks the `is_admin` flag.

## 🎨 Project Structure

\`\`\`
caarl-ecommerce/
├── app/                          # Next.js app directory
│   ├── account/                  # User account pages
│   ├── admin/                    # Admin dashboard pages
│   ├── auth/                     # Authentication pages
│   ├── cart/                     # Shopping cart
│   ├── checkout/                 # Checkout flow
│   ├── products/                 # Product pages
│   ├── wishlist/                 # Wishlist page
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Homepage
│   └── globals.css               # Global styles
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   ├── header.tsx                # Site header
│   ├── footer.tsx                # Site footer
│   ├── product-card.tsx          # Product display card
│   └── ...                       # Other components
├── lib/                          # Utility functions
│   ├── supabase/                 # Supabase clients
│   ├── email.ts                  # Email utilities
│   └── whatsapp.ts               # WhatsApp utilities
├── scripts/                      # Database SQL scripts
│   ├── 001_setup_profiles_trigger.sql
│   ├── 002_setup_rls_policies.sql
│   ├── 003_create_reviews_table.sql
│   ├── 004_create_discount_codes_table.sql
│   └── 005_create_wishlist_table.sql
├── .env.example                  # Environment variables template
├── .env.local                    # Your local environment variables (gitignored)
├── next.config.mjs               # Next.js configuration
├── package.json                  # Dependencies
└── README.md                     # This file
\`\`\`

## 💳 Payment Flow

The application uses Paystack for payment processing:

1. **Cart → Checkout** - User proceeds to checkout with items in cart
2. **Order Creation** - Order is created with "pending" status
3. **Payment Initialization** - Paystack payment is initialized via API
4. **Paystack Redirect** - User is redirected to Paystack payment page
5. **Payment Processing** - User completes payment on Paystack
6. **Verification** - Payment is verified via Paystack API
7. **Order Update** - Order status is updated to "confirmed"
8. **Email Notification** - Confirmation email is sent to customer
9. **Cart Cleared** - Shopping cart is emptied
10. **Success Page** - User sees order confirmation

## 📧 Email Notifications

The app sends automated emails using Resend:

- **Order Confirmation** - Sent when order is placed
- **Order Status Updates** - Sent when admin updates order status
- **Welcome Email** - Sent on account creation (optional)

Email templates are HTML-formatted with Caarl branding.

## 💬 WhatsApp Integration

Instead of using an expensive WhatsApp API, the app provides a manual messaging system:

1. **Admin Order View** - Click "Message Customer" button
2. **WhatsApp Web** - Opens WhatsApp Web with pre-formatted message
3. **Copy Message** - Or copy the message to send manually

Messages include order details and customer information.

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
   \`\`\`bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   \`\`\`

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

3. **Configure Environment Variables**
   - Add all variables from `.env.local`
   - Update `NEXT_PUBLIC_APP_URL` to your production domain

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete

5. **Update Supabase Redirect URLs**
   - Go to Supabase Dashboard → Authentication → URL Configuration
   - Add your production URL to allowed redirect URLs

### Deploy to Other Platforms

The app can be deployed to any platform that supports Next.js:
- **Netlify** - Use the Next.js plugin
- **Railway** - Direct deployment from GitHub
- **DigitalOcean App Platform** - Docker or buildpack deployment

## 🧪 Testing

### Test Accounts

Create test accounts for different user types:
- **Customer Account** - Regular user for testing shopping flow
- **Admin Account** - User with `is_admin = true` for testing admin features

### Test Payments

Use Paystack test cards:
- **Success:** 4084084084084081
- **Declined:** 4084080000000408
- **Insufficient Funds:** 4084080000001234

See [Paystack Test Payments](https://paystack.com/docs/payments/test-payments) for more.

## 🛠️ Development

### Adding New Products

1. **Via Admin Dashboard** 
   - Go to `/admin/products` and click "Add Product"
   - Use the Cloudinary upload widget to upload product images
   - The first image uploaded will be the main product image
   - Fill in product details and save

2. **Via Database** - Insert directly into `products` table in Supabase

### Creating Discount Codes

1. Go to `/admin/discounts`
2. Click "Add Discount Code"
3. Set code, type (percentage/fixed), value, and expiration

### Managing Orders

1. Go to `/admin/orders`
2. Click on an order to view details
3. Update status or send WhatsApp message to customer

### Image Upload with Cloudinary

The admin dashboard uses Cloudinary's upload widget for easy image management:

- **Multiple uploads** - Upload up to 10 images per product
- **Drag & drop** - Drag images directly into the widget
- **Cropping** - Crop images to perfect square aspect ratio
- **Automatic optimization** - Images are automatically optimized for web
- **CDN delivery** - Fast global delivery via Cloudinary's CDN

See [CLOUDINARY_SETUP.md](./CLOUDINARY_SETUP.md) for setup instructions.

## 📝 Common Issues

### "The request was denied" Error

This is usually a clipboard API security error. Make sure:
- You're running on `localhost` or HTTPS
- Browser has clipboard permissions

### Database Connection Issues

Check that:
- Supabase credentials are correct in `.env.local`
- All SQL scripts have been run
- RLS policies are enabled

### Payment Verification Fails

Ensure:
- Paystack secret key is correct
- Webhook URL is configured (for production)
- Order exists in database before payment

### Email Not Sending

Verify:
- Resend API key is valid
- Sender email is verified in Resend dashboard
- Email templates are properly formatted

### Image Upload Issues

Check that:
- Cloudinary credentials are correct in `.env.local`
- Upload preset is set to "Unsigned"
- Widget is properly initialized in the admin dashboard

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Next.js** - React framework
- **Supabase** - Backend and database
- **Paystack** - Payment processing
- **shadcn/ui** - UI components
- **Tailwind CSS** - Styling
- **Resend** - Email delivery
- **Cloudinary** - Image hosting and management

## 📞 Support

For questions or support:
- **Email:** support@caarl.co.za
- **GitHub Issues:** [Create an issue](https://github.com/yourusername/caarl-ecommerce/issues)

---

Built with ❤️ for South African fashion retail
