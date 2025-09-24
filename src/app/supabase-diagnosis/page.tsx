'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface TableInfo {
  accessible: boolean
  error?: string
  hasData?: boolean
  columns?: string[]
}

export default function SupabaseDiagnosisPage() {
  const supabase = createClient()
  const [tableInfo, setTableInfo] = useState<Record<string, TableInfo>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    diagnoseDatabase()
  }, [])

  const diagnoseDatabase = async () => {
    setLoading(true)
    setError('')

    try {
      const results: Record<string, TableInfo> = {}

      // Test all possible table name variations
      const tableVariations = [
        'users',
        'user_progress',
        'userprogress',
        'userProgress',
        'user_badges',
        'userbadges',
        'userBadges',
        'sessions',
        'user_sessions'
      ]

      for (const tableName of tableVariations) {
        try {
          // Test basic access
          const { data, error } = await supabase.from(tableName).select('*').limit(1)

          if (error) {
            results[tableName] = {
              accessible: false,
              error: error.message
            }
          } else {
            // Try to get column information
            let columns: string[] = []
            if (data && data.length > 0) {
              columns = Object.keys(data[0])
            }

            results[tableName] = {
              accessible: true,
              hasData: data && data.length > 0,
              columns: columns
            }
          }
        } catch (err) {
          results[tableName] = {
            accessible: false,
            error: err instanceof Error ? err.message : 'Unknown error'
          }
        }
      }

      setTableInfo(results)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Diagnosis failed')
    } finally {
      setLoading(false)
    }
  }

  const getTableStatus = (tableName: string, info: TableInfo) => {
    if (!info.accessible) {
      return (
        <div className="text-red-600">
          ✗ {info.error || 'Not accessible'}
        </div>
      )
    }

    return (
      <div className="text-green-600">
        ✓ Accessible {info.hasData && '(has data)'}
        {info.columns && info.columns.length > 0 && (
          <div className="text-xs text-gray-500 mt-1">
            Columns: {info.columns.join(', ')}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Supabase Database Diagnosis</h1>

      {/* Summary */}
      <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h2 className="text-xl font-semibold text-blue-800 mb-3">Database Issues Found</h2>
        <div className="space-y-2 text-blue-700">
          <p><strong>1. Table Names:</strong> The correct table names use underscores (snake_case):</p>
          <ul className="list-disc ml-6">
            <li>✓ <code>users</code> - exists but has RLS restrictions</li>
            <li>✓ <code>user_badges</code> - exists but has RLS restrictions</li>
            <li>✓ <code>sessions</code> - exists but has RLS restrictions</li>
            <li>✗ <code>userProgress</code> - DOES NOT EXIST</li>
            <li>✗ <code>userBadges</code> - DOES NOT EXIST</li>
          </ul>

          <p className="mt-3"><strong>2. RLS Policies:</strong> All tables have Row Level Security preventing read/write operations</p>
          <p className="mt-3"><strong>3. Missing Table:</strong> The <code>user_progress</code> table doesn't exist - needs to be created</p>
        </div>
      </div>

      {/* Table Diagnosis Results */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Table Diagnosis Results</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(tableInfo).map(([tableName, info]) => (
            <div key={tableName} className="p-4 border rounded bg-gray-50">
              <div className="font-mono text-sm font-medium">{tableName}</div>
              <div className="mt-2">
                {getTableStatus(tableName, info)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Solutions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Required Solutions</h2>
        <div className="space-y-4">

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">1. Create Missing Table</h3>
            <p className="text-sm text-yellow-700 mb-2">
              Create the <code>user_progress</code> table in Supabase:
            </p>
            <pre className="bg-gray-800 text-green-400 p-3 rounded text-xs overflow-x-auto">
{`CREATE TABLE user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  day_id INTEGER NOT NULL,
  current_slide INTEGER DEFAULT 0,
  completed_sections TEXT[] DEFAULT '{}',
  completed_slides TEXT[] DEFAULT '{}',
  quiz_scores JSONB DEFAULT '{}',
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_day_id ON user_progress(day_id);
CREATE UNIQUE INDEX idx_user_progress_user_day ON user_progress(user_id, day_id);`}
            </pre>
          </div>

          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <h3 className="font-semibold text-orange-800 mb-2">2. Update RLS Policies</h3>
            <p className="text-sm text-orange-700 mb-2">
              Modify Row Level Security policies to allow authenticated users to access their data:
            </p>
            <pre className="bg-gray-800 text-orange-400 p-3 rounded text-xs overflow-x-auto">
{`-- Users table - allow users to read their own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own data" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- User progress table - allow users to manage their progress
CREATE POLICY "Users can read own progress" ON user_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON user_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;`}
            </pre>
          </div>

          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">3. Update Application Code</h3>
            <p className="text-sm text-green-700">
              Change all references from <code>userProgress</code> to <code>user_progress</code> and <code>userBadges</code> to <code>user_badges</code>
            </p>
          </div>

        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={diagnoseDatabase}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Diagnosing...' : 'Re-run Diagnosis'}
        </button>

        <a
          href="https://fbcrucweylsfyvlzacxu.supabase.co/project/default/editor"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
        >
          Open Supabase Dashboard
        </a>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="font-semibold text-red-800">Diagnosis Error</h3>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

    </div>
  )
}