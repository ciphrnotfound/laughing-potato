const testWorkforceExecution = async () => {
  console.log('🧪 Testing workforce execution with simple AI tool...\n');

  const testRequest = "Generate a short summary about AI automation";
  
  try {
    const response = await fetch('http://localhost:3000/api/workforce/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: "test-user-123",
        request: testRequest
      })
    });

    const data = await response.json();
    
    console.log(`Status Code: ${response.status}`);
    console.log(`Response: ${JSON.stringify(data, null, 2)}`);
    
    if (response.ok) {
      console.log('✅ Workforce execution completed successfully!');
      console.log(`✅ Generated ${data.iterations?.length || 0} iterations`);
      
      if (data.iterations && data.iterations.length > 0) {
        const lastIteration = data.iterations[data.iterations.length - 1];
        console.log(`✅ Last iteration outputs:`, Object.keys(lastIteration.outputs || {}));
        
        Object.entries(lastIteration.outputs || {}).forEach(([agent, output]) => {
          console.log(`  📋 ${agent}: ${output}`);
        });
      }
    } else {
      console.log('❌ Workforce execution failed');
      console.log('Error:', data.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
};

testWorkforceExecution();