// Test the swarm autopilot API endpoint
async function testSwarmAutopilot() {
  try {
    const response = await fetch('http://localhost:3000/api/swarm/autopilot', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        // Add auth cookie if needed
      },
      body: JSON.stringify({
        goal: "Monitor hackernews for 'AI' and slack me",
        availableBots: [],
        availableIntegrations: ['Slack', 'Gmail']
      })
    });

    console.log('Response status:', response.status);
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

testSwarmAutopilot();