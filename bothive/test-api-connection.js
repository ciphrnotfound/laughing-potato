// Simple test to check if the API is working
const http = require('http');

console.log('🧪 Testing swarm creation API...\n');

// Test data
const testData = JSON.stringify({
  goal: "Monitor hackernews for AI and send me a daily summary",
  availableBots: [
    { id: 'bot1', name: 'News Scraper', type: 'scraper' }
  ],
  availableIntegrations: ['Slack', 'Gmail', 'Discord']
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/swarm/autopilot',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(testData)
  }
};

console.log('Attempting to connect to localhost:3000...');

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`Status Code: ${res.statusCode}`);
    console.log(`Response: ${data}`);
    
    if (res.statusCode === 200) {
      console.log('✅ Swarm creation API is working!');
    } else if (res.statusCode === 401) {
      console.log('❌ Still getting 401 Unauthorized - authentication fix may not be working');
    } else {
      console.log(`❌ Unexpected status code: ${res.statusCode}`);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Connection error:', e.message);
  console.log('');
  console.log('💡 Troubleshooting steps:');
  console.log('   1. Make sure Next.js dev server is running: npm run dev');
  console.log('   2. Check if the server is running on port 3000');
  console.log('   3. Check the server logs for any errors');
  console.log('');
  console.log('📝 The authentication fix has been applied to:');
  console.log('   - src/app/api/swarm/autopilot/route.ts (authentication is now optional)');
  console.log('   - src/components/VisualWorkflowBuilder.tsx (includes auth cookies)');
});

req.write(testData);
req.end();