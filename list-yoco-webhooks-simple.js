// Simple script to list Yoco webhooks using built-in modules
const https = require('https');

function makeRequest(url, options) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(10000, () => reject(new Error('Request timeout')));
    req.end();
  });
}

async function listWebhooks() {
  try {
    const secretKey = process.env.YOCO_SECRET_KEY;
    
    if (!secretKey) {
      console.log('❌ YOCO_SECRET_KEY not found in environment');
      return;
    }

    console.log('🔍 Fetching webhooks from Yoco...');
    
    // Try the most common Yoco webhook endpoint
    const url = 'https://api.yoco.com/v1/webhook_subscriptions';
    
    console.log(`Trying endpoint: ${url}`);
    
    const response = await makeRequest(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'ApparelCast/1.0'
      }
    });

    console.log(`Response status: ${response.status}`);
    
    if (response.status === 200 && response.data) {
      console.log('✅ Webhooks found:');
      console.log(JSON.stringify(response.data, null, 2));
      
      if (response.data.data && response.data.data.length > 0) {
        console.log(`\n📋 Summary: ${response.data.data.length} webhook(s) found`);
        response.data.data.forEach((webhook, index) => {
          console.log(`${index + 1}. ID: ${webhook.id || webhook.uuid}`);
          console.log(`   URL: ${webhook.url}`);
          console.log(`   Events: ${JSON.stringify(webhook.events || webhook.event_types)}`);
          console.log(`   Status: ${webhook.status || webhook.state}`);
          console.log('');
        });
      }
    } else {
      console.log('❌ No webhooks found or error occurred');
      console.log('Response:', response.data);
    }
    
  } catch (error) {
    console.error('❌ Error listing webhooks:', error.message);
  }
}

listWebhooks();