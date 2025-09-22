const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client with service role key
const supabase = createClient(
  'https://fbcrucweylsfyvlzacxu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZiY3J1Y3dleWxzZnl2bHphY3h1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Nzk0NzYxNCwiZXhwIjoyMDczNTIzNjE0fQ.IS9KWd-iBvbziCIW8x78oXbJs1RXT1J80JDy087d9SE'
)

async function setupPolicies() {
  console.log('Setting up complete RLS policies for users table...\n')

  // List of policies to create
  const policies = [
    {
      name: 'Users can read own profile',
      command: 'SELECT',
      using: 'auth.uid() = id',
      withCheck: null
    },
    {
      name: 'Users can insert own profile',
      command: 'INSERT',
      using: null,
      withCheck: 'auth.uid() = id'
    },
    {
      name: 'Users can update own profile',
      command: 'UPDATE',
      using: 'auth.uid() = id',
      withCheck: null
    }
  ]

  console.log('SQL commands to run in your Supabase dashboard SQL editor:\n')
  console.log('```sql')

  // Generate SQL for each policy
  policies.forEach(policy => {
    let sql = `CREATE POLICY IF NOT EXISTS "${policy.name}" ON "public"."users"\n`
    sql += `    FOR ${policy.command}\n`

    if (policy.using) {
      sql += `    USING (${policy.using})\n`
    }

    if (policy.withCheck) {
      sql += `    WITH CHECK (${policy.withCheck})\n`
    }

    sql += ';'
    console.log(sql)
    console.log('')
  })

  console.log('```\n')
  console.log('Copy and paste the SQL above into your Supabase dashboard SQL Editor:')
  console.log('1. Go to: https://supabase.com/dashboard/project/fbcrucweylsfyvlzacxu')
  console.log('2. Navigate to SQL Editor in the left sidebar')
  console.log('3. Click "New query"')
  console.log('4. Paste the SQL and click "Run"')

  // Also check if RLS is enabled
  console.log('\n\nChecking if RLS is enabled on users table...')
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true })

    if (error && error.code === '42501') {
      console.log('✓ RLS is enabled (got permission denied error)')
    } else if (error) {
      console.log('? RLS status unclear due to error:', error.message)
    } else {
      console.log('? RLS might not be enabled (got successful response)')
    }
  } catch (err) {
    console.log('Error checking RLS status:', err.message)
  }

  console.log('\nAfter running the SQL commands, the profile persistence issue should be resolved!')
}

setupPolicies()