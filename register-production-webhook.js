// Register Yoco webhook for production domain
const https = require('https');

// Get the secret key from environment - this should be your LIVE key
const secretKey = process.env.YOCO_SECRET_KEY;
if (!secretKey) {
  console.error('YOCO_SECRET_KEY not found in environment');
  console.error('Make sure you are using your LIVE Yoco secret key (sk_live_...)');
  process.exit(1);
}

// Production webhook configuration
const webhookConfig = {
  name: 'apparelcast-production-webhook',
  url: 'https://www.apparelcast.shop/api/yoco/webhook'
};

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function registerProductionWebhook() {
  try {
    console.log('🚀 Registering PRODUCTION webhook...');
    console.log('🔗 Webhook URL:', webhookConfig.url);
    console.log('🔑 Using secret key:', secretKey.substring(0, 10) + '...');
    console.log('⚠️  IMPORTANT: Make sure this is your LIVE secret key!');

    const postData = JSON.stringify(webhookConfig);
    
    const options = {
      hostname: 'payments.yoco.com',
      port: 443,
      path: '/api/webhooks',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    console.log('📡 Making request to:', `https://${options.hostname}${options.path}`);
    
    const response = await makeRequest(options, postData);
    
    console.log('📊 Response status:', response.statusCode);
    
    if (response.data) {
      try {
        const parsedData = JSON.parse(response.data);
        console.log('📄 Response data:', JSON.stringify(parsedData, null, 2));
        
        if (response.statusCode === 201) {
          console.log('🎉 PRODUCTION Webhook registered successfully!');
          console.log('🆔 Webhook ID:', parsedData.id);
          console.log('🔐 Webhook secret:', parsedData.secret);
          console.log('📋 Mode:', parsedData.mode);
          console.log('');
          console.log('⚠️  CRITICAL: Save this secret for production webhook verification!');
          console.log('📁 Update your Vercel environment variables with this new secret.');
          return parsedData;
        } else if (response.statusCode === 400) {
          console.log('❌ Bad request - check your configuration');
          if (parsedData.code === 'subscription_limit_exceeded') {
            console.log('📝 You have reached the webhook limit. Delete some existing webhooks first.');
          }
        } else if (response.statusCode === 403) {
          console.log('❌ Forbidden - check your API key permissions');
        } else if (response.statusCode === 500) {
          console.log('❌ Server error - try again later');
        }
      } catch (parseError) {
        console.log('📄 Raw response data:', response.data);
      }
    }
    
  } catch (error) {
    console.error('💥 Error registering webhook:', error.message);
  }
}

async function listProductionWebhooks() {
  try {
    console.log('\n📋 Listing existing webhooks...');
    
    const options = {
      hostname: 'payments.yoco.com',
      port: 443,
      path: '/api/webhooks',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json'
      }
    };

    const response = await makeRequest(options);
    
    if (response.statusCode === 200 && response.data) {
      try {
        const parsedData = JSON.parse(response.data);
        const webhooks = parsedData.subscriptions || [];
        
        console.log(`📊 Found ${webhooks.length} webhooks:`);
        webhooks.forEach((webhook, index) => {
          console.log(`${index + 1}. 🆔 ${webhook.id}`);
          console.log(`   📛 Name: ${webhook.name}`);
          console.log(`   🔗 URL: ${webhook.url}`);
          console.log(`   📋 Mode: ${webhook.mode}`);
          console.log('');
        });
        
        return webhooks;
      } catch (parseError) {
        console.log('📄 Raw response:', response.data);
      }
    }
    
  } catch (error) {
    console.error('💥 Error listing webhooks:', error.message);
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('🏭 APPARELCAST PRODUCTION WEBHOOK SETUP');
  console.log('='.repeat(60));
  console.log('');
  console.log('🌐 Production Domain: https://www.apparelcast.shop');
  console.log('📍 Webhook Endpoint: https://www.apparelcast.shop/api/yoco/webhook');
  console.log('');
  console.log('⚠️  IMPORTANT: Make sure you have:');
  console.log('   ✅ Deployed to Vercel with your domain');
  console.log('   ✅ Set LIVE Yoco secret key in Vercel environment');
  console.log('   ✅ Your domain is accessible publicly');
  console.log('');
  
  await listProductionWebhooks();
  console.log('\n' + '='.repeat(60));
  await registerProductionWebhook();
}

main();