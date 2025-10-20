// Register Yoco webhook using the correct endpoint and authentication
const https = require('https');

// Get the secret key from environment
const secretKey = process.env.YOCO_SECRET_KEY;
if (!secretKey) {
  console.error('YOCO_SECRET_KEY not found in environment');
  process.exit(1);
}

// Webhook configuration
const webhookConfig = {
  name: 'apparelcast-webhook',
  url: 'https://553a30824bb5.ngrok-free.app/api/yoco/webhook'
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

async function registerWebhook() {
  try {
    console.log('Registering webhook with configuration:', webhookConfig);
    console.log('Using secret key:', secretKey.substring(0, 10) + '...');

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

    console.log('Making request to:', `https://${options.hostname}${options.path}`);
    
    const response = await makeRequest(options, postData);
    
    console.log('Response status:', response.statusCode);
    console.log('Response headers:', response.headers);
    
    if (response.data) {
      try {
        const parsedData = JSON.parse(response.data);
        console.log('Response data:', JSON.stringify(parsedData, null, 2));
        
        if (response.statusCode === 201) {
          console.log('✅ Webhook registered successfully!');
          console.log('Webhook ID:', parsedData.id);
          console.log('Webhook secret:', parsedData.secret);
          console.log('IMPORTANT: Save this secret for webhook verification!');
        } else if (response.statusCode === 400) {
          console.log('❌ Bad request - invalid input');
        } else if (response.statusCode === 403) {
          console.log('❌ Forbidden - lack of permission');
        } else if (response.statusCode === 500) {
          console.log('❌ Server error');
        }
      } catch (parseError) {
        console.log('Raw response data:', response.data);
      }
    }
    
  } catch (error) {
    console.error('Error registering webhook:', error.message);
  }
}

async function listWebhooks() {
  try {
    console.log('\nListing existing webhooks...');
    
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
    
    console.log('List response status:', response.statusCode);
    
    if (response.data) {
      try {
        const parsedData = JSON.parse(response.data);
        console.log('Existing webhooks:', JSON.stringify(parsedData, null, 2));
      } catch (parseError) {
        console.log('Raw list response:', response.data);
      }
    }
    
  } catch (error) {
    console.error('Error listing webhooks:', error.message);
  }
}

// Run both operations
async function main() {
  await listWebhooks();
  console.log('\n' + '='.repeat(50));
  await registerWebhook();
}

main();