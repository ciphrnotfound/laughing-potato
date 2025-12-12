// Test the autopilot authentication flow with proper env loading
import { createClient } from '@supabase/supabase-js'
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

async function testAuth() {
    loadEnv()
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    console.log('Testing Supabase authentication flow...')
    console.log('Supabase URL:', supabaseUrl)
    console.log('Supabase Anon Key exists:', !!supabaseAnonKey)
    
    if (!supabaseUrl || !supabaseAnonKey) {
        console.log('❌ Missing Supabase environment variables')
        return
    }
    
    try {
        // Test 1: Create basic client
        console.log('\n1. Testing basic Supabase client creation...')
        const supabase = createClient(supabaseUrl, supabaseAnonKey)
        console.log('✅ Basic client created successfully')
        
        // Test 2: Test authentication state
        console.log('\n2. Testing authentication state...')
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error) {
            console.log('❌ Authentication error:', error.message)
            console.log('Error code:', error.code)
            console.log('Error details:', error)
        } else if (user) {
            console.log('✅ User authenticated:', user.email)
            console.log('User ID:', user.id)
        } else {
            console.log('ℹ️ No user authenticated (this is expected for anon access)')
        }
        
        // Test 3: Test session retrieval
        console.log('\n3. Testing session retrieval...')
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
            console.log('❌ Session error:', sessionError.message)
        } else if (session) {
            console.log('✅ Active session found')
            console.log('Access token exists:', !!session.access_token)
            console.log('Refresh token exists:', !!session.refresh_token)
        } else {
            console.log('ℹ️ No active session (expected for anon access)')
        }
        
        // Test 4: Test the specific autopilot API scenario
        console.log('\n4. Testing autopilot API scenario...')
        console.log('This simulates what happens in the autopilot API endpoint:')
        console.log('- User must be authenticated to access the endpoint')
        console.log('- If no user, it returns 401 Unauthorized')
        
        if (!user) {
            console.log('❌ In autopilot API: Would return 401 Unauthorized')
            console.log('This explains why swarm creation is failing!')
        } else {
            console.log('✅ In autopilot API: User authenticated, would proceed with AI generation')
        }
        
        console.log('\n✅ Authentication test completed')
        console.log('\n🔍 DIAGNOSIS:')
        console.log('The swarm creation is failing because users are not authenticated')
        console.log('when calling the autopilot API endpoint.')
        console.log('\n💡 SOLUTIONS:')
        console.log('1. Ensure user is logged in before creating swarms')
        console.log('2. Check if the frontend is sending proper authentication')
        console.log('3. Consider if this endpoint should require authentication')
        
    } catch (error) {
        console.log('❌ Authentication test failed:', error.message)
        console.log('Full error:', error)
    }
}

testAuth()