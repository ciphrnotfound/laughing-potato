// Test the mock autopilot API
async function testMockAutopilot() {
  try {
    // Import the mock API function
    const { POST } = await import('./test-autopilot-api.ts');
    
    // Create a mock request
    const mockRequest = {
      json: async () => ({
        goal: "Monitor hackernews for 'AI' and slack me",
        availableBots: [],
        availableIntegrations: ['Slack', 'Gmail']
      })
    };

    console.log('Testing mock autopilot API...');
    const response = await POST(mockRequest);
    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (response.status === 200 && data.blueprint) {
      console.log('✅ AI generation is working correctly!');
      console.log('Blueprint nodes:', data.blueprint.nodes?.length || 0);
      console.log('Blueprint edges:', data.blueprint.edges?.length || 0);
    } else {
      console.log('❌ AI generation failed');
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testMockAutopilot();