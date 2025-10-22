const http = require('http');

function testEmail() {
  console.log('🧪 Testing order confirmation email...');

  const postData = JSON.stringify({
    email: 'judassithole@duck.com'
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/test-email',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    console.log('📊 Response Status:', res.statusCode);

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const responseData = JSON.parse(data);
        console.log('📝 Response Data:', JSON.stringify(responseData, null, 2));

        if (res.statusCode === 200) {
          console.log('✅ Email test successful!');
        } else {
          console.log('❌ Email test failed:', responseData.error);
        }
      } catch (error) {
        console.log('📄 Raw Response:', data);
        console.log('💥 Error parsing response:', error.message);
      }
    });
  });

  req.on('error', (error) => {
    console.error('💥 Error making request:', error.message);
  });

  req.write(postData);
  req.end();
}

testEmail();
