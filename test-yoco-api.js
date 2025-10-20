// Test Yoco API connectivity
const https = require('https');

function makeRequest(url, options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(15000, () => reject(new Error('Request timeout')));
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testYocoAPI() {
  try {
    const secretKey = 'sk_test_4acff3f3Q4Mz7ePb8014d4b80956';
    
    console.log('🧪 Testing Yoco API connectivity...');
    
    // Test 1: Create a simple checkout (this should work with test keys)
    console.log('\n1️⃣ Testing checkout creation...');
    
    const checkoutData = {
      amount: 1000, // R10.00 in cents
      currency: 'ZAR',
      successUrl: 'https://553a30824bb5.ngrok-free.app/checkout/success',
      cancelUrl: 'https://553a30824bb5.ngrok-free.app/cart',
      metadata: {
        test: 'api connectivity check'
      }
    };
    
    const checkoutResponse = await makeRequest('https://api.yoco.com/v1/checkouts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'ApparelCast/1.0'
      }
    }, checkoutData);
    
    console.log(`Checkout Response Status: ${checkoutResponse.status}`);
    
    if (checkoutResponse.status === 201 || checkoutResponse.status === 200) {
      console.log('✅ Checkout creation successful!');
      console.log('Checkout ID:', checkoutResponse.data.id);
      console.log('Processing Mode:', checkoutResponse.data.processingMode);
      console.log('Redirect URL:', checkoutResponse.data.redirectUrl);
    } else {
      console.log('❌ Checkout creation failed:', checkoutResponse.data);
    }
    
    // Test 2: Try to list webhooks (might fail with test keys)
    console.log('\n2️⃣ Testing webhook listing...');
    
    const webhookResponse = await makeRequest('https://api.yoco.com/v1/webhook_subscriptions', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'ApparelCast/1.0'
      }
    });
    
    console.log(`Webhook Response Status: ${webhookResponse.status}`);
    
    if (webhookResponse.status === 200) {
      console.log('✅ Webhook listing successful!');
      console.log('Webhooks:', webhookResponse.data);
    } else {
      console.log('❌ Webhook listing failed:', webhookResponse.data);
      console.log('ℹ️  This is expected with test keys - webhooks may need to be configured manually');
    }
    
    // Test 3: Try alternative webhook endpoint
    console.log('\n3️⃣ Testing alternative webhook endpoint...');
    
    const altWebhookResponse = await makeRequest('https://online.yoco.com/api/v1/webhook_subscriptions', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'ApparelCast/1.0'
      }
    });
    
    console.log(`Alternative Webhook Response Status: ${altWebhookResponse.status}`);
    
    if (altWebhookResponse.status === 200) {
      console.log('✅ Alternative webhook endpoint successful!');
      console.log('Webhooks:', altWebhookResponse.data);
    } else {
      console.log('❌ Alternative webhook endpoint failed:', altWebhookResponse.data);
    }
    
  } catch (error) {
    console.error('❌ Error testing Yoco API:', error.message);
  }
}

testYocoAPI();