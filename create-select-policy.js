const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client with service role key
const supabase = createClient(
  'https://fbcrucweylsfyvlzacxu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZiY3J1Y3dleWxzZnl2bHphY3h1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Nzk0NzYxNCwiZXhwIjoyMDczNTIzNjE0fQ.IS9KWd-iBvbziCIW8x78oXbJs1RXT1J80JDy087d9SE'
)

async function createSelectPolicy() {
  try {
    console.log('Creating SELECT policy for users table...')

    // Use raw SQL to create the policy
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .then(() => {
        // This will fail but we're checking the error
        return supabase.rpc('exec_sql', {
          sql: `CREATE POLICY IF NOT EXISTS "Users can read own profile" ON "public"."users" FOR SELECT USING (auth.uid() = id);`
        })
      })

    // Try a different approach - insert directly into pg_policies
    console.log('\nTrying direct insertion into pg_policies...')

    // First check if policy already exists
    const { data: existingPolicy } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'users')
      .eq('cmd', 'SELECT')
      .single()

    if (existingPolicy) {
      console.log('✓ SELECT policy already exists:', existingPolicy.policyname)
    } else {
      console.log('✗ SELECT policy not found')

      // Since we can't directly modify pg_policies, let's provide the SQL
      console.log('\nPlease run this SQL in your Supabase dashboard SQL editor:')
      console.log('```sql')
      console.log('CREATE POLICY IF NOT EXISTS "Users can read own profile" ON "public"."users"')
      console.log('FOR SELECT')
      console.log('USING (auth.uid() = id);')
      console.log('```')
    }

    // Let's also test if we can read the policies
    console.log('\nChecking policies using information_schema...')
    const { data: infoPolicies, error: infoError } = await supabase
      .from('information_schema')
      .select('*')
      .limit(1)

    if (infoError) {
      console.log('Cannot access information_schema')
    }

  } catch (err) {
    console.error('Error:', err)
  }
}

createSelectPolicy()