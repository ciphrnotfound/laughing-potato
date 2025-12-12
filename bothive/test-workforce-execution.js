// Test the actual workforce execution to see what tools are working
const http = require('http');

console.log('🧪 Testing workforce execution with real tools...\n');

// Test data - a simple task that should use real tools
const testData = JSON.stringify({
  userId: "test-user-123",
  request: "Fetch my bots from the database and create a summary of my integrations"
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/workforce/run',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(testData)
  }
};

console.log('Testing workforce execution with request:', JSON.parse(testData).request);

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`Status Code: ${res.statusCode}`);
    console.log(`Response: ${data}`);
    
    if (res.statusCode === 200) {
      try {
        const response = JSON.parse(data);
        if (response.success) {
          console.log('✅ Workforce execution completed successfully!');
          console.log(`✅ Generated ${response.iterations?.length || 0} iterations`);
          
          if (response.iterations && response.iterations.length > 0) {
            const lastIteration = response.iterations[response.iterations.length - 1];
            console.log(`✅ Last iteration outputs:`, Object.keys(lastIteration.outputs || {}));
            
            // Check if any real data was fetched
            if (lastIteration.outputs) {
              Object.entries(lastIteration.outputs).forEach(([role, output]) => {
                console.log(`  📋 ${role}: ${(output || '').substring(0, 100)}...`);
              });
            }
          }
        } else {
          console.log('❌ Workforce execution failed:', response.error);
        }
      } catch (e) {
        console.log('❌ Failed to parse response:', e.message);
      }
    } else {
      console.log('❌ Workforce execution request failed');
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Connection error:', e.message);
  console.log('');
  console.log('💡 Make sure:');
  console.log('   1. Next.js dev server is running: npm run dev');
  console.log('   2. Supabase is properly configured');
  console.log('   3. Environment variables are loaded');
});

req.write(testData);
req.end();