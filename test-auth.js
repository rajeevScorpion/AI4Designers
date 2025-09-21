import { createClient } from '@/lib/supabase/client'

async function testAuth() {
  const supabase = createClient()

  // Test sign in
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'test@example.com',
    password: 'password123'
  })

  console.log('Sign in result:', { data, error })

  // Check session
  const { data: sessionData } = await supabase.auth.getSession()
  console.log('Session data:', sessionData)
}

testAuth()