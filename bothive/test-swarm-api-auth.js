// Test the swarm autopilot API with proper authentication
import { readFileSync } from 'fs'
import { join } from 'path'

// Load environment variables from .env.local
function loadEnv() {
    const envPath = join(process.cwd(), '.env.local')
    try {
        const envContent = readFileSync(envPath, 'utf8')
        envContent.split('\n').forEach(line => {
            const [key, ...valueParts] = line.split('=')
            if (key && valueParts.length > 0) {
                const value = valueParts.join('=').trim()
                if (value && !value.startsWith('#')) {
                    process.env[key.trim()] = value
                }
            }
        })
        console.log('✅ Environment variables loaded from .env.local')
    } catch (error) {
        console.log('❌ Could not load .env.local:', error.message)
    }
}

async function testSwarmAutopilotAPI() {
    loadEnv()
    
    const goal = "Monitor hackernews for 'AI' and slack me"
    
    console.log('Testing swarm autopilot API with authentication...')
    console.log('Goal:', goal)
    
    try {
        // This simulates what the browser should do with credentials: 'include'
        const response = await fetch('http://localhost:3000/api/swarm/autopilot', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                // Note: In a real browser, cookies would be automatically included
                // But in Node.js we need to manually handle them
            },
            body: JSON.stringify({
                goal: goal,
                availableBots: [],
                availableIntegrations: ['Slack', 'Gmail', 'HubSpot']
            })
        })
        
        console.log('Response status:', response.status)
        console.log('Response headers:', Object.fromEntries(response.headers.entries()))
        
        if (response.ok) {
            const data = await response.json()
            console.log('✅ API call successful!')
            console.log('Blueprint:', JSON.stringify(data.blueprint, null, 2))
        } else {
            const errorText = await response.text()
            console.log('❌ API call failed:', response.status, response.statusText)
            console.log('Error response:', errorText)
            
            if (response.status === 401) {
                console.log('\n🔍 AUTHENTICATION ISSUE DETECTED!')
                console.log('The API endpoint requires authentication but the request is not authenticated.')
                console.log('\n💡 SOLUTION:')
                console.log('1. Ensure the user is logged in to the application')
                console.log('2. Check that cookies are being properly sent with the request')
                console.log('3. Verify that the browser client is properly configured')
            }
        }
        
    } catch (error) {
        console.log('❌ API call failed:', error.message)
        console.log('This might mean the Next.js server is not running.')
        console.log('Start the server with: npm run dev')
    }
}

testSwarmAutopilotAPI()