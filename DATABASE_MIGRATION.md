# Database Migration Guide

This guide explains how to migrate from the in-memory analytics system to the PostgreSQL database-backed system.

## Overview

The application now supports PostgreSQL for persistent storage of:
- User authentication credentials
- Analytics data (page views, sessions, system metrics)

## Migration Steps

### 1. Install Dependencies

```bash
npm install pg @types/pg
```

### 2. Set Up PostgreSQL Database

Follow the instructions in `database/README.md` to:
- Install PostgreSQL
- Create the database
- Run the schema migration

### 3. Update Environment Variables

Add these to your `.env.local`:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ial_analytics
DB_USER=postgres
DB_PASSWORD=your_password
DB_SSL=false

# Keep existing auth variables
JWT_SECRET=your-random-secret-key-change-this
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

### 4. Switch to Database-Backed Code

You have three options:

#### Option A: Use Environment Variable (Easiest - Recommended)

Use the wrapper files that automatically switch based on `USE_DATABASE`:

**Add to `.env.local`:**
```env
USE_DATABASE=true
```

**Update imports to use wrappers:**

**In `app/api/auth/login/route.ts`:**
```typescript
// Change from:
import { login } from '@/lib/auth';

// To:
import { login } from '@/lib/auth-wrapper';
// And update to async:
const result = await login(username, password);
```

**In `app/api/analytics/route.ts`:**
```typescript
// Change from:
import { ... } from '@/lib/analytics';

// To:
import { ... } from '@/lib/analytics-wrapper';
// All functions are now async, add await where needed
```

**In `middleware.ts`:**
```typescript
// Change from:
import { trackPageView, trackSystemMetric } from '@/lib/analytics';

// To:
import { trackPageView, trackSystemMetric } from '@/lib/analytics-wrapper';
// Functions are async, use await or .catch() for error handling
```

#### Option B: Direct Database Imports

Replace imports directly:

**In `app/api/auth/login/route.ts`:**
```typescript
// Change from:
import { login } from '@/lib/auth';

// To:
import { login } from '@/lib/auth-db';
// Update to async: const result = await login(username, password);
```

**In `app/api/analytics/route.ts`:**
```typescript
// Change from:
import { ... } from '@/lib/analytics';

// To:
import { ... } from '@/lib/analytics-db';
// All functions are async, add await where needed
```

#### Option C: Replace Original Files

Replace the original files to use database versions:

**Backup originals first:**
```bash
mv lib/auth.ts lib/auth-memory.ts
mv lib/analytics.ts lib/analytics-memory.ts
cp lib/auth-db.ts lib/auth.ts
cp lib/analytics-db.ts lib/analytics.ts
```

**Important:** Database functions are async, so you'll need to update all call sites to use `await`.

### 5. Update API Routes

Update the following files to use database-backed functions:

- `app/api/auth/login/route.ts`
- `app/api/auth/logout/route.ts`
- `app/api/auth/verify/route.ts`
- `app/api/analytics/route.ts`
- `app/api/analytics/export/csv/route.ts`
- `app/api/analytics/export/pdf/route.ts`
- `middleware.ts`

### 6. Test the Migration

1. **Test Authentication:**
   ```bash
   # Login should work with database credentials
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"admin123"}'
   ```

2. **Test Analytics:**
   - Visit some pages on your website
   - Check the dashboard to see if data is being tracked
   - Verify data persists after server restart

3. **Verify Database:**
   ```sql
   -- Check if data is being inserted
   SELECT COUNT(*) FROM page_views;
   SELECT COUNT(*) FROM visitor_sessions;
   SELECT COUNT(*) FROM system_metrics;
   ```

## Backward Compatibility

The database-backed functions maintain the same interface as the in-memory versions, so:
- Function signatures are identical
- Return types match
- Error handling is similar

## Data Migration (Optional)

If you have existing in-memory data you want to preserve:

1. Export data from the old system (if possible)
2. Create a migration script to import into PostgreSQL
3. Run the import script

Example migration script structure:
```typescript
// scripts/migrate-data.ts
import { getPageViews, getSessions, getSystemMetrics } from '@/lib/analytics';
import { trackPageView, trackSystemMetric } from '@/lib/analytics-db';

async function migrateData() {
  // Migrate page views
  const pageViews = getPageViews();
  for (const pv of pageViews) {
    await trackPageView(pv);
  }
  
  // Migrate system metrics
  const metrics = getSystemMetrics();
  for (const metric of metrics) {
    await trackSystemMetric(metric);
  }
}
```

## Rollback Plan

If you need to rollback to in-memory storage:

1. Revert imports to use `@/lib/auth` and `@/lib/analytics`
2. Remove database environment variables
3. Restart the application

**Note:** Data in the database will not be lost, but won't be used until you switch back.

## Performance Considerations

### Connection Pooling

The database connection uses a pool (max 20 connections by default). Adjust in `lib/db.ts`:

```typescript
max: 20, // Increase for high-traffic sites
```

### Indexes

The schema includes indexes for common queries. Monitor query performance and add indexes as needed.

### Data Retention

Old data is automatically cleaned up after 30 days. Adjust `METRIC_RETENTION_DAYS` in `lib/analytics-db.ts` if needed.

## Troubleshooting

### Connection Errors

**Error:** `Connection refused`
- Check PostgreSQL is running
- Verify `DB_HOST` and `DB_PORT` are correct

**Error:** `password authentication failed`
- Verify `DB_USER` and `DB_PASSWORD` are correct
- Check PostgreSQL user permissions

### Query Errors

**Error:** `relation "users" does not exist`
- Run the schema migration: `psql -U user -d database -f database/schema.sql`

**Error:** `permission denied`
- Grant proper permissions to database user

### Performance Issues

- Check database indexes are being used: `EXPLAIN ANALYZE SELECT ...`
- Monitor connection pool usage
- Consider partitioning large tables by date

## Production Checklist

- [ ] Database credentials are secure (use environment variables)
- [ ] SSL is enabled (`DB_SSL=true`)
- [ ] Database backups are configured
- [ ] Connection pool size is optimized
- [ ] Monitoring is set up for database performance
- [ ] Default admin password has been changed
- [ ] JWT_SECRET is a strong random value
- [ ] Database user has minimal required permissions

## Next Steps

After migration:

1. **Change Default Password:**
   ```sql
   UPDATE users 
   SET password_hash = '$2b$10$...' -- Generate with bcrypt
   WHERE username = 'admin';
   ```

2. **Set Up Backups:**
   ```bash
   # Daily backup script
   pg_dump -U user ial_analytics > backup_$(date +%Y%m%d).sql
   ```

3. **Monitor Performance:**
   - Set up database monitoring
   - Review slow query logs
   - Optimize indexes based on usage

4. **Scale as Needed:**
   - Consider read replicas for analytics queries
   - Implement data partitioning for large datasets
   - Set up connection pooling at the database level

