// Test the autopilot authentication flow - simplified version
import { createClient } from '@supabase/supabase-js'

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

async function testAuth() {
    try {
        console.log('Testing Supabase authentication flow...')
        console.log('Supabase URL:', supabaseUrl)
        console.log('Supabase Anon Key exists:', !!supabaseAnonKey)
        
        if (!supabaseUrl || !supabaseAnonKey) {
            console.log('❌ Missing Supabase environment variables')
            console.log('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
            return
        }
        
        // Test 1: Create basic client
        console.log('\n1. Testing basic Supabase client creation...')
        const supabase = createClient(supabaseUrl, supabaseAnonKey)
        console.log('✅ Basic client created successfully')
        
        // Test 2: Test authentication state
        console.log('\n2. Testing authentication state...')
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error) {
            console.log('❌ Authentication error:', error.message)
            console.log('Error details:', error)
        } else if (user) {
            console.log('✅ User authenticated:', user.email)
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
        } else {
            console.log('ℹ️ No active session (expected for anon access)')
        }
        
        console.log('\n✅ Authentication test completed')
        
    } catch (error) {
        console.log('❌ Authentication test failed:', error.message)
        console.log('Full error:', error)
    }
}

testAuth()