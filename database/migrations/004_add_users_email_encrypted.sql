-- Migration 004: Add encrypted email column for users table
-- Adds email_encrypted column to support optional email encryption at rest
-- Original email column remains for backward compatibility during transition

-- Add email_encrypted column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS email_encrypted TEXT;

-- Create index on encrypted email for lookups (if needed)
-- Note: Encrypted data cannot be efficiently searched, but index helps with NULL checks
CREATE INDEX IF NOT EXISTS idx_users_email_encrypted 
ON users(email_encrypted) 
WHERE email_encrypted IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN users.email_encrypted IS 'AES-256-GCM encrypted email address. Format: iv:authTag:ciphertext (all base64). Original email column retained for backward compatibility.';

