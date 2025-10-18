#!/usr/bin/env node

/**
 * Script to register a production webhook with Yoco
 * Run this AFTER deploying to production with your live domain
 * 
 * Usage:
 * export YOCO_SECRET_KEY=sk_live_your_actual_key_here
 * export PRODUCTION_DOMAIN=https://your-domain.com
 * node scripts/register-production-webhook.js
 * 
 * Or use a .env file with your environment variables
 */

const https = require('https');

// ⚠️  IMPORTANT: Replace these with your actual values
const YOCO_LIVE_SECRET_KEY = process.env.YOCO_SECRET_KEY || ''; // Get from environment variable
const PRODUCTION_DOMAIN = process.env.PRODUCTION_DOMAIN || 'https://apparelcast.shop'; // Your actual domain

// Validate inputs
if (!YOCO_LIVE_SECRET_KEY) {
  console.error('❌ Error: YOCO_SECRET_KEY environment variable is not set');
  console.log('Please set the YOCO_SECRET_KEY environment variable with your Yoco secret key');
  console.log('Example: export YOCO_SECRET_KEY=sk_live_your_actual_key_here');
  process.exit(1);
}

if (!PRODUCTION_DOMAIN || PRODUCTION_DOMAIN === 'https://your-domain.com') {
  console.error('❌ Error: PRODUCTION_DOMAIN environment variable is not set or invalid');
  console.log('Please set the PRODUCTION_DOMAIN environment variable with your actual domain');
  console.log('Example: export PRODUCTION_DOMAIN=https://apparelcast.shop');
  process.exit(1);
}

if (!YOCO_LIVE_SECRET_KEY.startsWith('sk_live_') && !YOCO_LIVE_SECRET_KEY.startsWith('sk_test_')) {
  console.error('❌ Error: Secret key must start with "sk_live_" or "sk_test_"');
  console.log('Make sure you are using a valid Yoco secret key');
  process.exit(1);
}

// Webhook registration payload
const webhookData = {
  name: 'ApparelCast Production Webhook',
  url: `${PRODUCTION_DOMAIN}/api/yoco/webhook`
};

console.log('🚀 Registering Yoco webhook...');
console.log(`📍 Webhook URL: ${webhookData.url}`);
console.log(`📝 Webhook Name: ${webhookData.name}`);
console.log(`🔑 Using: ${YOCO_LIVE_SECRET_KEY.startsWith('sk_test_') ? 'TEST' : 'LIVE'} keys`);
if (YOCO_LIVE_SECRET_KEY.startsWith('sk_test_')) {
  console.log('ℹ️  This is a test webhook - no real payments will be processed');
} else {
  console.log('⚠️  This will use LIVE keys - real payments will be processed!');
}

const postData = JSON.stringify(webhookData);

const options = {
  hostname: 'payments.yoco.com',
  port: 443,
  path: '/api/webhooks',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
    'Authorization': `Bearer ${YOCO_LIVE_SECRET_KEY}`
  }
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(`\n📊 Response Status: ${res.statusCode}`);
    
    try {
      const response = JSON.parse(data);
      
      if (res.statusCode === 201) {
        console.log('✅ Production webhook registered successfully!');
        console.log('\n📋 Webhook Details:');
        console.log(`   ID: ${response.id}`);
        console.log(`   Name: ${response.name}`);
        console.log(`   URL: ${response.url}`);
        console.log(`   Mode: ${response.mode}`);
        console.log(`   Secret: ${response.secret}`);
        
        console.log('\n🔐 CRITICAL: Save this webhook secret immediately!');
        console.log('Add this to your Vercel environment variables:');
        console.log(`YOCO_WEBHOOK_SECRET=${response.secret}`);
        
        console.log('\n📝 Next steps:');
        console.log('1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables');
        console.log('2. Add the YOCO_WEBHOOK_SECRET variable above');
        console.log('3. Set Environment to "Production"');
        console.log('4. Redeploy your application');
        console.log('5. Test a small payment (R1.00) to verify everything works');
        
        console.log('\n🎉 Your production payment system is ready!');
        
      } else {
        console.log('❌ Failed to register production webhook');
        console.log('Response:', response);
        
        if (res.statusCode === 403) {
          console.log('\n💡 Possible issues:');
          console.log('- Check your live secret key is correct');
          console.log('- Ensure your Yoco account is approved for live payments');
          console.log('- Verify you have permission to create webhooks');
        }
      }
    } catch (error) {
      console.log('❌ Error parsing response:', error.message);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request error:', error.message);
  
  if (error.code === 'ENOTFOUND') {
    console.log('\n💡 Check your internet connection and try again');
  }
});

req.write(postData);
req.end();