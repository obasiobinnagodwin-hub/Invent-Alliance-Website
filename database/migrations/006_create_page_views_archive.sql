-- Migration 006: Create Page Views Archive Table
-- Description: Creates an aggregated archive table for page views to support
--              long-term analytics without storing raw data indefinitely.
-- Date: 2024-01-16
-- 
-- This migration is additive only - no tables or columns are dropped.
-- The archive table stores daily aggregated statistics per path.

-- ============================================================================
-- ARCHIVE TABLE
-- ============================================================================

-- Create archive table for aggregated page views
CREATE TABLE IF NOT EXISTS page_views_archive (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    path VARCHAR(500) NOT NULL,
    views INTEGER NOT NULL DEFAULT 0,
    unique_sessions INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- Ensure one record per date+path combination
    UNIQUE(date, path)
);

-- ============================================================================
-- INDEXES FOR ARCHIVE TABLE
-- ============================================================================

-- Index for date-based queries (most common)
CREATE INDEX IF NOT EXISTS idx_page_views_archive_date 
ON page_views_archive(date DESC);

-- Index for path-based queries
CREATE INDEX IF NOT EXISTS idx_page_views_archive_path 
ON page_views_archive(path);

-- Composite index for date + path queries
CREATE INDEX IF NOT EXISTS idx_page_views_archive_date_path 
ON page_views_archive(date DESC, path);

-- Index for created_at (for cleanup operations)
CREATE INDEX IF NOT EXISTS idx_page_views_archive_created_at 
ON page_views_archive(created_at);

-- ============================================================================
-- TRIGGER FOR UPDATED_AT
-- ============================================================================

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_page_views_archive_updated_at
    BEFORE UPDATE ON page_views_archive
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ANALYZE TABLE
-- ============================================================================

-- Update table statistics
ANALYZE page_views_archive;

-- Add comments for documentation
COMMENT ON TABLE page_views_archive IS 
'Aggregated daily statistics for page views. Used for long-term analytics without storing raw page view data indefinitely.';

COMMENT ON COLUMN page_views_archive.date IS 
'Date for which statistics are aggregated (YYYY-MM-DD)';

COMMENT ON COLUMN page_views_archive.path IS 
'Page path (e.g., /dashboard, /about)';

COMMENT ON COLUMN page_views_archive.views IS 
'Total number of page views for this path on this date';

COMMENT ON COLUMN page_views_archive.unique_sessions IS 
'Number of unique sessions that viewed this path on this date';

COMMENT ON INDEX idx_page_views_archive_date IS 
'Index for date-based queries. Optimizes queries filtering by date range.';

COMMENT ON INDEX idx_page_views_archive_path IS 
'Index for path-based queries. Optimizes queries filtering by specific paths.';

COMMENT ON INDEX idx_page_views_archive_date_path IS 
'Composite index for date + path queries. Optimizes queries filtering by both date and path.';

