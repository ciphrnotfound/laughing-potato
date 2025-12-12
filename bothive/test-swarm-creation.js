// Test swarm creation with authentication fix
const http = require('http');

// Load environment variables
require('fs').readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  if (line.includes('=')) {
    const [key, value] = line.split('=');
    process.env[key.trim()] = value.trim();
  }
});

console.log('🧪 Testing swarm creation with authentication fix...\n');

// Test data
const testData = {
  goal: "Monitor hackernews for 'AI' and send me a daily summary",
  availableBots: [
    { id: 'bot1', name: 'News Scraper', type: 'scraper' }
  ],
  availableIntegrations: ['Slack', 'Gmail', 'Discord']
};

// Test without authentication (anonymous)
console.log('1️⃣ Testing anonymous swarm creation (no auth required)...');

const postData = JSON.stringify(testData);

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/swarm/autopilot',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`Status Code: ${res.statusCode}`);
    console.log(`Response: ${data}`);
    
    if (res.statusCode === 200) {
      console.log('✅ Anonymous swarm creation works!');
      
      try {
        const response = JSON.parse(data);
        if (response.blueprint && response.blueprint.nodes) {
          console.log(`✅ Generated ${response.blueprint.nodes.length} nodes`);
          console.log('Sample nodes:', response.blueprint.nodes.slice(0, 2).map(n => n.data?.label));
        }
      } catch (e) {
        console.log('❌ Failed to parse response:', e.message);
      }
    } else {
      console.log('❌ Anonymous swarm creation failed');
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Request error:', e.message);
});

req.write(postData);
req.end();