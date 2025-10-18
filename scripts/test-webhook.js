#!/usr/bin/env node

/**
 * Script to test the Yoco webhook endpoint
 * This simulates a webhook event to verify the endpoint is working correctly
 */

const https = require('https');
const crypto = require('crypto');
require('dotenv').config({ path: '.env.local' });

const WEBHOOK_SECRET = process.env.YOCO_WEBHOOK_SECRET;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

if (!WEBHOOK_SECRET) {
  console.error('❌ Error: YOCO_WEBHOOK_SECRET not found in environment variables');
  process.exit(1);
}

// Sample webhook payload (payment.succeeded event)
const webhookPayload = {
  id: 'evt_test_123456789',
  type: 'payment.succeeded',
  created: new Date().toISOString(),
  payload: {
    id: 'ch_test_987654321',
    amount: 29900, // R299.00 in cents
    currency: 'ZAR',
    status: 'succeeded',
    metadata: {
      checkoutId: 'test_checkout_123',
      order_id: '550e8400-e29b-41d4-a716-446655440000' // Valid UUID format
    },
    created: new Date().toISOString()
  }
};

const body = JSON.stringify(webhookPayload);

// Generate signature using the webhook secret
const signature = crypto
  .createHmac('sha256', WEBHOOK_SECRET)
  .update(body)
  .digest('hex');

console.log('🧪 Testing Yoco webhook endpoint...');
console.log(`📍 Webhook URL: ${APP_URL}/api/yoco/webhook`);
console.log(`🔐 Generated signature: ${signature}`);

const url = new URL(`${APP_URL}/api/yoco/webhook`);
const options = {
  hostname: url.hostname,
  port: url.port || (url.protocol === 'https:' ? 443 : 80),
  path: url.pathname,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
    'x-yoco-signature': signature
  }
};

const req = (url.protocol === 'https:' ? https : require('http')).request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(`\n📊 Response Status: ${res.statusCode}`);
    
    if (res.statusCode === 200) {
      console.log('✅ Webhook test successful!');
      console.log('📝 Response:', data);
    } else {
      console.log('❌ Webhook test failed');
      console.log('📝 Response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request error:', error.message);
  
  if (error.code === 'ECONNREFUSED') {
    console.log('\n💡 Make sure your development server is running:');
    console.log('   npm run dev');
  }
});

req.write(body);
req.end();