const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client with service role key
const supabase = createClient(
  'https://fbcrucweylsfyvlzacxu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZiY3J1Y3dleWxzZnl2bHphY3h1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Nzk0NzYxNCwiZXhwIjoyMDczNTIzNjE0fQ.IS9KWd-iBvbziCIW8x78oXbJs1RXT1J80JDy087d9SE'
)

async function runMigrations() {
  try {
    console.log('Running migrations...')

    // Read migration files
    const fs = require('fs')
    const path = require('path')
    const migrationsDir = path.join(__dirname, 'supabase', 'migrations')

    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort()

    console.log('Found migration files:', migrationFiles)

    for (const file of migrationFiles) {
      console.log(`\nRunning migration: ${file}`)

      const filePath = path.join(migrationsDir, file)
      const sql = fs.readFileSync(filePath, 'utf8')

      // Execute the migration using RPC
      const { data, error } = await supabase.rpc('exec', { sql })

      if (error) {
        console.error(`Error running migration ${file}:`, error)
      } else {
        console.log(`Migration ${file} completed successfully!`)
      }
    }

    console.log('\nAll migrations completed!')

  } catch (err) {
    console.error('Error running migrations:', err)
  }
}

runMigrations()