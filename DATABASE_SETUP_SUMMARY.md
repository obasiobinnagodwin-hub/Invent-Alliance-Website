# PostgreSQL Database Setup - Quick Summary

## What Was Created

### Database Files
- `database/schema.sql` - Complete PostgreSQL schema with tables, indexes, triggers, and views
- `database/migrations/` - Migration scripts for version control
- `database/seed.sql` - Test data seeding script
- `database/README.md` - Comprehensive setup guide

### Code Files
- `lib/db.ts` - Database connection pool utility
- `lib/auth-db.ts` - Database-backed authentication system
- `lib/analytics-db.ts` - Database-backed analytics system

### Documentation
- `DATABASE_MIGRATION.md` - Step-by-step migration guide
- `scripts/setup-database.js` - Automated database setup script

## Quick Start

### 1. Install PostgreSQL and Dependencies
```bash
# Install PostgreSQL (if not already installed)
# Then install Node.js dependencies
npm install pg @types/pg
```

### 2. Create Database
```bash
psql -U postgres
CREATE DATABASE ial_analytics;
\q
```

### 3. Set Environment Variables
Add to `.env.local`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ial_analytics
DB_USER=postgres
DB_PASSWORD=your_password
DB_SSL=false
```

### 4. Run Schema Migration
```bash
psql -U postgres -d ial_analytics -f database/schema.sql
```

### 5. Update Code to Use Database

**Option A: Update imports** (recommended for clean codebase)
- Change `@/lib/auth` → `@/lib/auth-db` in auth routes
- Change `@/lib/analytics` → `@/lib/analytics-db` in analytics routes and middleware

**Option B: Create wrapper files** (easier migration)
- Create `lib/auth.ts` that re-exports from `auth-db.ts`
- Create `lib/analytics.ts` that re-exports from `analytics-db.ts`

## Database Schema Overview

### Tables
1. **users** - Authentication credentials (username, password_hash, role)
2. **user_sessions** - Active login sessions with JWT tokens
3. **visitor_sessions** - Website visitor tracking sessions
4. **page_views** - Individual page view records
5. **system_metrics** - API performance and error tracking

### Key Features
- ✅ UUID primary keys
- ✅ Automatic timestamps (created_at, updated_at)
- ✅ Foreign key relationships
- ✅ Comprehensive indexes for performance
- ✅ Automatic triggers for data consistency
- ✅ Views for common queries
- ✅ Data retention (30 days default)

## Default Credentials

**Admin User:**
- Username: `admin`
- Password: `admin123`
- **⚠️ Change this immediately in production!**

To change password:
```sql
-- Generate hash: bcrypt.hashSync('new-password', 10)
UPDATE users 
SET password_hash = '$2b$10$...' 
WHERE username = 'admin';
```

## Testing

1. **Test Connection:**
   ```bash
   node -e "require('./lib/db').testConnection().then(console.log)"
   ```

2. **Test Login:**
   - Visit `/login`
   - Use credentials: admin / admin123

3. **Test Analytics:**
   - Visit pages on your site
   - Check dashboard for tracked data
   - Verify data persists after restart

## Production Checklist

- [ ] Change default admin password
- [ ] Set strong JWT_SECRET
- [ ] Enable SSL (DB_SSL=true)
- [ ] Set up database backups
- [ ] Configure monitoring
- [ ] Review connection pool settings
- [ ] Test failover scenarios

## Support Files

- `database/README.md` - Full setup documentation
- `DATABASE_MIGRATION.md` - Migration guide
- `scripts/setup-database.js` - Automated setup

## Need Help?

See `database/README.md` for:
- Detailed installation instructions
- Troubleshooting guide
- Performance optimization tips
- Production deployment guide

