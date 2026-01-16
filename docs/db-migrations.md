# Database Migrations Guide

This document describes how to safely apply database migrations in production environments.

## Overview

Database migrations are located in `database/migrations/` and are numbered sequentially:
- `001_initial_schema.sql` - Initial database schema
- `002_add_user_email_index.sql` - Additional email index
- `003_add_pii_hash_columns.sql` - PII hash columns for GDPR
- `004_add_users_email_encrypted.sql` - Email encryption support
- `005_add_performance_indexes.sql` - Performance indexes for analytics

## Migration Safety Principles

All migrations follow these safety principles:

1. **Additive Only**: Migrations never drop tables, columns, or indexes
2. **Idempotent**: All migrations use `IF NOT EXISTS` clauses to allow safe re-runs
3. **Backward Compatible**: Migrations don't break existing application code
4. **Non-Blocking**: Index creation uses `CREATE INDEX CONCURRENTLY` when possible (PostgreSQL 12+)

## Production Migration Process

### Pre-Migration Checklist

1. **Backup Database**
   ```bash
   pg_dump -U ial_user -d ial_analytics -F c -f backup_$(date +%Y%m%d_%H%M%S).dump
   ```

2. **Review Migration Script**
   - Read the migration file to understand what changes will be made
   - Check for any potential performance impacts (index creation can be slow on large tables)
   - Verify the migration uses `IF NOT EXISTS` clauses

3. **Test on Staging**
   - Always test migrations on a staging environment first
   - Verify the migration runs successfully
   - Test application functionality after migration

4. **Check Database Size**
   - Large tables may take significant time to build indexes
   - Monitor disk space (indexes require additional storage)
   - Estimate index creation time based on table size

5. **Schedule Maintenance Window** (if needed)
   - For large tables (>1M rows), consider scheduling during low-traffic periods
   - Index creation can lock tables (though `CONCURRENTLY` reduces this)

### Running Migrations

#### Option 1: Using psql (Recommended)

```bash
# Connect to database
psql -U ial_user -d ial_analytics

# Run migration
\i database/migrations/005_add_performance_indexes.sql

# Verify indexes were created
\d page_views
\d visitor_sessions
\d system_metrics

# Check index sizes
SELECT 
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_indexes
WHERE tablename IN ('page_views', 'visitor_sessions', 'system_metrics')
ORDER BY pg_relation_size(indexrelid) DESC;
```

#### Option 2: Using Node.js Script

```bash
# Create a migration runner script (scripts/run-migration.js)
node scripts/run-migration.js database/migrations/005_add_performance_indexes.sql
```

#### Option 3: Automated Migration Tool

For production environments, consider using a migration tool like:
- [node-pg-migrate](https://github.com/salsita/node-pg-migrate)
- [db-migrate](https://db-migrate.readthedocs.io/)
- [Flyway](https://flywaydb.org/) (Java-based)

### Post-Migration Verification

1. **Verify Indexes Created**
   ```sql
   SELECT indexname, indexdef 
   FROM pg_indexes 
   WHERE tablename IN ('page_views', 'visitor_sessions', 'system_metrics')
   ORDER BY tablename, indexname;
   ```

2. **Check Index Usage**
   ```sql
   -- Enable index usage tracking (if not already enabled)
   SET track_io_timing = ON;
   
   -- Run a test query and check EXPLAIN ANALYZE
   EXPLAIN ANALYZE 
   SELECT * FROM page_views 
   WHERE path = '/dashboard' 
   ORDER BY timestamp DESC 
   LIMIT 100;
   ```

3. **Monitor Performance**
   - Check query execution times before and after migration
   - Monitor database CPU and I/O usage
   - Verify application functionality

4. **Check Disk Space**
   ```sql
   SELECT 
       pg_size_pretty(pg_database_size('ial_analytics')) AS database_size;
   ```

## Migration-Specific Notes

### Migration 005: Performance Indexes

**What it does:**
- Adds composite indexes for common query patterns
- Adds partial index for active sessions (last 24 hours)
- Adds indexes for retention job cleanup operations

**Performance Impact:**
- **Index Creation Time**: 
  - Small tables (<100K rows): < 1 minute
  - Medium tables (100K-1M rows): 1-5 minutes
  - Large tables (>1M rows): 5-30+ minutes (depends on hardware)
  
- **Disk Space**: 
  - Each index typically requires 20-30% of table size
  - Monitor disk space before running

- **Query Performance**: 
  - Should improve query performance for filtered/ordered queries
  - May slightly slow down INSERT operations (minimal impact)

**Best Practices:**
1. Run during low-traffic periods if tables are large
2. Monitor index creation progress:
   ```sql
   SELECT 
       pid,
       now() - pg_stat_activity.query_start AS duration,
       query
   FROM pg_stat_activity
   WHERE query LIKE '%CREATE INDEX%';
   ```
3. Consider using `CREATE INDEX CONCURRENTLY` for production (requires manual modification):
   ```sql
   CREATE INDEX CONCURRENTLY idx_page_views_timestamp_desc_path 
   ON page_views(timestamp DESC, path);
   ```
   Note: `CONCURRENTLY` takes longer but doesn't lock the table

**Rollback Plan:**
If issues occur, indexes can be dropped individually:
```sql
DROP INDEX IF EXISTS idx_page_views_timestamp_desc_path;
DROP INDEX IF EXISTS idx_page_views_session_timestamp_desc;
-- etc.
```

## Troubleshooting

### Migration Fails

1. **Check Error Message**: Read the full error message for details
2. **Verify Permissions**: Ensure database user has CREATE INDEX privileges
3. **Check Disk Space**: Index creation requires free disk space
4. **Check Existing Indexes**: Use `IF NOT EXISTS` to avoid conflicts

### Slow Index Creation

1. **Monitor Progress**: Use `pg_stat_progress_create_index` (PostgreSQL 12+)
2. **Check Locks**: `SELECT * FROM pg_locks WHERE NOT granted;`
3. **Consider CONCURRENTLY**: For production, modify migration to use `CREATE INDEX CONCURRENTLY`

### Index Not Used

1. **Update Statistics**: Run `ANALYZE table_name;` after index creation
2. **Check Query Plan**: Use `EXPLAIN ANALYZE` to verify index usage
3. **Verify Index Condition**: For partial indexes, ensure query matches index condition

## Best Practices

1. **Always Backup**: Create a database backup before running migrations
2. **Test First**: Test migrations on staging before production
3. **Monitor**: Watch database performance and query times after migration
4. **Document**: Document any manual steps or customizations
5. **Version Control**: Keep migration files in version control
6. **Rollback Plan**: Have a rollback plan ready (though migrations are additive)

## Emergency Rollback

If a migration causes issues:

1. **Stop Application**: Prevent further data changes
2. **Drop Problematic Indexes**: 
   ```sql
   DROP INDEX IF EXISTS problematic_index_name;
   ```
3. **Restore from Backup** (if necessary):
   ```bash
   pg_restore -U ial_user -d ial_analytics backup_file.dump
   ```
4. **Verify**: Test application functionality
5. **Investigate**: Review migration script and identify issue

## Migration History

| Migration | Date | Description | Status |
|-----------|------|-------------|--------|
| 001 | Initial | Initial schema | ✅ Stable |
| 002 | - | User email index | ✅ Stable |
| 003 | - | PII hash columns | ✅ Stable |
| 004 | - | Email encryption | ✅ Stable |
| 005 | 2024-01-16 | Performance indexes | 🆕 New |

## Additional Resources

- [PostgreSQL CREATE INDEX Documentation](https://www.postgresql.org/docs/current/sql-createindex.html)
- [PostgreSQL Index Types](https://www.postgresql.org/docs/current/indexes-types.html)
- [PostgreSQL Performance Tuning](https://www.postgresql.org/docs/current/performance-tips.html)

