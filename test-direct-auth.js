import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Testing direct Supabase authentication...');
console.log('URL:', supabaseUrl);
console.log('Key length:', supabaseServiceKey?.length || 0);

// Create admin client
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function testAuth() {
  try {
    // First, let's check if we can access the project
    const { data, error } = await supabaseAdmin.from('users').select('count').single();

    if (error) {
      console.log('Database access error:', error.message);
      return;
    }

    console.log('✅ Database access successful');

    // Now test authentication
    console.log('\nTesting sign in...');
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email: 'test@example.com',
      password: '123456'
    });

    if (authError) {
      console.log('❌ Auth error:', authError.message);

      // Try creating the user if it doesn't exist
      console.log('\nTrying to create user...');
      const { data: signUpData, error: signUpError } = await supabaseAdmin.auth.signUp({
        email: 'test@example.com',
        password: '123456',
        options: {
          data: {
            first_name: 'Test',
            last_name: 'User'
          }
        }
      });

      if (signUpError) {
        console.log('Sign up error:', signUpError.message);
      } else {
        console.log('✅ User created successfully');
        console.log('User ID:', signUpData.user?.id);
      }
    } else {
      console.log('✅ Sign in successful');
      console.log('User ID:', authData.user?.id);
      console.log('Session:', authData.session?.access_token ? 'Valid' : 'Invalid');
    }
  } catch (err) {
    console.error('Unexpected error:', err.message);
  }
}

testAuth();