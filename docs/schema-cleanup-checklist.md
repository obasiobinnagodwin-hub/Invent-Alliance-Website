# Schema Cleanup Checklist: Unused Columns Verification

This checklist helps verify that columns identified as "unused" are truly safe to remove before applying migration `007_drop_unused_columns.sql`.

## ⚠️ Critical Warning

**DO NOT APPLY THE MIGRATION UNTIL ALL ITEMS IN THIS CHECKLIST ARE COMPLETED AND VERIFIED.**

Dropping columns is **irreversible** without a database backup. Once dropped, data cannot be recovered unless you restore from a backup.

## Columns Under Review

### visitor_sessions table:
- `country` (VARCHAR(100))
- `city` (VARCHAR(100))
- `device_type` (VARCHAR(50))
- `browser` (VARCHAR(100))
- `os` (VARCHAR(100))

### system_metrics table:
- `request_size` (INTEGER)
- `response_size` (INTEGER)

---

## Pre-Migration Verification Steps

### Step 1: Codebase Search

Search the entire codebase for references to these columns:

```bash
# Search for visitor_sessions columns
grep -r "country\|city\|device_type\|browser\|os" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" --include="*.sql" .

# Search for system_metrics columns
grep -r "request_size\|response_size" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" --include="*.sql" .
```

**Checklist:**
- [ ] No INSERT statements reference these columns
- [ ] No SELECT statements reference these columns
- [ ] No UPDATE statements reference these columns
- [ ] No TypeScript/JavaScript interfaces/types reference these columns
- [ ] No SQL queries (raw or parameterized) reference these columns

**If any references found:** Document them and determine if they're actually used or just dead code.

---

### Step 2: Database Schema Verification

Check the production database schema:

```sql
-- Check if columns exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'visitor_sessions'
  AND column_name IN ('country', 'city', 'device_type', 'browser', 'os')
ORDER BY column_name;

SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'system_metrics'
  AND column_name IN ('request_size', 'response_size')
ORDER BY column_name;
```

**Checklist:**
- [ ] Columns exist in production schema
- [ ] Column data types match expected types
- [ ] Columns are nullable (expected for unused columns)

---

### Step 3: Data Verification

Check if any data exists in these columns:

```sql
-- Check visitor_sessions columns
SELECT 
  COUNT(*) as total_rows,
  COUNT(country) as country_count,
  COUNT(city) as city_count,
  COUNT(device_type) as device_type_count,
  COUNT(browser) as browser_count,
  COUNT(os) as os_count
FROM visitor_sessions;

-- Check for any non-null values
SELECT 
  COUNT(*) FILTER (WHERE country IS NOT NULL) as country_non_null,
  COUNT(*) FILTER (WHERE city IS NOT NULL) as city_non_null,
  COUNT(*) FILTER (WHERE device_type IS NOT NULL) as device_type_non_null,
  COUNT(*) FILTER (WHERE browser IS NOT NULL) as browser_non_null,
  COUNT(*) FILTER (WHERE os IS NOT NULL) as os_non_null
FROM visitor_sessions;

-- Check system_metrics columns
SELECT 
  COUNT(*) as total_rows,
  COUNT(request_size) as request_size_count,
  COUNT(response_size) as response_size_count
FROM system_metrics;

-- Check for any non-null values
SELECT 
  COUNT(*) FILTER (WHERE request_size IS NOT NULL) as request_size_non_null,
  COUNT(*) FILTER (WHERE response_size IS NOT NULL) as response_size_non_null
FROM system_metrics;
```

**Checklist:**
- [ ] All columns are NULL for all rows (or columns don't exist)
- [ ] No data will be lost by dropping these columns
- [ ] Document any non-null values found (may indicate hidden usage)

---

### Step 4: Database Objects Verification

Check for database views, functions, triggers, or stored procedures that reference these columns:

```sql
-- Check views
SELECT 
  table_name as view_name,
  view_definition
FROM information_schema.views
WHERE view_definition LIKE '%country%'
   OR view_definition LIKE '%city%'
   OR view_definition LIKE '%device_type%'
   OR view_definition LIKE '%browser%'
   OR view_definition LIKE '%os%'
   OR view_definition LIKE '%request_size%'
   OR view_definition LIKE '%response_size%';

-- Check functions (PostgreSQL)
SELECT 
  routine_name,
  routine_definition
FROM information_schema.routines
WHERE routine_definition LIKE '%country%'
   OR routine_definition LIKE '%city%'
   OR routine_definition LIKE '%device_type%'
   OR routine_definition LIKE '%browser%'
   OR routine_definition LIKE '%os%'
   OR routine_definition LIKE '%request_size%'
   OR routine_definition LIKE '%response_size%';

-- Check triggers
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE action_statement LIKE '%country%'
   OR action_statement LIKE '%city%'
   OR action_statement LIKE '%device_type%'
   OR action_statement LIKE '%browser%'
   OR action_statement LIKE '%os%'
   OR action_statement LIKE '%request_size%'
   OR action_statement LIKE '%response_size%';
```

**Checklist:**
- [ ] No views reference these columns
- [ ] No functions reference these columns
- [ ] No triggers reference these columns
- [ ] No stored procedures reference these columns

---

### Step 5: External Tools & Integrations

Check for external tools that might use these columns:

**Checklist:**
- [ ] No BI tools (Tableau, Power BI, etc.) query these columns
- [ ] No reporting tools reference these columns
- [ ] No data export scripts use these columns
- [ ] No external APIs expose these columns
- [ ] No monitoring/alerting systems query these columns
- [ ] No ETL processes read/write these columns

**How to verify:**
- Review database connection logs for queries referencing these columns
- Check BI tool data sources and reports
- Review API documentation for exposed fields
- Check monitoring dashboards for metrics using these columns

---

### Step 6: Dashboard & UI Verification

Verify the dashboard and UI don't display these columns:

**Checklist:**
- [ ] Dashboard doesn't display country/city/device/browser/OS data
- [ ] Dashboard doesn't display request/response size metrics
- [ ] Export functions (CSV/PDF) don't include these columns
- [ ] Admin panels don't show these fields
- [ ] API responses don't include these fields

**Files to check:**
- `app/dashboard/page.tsx` - Main dashboard
- `app/api/analytics/export/csv/route.ts` - CSV export
- `app/api/analytics/export/pdf/route.ts` - PDF export
- `app/api/analytics/route.ts` - Analytics API

---

### Step 7: Application Code Verification

Verify application code doesn't reference these columns:

**Checklist:**
- [ ] `lib/analytics-db.ts` - No INSERT/SELECT for these columns
- [ ] `lib/analytics-db-optimized.ts` - No references
- [ ] `lib/analytics.ts` - No references (in-memory)
- [ ] `lib/analytics-wrapper.ts` - No references
- [ ] TypeScript interfaces don't include these fields
- [ ] No type definitions reference these columns

**Key files to review:**
```bash
# Check TypeScript interfaces
grep -A 20 "interface.*Session\|interface.*SystemMetric" lib/analytics-db.ts

# Check INSERT statements
grep -A 10 "INSERT INTO visitor_sessions\|INSERT INTO system_metrics" lib/analytics-db.ts

# Check SELECT statements
grep -A 10 "SELECT.*FROM visitor_sessions\|SELECT.*FROM system_metrics" lib/analytics-db.ts
```

---

### Step 8: Staging Environment Test

Test the migration on staging before production:

**Checklist:**
- [ ] Backup staging database before migration
- [ ] Apply migration to staging database
- [ ] Verify application still works correctly
- [ ] Check for any error logs mentioning dropped columns
- [ ] Test all dashboard features
- [ ] Test all export functions
- [ ] Test analytics tracking
- [ ] Monitor for 24-48 hours for any issues

**Test commands:**
```bash
# Backup staging database
pg_dump -U user -d database_name -F c -f backup_before_column_drop.dump

# Apply migration
psql -U user -d database_name -f database/migrations/007_drop_unused_columns.sql

# Verify columns are dropped
psql -U user -d database_name -c "\d visitor_sessions"
psql -U user -d database_name -c "\d system_metrics"
```

---

### Step 9: Production Readiness

Final checks before production:

**Checklist:**
- [ ] All checklist items above are completed
- [ ] Staging test passed without issues
- [ ] Database backup created for production
- [ ] Rollback plan documented
- [ ] Stakeholders notified of planned change
- [ ] Maintenance window scheduled (if needed)
- [ ] Team members available for monitoring

---

### Step 10: Rollback Plan

Have a rollback plan ready:

**If migration causes issues:**

1. **Immediate rollback** (if migration just ran):
   ```sql
   -- Restore columns (if migration was just applied)
   ALTER TABLE visitor_sessions ADD COLUMN country VARCHAR(100);
   ALTER TABLE visitor_sessions ADD COLUMN city VARCHAR(100);
   ALTER TABLE visitor_sessions ADD COLUMN device_type VARCHAR(50);
   ALTER TABLE visitor_sessions ADD COLUMN browser VARCHAR(100);
   ALTER TABLE visitor_sessions ADD COLUMN os VARCHAR(100);
   ALTER TABLE system_metrics ADD COLUMN request_size INTEGER;
   ALTER TABLE system_metrics ADD COLUMN response_size INTEGER;
   ```

2. **Full database restore** (if data loss occurred):
   ```bash
   # Restore from backup
   pg_restore -U user -d database_name backup_file.dump
   ```

3. **Application rollback**:
   - Revert any code changes that depend on columns being dropped
   - Redeploy previous application version if needed

---

## Sign-Off

Before applying the migration, obtain sign-off from:

- [ ] **Database Administrator** - Verified schema and data
- [ ] **Backend Developer** - Verified code doesn't use columns
- [ ] **Frontend Developer** - Verified UI doesn't display columns
- [ ] **QA Engineer** - Verified testing completed
- [ ] **Product Owner** - Confirmed columns not needed for business requirements

---

## Post-Migration Verification

After applying the migration:

**Checklist:**
- [ ] Columns are removed from schema
- [ ] Application runs without errors
- [ ] Dashboard displays correctly
- [ ] Analytics tracking works
- [ ] Export functions work
- [ ] No error logs related to missing columns
- [ ] Update `database/schema.sql` to reflect new structure
- [ ] Update documentation

**Verification queries:**
```sql
-- Verify columns are gone
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'visitor_sessions' 
  AND column_name IN ('country', 'city', 'device_type', 'browser', 'os');
-- Should return 0 rows

SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'system_metrics' 
  AND column_name IN ('request_size', 'response_size');
-- Should return 0 rows
```

---

## Additional Notes

- **Storage savings**: Dropping these columns will save minimal storage (~$2-3/month), but simplifies the schema
- **Future use**: If these columns are needed in the future, they can be re-added, but any historical data will be lost
- **Documentation**: Update all documentation that references these columns after migration

---

## Questions?

If you're unsure about any step, **DO NOT PROCEED**. Consult with the team and database administrator before applying the migration.

