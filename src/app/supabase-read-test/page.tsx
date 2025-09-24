'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function SupabaseReadTestPage() {
  const supabase = createClient()
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'failed'>('testing')
  const [users, setUsers] = useState<any[]>([])
  const [progress, setProgress] = useState<any[]>([])
  const [tableInfo, setTableInfo] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Test connection and fetch data on page load
  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    setLoading(true)
    setError('')

    try {
      // Test basic connection
      const { data: testData, error: testError } = await supabase.from('users').select('id').limit(1)

      if (testError) {
        setConnectionStatus('failed')
        setError(testError.message)
        return
      }

      setConnectionStatus('connected')

      // Fetch all data
      const [usersData, badgesData] = await Promise.all([
        supabase.from('users').select('*').limit(10),
        supabase.from('user_badges').select('*').limit(10)
      ])

      setUsers(usersData.data || [])
      setProgress(badgesData.data || [])

      // Get table schema info
      const tables = ['users', 'user_badges', 'sessions']
      const schemaInfo: Record<string, any> = {}

      for (const table of tables) {
        try {
          const { data, error } = await supabase.from(table).select('*').limit(1)
          schemaInfo[table] = {
            accessible: !error,
            error: error?.message,
            hasData: data && data.length > 0
          }
        } catch (err) {
          schemaInfo[table] = {
            accessible: false,
            error: err instanceof Error ? err.message : 'Unknown error'
          }
        }
      }

      setTableInfo(schemaInfo)

    } catch (err) {
      setConnectionStatus('failed')
      setError(err instanceof Error ? err.message : 'Connection failed')
    } finally {
      setLoading(false)
    }
  }

  const getSchemaDisplay = (tableName: string) => {
    const info = tableInfo[tableName]
    if (!info) return 'Not tested'

    if (info.accessible) {
      return (
        <div className="text-green-600">
          ✓ Accessible {info.hasData && '(has data)'}
        </div>
      )
    } else {
      return (
        <div className="text-red-600">
          ✗ {info.error || 'Not accessible'}
        </div>
      )
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Supabase Read-Only Test</h1>

      {/* Connection Status */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
        <div className={`p-4 rounded-lg ${
          connectionStatus === 'connected' ? 'bg-green-100 text-green-800' :
          connectionStatus === 'failed' ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          <div className="font-medium">Status: {connectionStatus.toUpperCase()}</div>
          {error && <div className="mt-2 text-sm">Error: {error}</div>}
        </div>

        {connectionStatus === 'connected' && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">✓ Database Connection Successful</h3>
            <p className="text-sm text-green-700">
              The application can successfully connect to Supabase and read data. The connection is working properly.
            </p>
          </div>
        )}
      </div>

      {/* Table Schema Information */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Table Access Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(tableInfo).map(([tableName, info]) => (
            <div key={tableName} className="p-4 border rounded bg-gray-50">
              <div className="font-medium">{tableName}</div>
              <div className="text-sm mt-1">
                {getSchemaDisplay(tableName)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Data Display */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-3">Users ({users.length})</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {users.length === 0 ? (
              <div className="p-4 border rounded bg-gray-50 text-gray-500 text-center">
                No users found
              </div>
            ) : (
              users.map(user => (
                <div key={user.id} className="p-3 border rounded bg-gray-50">
                  <div className="font-medium">{user.fullname || 'No name'}</div>
                  <div className="text-sm text-gray-600">{user.email || 'No email'}</div>
                  <div className="text-xs text-gray-500">
                    {user.profession && `${user.profession} • `}
                    {user.organization && `${user.organization}`}
                  </div>
                  <div className="text-xs text-gray-400">
                    ID: {user.id}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">User Badges ({progress.length})</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {progress.length === 0 ? (
              <div className="p-4 border rounded bg-gray-50 text-gray-500 text-center">
                No badges found
              </div>
            ) : (
              progress.map(item => (
                <div key={item.id} className="p-3 border rounded bg-gray-50">
                  <div className="font-medium">
                    {item.badge_id || item.badgeId || 'Unknown Badge'}
                  </div>
                  <div className="text-sm">
                    User ID: {item.user_id || item.userId}
                  </div>
                  <div className="text-xs text-gray-400">
                    Created: {item.created_at || item.createdat || 'Unknown'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex space-x-4">
        <button
          onClick={testConnection}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Refresh Data'}
        </button>
      </div>

      {/* Console Instructions */}
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold mb-2">Debug Information</h3>
        <p className="text-sm text-gray-700 mb-2">
          Open the browser console (F12) to see detailed error messages and debugging information.
        </p>
        <div className="text-xs text-gray-600">
          <p><strong>If you see permission errors:</strong></p>
          <ul className="list-disc ml-4 mt-1">
            <li>This is normal - RLS policies may restrict write operations</li>
            <li>The connection is working if you can see the table status above</li>
            <li>Read operations should work fine for testing the connection</li>
          </ul>
        </div>
      </div>
    </div>
  )
}