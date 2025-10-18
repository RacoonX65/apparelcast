#!/usr/bin/env node

/**
 * Script to register a webhook with Yoco
 * This will register your webhook endpoint to receive payment event notifications
 */

const https = require('https');
require('dotenv').config({ path: '.env.local' });

const YOCO_SECRET_KEY = process.env.YOCO_SECRET_KEY;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

if (!YOCO_SECRET_KEY) {
  console.error('❌ Error: YOCO_SECRET_KEY not found in environment variables');
  console.log('Please make sure your .env.local file contains the YOCO_SECRET_KEY');
  process.exit(1);
}

// Webhook registration payload
const webhookData = {
  name: 'ApparelCast Payment Webhook',
  url: `${APP_URL}/api/yoco/webhook`
};

console.log('🚀 Registering Yoco webhook...');
console.log(`📍 Webhook URL: ${webhookData.url}`);
console.log(`📝 Webhook Name: ${webhookData.name}`);

const postData = JSON.stringify(webhookData);

const options = {
  hostname: 'payments.yoco.com',
  port: 443,
  path: '/api/webhooks',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
    'Authorization': `Bearer ${YOCO_SECRET_KEY}`
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
        console.log('✅ Webhook registered successfully!');
        console.log('\n📋 Webhook Details:');
        console.log(`   ID: ${response.id}`);
        console.log(`   Name: ${response.name}`);
        console.log(`   URL: ${response.url}`);
        console.log(`   Mode: ${response.mode}`);
        console.log(`   Secret: ${response.secret}`);
        
        console.log('\n🔐 IMPORTANT: Save this webhook secret!');
        console.log(`Add this to your .env.local file:`);
        console.log(`YOCO_WEBHOOK_SECRET=${response.secret}`);
        
        console.log('\n✨ Next steps:');
        console.log('1. Update your .env.local with the webhook secret above');
        console.log('2. Restart your development server');
        console.log('3. Test a payment to verify webhook events are received');
        
      } else {
        console.log('❌ Failed to register webhook');
        console.log('Response:', response);
      }
    } catch (error) {
      console.log('❌ Error parsing response:', error.message);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request error:', error.message);
});

req.write(postData);
req.end();