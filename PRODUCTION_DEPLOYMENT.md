# 🚀 Production Deployment Guide - Yoco Integration

This guide will help you deploy your ApparelCast dropshipping platform to production with Yoco payment integration.

## 📋 Pre-Deployment Checklist

### 1. Get Your Live Yoco Keys
- [ ] Log into your [Yoco Dashboard](https://portal.yoco.com/)
- [ ] Navigate to **Settings** → **API Keys**
- [ ] Copy your **Live Secret Key** (starts with `sk_live_`)
- [ ] Copy your **Live Public Key** (starts with `pk_live_`)

### 2. Prepare Your Domain
- [ ] Ensure your custom domain is connected to Vercel
- [ ] Verify SSL certificate is active
- [ ] Test that your domain resolves correctly

## 🔧 Vercel Environment Variables Setup

### Step 1: Access Vercel Dashboard
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **apparelcast** project
3. Navigate to **Settings** → **Environment Variables**

### Step 2: Add Yoco Production Variables

Add these environment variables in Vercel:

#### **Required Yoco Variables:**
```bash
# Yoco Live Keys (CRITICAL - Keep these secure!)
YOCO_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY_HERE
YOCO_PUBLIC_KEY=pk_live_YOUR_LIVE_PUBLIC_KEY_HERE

# Webhook Secret (Will be generated after webhook registration)
YOCO_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
```

#### **Production Domain:**
```bash
# Your production domain
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

#### **Other Required Variables:**
Make sure these are also set in Vercel:
```bash
# Supabase (Production)
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key

# Email Service
RESEND_API_KEY=your_resend_api_key

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Google Places (if using)
GOOGLE_PLACES_API_KEY=your_google_places_key

# Contact Information
NEXT_PUBLIC_CONTACT_EMAIL=your_contact_email
NEXT_PUBLIC_CONTACT_PHONE=your_contact_phone
NEXT_PUBLIC_WHATSAPP_NUMBER=your_whatsapp_number
```

### Step 3: Environment Variable Settings
- **Environment**: Select **Production** for all variables
- **Git Branch**: Leave blank (applies to all branches)
- **Sensitive**: Mark as sensitive for API keys and secrets

## 🔗 Webhook Registration for Production

### Step 1: Deploy to Production First
1. Deploy your app to Vercel with the environment variables
2. Ensure your production domain is working: `https://your-domain.com`

### Step 2: Register Production Webhook

Create a script to register your production webhook:

```javascript
// scripts/register-production-webhook.js
const https = require('https');

const YOCO_SECRET_KEY = 'sk_live_YOUR_LIVE_SECRET_KEY'; // Your live key
const PRODUCTION_DOMAIN = 'https://your-domain.com'; // Your domain

const webhookData = {
  name: 'ApparelCast Production Webhook',
  url: `${PRODUCTION_DOMAIN}/api/yoco/webhook`
};

// ... (rest of webhook registration code)
```

### Step 3: Update Webhook Secret
After registering the production webhook:
1. Copy the returned webhook secret
2. Add it to Vercel environment variables as `YOCO_WEBHOOK_SECRET`
3. Redeploy your application

## 🛡️ Security Checklist

### Environment Variables Security
- [ ] Never commit live keys to Git
- [ ] Use Vercel's environment variables (not .env files in production)
- [ ] Mark sensitive variables as "Sensitive" in Vercel
- [ ] Regularly rotate API keys

### Webhook Security
- [ ] Webhook URL uses HTTPS
- [ ] Webhook signature verification is enabled
- [ ] Webhook secret is securely stored

## 📊 Testing Production Setup

### 1. Test Payment Flow
1. Visit your production site
2. Add items to cart
3. Proceed to checkout
4. Use a **real card** (small amount like R1.00)
5. Verify payment completes successfully
6. Check order appears in admin panel
7. Verify confirmation email is sent

### 2. Test Webhook Events
1. Make a test payment
2. Check Vercel function logs for webhook processing
3. Verify order status updates correctly
4. Confirm email notifications work

### 3. Monitor Logs
- Check Vercel function logs for errors
- Monitor Yoco dashboard for payment activity
- Watch for failed webhook deliveries

## 🚨 Common Issues & Solutions

### Issue: Webhook Not Receiving Events
**Solution:**
- Verify webhook URL is correct: `https://your-domain.com/api/yoco/webhook`
- Check Vercel function logs for errors
- Ensure webhook secret matches Vercel environment variable

### Issue: Payment Initialization Fails
**Solution:**
- Verify live secret key is correct
- Check amount is in cents (multiply by 100)
- Ensure all required fields are provided

### Issue: Environment Variables Not Loading
**Solution:**
- Redeploy after adding environment variables
- Check variable names match exactly
- Ensure variables are set for "Production" environment

## 📈 Post-Deployment Monitoring

### Daily Checks
- [ ] Monitor payment success rates
- [ ] Check for failed webhook deliveries
- [ ] Review error logs in Vercel
- [ ] Verify email notifications are working

### Weekly Reviews
- [ ] Analyze payment conversion rates
- [ ] Review customer feedback
- [ ] Check for security alerts
- [ ] Update dependencies if needed

## 🎯 Go-Live Checklist

Before announcing your store is live:

- [ ] All environment variables configured in Vercel
- [ ] Production webhook registered and working
- [ ] Test payments completed successfully
- [ ] Email notifications working
- [ ] SSL certificate active
- [ ] Domain resolving correctly
- [ ] Admin panel accessible
- [ ] Customer support ready
- [ ] Backup and monitoring in place

## 📞 Support Resources

- **Yoco Support**: [support@yoco.com](mailto:support@yoco.com)
- **Yoco Documentation**: [developer.yoco.com](https://developer.yoco.com)
- **Vercel Support**: [vercel.com/support](https://vercel.com/support)

---

🎉 **Congratulations!** Your ApparelCast dropshipping platform is now ready for production with Yoco payments!