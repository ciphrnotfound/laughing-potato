// Test session state via API
async function testSessionAPI() {
    console.log('🔍 TESTING SESSION STATE VIA API')
    console.log('====================================')
    
    try {
        // Test the session endpoint
        const response = await fetch('http://localhost:3000/api/auth/session', {
            method: 'GET',
            credentials: 'include' // Include cookies
        })
        
        console.log('Session API response status:', response.status)
        
        if (response.ok) {
            const data = await response.json()
            console.log('Session data:', JSON.stringify(data, null, 2))
            
            if (data.authenticated) {
                console.log('✅ User is authenticated according to API')
                console.log('User email:', data.user?.email)
            } else {
                console.log('❌ User is not authenticated according to API')
                console.log('This explains why swarm creation fails!')
            }
        } else {
            const errorText = await response.text()
            console.log('❌ Session API failed:', response.status, errorText)
        }
        
    } catch (error) {
        console.log('❌ Session API test failed:', error.message)
        console.log('Make sure Next.js server is running: npm run dev')
    }
}

// Test the actual swarm autopilot endpoint
testSessionAPI()