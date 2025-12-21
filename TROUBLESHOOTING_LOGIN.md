# Troubleshooting Login Issues

## Problem: admin/admin123 not working

If you're getting "Invalid username or password" errors, here are the solutions:

## Solution 1: Use In-Memory Authentication (Quick Fix)

If you haven't set up PostgreSQL yet, use in-memory authentication:

1. **Check your `.env.local` file:**
   - Make sure `USE_DATABASE` is NOT set, or set it to `false`:
   ```env
   USE_DATABASE=false
   ```
   - Or simply remove the `USE_DATABASE` line

2. **Restart your dev server:**
   ```bash
   npm run dev
   ```

3. **Try logging in again** with:
   - Username: `admin`
   - Password: `admin123`

## Solution 2: Set Up Database Properly

If you want to use database authentication:

### Step 1: Install and Start PostgreSQL
```bash
# Check if PostgreSQL is running
psql -U postgres -c "SELECT NOW();"
```

### Step 2: Create Database and Run Schema
```bash
# Create database
psql -U postgres
CREATE DATABASE ial_analytics;
\q

# Run schema
psql -U postgres -d ial_analytics -f database/schema.sql
```

### Step 3: Create Admin User
```bash
# Using the helper script
node scripts/create-admin-user.js admin admin123

# Or manually in psql:
psql -U postgres -d ial_analytics
```

Then run this SQL (replace the hash with one generated from bcrypt):
```sql
INSERT INTO users (username, password_hash, email, role, is_active)
VALUES (
    'admin',
    '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'admin@inventallianceco.com',
    'admin',
    TRUE
)
ON CONFLICT (username) 
DO UPDATE SET password_hash = EXCLUDED.password_hash;
```

### Step 4: Verify Database Configuration
Make sure your `.env.local` has:
```env
USE_DATABASE=true
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ial_analytics
DB_USER=postgres
DB_PASSWORD=your_password
```

## Solution 3: Check Error Messages

Check your server console for specific error messages:

1. **"Database connection failed"**
   - PostgreSQL is not running
   - Wrong database credentials
   - Database doesn't exist

2. **"Invalid username or password"**
   - User doesn't exist in database
   - Password hash doesn't match
   - User account is disabled

3. **"Authentication service configuration error"**
   - `JWT_SECRET` is not set or is the default value

## Quick Diagnostic

Run this to check your current setup:
```bash
# Check if USE_DATABASE is set
grep USE_DATABASE .env.local

# Check database connection (if USE_DATABASE=true)
psql -U postgres -d ial_analytics -c "SELECT username, is_active FROM users WHERE username='admin';"
```

## Default Behavior

- **If `USE_DATABASE` is NOT set or `false`**: Uses in-memory authentication (admin/admin123 works immediately)
- **If `USE_DATABASE=true`**: Requires PostgreSQL database with admin user created

