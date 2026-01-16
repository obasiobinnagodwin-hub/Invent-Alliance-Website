-- Migration 005: Add Performance Indexes for Analytics Queries
-- Description: Adds composite indexes and partial indexes to optimize analytics queries
--              and support efficient data retention operations
-- Date: 2024-01-16
-- 
-- This migration is additive only - no tables or columns are dropped.
-- All indexes use CREATE INDEX IF NOT EXISTS to allow safe re-runs.

-- ============================================================================
-- COMPOSITE INDEXES FOR PAGE_VIEWS
-- ============================================================================

-- Composite index for timestamp DESC + path queries (common in analytics dashboards)
-- Optimizes queries like: SELECT * FROM page_views WHERE path = 'X' ORDER BY timestamp DESC
CREATE INDEX IF NOT EXISTS idx_page_views_timestamp_desc_path 
ON page_views(timestamp DESC, path);

-- Composite index for session_id + timestamp DESC queries
-- Optimizes queries that fetch page views for a session ordered by time
-- Example: SELECT * FROM page_views WHERE session_id = 'X' ORDER BY timestamp DESC
CREATE INDEX IF NOT EXISTS idx_page_views_session_timestamp_desc 
ON page_views(session_id, timestamp DESC);

-- ============================================================================
-- PARTIAL INDEX FOR ACTIVE SESSIONS (Last 24 Hours)
-- ============================================================================

-- Partial index for visitor_sessions active in the last 24 hours
-- This index only includes rows where last_activity is within 24 hours
-- Significantly reduces index size and improves query performance for active session lookups
-- 
-- Note: PostgreSQL will automatically use this index for queries filtering by last_activity
-- when the filter matches the partial index condition (last 24 hours)
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_active_24h 
ON visitor_sessions(last_activity DESC) 
WHERE last_activity >= (CURRENT_TIMESTAMP - INTERVAL '24 hours');

-- ============================================================================
-- RETENTION JOB SUPPORT INDEXES
-- ============================================================================

-- Index for retention cleanup operations on page_views
-- Optimizes DELETE queries that filter by created_at (or timestamp) for retention policies
-- Example: DELETE FROM page_views WHERE created_at < '2024-01-01'
CREATE INDEX IF NOT EXISTS idx_page_views_created_at_retention 
ON page_views(created_at);

-- Index for retention cleanup on visitor_sessions
-- Optimizes DELETE queries for old sessions based on start_time
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_start_time_retention 
ON visitor_sessions(start_time);

-- Index for retention cleanup on system_metrics
-- Optimizes DELETE queries for old metrics based on created_at
CREATE INDEX IF NOT EXISTS idx_system_metrics_created_at_retention 
ON system_metrics(created_at);

-- ============================================================================
-- ANALYZE TABLES FOR QUERY PLANNER
-- ============================================================================

-- Update table statistics to help PostgreSQL query planner make better decisions
-- This should be run after index creation to ensure optimal query plans
ANALYZE page_views;
ANALYZE visitor_sessions;
ANALYZE system_metrics;

-- Add comments for documentation
COMMENT ON INDEX idx_page_views_timestamp_desc_path IS 
'Composite index for timestamp DESC + path queries. Optimizes analytics dashboard queries filtering by path and ordering by time.';

COMMENT ON INDEX idx_page_views_session_timestamp_desc IS 
'Composite index for session_id + timestamp DESC. Optimizes queries fetching page views for a specific session ordered by time.';

COMMENT ON INDEX idx_visitor_sessions_active_24h IS 
'Partial index for active sessions in last 24 hours. Reduces index size and improves performance for active session lookups.';

COMMENT ON INDEX idx_page_views_created_at_retention IS 
'Index for retention job cleanup operations. Optimizes DELETE queries filtering by created_at for data retention policies.';

COMMENT ON INDEX idx_visitor_sessions_start_time_retention IS 
'Index for retention job cleanup operations. Optimizes DELETE queries filtering by start_time for old session removal.';

COMMENT ON INDEX idx_system_metrics_created_at_retention IS 
'Index for retention job cleanup operations. Optimizes DELETE queries filtering by created_at for old metrics removal.';

