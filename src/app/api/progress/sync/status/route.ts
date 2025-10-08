import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient()

    // Authenticate user
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get sync queue status
    const { data: queueData } = await supabase
      .from('sync_queue')
      .select('action, created_at, retry_count')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    // Get last sync info
    const { data: lastSyncData } = await supabase
      .from('user_progress')
      .select('last_sync_at, sync_version')
      .eq('user_id', user.id)
      .not('last_sync_at', 'is', null)
      .order('last_sync_at', { ascending: false })
      .limit(1)
      .single()

    // Get total progress count
    const { count } = await supabase
      .from('user_progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    return NextResponse.json({
      success: true,
      status: {
        queueLength: queueData?.length || 0,
        oldestPendingItem: queueData?.[0]?.created_at || null,
        lastSyncAt: lastSyncData?.last_sync_at || null,
        syncVersion: lastSyncData?.sync_version || 0,
        totalRecords: count || 0,
        needsSync: (queueData?.length || 0) > 0
      }
    })

  } catch (error) {
    console.error('Sync status error:', error)
    return NextResponse.json(
      { error: 'Failed to get sync status' },
      { status: 500 }
    )
  }
}