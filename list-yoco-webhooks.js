// Simple script to list Yoco webhooks
const axios = require('axios');

async function listWebhooks() {
  try {
    const secretKey = process.env.YOCO_SECRET_KEY;
    
    if (!secretKey) {
      console.log('❌ YOCO_SECRET_KEY not found in environment');
      return;
    }

    console.log('🔍 Fetching webhooks from Yoco...');
    
    // Try different possible endpoints
    const endpoints = [
      'https://api.yoco.com/v1/webhook_subscriptions',
      'https://api.yoco.com/v1/webhooks',
      'https://online.yoco.com/api/v1/webhook_subscriptions',
      'https://online.yoco.com/api/v1/webhooks'
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`Trying endpoint: ${endpoint}`);
        
        const response = await axios.get(endpoint, {
          headers: {
            'Authorization': `Bearer ${secretKey}`,
            'Content-Type': 'application/json',
            'User-Agent': 'ApparelCast/1.0'
          },
          timeout: 10000
        });

        if (response.data && response.data.data) {
          console.log(`✅ Found webhooks at ${endpoint}:`);
          console.log(JSON.stringify(response.data.data, null, 2));
          
          if (response.data.data.length > 0) {
            console.log(`\n📋 Summary: ${response.data.data.length} webhook(s) found`);
            response.data.data.forEach((webhook, index) => {
              console.log(`${index + 1}. ID: ${webhook.id || webhook.uuid}`);
              console.log(`   URL: ${webhook.url}`);
              console.log(`   Events: ${JSON.stringify(webhook.events || webhook.event_types)}`);
              console.log(`   Status: ${webhook.status || webhook.state}`);
              console.log('');
            });
          }
          return;
        }
      } catch (error) {
        console.log(`❌ Failed at ${endpoint}: ${error.response?.status || error.message}`);
        continue;
      }
    }

    console.log('❌ Could not find any webhooks or valid endpoints');
    
  } catch (error) {
    console.error('❌ Error listing webhooks:', error.message);
  }
}

listWebhooks();