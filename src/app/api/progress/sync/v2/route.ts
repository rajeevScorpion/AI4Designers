import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

// Enhanced sync with versioning and delta sync support
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const {
      lastSyncVersion, // Client's last sync version
      clientChanges,  // Changes from client since last sync
      fullSync = false // Force full sync
    } = body

    // Get current sync version from database
    const { data: syncData } = await supabase
      .rpc('get_sync_version', {
        p_user_id: user.id
      })

    const currentServerVersion = syncData?.[0]?.current_version || 0

    // If client version is too old or full sync requested, do full sync
    if (fullSync || !lastSyncVersion || lastSyncVersion < currentServerVersion - 100) {
      return await performFullSync(supabase, user.id, clientChanges)
    }

    // Otherwise, do delta sync
    return await performDeltaSync(supabase, user.id, lastSyncVersion, clientChanges)

  } catch (error) {
    console.error('Sync v2 error:', error)
    return NextResponse.json(
      { error: 'Failed to sync', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}

// Full sync - returns all data
async function performFullSync(supabase: any, userId: string, clientChanges?: any[]) {
  // First, apply client changes if any
  if (clientChanges && clientChanges.length > 0) {
    await applyClientChanges(supabase, userId, clientChanges)
  }

  // Get all progress for user
  const { data: allProgress } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  // Get current sync version
  const { data: syncData } = await supabase
    .rpc('get_sync_version', { p_user_id: userId })

  const currentVersion = syncData?.[0]?.current_version || 0

  return NextResponse.json({
    success: true,
    syncType: 'full',
    serverVersion: currentVersion,
    changes: allProgress,
    conflicts: [],
    message: 'Full sync completed'
  })
}

// Delta sync - returns only changes since last sync
async function performDeltaSync(supabase: any, userId: string, lastSyncVersion: number, clientChanges?: any[]) {
  const conflicts: any[] = []
  const appliedChanges: any[] = []

  // Apply client changes
  if (clientChanges && clientChanges.length > 0) {
    for (const change of clientChanges) {
      try {
        const result = await applySingleChange(supabase, userId, change)
        if (result.conflict) {
          conflicts.push(result.conflict)
        } else if (result.applied) {
          appliedChanges.push(result.applied)
        }
      } catch (error) {
        console.error('Failed to apply change:', change, error)
      }
    }
  }

  // Get server changes since last sync
  const { data: serverChanges } = await supabase
    .rpc('get_changes_since_sync', {
      p_user_id: userId,
      p_sync_version: lastSyncVersion
    })

  // Get current sync version
  const { data: syncData } = await supabase
    .rpc('get_sync_version', { p_user_id: userId })

  const currentVersion = syncData?.[0]?.current_version || 0

  return NextResponse.json({
    success: true,
    syncType: 'delta',
    serverVersion: currentVersion,
    clientVersion: lastSyncVersion,
    serverChanges: serverChanges || [],
    appliedChanges,
    conflicts: conflicts.length > 0 ? conflicts : undefined,
    message: `Delta sync: ${serverChanges?.length || 0} server changes, ${appliedChanges.length} client changes applied`
  })
}

// Apply a single change from client
async function applySingleChange(supabase: any, userId: string, change: any) {
  const { dayId, action, data, clientId, clientVersion } = change

  // Check for existing record
  const { data: existing } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('day_id', dayId)
    .single()

  if (existing) {
    // Check for conflict
    if (existing.sync_version > clientVersion) {
      // Conflict detected
      return {
        conflict: {
          dayId,
          serverData: existing,
          clientData: data,
          resolution: 'manual'
        }
      }
    }

    // Update existing record
    const { data: updated } = await supabase
      .from('user_progress')
      .update({
        completed_sections: data.completedSections || existing.completed_sections,
        completed_slides: data.completedSlides || existing.completed_slides,
        quiz_scores: data.quizScores || existing.quiz_scores,
        current_slide: data.currentSlide !== undefined ? data.currentSlide : existing.current_slide,
        is_completed: data.isCompleted !== undefined ? data.isCompleted : existing.is_completed,
        completed_at: data.isCompleted && !existing.is_completed ? new Date() : existing.completed_at,
        sync_version: existing.sync_version + 1,
        last_sync_at: new Date(),
        client_id: clientId,
        updated_at: new Date()
      })
      .eq('id', existing.id)
      .select()
      .single()

    return { applied: updated }
  } else {
    // Create new record
    const { data: created } = await supabase
      .from('user_progress')
      .insert({
        user_id: userId,
        day_id: dayId,
        completed_sections: data.completedSections || [],
        completed_slides: data.completedSlides || [],
        quiz_scores: data.quizScores || {},
        current_slide: data.currentSlide || 0,
        is_completed: data.isCompleted || false,
        completed_at: data.isCompleted ? new Date() : null,
        sync_version: 1,
        last_sync_at: new Date(),
        client_id: clientId
      })
      .select()
      .single()

    return { applied: created }
  }
}

// Apply multiple client changes
async function applyClientChanges(supabase: any, userId: string, changes: any[]) {
  const results = []

  for (const change of changes) {
    try {
      const result = await applySingleChange(supabase, userId, change)
      results.push(result)
    } catch (error) {
      console.error('Failed to apply client change:', change, error)
    }
  }

  return results
}