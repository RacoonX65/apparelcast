// Simple test to verify webhook endpoint is accessible
const https = require('https');

// Test the webhook endpoint directly
const options = {
  hostname: '553a30824bb5.ngrok-free.app',
  port: 443,
  path: '/api/yoco/webhook',
  method: 'GET',
  headers: {
    'User-Agent': 'Webhook-Test/1.0'
  }
};

console.log('Testing webhook endpoint accessibility...');
console.log('URL: https://553a30824bb5.ngrok-free.app/api/yoco/webhook');

const req = https.request(options, (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Status Message:', res.statusMessage);
  console.log('Headers:', res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response body:', data);
    
    if (res.statusCode === 200) {
      console.log('✅ Webhook endpoint is accessible!');
    } else if (res.statusCode === 405) {
      console.log('✅ Webhook endpoint is accessible (405 Method Not Allowed is expected for GET)');
    } else {
      console.log('⚠️  Webhook endpoint returned unexpected status');
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Webhook endpoint test failed:', error.message);
  if (error.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE') {
    console.log('💡 This is an SSL certificate issue with ngrok.');
    console.log('💡 The webhook might still work - try testing with a proper POST request.');
  }
});

req.end();