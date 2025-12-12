// Test the swarm autopilot API endpoint with proper authentication
async function testSwarmAutopilotWithAuth() {
  try {
    // First, let's check if we can get the current session/cookies
    console.log('Testing authentication flow...');
    
    // Try to access a public endpoint first to see if we get cookies
    const publicResponse = await fetch('http://localhost:3000/api/auth/session', {
      method: 'GET',
      credentials: 'include' // This should include cookies
    });
    
    console.log('Auth session response:', publicResponse.status);
    if (publicResponse.ok) {
      const sessionData = await publicResponse.json();
      console.log('Session data:', sessionData);
    }
    
    // Now try the autopilot endpoint with credentials
    const response = await fetch('http://localhost:3000/api/swarm/autopilot', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      credentials: 'include', // Include cookies
      body: JSON.stringify({
        goal: "Monitor hackernews for 'AI' and slack me",
        availableBots: [],
        availableIntegrations: ['Slack', 'Gmail']
      })
    });

    console.log('Autopilot response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const text = await response.text();
    console.log('Raw response:', text);
    
    if (response.ok) {
      const data = JSON.parse(text);
      console.log('Parsed response:', JSON.stringify(data, null, 2));
    } else {
      console.log('Error response:', text);
    }
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

testSwarmAutopilotWithAuth();