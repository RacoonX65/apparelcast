// Register Yoco webhook using the correct endpoint
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

async function registerWebhook() {
  try {
    const secretKey = 'sk_test_4acff3f3Q4Mz7ePb8014d4b80956';
    const webhookUrl = 'https://553a30824bb5.ngrok-free.app/api/yoco/webhook';
    
    console.log('🎯 Registering Yoco webhook...');
    console.log('URL:', webhookUrl);
    
    const webhookData = {
      url: webhookUrl,
      events: ['payment.succeeded']
    };
    
    console.log('\n📤 Sending webhook registration request...');
    
    const response = await makeRequest('https://api.yoco.com/api/webhooks', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'ApparelCast/1.0'
      }
    }, webhookData);
    
    console.log(`\n📊 Response Status: ${response.status}`);
    
    if (response.status === 201 || response.status === 200) {
      console.log('✅ Webhook registered successfully!');
      console.log('\n📝 Response Data:');
      console.log(JSON.stringify(response.data, null, 2));
      
      if (response.data.secret) {
        console.log('\n🚨 IMPORTANT: Save this webhook secret!');
        console.log(`Secret: ${response.data.secret}`);
        console.log('This secret will be used to verify webhook signatures.');
        console.log('Update your .env.local file with: YOCO_WEBHOOK_SECRET=' + response.data.secret);
      }
      
      if (response.data.id) {
        console.log(`\n🆔 Webhook ID: ${response.data.id}`);
        console.log('Save this ID if you need to update/delete the webhook later.');
      }
      
    } else if (response.status === 401) {
      console.log('❌ Unauthorized - Check your API key');
      console.log('Response:', response.data);
    } else if (response.status === 400) {
      console.log('❌ Bad Request - Check your data format');
      console.log('Response:', response.data);
    } else {
      console.log('❌ Unexpected response');
      console.log('Response:', response.data);
    }
    
  } catch (error) {
    console.error('❌ Error registering webhook:', error.message);
  }
}

// Also create a function to list existing webhooks
async function listWebhooks() {
  try {
    const secretKey = 'sk_test_4acff3f3Q4Mz7ePb8014d4b80956';
    
    console.log('\n📋 Listing existing webhooks...');
    
    const response = await makeRequest('https://api.yoco.com/api/webhooks', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'ApparelCast/1.0'
      }
    });
    
    console.log(`List Response Status: ${response.status}`);
    
    if (response.status === 200) {
      console.log('✅ Webhooks retrieved successfully!');
      console.log('Webhooks:', JSON.stringify(response.data, null, 2));
    } else {
      console.log('❌ Failed to retrieve webhooks:', response.data);
    }
  } catch (error) {
    console.error('❌ Error listing webhooks:', error.message);
  }
}

// Run both functions
async function main() {
  await listWebhooks();
  console.log('\n' + '='.repeat(50));
  await registerWebhook();
}

main();