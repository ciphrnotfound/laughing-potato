const { generateText } = require('./src/lib/ai-client');

async function testAIClient() {
  try {
    console.log('Testing AI client...');
    const result = await generateText('Hello, this is a test. Please respond with "AI is working" if you can read this.');
    console.log('AI Response:', result);
  } catch (error) {
    console.error('AI Client Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testAIClient();