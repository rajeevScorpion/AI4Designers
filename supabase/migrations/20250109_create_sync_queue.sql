-- =============================================
-- Migration: Create sync_queue table for offline sync tracking
-- Version: 20250109_create_sync_queue
-- Date: 2025-01-09
-- Description: Creates sync_queue table to track pending sync operations
-- =============================================

-- Create sync_queue table for tracking pending sync operations
CREATE TABLE IF NOT EXISTS sync_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    data JSONB DEFAULT '{}',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'syncing', 'completed', 'failed')),
    retry_count INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    synced_at TIMESTAMPTZ
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sync_queue_user_id ON sync_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON sync_queue(status);
CREATE INDEX IF NOT EXISTS idx_sync_queue_created_at ON sync_queue(created_at);
CREATE INDEX IF NOT EXISTS idx_sync_queue_table_record ON sync_queue(table_name, record_id);

-- Enable Row Level Security
ALTER TABLE sync_queue ENABLE ROW LEVEL SECURITY;

-- Add trigger for updated_at
CREATE TRIGGER handle_sync_queue_updated_at
    BEFORE UPDATE ON sync_queue
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- Add comments for documentation
COMMENT ON TABLE sync_queue IS 'Queue for tracking pending sync operations in offline-first architecture';
COMMENT ON COLUMN sync_queue.user_id IS 'User ID who owns the sync operation';
COMMENT ON COLUMN sync_queue.table_name IS 'Table name being synced (e.g., user_progress)';
COMMENT ON COLUMN sync_queue.record_id IS 'ID of the record being synced';
COMMENT ON COLUMN sync_queue.action IS 'Type of operation: INSERT, UPDATE, or DELETE';
COMMENT ON COLUMN sync_queue.data IS 'JSON data for the sync operation';
COMMENT ON COLUMN sync_queue.status IS 'Current status: pending, syncing, completed, or failed';
COMMENT ON COLUMN sync_queue.retry_count IS 'Number of retry attempts';
COMMENT ON COLUMN sync_queue.error_message IS 'Error message if sync failed';
COMMENT ON COLUMN sync_queue.synced_at IS 'Timestamp when sync was completed';

-- =============================================
-- Verification
-- =============================================

-- Verify table creation
SELECT 'sync_queue table created successfully' as status;

-- Show table structure
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'sync_queue'
ORDER BY ordinal_position;