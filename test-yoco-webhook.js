#!/usr/bin/env node

/**
 * Test script for Yoco webhook endpoint
 * This simulates a Yoco webhook event to test the local webhook handler
 */

const crypto = require('crypto');

// Configuration
const WEBHOOK_SECRET = process.env.YOCO_WEBHOOK_SECRET || 'whsec_MkJGODlGNzg5OEFGRkQ3MzgwNDdGNEQ3MTQ2OUI0OEY=';
const WEBHOOK_URL = 'https://9fe39f1adbf5.ngrok-free.app/api/yoco/webhook';

// Test webhook payload
const testPayload = {
  id: 'evt_test_123456789',
  type: 'payment.succeeded',
  created: new Date().toISOString(),
  payload: {
    id: 'pay_test_123456789',
    amount: 5000,
    currency: 'ZAR',
    status: 'successful',
    created: new Date().toISOString(),
    metadata: {
      checkoutId: 'ch_9Ee7qaV8wpntYYvFB8BtrmQx',
      order_id: 'test-order-ngrok',
      order_number: 'TEST-001',
      customer_email: 'test@example.com'
    }
  }
};

// Convert payload to JSON string
const payloadString = JSON.stringify(testPayload);

// Generate webhook signature
const signature = crypto
  .createHmac('sha256', WEBHOOK_SECRET)
  .update(payloadString)
  .digest('hex');

console.log('🧪 Testing Yoco webhook endpoint...');
console.log(`📍 Webhook URL: ${WEBHOOK_URL}`);
console.log(`🔑 Using webhook secret: ${WEBHOOK_SECRET.substring(0, 10)}...`);
console.log(`📋 Test payload: ${payloadString}`);
console.log(`🔏 Generated signature: ${signature}`);

// Send the webhook request
fetch(WEBHOOK_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-yoco-signature': signature,
    'User-Agent': 'Yoco-Webhooks/1.0'
  },
  body: payloadString,
  // Disable SSL verification for local testing with ngrok
  agent: new (require('https').Agent)({ rejectUnauthorized: false })
})
.then(async (response) => {
  const responseText = await response.text();
  console.log(`\n📊 Response Status: ${response.status} ${response.statusText}`);
  console.log(`📄 Response Body: ${responseText}`);
  
  if (response.ok) {
    console.log('✅ Webhook test successful!');
  } else {
    console.log('❌ Webhook test failed!');
  }
})
.catch(error => {
  console.error('❌ Webhook request failed:', error);
});

console.log('\n⏳ Sending webhook request...');