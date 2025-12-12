// Test script to check API without auth
fetch('http://localhost:3000/api/hivetools/install', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        toolName: 'test-tool',
        credentials: { apiKey: 'test' }
    })
})
    .then(res => res.json())
    .then(data => console.log('Response:', data))
    .catch(err => console.error('Error:', err));
