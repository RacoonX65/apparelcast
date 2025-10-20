# 🚀 ApparelCast Production Deployment Checklist

## Pre-Deployment Setup

### 1. Yoco Live Keys Setup
```bash
# You need to get these from your Yoco Dashboard → Settings → API Keys
# Replace these in your Vercel environment variables:

YOCO_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY
YOCO_PUBLIC_KEY=pk_live_YOUR_LIVE_PUBLIC_KEY
```

### 2. Production Webhook Registration
```bash
# Run this script with your LIVE Yoco secret key:
node register-production-webhook.js

# This will register the webhook for:
# https://www.apparelcast.shop/api/yoco/webhook
```

### 3. Vercel Environment Variables Update
Update these in your Vercel dashboard → Settings → Environment Variables:

```env
# Critical Payment Configuration
YOCO_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY
YOCO_PUBLIC_KEY=pk_live_YOUR_LIVE_PUBLIC_KEY
YOCO_WEBHOOK_SECRET=[GET_THIS_FROM_WEBHOOK_REGISTRATION]

# Production Domain Configuration
NEXT_PUBLIC_APP_URL=https://www.apparelcast.shop
YOCO_CALLBACK_URL=https://www.apparelcast.shop

# Ensure these are set correctly
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
```

## Deployment Steps

### 1. Test Locally First
```bash
# Set your environment to production mode
NODE_ENV=production npm run build
npm run start
```

### 2. Deploy to Vercel
```bash
# Push to your main branch or use Vercel CLI
vercel --prod
```

### 3. Post-Deployment Verification

#### Test Payment Flow
1. Go to your live site: https://www.apparelcast.shop
2. Add a product to cart
3. Proceed to checkout
4. Use Yoco test card: `4242424242424242`
5. Complete payment
6. Check if order status updates automatically

#### Verify Webhook Reception
Check your Vercel logs for webhook reception:
```
Vercel Dashboard → Your Project → Logs
Look for: "Webhook received" or "payment.succeeded"
```

#### Test Email Notifications
Ensure order confirmation emails are sent after successful payment.

## Production Monitoring

### 1. Set Up Monitoring
- Vercel Analytics
- Payment failure alerts
- Webhook delivery monitoring

### 2. Regular Checks
- Test payment flow weekly
- Monitor webhook delivery rates
- Check for failed payments
- Verify email delivery

## Rollback Plan

If something goes wrong:
1. Revert to test keys in Vercel
2. Update webhook URL to test endpoint
3. Redeploy
4. Debug issues in test environment

## Support Contacts

- **Yoco Support:** For payment gateway issues
- **Vercel Support:** For deployment issues
- **Supabase Support:** For database issues

## Important Notes

⚠️ **CRITICAL:**
- Never commit live secret keys to git
- Always use environment variables for secrets
- Test thoroughly before going live
- Monitor your first few real transactions closely
- Keep webhook secret safe and secure

✅ **Success Indicators:**
- Payment completes successfully
- Order status updates to "paid"
- Customer receives confirmation email
- Webhook logs show 200 status
- No errors in Vercel logs

## Emergency Contacts

Keep these handy during deployment:
- Your Yoco account manager
- Vercel support team
- Domain registrar support
- Email service support (Resend)

---

**Good luck with your production deployment! 🎉**