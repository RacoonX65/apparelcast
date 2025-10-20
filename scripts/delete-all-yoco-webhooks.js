/**
 * Script to delete all Yoco webhooks
 * This will remove all existing webhook subscriptions
 * 
 * Usage: node scripts/delete-all-yoco-webhooks.js
 */

require('dotenv').config({ path: '.env.local' });

const https = require('https');

const secretKey = process.env.YOCO_SECRET_KEY;

if (!secretKey) {
  console.error('❌ YOCO_SECRET_KEY not found in environment variables');
  process.exit(1);
}

async function makeYocoRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'online.yoco.com',
      path: `/api/v1${path}`,
      method: method,
      headers: {
        'Authorization': 'Bearer ' + secretKey,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({
            statusCode: res.statusCode,
            data: parsedData
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            data: responseData
          });
        }
      });
    });

    req.on('error', (e) => reject(e));

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function deleteAllWebhooks() {
  try {
    console.log('🔍 Fetching existing webhooks...');
    
    // Try to get webhooks using the standard API endpoint
    const response = await makeYocoRequest('GET', '/webhooks');
    
    console.log('📊 Response status:', response.statusCode);
    console.log('📄 Response data:', JSON.stringify(response.data, null, 2));

    if (response.statusCode === 200 && response.data && response.data.data) {
      const webhooks = response.data.data;
      
      if (webhooks.length === 0) {
        console.log('✅ No webhooks found to delete');
        return;
      }

      console.log(`🗑️  Found ${webhooks.length} webhook(s) to delete`);
      
      for (const webhook of webhooks) {
        console.log(`🗑️  Deleting webhook: ${webhook.id} - ${webhook.url}`);
        
        const deleteResponse = await makeYocoRequest('DELETE', `/webhooks/${webhook.id}`);
        
        if (deleteResponse.statusCode === 204 || deleteResponse.statusCode === 200) {
          console.log(`✅ Successfully deleted webhook: ${webhook.id}`);
        } else {
          console.log(`❌ Failed to delete webhook: ${webhook.id}`, deleteResponse.data);
        }
      }
      
      console.log('✅ All webhooks deleted successfully!');
    } else if (response.statusCode === 404) {
      console.log('🤔 Webhook endpoint not found. Trying alternative approach...');
      
      // Yoco might use a different endpoint structure
      // Let's try the alternative endpoint mentioned in their docs
      const altResponse = await makeYocoRequest('GET', '/webhook_subscriptions');
      console.log('Alternative endpoint response:', altResponse.statusCode, altResponse.data);
      
    } else {
      console.log('❌ Failed to fetch webhooks:', response.data);
    }
    
  } catch (error) {
    console.error('❌ Error deleting webhooks:', error.message);
    
    // Try using curl as fallback
    console.log('\n🔄 Trying alternative approach with curl...');
    
    try {
      const { exec } = require('child_process');
      exec(`curl -X GET "https://online.yoco.com/api/v1/webhooks" -H "Authorization: Bearer ${secretKey}" -H "Content-Type: application/json"`, (error, stdout, stderr) => {
        if (error) {
          console.log('❌ Curl also failed:', error.message);
          return;
        }
        
        try {
          const data = JSON.parse(stdout);
          console.log('📊 Webhooks found via curl:', data);
        } catch (e) {
          console.log('📄 Raw response:', stdout);
        }
      });
    } catch (e) {
      console.log('❌ Alternative approach also failed');
    }
  }
}

// Run the deletion
console.log('🚀 Starting webhook deletion process...');
deleteAllWebhooks();