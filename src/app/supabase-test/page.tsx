'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface TestUser {
  id?: string
  fullname?: string
  email?: string
  phone?: string
  profession?: string
  organization?: string
  createdat?: string
  updatedat?: string
}

interface TestProgress {
  id?: string
  userId?: string
  dayId?: number
  completedSections?: string[]
  completedSlides?: string[]
  quizScores?: Record<string, number>
  currentSlide?: number
  isCompleted?: boolean
  completedAt?: string | null
  createdat?: string
}

export default function SupabaseTestPage() {
  const supabase = createClient()
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'failed'>('testing')
  const [testResults, setTestResults] = useState<any>({})
  const [testUser, setTestUser] = useState<TestUser>({})
  const [testProgress, setTestProgress] = useState<TestProgress>({})
  const [users, setUsers] = useState<TestUser[]>([])
  const [progress, setProgress] = useState<TestProgress[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Test connection on page load
  useEffect(() => {
    testConnection()
    fetchData()
  }, [])

  const testConnection = async () => {
    try {
      const { data, error } = await supabase.from('users').select('id').limit(1)

      if (error) {
        setConnectionStatus('failed')
        setError(error.message)
      } else {
        setConnectionStatus('connected')
      }
    } catch (err) {
      setConnectionStatus('failed')
      setError('Connection failed')
    }
  }

  const fetchData = async () => {
    try {
      const [usersData, progressData] = await Promise.all([
        supabase.from('users').select('*').limit(10),
        supabase.from('userProgress').select('*').limit(10)
      ])

      setUsers(usersData.data || [])
      setProgress(progressData.data || [])
    } catch (err) {
      console.error('Error fetching data:', err)
    }
  }

  const createTestUser = async () => {
    setLoading(true)
    setError('')

    try {
      console.log('Attempting to create user with:', testUser)

      const { data, error } = await supabase
        .from('users')
        .insert([{
          fullname: testUser.fullname || 'Test User',
          email: testUser.email || `test${Date.now()}@example.com`,
          phone: testUser.phone || '1234567890',
          profession: testUser.profession || 'working',
          organization: testUser.organization || 'Test Organization'
        }])
        .select()

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      console.log('User created successfully:', data)
      await fetchData()
      setTestUser({})
    } catch (err) {
      console.error('Create user error:', err)
      setError(err instanceof Error ? err.message : 'Failed to create user')
    } finally {
      setLoading(false)
    }
  }

  const updateTestUser = async (userId: string) => {
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          fullname: testUser.fullname,
          email: testUser.email,
          phone: testUser.phone,
          profession: testUser.profession,
          organization: testUser.organization
        })
        .eq('id', userId)

      if (error) throw error

      await fetchData()
      setTestUser({})
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user')
    } finally {
      setLoading(false)
    }
  }

  const deleteTestUser = async (userId: string) => {
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId)

      if (error) throw error

      await fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user')
    } finally {
      setLoading(false)
    }
  }

  const createTestProgress = async () => {
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase
        .from('userProgress')
        .insert([{
          userId: testProgress.userId || users[0]?.id,
          dayId: testProgress.dayId || 1,
          completedSections: testProgress.completedSections || [],
          completedSlides: testProgress.completedSlides || [],
          quizScores: testProgress.quizScores || {},
          currentSlide: testProgress.currentSlide || 0,
          isCompleted: testProgress.isCompleted || false,
          completedAt: testProgress.isCompleted ? new Date().toISOString() : null
        }])
        .select()

      if (error) throw error

      await fetchData()
      setTestProgress({})
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create progress')
    } finally {
      setLoading(false)
    }
  }

  const runComprehensiveTest = async () => {
    setLoading(true)
    setError('')
    const results: any = {}

    try {
      // Test 1: Read
      const { data: readData, error: readError } = await supabase.from('users').select('*').limit(5)
      results.read = { success: !readError, count: readData?.length || 0, error: readError?.message }

      // Test 2: Create
      if (users.length === 0) {
        const { data: createData, error: createError } = await supabase
          .from('users')
          .insert([{
            fullname: 'CRUD Test User',
            email: `crud.test.${Date.now()}@example.com`,
            phone: '1234567890',
            profession: 'working',
            organization: 'Test Organization'
          }])
          .select()

        results.create = { success: !createError, data: createData, error: createError?.message }

        if (createData && createData[0]) {
          // Test 3: Update
          const { data: updateData, error: updateError } = await supabase
            .from('users')
            .update({ fullname: 'Updated CRUD Test User' })
            .eq('id', createData[0].id)
            .select()

          results.update = { success: !updateError, data: updateData, error: updateError?.message }

          // Test 4: Delete
          const { error: deleteError } = await supabase
            .from('users')
            .delete()
            .eq('id', createData[0].id)

          results.delete = { success: !deleteError, error: deleteError?.message }
        }
      }

      setTestResults(results)
      await fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Comprehensive test failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Supabase CRUD Test Page</h1>

      {/* Connection Status */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
        <div className={`p-4 rounded-lg ${
          connectionStatus === 'connected' ? 'bg-green-100 text-green-800' :
          connectionStatus === 'failed' ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          Status: {connectionStatus.toUpperCase()}
          {error && <div className="mt-2 text-sm">Error: {error}</div>}
        </div>

        {connectionStatus === 'connected' && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Database Access Note</h3>
            <p className="text-sm text-blue-700 mb-2">
              The database connection is working, but you may encounter permission errors when trying to create/update records.
            </p>
            <div className="text-xs text-blue-600">
              <p><strong>Common issues:</strong></p>
              <ul className="list-disc ml-4 mt-1">
                <li>Row Level Security (RLS) policies may restrict insert operations</li>
                <li>The API key may not have write permissions</li>
                <li>Required fields may be missing or incorrectly formatted</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Comprehensive Test */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Comprehensive CRUD Test</h2>
        <button
          onClick={runComprehensiveTest}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Run CRUD Test
        </button>

        {Object.keys(testResults).length > 0 && (
          <div className="mt-4 space-y-2">
            {Object.entries(testResults).map(([test, result]: [string, any]) => (
              <div key={test} className={`p-3 rounded ${
                result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}>
                <strong>{test.toUpperCase()}:</strong> {result.success ? 'SUCCESS' : 'FAILED'}
                {result.error && <div className="text-sm mt-1">Error: {result.error}</div>}
                {result.count && <div className="text-sm mt-1">Records: {result.count}</div>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User CRUD Operations */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">User CRUD Operations</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Full Name"
              value={testUser.fullname || ''}
              onChange={(e) => setTestUser({...testUser, fullname: e.target.value})}
              className="w-full p-2 border rounded"
            />
            <input
              type="email"
              placeholder="Email"
              value={testUser.email || ''}
              onChange={(e) => setTestUser({...testUser, email: e.target.value})}
              className="w-full p-2 border rounded"
            />
            <input
              type="tel"
              placeholder="Phone"
              value={testUser.phone || ''}
              onChange={(e) => setTestUser({...testUser, phone: e.target.value})}
              className="w-full p-2 border rounded"
            />
            <select
              value={testUser.profession || ''}
              onChange={(e) => setTestUser({...testUser, profession: e.target.value})}
              className="w-full p-2 border rounded"
            >
              <option value="">Select Profession</option>
              <option value="student">Student</option>
              <option value="working">Working Professional</option>
            </select>
            <input
              type="text"
              placeholder="Organization"
              value={testUser.organization || ''}
              onChange={(e) => setTestUser({...testUser, organization: e.target.value})}
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="space-y-2">
            <button
              onClick={createTestUser}
              disabled={loading}
              className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
            >
              Create User
            </button>
          </div>
        </div>
      </div>

      {/* Progress CRUD Operations */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Progress CRUD Operations</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <select
              value={testProgress.userId || ''}
              onChange={(e) => setTestProgress({...testProgress, userId: e.target.value})}
              className="w-full p-2 border rounded"
            >
              <option value="">Select User</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.fullname}
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Day (1-5)"
              min="1"
              max="5"
              value={testProgress.dayId || ''}
              onChange={(e) => setTestProgress({...testProgress, dayId: parseInt(e.target.value)})}
              className="w-full p-2 border rounded"
            />
            <input
              type="number"
              placeholder="Current Slide"
              min="0"
              value={testProgress.currentSlide || ''}
              onChange={(e) => setTestProgress({...testProgress, currentSlide: parseInt(e.target.value)})}
              className="w-full p-2 border rounded"
            />
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={testProgress.isCompleted || false}
                onChange={(e) => setTestProgress({...testProgress, isCompleted: e.target.checked})}
                className="rounded"
              />
              <span>Completed</span>
            </label>
          </div>

          <div className="space-y-2">
            <button
              onClick={createTestProgress}
              disabled={loading}
              className="w-full bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
            >
              Create Progress
            </button>
          </div>
        </div>
      </div>

      {/* Data Display */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-3">Users ({users.length})</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {users.map(user => (
              <div key={user.id} className="p-3 border rounded bg-gray-50">
                <div className="font-medium">{user.fullname}</div>
                <div className="text-sm text-gray-600">{user.email}</div>
                <div className="text-sm text-gray-500">{user.phone} • {user.profession}</div>
                <div className="text-sm text-gray-500">{user.organization}</div>
                <div className="text-xs text-gray-500">Created: {user.createdat}</div>
                <div className="mt-2 space-x-2">
                  <button
                    onClick={() => setTestUser(user)}
                    className="text-xs bg-blue-500 text-white px-2 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteTestUser(user.id!)}
                    className="text-xs bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Progress Records ({progress.length})</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {progress.map(item => (
              <div key={item.id} className="p-3 border rounded bg-gray-50">
                <div className="font-medium">Day {item.dayId}</div>
                <div className="text-sm">Current Slide: {item.currentSlide}</div>
                <div className="text-sm">Completed: {item.isCompleted ? 'Yes' : 'No'}</div>
                <div className="text-xs text-gray-500">
                  Sections: {item.completedSections?.length || 0} |
                  Slides: {item.completedSlides?.length || 0}
                </div>
                <div className="text-xs text-gray-500">User ID: {item.userId}</div>
                <div className="text-xs text-gray-500">Created: {item.createdat}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}