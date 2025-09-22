const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client with service role key
const supabase = createClient(
  'https://fbcrucweylsfyvlzacxu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZiY3J1Y3dleWxzZnl2bHphY3h1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Nzk0NzYxNCwiZXhwIjoyMDczNTIzNjE0fQ.IS9KWd-iBvbziCIW8x78oXbJs1RXT1J80JDy087d9SE'
)

async function checkPolicies() {
  try {
    console.log('Checking existing RLS policies for users table...\n')

    // Check if RLS is enabled
    const { data: rlsStatus, error: rlsError } = await supabase.rpc('exec', {
      sql: `SELECT relrowsecurity FROM pg_class WHERE relname = 'users';`
    })

    if (rlsError) {
      console.error('Error checking RLS status:', rlsError)
    } else {
      console.log('RLS enabled on users table:', rlsStatus)
    }

    // Check existing policies
    const { data: policies, error: policyError } = await supabase.rpc('exec', {
      sql: `SELECT
        policyname,
        permissive,
        roles,
        cmd,
        qual
      FROM pg_policies
      WHERE tablename = 'users'
      ORDER BY policyname;`
    })

    if (policyError) {
      console.error('Error checking policies:', policyError)
    } else {
      console.log('\nExisting policies:')
      if (policies && policies.length > 0) {
        policies.forEach(policy => {
          console.log(`\n- Policy: ${policy.policyname}`)
          console.log(`  Command: ${policy.cmd}`)
          console.log(`  Roles: ${policy.roles}`)
          console.log(`  Using: ${policy.qual || 'N/A'}`)
        })
      } else {
        console.log('No policies found')
      }
    }

    // Check if we need to add the SELECT policy
    console.log('\n\nChecking for SELECT policy...')
    const { data: selectPolicy } = await supabase.rpc('exec', {
      sql: `SELECT policyname FROM pg_policies
            WHERE tablename = 'users' AND cmd = 'SELECT';`
    })

    if (selectPolicy && selectPolicy.length > 0) {
      console.log('✓ SELECT policy exists:', selectPolicy[0].policyname)
    } else {
      console.log('✗ SELECT policy is missing')
      console.log('\nAdding SELECT policy...')

      const { error: addError } = await supabase.rpc('exec', {
        sql: `CREATE POLICY IF NOT EXISTS "Users can read own profile" ON "public"."users"
              FOR SELECT
              USING (auth.uid() = id);`
      })

      if (addError) {
        console.error('Error adding SELECT policy:', addError)
      } else {
        console.log('✓ SELECT policy added successfully!')
      }
    }

  } catch (err) {
    console.error('Error:', err)
  }
}

checkPolicies()