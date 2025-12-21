# Database Setup Guide

This guide will help you set up PostgreSQL for the IAL Website Analytics Dashboard.

## Prerequisites

- PostgreSQL 12+ installed and running
- Node.js and npm installed
- Access to create databases and users

## Quick Start

### 1. Install PostgreSQL

**Windows:**
- Download from [PostgreSQL Downloads](https://www.postgresql.org/download/windows/)
- Or use Chocolatey: `choco install postgresql`

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Create Database and User

Connect to PostgreSQL as the postgres superuser:

```bash
psql -U postgres
```

Then run:

```sql
-- Create database
CREATE DATABASE ial_analytics;

-- Create user (optional, you can use postgres user)
CREATE USER ial_user WITH PASSWORD 'your_secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE ial_analytics TO ial_user;

-- Connect to the database
\c ial_analytics

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO ial_user;
```

### 3. Install Node.js Dependencies

```bash
npm install pg @types/pg
```

### 4. Set Environment Variables

Create or update your `.env.local` file:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ial_analytics
DB_USER=ial_user
DB_PASSWORD=your_secure_password
DB_SSL=false

# Authentication (keep existing)
JWT_SECRET=your-random-secret-key-change-this
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

### 5. Run Schema Migration

**Option A: Using psql command line:**

```bash
psql -U ial_user -d ial_analytics -f database/schema.sql
```

**Option B: Using Node.js script:**

```bash
node scripts/setup-database.js
```

### 6. Seed Test Data (Optional)

```bash
psql -U ial_user -d ial_analytics -f database/seed.sql
```

## Database Schema Overview

### Tables

1. **users** - User authentication credentials
   - Stores username, password hash, role, etc.

2. **user_sessions** - Active user login sessions
   - Tracks JWT tokens and session expiration

3. **visitor_sessions** - Website visitor sessions
   - Tracks unique visitor sessions with metadata

4. **page_views** - Individual page view records
   - Detailed page view tracking with referrer, IP, etc.

5. **system_metrics** - API and performance metrics
   - Response times, status codes, errors, etc.

### Views

- `page_views_summary` - Aggregated page view statistics
- `traffic_sources_summary` - Traffic source breakdown
- `system_metrics_summary` - Daily system metrics summary

### Indexes

All tables have appropriate indexes for:
- Timestamp-based queries
- Path-based filtering
- Session lookups
- User authentication

## Migration Scripts

Migrations are located in `database/migrations/`:

- `001_initial_schema.sql` - Initial database schema
- `002_add_user_email_index.sql` - Additional email index

To run migrations:

```bash
# Run all migrations
for file in database/migrations/*.sql; do
  psql -U ial_user -d ial_analytics -f "$file"
done
```

## Database Connection

The application uses a connection pool managed by `lib/db.ts`. The pool:
- Automatically manages connections
- Handles connection errors gracefully
- Supports transactions
- Configurable via environment variables

## Security Notes

1. **Change Default Password**: The default admin password hash in the schema is a placeholder. Generate a proper bcrypt hash:
   ```javascript
   const bcrypt = require('bcryptjs');
   const hash = bcrypt.hashSync('your-password', 10);
   ```

2. **Use Environment Variables**: Never commit database credentials to version control.

3. **SSL in Production**: Set `DB_SSL=true` in production environments.

4. **Regular Backups**: Set up automated backups for production databases.

## Troubleshooting

### Connection Issues

1. **Check PostgreSQL is running:**
   ```bash
   # Windows
   sc query postgresql-x64-14
   
   # macOS/Linux
   sudo systemctl status postgresql
   ```

2. **Verify connection:**
   ```bash
   psql -U ial_user -d ial_analytics -c "SELECT NOW();"
   ```

3. **Check firewall**: Ensure PostgreSQL port (5432) is accessible.

### Permission Issues

If you get permission errors:
```sql
GRANT ALL PRIVILEGES ON DATABASE ial_analytics TO ial_user;
GRANT ALL ON SCHEMA public TO ial_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ial_user;
```

### Reset Database

To start fresh:
```sql
DROP DATABASE IF EXISTS ial_analytics;
CREATE DATABASE ial_analytics;
-- Then run schema.sql again
```

## Production Considerations

1. **Connection Pooling**: Adjust `max` connections in `lib/db.ts` based on your server capacity.

2. **Backup Strategy**: Set up automated daily backups:
   ```bash
   pg_dump -U ial_user ial_analytics > backup_$(date +%Y%m%d).sql
   ```

3. **Monitoring**: Monitor database performance and query times.

4. **Indexes**: Review and optimize indexes based on actual query patterns.

5. **Partitioning**: Consider partitioning large tables (page_views, system_metrics) by date for better performance.

6. **Archival**: Implement data archival for old analytics data (e.g., move data older than 1 year to archive tables).

## Docker Setup (Alternative)

If you prefer Docker:

```bash
docker run --name ial-postgres \
  -e POSTGRES_DB=ial_analytics \
  -e POSTGRES_USER=ial_user \
  -e POSTGRES_PASSWORD=your_secure_password \
  -p 5432:5432 \
  -d postgres:14

# Then run migrations
psql -h localhost -U ial_user -d ial_analytics -f database/schema.sql
```

