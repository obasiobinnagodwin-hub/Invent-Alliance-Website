-- Migration 003: Add PII hash columns for GDPR compliance
-- Adds ip_address_hash columns to visitor_sessions and page_views tables
-- This allows pseudonymized/hashed IP storage alongside original IPs for backward compatibility

-- Add ip_address_hash column to visitor_sessions table
ALTER TABLE visitor_sessions 
ADD COLUMN IF NOT EXISTS ip_address_hash VARCHAR(64);

-- Add ip_address_hash column to page_views table
ALTER TABLE page_views 
ADD COLUMN IF NOT EXISTS ip_address_hash VARCHAR(64);

-- Create indexes on hash columns for efficient querying
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_ip_address_hash 
ON visitor_sessions(ip_address_hash);

CREATE INDEX IF NOT EXISTS idx_page_views_ip_address_hash 
ON page_views(ip_address_hash);

-- Add comment for documentation
COMMENT ON COLUMN visitor_sessions.ip_address_hash IS 'SHA-256 hash of pseudonymized IP address for GDPR-compliant analytics';
COMMENT ON COLUMN page_views.ip_address_hash IS 'SHA-256 hash of pseudonymized IP address for GDPR-compliant analytics';

