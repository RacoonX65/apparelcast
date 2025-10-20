// Delete Yoco webhooks to make room for new ones
const https = require('https');

// Get the secret key from environment
const secretKey = process.env.YOCO_SECRET_KEY;
if (!secretKey) {
  console.error('YOCO_SECRET_KEY not found in environment');
  process.exit(1);
}

function makeRequest(options) {
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

    req.end();
  });
}

async function deleteWebhook(webhookId) {
  try {
    console.log(`Deleting webhook: ${webhookId}`);
    
    const options = {
      hostname: 'payments.yoco.com',
      port: 443,
      path: `/api/webhooks/${webhookId}`,
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json'
      }
    };

    const response = await makeRequest(options);
    
    console.log(`Delete response for ${webhookId}:`, response.statusCode);
    
    if (response.statusCode === 204) {
      console.log(`✅ Successfully deleted webhook: ${webhookId}`);
    } else if (response.data) {
      try {
        const parsedData = JSON.parse(response.data);
        console.log('Response:', parsedData);
      } catch (parseError) {
        console.log('Raw response:', response.data);
      }
    }
    
    return response.statusCode === 204;
    
  } catch (error) {
    console.error(`Error deleting webhook ${webhookId}:`, error.message);
    return false;
  }
}

async function listWebhooks() {
  try {
    console.log('Listing existing webhooks...');
    
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
        console.log('Raw webhook data structure:', JSON.stringify(parsedData, null, 2));
        // The response has a subscriptions property containing the webhooks
        return parsedData.subscriptions || [];
      } catch (parseError) {
        console.log('Failed to parse webhook list:', response.data);
        return [];
      }
    }
    
    return [];
    
  } catch (error) {
    console.error('Error listing webhooks:', error.message);
    return [];
  }
}

async function main() {
  console.log('Fetching existing webhooks...');
  const webhooks = await listWebhooks();
  
  if (webhooks.length === 0) {
    console.log('No webhooks found or error fetching webhooks.');
    return;
  }
  
  console.log(`Found ${webhooks.length} webhooks:`);
  webhooks.forEach((webhook, index) => {
    console.log(`${index + 1}. ${webhook.id} - ${webhook.name} (${webhook.mode}) - ${webhook.url}`);
  });
  
  console.log('\nWhich webhooks would you like to delete?');
  console.log('Enter the numbers separated by commas (e.g., "1,2") or "all" to delete all:');
  
  // For now, let's delete the test mode webhooks to make room
  const testWebhooks = webhooks.filter(w => w.mode === 'test');
  console.log(`\nAuto-deleting ${testWebhooks.length} test mode webhooks to make room...`);
  
  for (const webhook of testWebhooks) {
    await deleteWebhook(webhook.id);
    // Small delay between deletions
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\nWebhook cleanup complete. You can now register a new webhook.');
}

main();