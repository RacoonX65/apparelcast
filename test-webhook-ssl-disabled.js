// Test webhook with SSL verification disabled (for testing only)
const https = require('https');

// Test payload from Yoco documentation
const testPayload = {
  "id": "evt_test_123456789",
  "type": "payment.succeeded",
  "created": "2025-10-20T16:11:39.283Z",
  "payload": {
    "id": "pay_test_123456789",
    "amount": 5000,
    "currency": "ZAR",
    "status": "successful",
    "created": "2025-10-20T16:11:39.288Z",
    "metadata": {
      "checkoutId": "ch_9Ee7qaV8wpntYYvFB8BtrmQx",
      "order_id": "test-order-ngrok",
      "order_number": "TEST-001",
      "customer_email": "test@example.com"
    }
  }
};

// Disable SSL verification for testing (don't do this in production!)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const postData = JSON.stringify(testPayload);

const options = {
  hostname: '553a30824bb5.ngrok-free.app',
  port: 443,
  path: '/api/yoco/webhook',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
    'User-Agent': 'Yoco-Webhook-Test/1.0'
  }
};

console.log('🧪 Testing Yoco webhook endpoint with SSL verification disabled...');
console.log('📍 Webhook URL: https://553a30824bb5.ngrok-free.app/api/yoco/webhook');
console.log('📋 Test payload:', JSON.stringify(testPayload, null, 2));

const req = https.request(options, (res) => {
  console.log('📊 Response Status:', res.statusCode);
  console.log('📋 Response Headers:', res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('📄 Response Body:', data);
    
    if (res.statusCode === 200) {
      console.log('✅ Webhook endpoint responded successfully!');
    } else if (res.statusCode === 201) {
      console.log('✅ Webhook endpoint responded with created status!');
    } else {
      console.log(`⚠️  Webhook endpoint returned status: ${res.statusCode}`);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Webhook request failed:', error.message);
});

req.write(postData);
req.end();

// Re-enable SSL verification after test
setTimeout(() => {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
}, 1000);