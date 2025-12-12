// Test the autopilot authentication flow
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Mock the environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'

async function testAuth() {
    try {
        console.log('Testing Supabase SSR authentication...')
        
        // Test 1: Direct Supabase client creation
        console.log('\n1. Testing direct Supabase client creation...')
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        
        console.log('Supabase URL:', supabaseUrl)
        console.log('Supabase Anon Key exists:', !!supabaseAnonKey)
        
        if (!supabaseUrl || !supabaseAnonKey) {
            console.log('❌ Missing Supabase environment variables')
            return
        }
        
        // Test 2: Test without cookies (should fail)
        console.log('\n2. Testing without cookies...')
        try {
            const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
                cookies: {
                    get(name) { return undefined; },
                    set(name, value, options) { },
                    remove(name, options) { },
                },
            })
            
            const { data: { user }, error } = await supabase.auth.getUser()
            console.log('User without cookies:', user)
            console.log('Error without cookies:', error)
        } catch (err) {
            console.log('Error creating client without cookies:', err.message)
        }
        
        // Test 3: Test with mock cookies
        console.log('\n3. Testing with mock cookies...')
        const mockCookies = {
            'sb-access-token': 'mock-access-token',
            'sb-refresh-token': 'mock-refresh-token'
        }
        
        try {
            const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
                cookies: {
                    get(name) { 
                        console.log(`Getting cookie: ${name}`)
                        return mockCookies[name] 
                    },
                    set(name, value, options) { 
                        console.log(`Setting cookie: ${name}`)
                    },
                    remove(name, options) { 
                        console.log(`Removing cookie: ${name}`)
                    },
                },
            })
            
            const { data: { user }, error } = await supabase.auth.getUser()
            console.log('User with mock cookies:', user)
            console.log('Error with mock cookies:', error)
        } catch (err) {
            console.log('Error creating client with mock cookies:', err.message)
        }
        
        console.log('\n✅ Authentication test completed')
        
    } catch (error) {
        console.log('❌ Authentication test failed:', error.message)
    }
}

testAuth()