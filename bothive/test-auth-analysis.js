// Test authentication state and API access comprehensively
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

async function testAuthState() {
    loadEnv()
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    console.log('🔍 COMPREHENSIVE AUTHENTICATION TEST')
    console.log('=====================================')
    console.log('Supabase URL:', supabaseUrl)
    console.log('Supabase Anon Key exists:', !!supabaseAnonKey)
    
    if (!supabaseUrl || !supabaseAnonKey) {
        console.log('❌ Missing Supabase environment variables')
        return
    }
    
    try {
        // Test 1: Basic client authentication
        console.log('\n1️⃣ TESTING BASIC CLIENT AUTHENTICATION')
        const supabase = createClient(supabaseUrl, supabaseAnonKey)
        
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError) {
            console.log('❌ Authentication failed:', authError.message)
            console.log('Error code:', authError.code)
            console.log('This means no user is currently authenticated')
        } else if (user) {
            console.log('✅ User authenticated:', user.email)
            console.log('User ID:', user.id)
        } else {
            console.log('ℹ️ No user authenticated (anonymous access)')
        }
        
        // Test 2: Check if we can access the database
        console.log('\n2️⃣ TESTING DATABASE ACCESS')
        const { data: testData, error: dbError } = await supabase
            .from('workforce_shared_memory')
            .select('*')
            .limit(1)
        
        if (dbError) {
            console.log('❌ Database access failed:', dbError.message)
            console.log('This might indicate RLS policies are blocking access')
        } else {
            console.log('✅ Database access successful')
            console.log('Found', testData?.length || 0, 'records')
        }
        
        // Test 3: Test the specific issue with swarm creation
        console.log('\n3️⃣ ANALYZING SWARM CREATION ISSUE')
        console.log('The swarm autopilot API requires authentication, but:')
        
        if (!user) {
            console.log('❌ No user is authenticated')
            console.log('❌ This explains why swarm creation fails with 401')
            
            console.log('\n💡 POTENTIAL SOLUTIONS:')
            console.log('1. Check if user is logged in to the application')
            console.log('2. Verify frontend authentication state')
            console.log('3. Check if cookies are being properly sent')
            console.log('4. Consider if the endpoint should be public')
            
            console.log('\n🔍 NEXT STEPS:')
            console.log('- Test authentication in browser dev tools')
            console.log('- Check if supabase.auth.getUser() returns user in browser')
            console.log('- Verify cookie settings in browser')
            
        } else {
            console.log('✅ User is authenticated')
            console.log('✅ Swarm creation should work')
            
            console.log('\n🔍 IF USER IS AUTHENTICATED BUT STILL FAILS:')
            console.log('1. Check browser network tab for cookie transmission')
            console.log('2. Verify SameSite cookie settings')
            console.log('3. Check CORS settings')
            console.log('4. Test the API endpoint directly')
        }
        
        console.log('\n✅ Authentication analysis completed')
        
    } catch (error) {
        console.log('❌ Test failed:', error.message)
        console.log('Full error:', error)
    }
}

testAuthState()