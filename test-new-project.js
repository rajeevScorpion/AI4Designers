import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Testing connection to new project:', supabaseUrl);

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase configuration');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function testConnection() {
  try {
    // Test basic connection
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('count', { count: 'exact', head: true });

    if (error) {
      console.log('Connection test failed:', error.message);
      return;
    }

    console.log('✅ Connection successful!');
    console.log('Users table exists, count:', data);

    // Test creating a test user
    const { data: authData, error: authError } = await supabaseAdmin.auth.signUp({
      email: 'test@example.com',
      password: 'password123',
      options: {
        data: {
          first_name: 'Test',
          last_name: 'User'
        }
      }
    });

    if (authError) {
      console.log('Auth signup failed:', authError.message);
    } else {
      console.log('✅ Test user created/exists!');
      console.log('User ID:', authData.user?.id);
    }

  } catch (error) {
    console.error('Connection test error:', error.message);
  }
}

testConnection();