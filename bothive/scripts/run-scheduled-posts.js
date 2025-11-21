// Simple script to trigger the publish-scheduled endpoint
// Can be called by cron job or task scheduler
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/social/publish-scheduled',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-cron-trigger': 'true' // Bypass authentication for cron jobs
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      console.log('Response:', JSON.stringify(result, null, 2));
    } catch (e) {
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write('{}');
req.end();
