const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client with service role key
const supabase = createClient(
  'https://fbcrucweylsfyvlzacxu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZiY3J1Y3dleWxzZnl2bHphY3h1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Nzk0NzYxNCwiZXhwIjoyMDczNTIzNjE0fQ.IS9KWd-iBvbziCIW8x78oXbJs1RXT1J80JDy087d9SE'
)

async function addSelectPolicy() {
  try {
    console.log('Adding SELECT policy for users table...')

    // Create the policy using RPC
    const { data, error } = await supabase.rpc('exec', {
      sql: `CREATE POLICY IF NOT EXISTS "Users can read own profile" ON "public"."users" FOR SELECT USING (auth.uid() = id);`
    })

    if (error) {
      console.error('Error adding policy:', error)
    } else {
      console.log('Policy added successfully!')
    }
  } catch (err) {
    console.error('Error:', err)
  }
}

addSelectPolicy()