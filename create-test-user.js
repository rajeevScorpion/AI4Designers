import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase configuration');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function createTestUser() {
  try {
    console.log('Creating test user...');
    console.log('Supabase URL:', supabaseUrl);

    const { data, error } = await supabaseAdmin.auth.signUp({
      email: 'test@example.com',
      password: 'password123',
      options: {
        data: {
          first_name: 'Test',
          last_name: 'User'
        }
      }
    });

    if (error) {
      console.error('Error creating user:', error);

      // Check if user already exists by trying to sign in
      const { data: signInData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'password123'
      });

      if (signInError && signInError.message.includes('Invalid login credentials')) {
        console.log('User does not exist and could not be created');
        return;
      } else if (!signInError) {
        console.log('✅ Test user already exists!');
        console.log('User ID:', signInData.user?.id);
        console.log('Email:', signInData.user?.email);
        console.log('Name:', `${signInData.user?.user_metadata?.first_name || 'Test'} ${signInData.user?.user_metadata?.last_name || 'User'}`);

        console.log('\n📋 Test User Credentials:');
        console.log('Email: test@example.com');
        console.log('Password: password123');
        console.log('User ID:', signInData.user?.id);
      }
      return;
    }

    console.log('✅ Test user created successfully!');
    console.log('User ID:', data.user?.id);
    console.log('Email:', data.user?.email);
    console.log('Name:', `${data.user?.user_metadata?.first_name || 'Test'} ${data.user?.user_metadata?.last_name || 'User'}`);

    console.log('\n📋 Test User Credentials:');
    console.log('Email: test@example.com');
    console.log('Password: password123');
    console.log('User ID:', data.user?.id);

  } catch (error) {
    console.error('Unexpected error:', error.message);
  }
}

createTestUser();