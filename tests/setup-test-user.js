const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setupTestUser() {
  try {
    // First, try to delete the test user if it exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const testUser = existingUsers.users.find(u => u.email === 'test@example.com');

    if (testUser) {
      console.log('Deleting existing test user...');
      await supabase.auth.admin.deleteUser(testUser.id);
    }

    // Create the test user
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'test@example.com',
      password: 'password123',
      email_confirm: true,
      user_metadata: {
        fullName: 'Test User'
      }
    });

    if (error) {
      console.error('Error creating test user:', error);
      return;
    }

    console.log('Test user created successfully:', data.user.id);

    // Create user profile in the users table
    const { error: profileError } = await supabase
      .from('users')
      .upsert({
        id: data.user.id,
        email: 'test@example.com',
        full_name: 'Test User',
        first_name: 'Test',
        last_name: 'User'
      });

    if (profileError) {
      console.error('Error creating user profile:', profileError);
    } else {
      console.log('User profile created successfully');
    }
  } catch (err) {
    console.error('Setup error:', err);
  }
}

setupTestUser();