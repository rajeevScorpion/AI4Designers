import { config } from 'dotenv';

// Test environment variable loading
console.log('Testing environment variable loading...\n');

// Load from .env.local
config({ path: '.env.local' });

console.log('Environment variables:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Not set');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Not set');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Not set');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Not set');
console.log('PORT:', process.env.PORT || '5000 (default)');

// Test creating a Supabase client
import { createClient } from '@supabase/supabase-js';

try {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  console.log('\n✅ Supabase client created successfully');

  // Test auth
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'test@example.com',
    password: '123456'
  });

  if (error) {
    console.log('Auth error:', error.message);
  } else {
    console.log('✅ Auth test successful');
  }
} catch (err) {
  console.error('\n❌ Error creating Supabase client:', err.message);
}