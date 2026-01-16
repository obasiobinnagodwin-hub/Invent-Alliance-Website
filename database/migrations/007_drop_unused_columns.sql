-- ============================================================================
-- ⚠️  WARNING: DO NOT APPLY UNTIL CONFIRMED UNUSED IN PRODUCTION  ⚠️
-- ============================================================================
--
-- This migration removes columns that are defined in the schema but appear
-- to be unused based on code analysis. However, these columns may be:
-- 1. Used by external tools or scripts not in this repository
-- 2. Referenced in database views, functions, or triggers
-- 3. Used by reporting tools or BI dashboards
-- 4. Planned for future use
--
-- BEFORE APPLYING THIS MIGRATION:
-- 1. Review docs/schema-cleanup-checklist.md
-- 2. Verify columns are truly unused using the checklist
-- 3. Check production database for any data in these columns
-- 4. Confirm with stakeholders that these columns are not needed
-- 5. Test on staging environment first
-- 6. Have a rollback plan ready
--
-- This migration is NOT part of any automated pipeline.
-- It must be manually reviewed and applied by a database administrator.
--
-- ============================================================================
-- Migration 007: Drop Unused Columns
-- Description: Removes columns that are defined but never populated or queried
-- Date: 2024-01-16
-- 
-- Columns to be removed:
-- - visitor_sessions.country
-- - visitor_sessions.city
-- - visitor_sessions.device_type
-- - visitor_sessions.browser
-- - visitor_sessions.os
-- - system_metrics.request_size
-- - system_metrics.response_size
--
-- ============================================================================

-- ============================================================================
-- DROP UNUSED COLUMNS FROM visitor_sessions TABLE
-- ============================================================================

-- Drop country column (if exists)
ALTER TABLE visitor_sessions DROP COLUMN IF EXISTS country;

-- Drop city column (if exists)
ALTER TABLE visitor_sessions DROP COLUMN IF EXISTS city;

-- Drop device_type column (if exists)
ALTER TABLE visitor_sessions DROP COLUMN IF EXISTS device_type;

-- Drop browser column (if exists)
ALTER TABLE visitor_sessions DROP COLUMN IF EXISTS browser;

-- Drop os column (if exists)
ALTER TABLE visitor_sessions DROP COLUMN IF EXISTS os;

-- ============================================================================
-- DROP UNUSED COLUMNS FROM system_metrics TABLE
-- ============================================================================

-- Drop request_size column (if exists)
ALTER TABLE system_metrics DROP COLUMN IF EXISTS request_size;

-- Drop response_size column (if exists)
ALTER TABLE system_metrics DROP COLUMN IF EXISTS response_size;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify columns have been dropped (uncomment to check)
-- SELECT column_name 
-- FROM information_schema.columns 
-- WHERE table_name = 'visitor_sessions' 
--   AND column_name IN ('country', 'city', 'device_type', 'browser', 'os');
-- 
-- SELECT column_name 
-- FROM information_schema.columns 
-- WHERE table_name = 'system_metrics' 
--   AND column_name IN ('request_size', 'response_size');

-- ============================================================================
-- NOTES
-- ============================================================================
--
-- After dropping columns:
-- 1. Update database/schema.sql to reflect the new structure
-- 2. Update any documentation that references these columns
-- 3. Verify application still works correctly
-- 4. Monitor for any errors related to missing columns
--
-- If you need to rollback (add columns back):
-- ALTER TABLE visitor_sessions ADD COLUMN country VARCHAR(100);
-- ALTER TABLE visitor_sessions ADD COLUMN city VARCHAR(100);
-- ALTER TABLE visitor_sessions ADD COLUMN device_type VARCHAR(50);
-- ALTER TABLE visitor_sessions ADD COLUMN browser VARCHAR(100);
-- ALTER TABLE visitor_sessions ADD COLUMN os VARCHAR(100);
-- ALTER TABLE system_metrics ADD COLUMN request_size INTEGER;
-- ALTER TABLE system_metrics ADD COLUMN response_size INTEGER;

