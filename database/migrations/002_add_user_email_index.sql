-- Migration: Add Email Index
-- Description: Adds index on users.email for faster email lookups
-- Date: 2024

CREATE INDEX IF NOT EXISTS idx_users_email_lower ON users(LOWER(email));

