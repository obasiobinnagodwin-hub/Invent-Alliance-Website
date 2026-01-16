# Railway Deployment Guide via GitHub Actions CI/CD

This guide provides step-by-step instructions for deploying the Invent Alliance Limited website to Railway using GitHub Actions for continuous integration and deployment.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Railway Setup](#railway-setup)
3. [GitHub Repository Configuration](#github-repository-configuration)
4. [Environment Variables Setup](#environment-variables-setup)
5. [Database Setup (Optional)](#database-setup-optional)
6. [GitHub Actions Workflow](#github-actions-workflow)
7. [Deployment Process](#deployment-process)
8. [Post-Deployment Verification](#post-deployment-verification)
9. [Troubleshooting](#troubleshooting)
10. [Rollback Procedure](#rollback-procedure)

---

## Prerequisites

Before starting, ensure you have:

- ✅ **GitHub Account** with repository access
- ✅ **Railway Account** (sign up at [railway.app](https://railway.app))
- ✅ **Node.js 20+** installed locally (for testing)
- ✅ **Docker** installed locally (for testing builds)
- ✅ **Git** installed and configured
- ✅ **Domain name** (optional, for custom domain)

---

## Railway Setup

### Step 1: Create Railway Account

1. Go to [railway.app](https://railway.app) and sign up/login
2. Complete account verification if required

### Step 2: Create New Project

**Option A: Using Railway's Native GitHub Integration (Simplest)**

1. Click **"New Project"** in Railway dashboard
2. Select **"Deploy from GitHub repo"**
3. Authorize Railway to access your GitHub account
4. Select the repository: `ial-website-redesign`
5. Railway will automatically create a service and deploy on every push

**Note**: If using Railway's native GitHub integration, Railway will automatically deploy on every push. You can still use GitHub Actions for CI (build/test) only, and Railway will handle deployment automatically.

**Option B: Using GitHub Actions CI/CD (This Guide)**

1. Click **"New Project"** in Railway dashboard
2. Select **"Empty Project"** or **"Deploy from GitHub repo"** (but disable auto-deploy)
3. Railway will create a service that you'll deploy via GitHub Actions

### Step 3: Configure Railway Service

1. In your Railway project, click on the service
2. Go to **Settings** → **General**
3. Set the following:
   - **Name**: `ial-website` (or your preferred name)
   - **Root Directory**: `/` (default)
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Watch Paths**: Leave default

**Note**: If using GitHub Actions for deployment, you can leave these settings as Railway won't build automatically. GitHub Actions will handle the build and deployment.

### Step 4: Get Railway Token

1. Go to Railway dashboard → **Account Settings** → **Tokens**
2. Click **"New Token"**
3. Name it: `github-actions-deploy`
4. Copy the token (you'll need it for GitHub Secrets)
5. **Note**: Save this token securely - you won't be able to see it again

### Step 5: Get Service ID and Project ID

1. In your Railway project, click on the service
2. Go to **Settings** → **General**
3. Copy the **Service ID** (you'll need it for GitHub Secrets)
4. Copy the **Project ID** (optional, helps with CLI linking)

---

## GitHub Repository Configuration

### Step 1: Enable GitHub Actions

1. Go to your GitHub repository
2. Navigate to **Settings** → **Actions** → **General**
3. Under **"Workflow permissions"**, select:
   - ✅ **"Read and write permissions"**
   - ✅ **"Allow GitHub Actions to create and approve pull requests"**
4. Click **Save**

### Step 2: Add GitHub Secrets

Go to your repository → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Add the following secrets:

#### Required Railway Secrets

| Secret Name | Description | How to Get |
|------------|-------------|------------|
| `RAILWAY_TOKEN` | Railway API token | Railway Dashboard → Account Settings → Tokens → New Token |
| `RAILWAY_SERVICE_ID` | Railway service identifier | Railway Project → Service → Settings → General → Service ID |
| `RAILWAY_PROJECT_ID` | Railway project identifier (optional) | Railway Project → Settings → General → Project ID |
| `RAILWAY_PUBLIC_URL` | Public URL of your Railway service | Railway Project → Service → Settings → Networking → Public Domain |

#### Critical Application Secrets (Required for Production)

| Secret Name | Description | Example | Validation |
|------------|-------------|---------|------------|
| `JWT_SECRET` | JWT signing secret | Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` | Min 32 chars |
| `ADMIN_USERNAME` | Admin dashboard username | `admin` (change in production) | Required |
| `ADMIN_PASSWORD` | Admin dashboard password | Generate secure password | Min 12 chars in production |
| `SMTP_HOST` | SMTP server hostname | `smtp.gmail.com` | Required |
| `SMTP_PORT` | SMTP server port | `587` | Required |
| `SMTP_USER` | SMTP username/email | `your-email@gmail.com` | Required |
| `SMTP_PASS` | SMTP app password | Gmail App Password (not regular password) | Required |
| `CONTACT_TO_EMAIL` | Contact form recipient(s) | `contact@inventallianceco.com` | Required |
| `ACADEMY_TO_EMAIL` | Academy registration recipient(s) | `academy@inventallianceco.com` | Required |

#### Optional Application Configuration

| Secret Name | Description | Default |
|------------|-------------|---------|
| `NEXT_PUBLIC_SITE_URL` | Public site URL | `https://www.inventallianceco.com` |
| `NODE_ENV` | Node environment | `production` |
| `NEXT_TELEMETRY_DISABLED` | Disable Next.js telemetry | `1` |

#### Database Secrets (If `USE_DATABASE=true`)

| Secret Name | Description | Example |
|------------|-------------|---------|
| `USE_DATABASE` | Enable PostgreSQL database | `true` |
| `DATABASE_URL` | PostgreSQL connection string (alternative to individual vars) | Railway PostgreSQL connection URL |
| `DB_HOST` | Database hostname | Railway PostgreSQL service hostname |
| `DB_PORT` | Database port | `5432` |
| `DB_NAME` | Database name | `railway` or `ial_analytics` |
| `DB_USER` | Database username | Railway PostgreSQL username |
| `DB_PASSWORD` | Database password | Railway PostgreSQL password |
| `DB_SSL` | Enable SSL connection | `true` |

#### Security Feature Flags

| Secret Name | Description | Default | Recommended |
|------------|-------------|---------|-------------|
| `FEATURE_ENV_VALIDATION` | Enable environment validation | `false` | `true` (auto-enabled in production) |
| `FEATURE_CSRF` | Enable CSRF protection | `false` | `true` (after testing) |
| `FEATURE_SECURE_HEADERS` | Enable security headers (CSP/HSTS) | `false` | `true` (after testing CSP) |
| `FEATURE_STRICT_SAMESITE_AUTH` | Use strict SameSite for auth cookies | `false` | `true` (after testing) |
| `FEATURE_SECURE_LOGGER` | Enable secure logging with redaction | `false` | `true` |
| `FEATURE_RATE_LIMIT_LOGIN` | Enable login rate limiting | `false` | `true` |
| `FEATURE_INPUT_VALIDATION` | Enable enhanced input validation | `false` | `true` |
| `CSP_ENFORCE` | Enforce CSP (vs Report-Only) | `false` | `false` (start with Report-Only) |

#### GDPR Feature Flags

| Secret Name | Description | Default | Recommended |
|------------|-------------|---------|-------------|
| `FEATURE_COOKIE_CONSENT` | Enable cookie consent banner | `false` | `true` (required for GDPR) |
| `FEATURE_PII_HASHING` | Enable PII pseudonymization | `false` | `true` |
| `FEATURE_PII_EMAIL_ENCRYPTION` | Enable email encryption at rest | `false` | `false` (optional) |
| `FEATURE_RETENTION_JOBS` | Enable automated data retention | `false` | `false` (enable after setup) |
| `FEATURE_RETENTION_ENDPOINT` | Enable manual retention endpoint | `false` | `true` (for admin use) |
| `FEATURE_DSAR_PORTAL` | Enable Data Subject Access Request portal | `false` | `true` (required for GDPR) |
| `FEATURE_ROPA_ENDPOINT` | Enable ROPA endpoint | `false` | `true` (for compliance) |

#### GDPR Configuration (If GDPR Features Enabled)

| Secret Name | Description | Required When |
|------------|-------------|---------------|
| `DATA_ENCRYPTION_KEY` | Data encryption key (64 hex chars) | `FEATURE_PII_EMAIL_ENCRYPTION=true` |
| `ANALYTICS_HASH_SALT` | Salt for analytics hashing | `FEATURE_PII_HASHING=true` |
| `DSAR_TO_EMAIL` | DSAR notification email | `FEATURE_DSAR_PORTAL=true` |

#### Optimization Feature Flags

| Secret Name | Description | Default | Recommended |
|------------|-------------|---------|-------------|
| `FEATURE_API_CACHE` | Enable API response caching | `false` | `false` (test first) |
| `FEATURE_DB_POOL_TUNING` | Enable connection pool tuning | `false` | `true` (if using DB) |
| `FEATURE_ANALYTICS_BATCH_WRITE` | Enable batch analytics writes | `false` | `true` (if high traffic) |
| `FEATURE_ANALYTICS_JOIN_OPTIMIZED_READS` | Enable optimized DB reads | `false` | `true` (if using DB) |
| `FEATURE_ANALYTICS_RETENTION_14D` | Use 14-day retention (vs 30) | `false` | `false` (optional) |
| `FEATURE_ANALYTICS_ARCHIVE` | Archive old analytics data | `false` | `false` (optional) |
| `FEATURE_OPTIMIZED_IMAGES` | Enable image optimization | `false` | `true` (recommended) |
| `FEATURE_DYNAMIC_IMPORTS` | Enable code splitting | `false` | `true` (recommended) |
| `FEATURE_MONITORING_METRICS` | Enable performance monitoring | `false` | `false` (optional) |

#### UX Feature Flags

| Secret Name | Description | Default | Recommended |
|------------|-------------|---------|-------------|
| `FEATURE_DASHBOARD_MOBILE_HEADER` | Mobile dashboard header | `false` | `true` |
| `FEATURE_DASHBOARD_SKELETON_LOADING` | Skeleton loaders | `false` | `true` |
| `FEATURE_DASHBOARD_ERROR_RECOVERY` | Error recovery UX | `false` | `true` |
| `FEATURE_ACCESSIBILITY_UPGRADES` | Accessibility improvements | `false` | `true` |
| `FEATURE_TRUST_SIGNALS` | Trust indicators on forms | `false` | `true` |
| `FEATURE_CTA_BUTTONS` | Enhanced CTA buttons | `false` | `true` |
| `FEATURE_FUNNEL_GOALS` | Goal & funnel tracking | `false` | `false` (optional) |
| `FEATURE_ACADEMY_MULTI_STEP_FORM` | Multi-step academy form | `false` | `false` (optional) |

#### Optional Monitoring Configuration

| Secret Name | Description | Required When |
|------------|-------------|---------------|
| `MONITORING_ENDPOINT` | External monitoring endpoint | `FEATURE_MONITORING_METRICS=true` |

### Step 3: Verify GitHub Actions Workflow

The workflow file is already created at `.github/workflows/railway-deploy.yml`. Verify it exists:

```bash
# Check if workflow file exists
ls -la .github/workflows/railway-deploy.yml
```

The workflow performs:
1. **Build and Test**: Installs dependencies, runs linter, type checks, builds application, builds Docker image, tests Docker image
2. **Deploy**: Deploys to Railway using Railway CLI, performs health check

---

## Environment Variables Setup

### Step 1: Set Railway Environment Variables

1. Go to Railway project → Service → **Variables**
2. Add all required environment variables (see list above)
3. **Important**: Railway will automatically use these variables during deployment

**Note**: You can set variables in Railway directly OR use GitHub Secrets. Railway variables take precedence during deployment.

### Step 2: Generate Secure Secrets

Run these commands locally to generate secure values:

```bash
# Generate JWT_SECRET (64 hex characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate DATA_ENCRYPTION_KEY (64 hex characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate ANALYTICS_HASH_SALT (random string)
node -e "console.log(require('crypto').randomBytes(16).toString('base64'))"

# Generate secure ADMIN_PASSWORD (16 characters)
openssl rand -base64 16
```

### Step 3: Configure Feature Flags

Decide which features to enable in production. Recommended initial setup:

```env
# Security Features (Recommended)
FEATURE_ENV_VALIDATION=true          # Always enabled in production (auto-enabled)
FEATURE_SECURE_HEADERS=true          # Enable after testing CSP
FEATURE_CSRF=true                     # Enable after testing forms
FEATURE_SECURE_LOGGER=true           # Enable for production logging
FEATURE_RATE_LIMIT_LOGIN=true        # Enable for security
FEATURE_INPUT_VALIDATION=true        # Enable for security
FEATURE_STRICT_SAMESITE_AUTH=true    # Enable after testing

# GDPR Features (Recommended)
FEATURE_COOKIE_CONSENT=true          # Required for GDPR compliance
FEATURE_PII_HASHING=true             # Enable for analytics privacy
FEATURE_DSAR_PORTAL=true             # Required for GDPR compliance
FEATURE_ROPA_ENDPOINT=true           # Required for compliance audits
FEATURE_RETENTION_ENDPOINT=true      # Enable for manual retention
FEATURE_RETENTION_JOBS=false         # Enable after setting up cron job

# Optimization Features (Optional - Test First)
FEATURE_API_CACHE=false              # Enable after testing
FEATURE_DB_POOL_TUNING=true          # Enable if using database
FEATURE_ANALYTICS_BATCH_WRITE=false  # Enable after testing
FEATURE_ANALYTICS_JOIN_OPTIMIZED_READS=true  # Enable if using database
FEATURE_OPTIMIZED_IMAGES=true        # Recommended
FEATURE_DYNAMIC_IMPORTS=true         # Recommended
FEATURE_MONITORING_METRICS=false     # Optional

# UX Features (Recommended)
FEATURE_DASHBOARD_MOBILE_HEADER=true
FEATURE_DASHBOARD_SKELETON_LOADING=true
FEATURE_DASHBOARD_ERROR_RECOVERY=true
FEATURE_ACCESSIBILITY_UPGRADES=true
FEATURE_TRUST_SIGNALS=true
FEATURE_CTA_BUTTONS=true
FEATURE_FUNNEL_GOALS=false           # Optional
FEATURE_ACADEMY_MULTI_STEP_FORM=false  # Optional
```

---

## Database Setup (Optional)

### Step 1: Create PostgreSQL Service in Railway

1. In Railway project, click **"+ New"** → **"Database"** → **"Add PostgreSQL"**
2. Railway will automatically create a PostgreSQL database
3. Copy the **Connection URL** from the database service

### Step 2: Configure Database Connection

**Option A: Use DATABASE_URL (Recommended for Railway)**

Railway automatically provides a `DATABASE_URL` environment variable when you create a PostgreSQL service. This is the easiest method:

1. In Railway project → PostgreSQL Database service → **Variables** tab
2. Copy the `DATABASE_URL` value (it should already be there automatically)
3. In Railway project → Your Application Service → **Variables** tab, add:
   ```env
   USE_DATABASE=true
   DATABASE_URL=<Railway automatically provides this - copy from PostgreSQL service>
   ```

**Option B: Use Individual Variables (Alternative)**

If you prefer individual variables or DATABASE_URL is not available:

1. In Railway project → PostgreSQL Database service → **Variables** tab, note these values:
   - `PGHOST` or `DB_HOST` = hostname
   - `PGPORT` or `DB_PORT` = port (usually 5432)
   - `PGDATABASE` or `DB_NAME` = database name (usually "railway")
   - `PGUSER` or `DB_USER` = username (usually "postgres")
   - `PGPASSWORD` or `DB_PASSWORD` = password

2. In Railway project → Your Application Service → **Variables** tab, add:
   ```env
   USE_DATABASE=true
   DB_HOST=<from PostgreSQL service variables>
   DB_PORT=5432
   DB_NAME=railway
   DB_USER=postgres
   DB_PASSWORD=<from PostgreSQL service variables>
   DB_SSL=true
   ```

**Important Notes:**
- Railway automatically provides `DATABASE_URL` - use Option A if possible
- Railway's `DATABASE_URL` should already include SSL parameters
- If `DATABASE_URL` doesn't work, check that it includes `?sslmode=require` or similar SSL parameters
- If using individual variables, `DB_SSL=true` is required for Railway PostgreSQL
- **Troubleshooting**: If you get AggregateError, verify:
  1. `DATABASE_URL` is copied correctly (no extra spaces or quotes)
  2. Database service is running and active in Railway
  3. Both services (app and database) are in the same Railway project
  4. Try adding `?sslmode=require` to DATABASE_URL if SSL errors occur

### Step 3: Run Database Migrations

**Option A: Manual Migration (Recommended for First Deployment)**

1. Connect to Railway database:
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login
   railway login
   
   # Link to project
   railway link
   
   # Navigate to project root directory (IMPORTANT: paths are relative to current directory)
   cd /path/to/your/project/ial-website-redesign
   
   # Connect to database
   railway connect postgres
   ```

2. Run migrations in order (from project root directory):
   ```sql
   -- Run each migration file
   -- Note: These paths are relative to the current working directory
   -- Make sure you're in the project root when running these commands
   \i database/migrations/001_initial_schema.sql
   \i database/migrations/002_add_user_email_index.sql
   \i database/migrations/003_add_pii_hash_columns.sql
   \i database/migrations/004_add_users_email_encrypted.sql
   \i database/migrations/005_add_performance_indexes.sql
   \i database/migrations/006_create_page_views_archive.sql
   -- Migration 007 is OPTIONAL and requires manual review before applying
   -- \i database/migrations/007_drop_unused_columns.sql
   ```

**Option B: Automated Migration (Via Railway CLI)**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Link to your project
railway link

# Method 1: Run migrations using Railway's shell (recommended)
# IMPORTANT: Run these commands from the project root directory
# This runs psql within Railway's environment where DATABASE_URL is accessible
cd /path/to/your/project/ial-website-redesign
railway run bash -c "psql \$DATABASE_URL -f database/migrations/001_initial_schema.sql"
railway run bash -c "psql \$DATABASE_URL -f database/migrations/002_add_user_email_index.sql"
railway run bash -c "psql \$DATABASE_URL -f database/migrations/003_add_pii_hash_columns.sql"
railway run bash -c "psql \$DATABASE_URL -f database/migrations/004_add_users_email_encrypted.sql"
railway run bash -c "psql \$DATABASE_URL -f database/migrations/005_add_performance_indexes.sql"
railway run bash -c "psql \$DATABASE_URL -f database/migrations/006_create_page_views_archive.sql"
# Migration 007 is OPTIONAL - review the file before applying (drops unused columns)
# railway run bash -c "psql \$DATABASE_URL -f database/migrations/007_drop_unused_columns.sql"

# Method 2: Use Railway shell interactively
# IMPORTANT: Navigate to project root before entering shell
cd /path/to/your/project/ial-website-redesign
railway shell
# Then inside Railway shell:
psql $DATABASE_URL -f database/migrations/001_initial_schema.sql
psql $DATABASE_URL -f database/migrations/002_add_user_email_index.sql
psql $DATABASE_URL -f database/migrations/003_add_pii_hash_columns.sql
psql $DATABASE_URL -f database/migrations/004_add_users_email_encrypted.sql
psql $DATABASE_URL -f database/migrations/005_add_performance_indexes.sql
psql $DATABASE_URL -f database/migrations/006_create_page_views_archive.sql
# Migration 007 is OPTIONAL - review the file before applying (drops unused columns)
# psql $DATABASE_URL -f database/migrations/007_drop_unused_columns.sql
exit

# Method 3: Get public connection string from Railway dashboard
# Steps to get Railway database credentials:
# 1. Go to Railway Dashboard (https://railway.app)
# 2. Select your project
# 3. Click on your PostgreSQL Database service
# 4. Click on the "Variables" tab (or "Connect" tab)
# 5. Look for the "DATABASE_URL" variable - this contains the full connection string
#    OR look for individual variables:
#    - PGHOST (or DB_HOST) = hostname
#    - PGPORT (or DB_PORT) = port (usually 5432)
#    - PGDATABASE (or DB_NAME) = database name (usually "railway")
#    - PGUSER (or DB_USER) = username (usually "postgres")
#    - PGPASSWORD (or DB_PASSWORD) = password
# 6. Copy the FULL connection string (format: postgresql://user:password@hostname:port/railway)
# 7. Use it directly with psql:
psql "postgresql://postgres:YOUR_PASSWORD@postgres-production-e4cbe.up.railway.app:5432/railway" -f database/migrations/001_initial_schema.sql

# Note: Replace YOUR_PASSWORD with the actual password from Railway Variables
# The connection string format is: postgresql://USERNAME:PASSWORD@HOSTNAME:PORT/DATABASE
# Example: postgresql://postgres:abc123xyz@postgres-production-e4cbe.up.railway.app:5432/railway
```

**Option C: Via Railway Dashboard**

1. Go to Railway project → Database service → **Query**
2. Copy and paste each migration file content
3. Execute each migration in order

---

## GitHub Actions Workflow

### Workflow Overview

The GitHub Actions workflow (`.github/workflows/railway-deploy.yml`) performs:

1. **Build and Test Job**:
   - Checks out code
   - Installs dependencies
   - Runs linter
   - Type checks TypeScript
   - Builds Next.js application
   - Builds Docker image
   - Tests Docker image
   - Pushes image to GitHub Container Registry (GHCR)

2. **Deploy Job** (only on `main` or `production` branches):
   - Deploys to Railway using Railway CLI
   - Waits for deployment to complete
   - Performs health check
   - Sends deployment notification

### Workflow Triggers

- **Push to `main` branch**: Deploys to staging environment
- **Push to `production` branch**: Deploys to production environment
- **Pull Request**: Runs build/test only (no deployment)
- **Manual trigger**: Can be triggered manually via GitHub Actions UI

### Customizing the Workflow

Edit `.github/workflows/railway-deploy.yml` to customize:

- **Build commands**: Modify `npm run build` step
- **Test commands**: Add additional test steps
- **Deployment environment**: Change `environment` name
- **Health check**: Modify health check endpoint/command

---

## Deployment Process

### Step 1: Initial Deployment

1. **Push code to GitHub**:
   ```bash
   git add .
   git commit -m "Initial deployment setup"
   git push origin main
   ```

2. **Monitor GitHub Actions**:
   - Go to repository → **Actions** tab
   - Watch the workflow run
   - Check for any errors

3. **Verify Railway Deployment**:
   - Go to Railway dashboard
   - Check service logs
   - Verify service is running

### Step 2: Continuous Deployment

After initial setup, deployments happen automatically:

1. **Push to `main` branch** → Auto-deploys to staging
2. **Push to `production` branch** → Auto-deploys to production
3. **Monitor via GitHub Actions** → Check deployment status

### Step 3: Manual Deployment

To manually trigger deployment:

1. Go to repository → **Actions** → **Railway Deployment**
2. Click **"Run workflow"**
3. Select branch (`main` or `production`)
4. Click **"Run workflow"**

---

## Post-Deployment Verification

### Step 1: Health Check

1. Visit health endpoint:
   ```bash
   curl https://your-railway-url.up.railway.app/api/health
   ```

2. Expected response:
   ```json
   {
     "status": "healthy",
     "database": "connected",
     "timestamp": "2024-01-01T00:00:00.000Z"
   }
   ```

### Step 2: Functional Testing

1. **Homepage**:
   - Visit: `https://your-railway-url.up.railway.app`
   - Verify page loads correctly
   - Check images and styles load

2. **Contact Form**:
   - Visit: `https://your-railway-url.up.railway.app/contacts`
   - Submit test form
   - Verify email is sent (check SMTP logs)

3. **Academy Registration**:
   - Visit: `https://your-railway-url.up.railway.app/invent-academy-registration`
   - Submit test registration
   - Verify email is sent

4. **Admin Dashboard**:
   - Visit: `https://your-railway-url.up.railway.app/login`
   - Login with admin credentials
   - Verify dashboard loads
   - Check analytics data (if database enabled)

5. **Privacy Policy** (if GDPR features enabled):
   - Visit: `https://your-railway-url.up.railway.app/privacy-policy`
   - Verify page loads and content is correct

6. **DSAR Portal** (if enabled):
   - Visit: `https://your-railway-url.up.railway.app/data-subject-request`
   - Submit test request
   - Verify confirmation email is sent

### Step 3: Security Verification

1. **Check Security Headers**:
   ```bash
   curl -I https://your-railway-url.up.railway.app
   ```

   Verify headers:
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: DENY`
   - `X-XSS-Protection: 1; mode=block`
   - `Strict-Transport-Security` (if HTTPS and `FEATURE_SECURE_HEADERS=true`)
   - `Content-Security-Policy` or `Content-Security-Policy-Report-Only` (if `FEATURE_SECURE_HEADERS=true`)

2. **Test CSRF Protection** (if enabled):
   - Try submitting form without CSRF token
   - Should return 403 error

3. **Test Rate Limiting** (if enabled):
   - Make multiple login attempts
   - Should return 429 after limit

4. **Test Cookie Consent** (if enabled):
   - First visit should show cookie banner
   - Analytics should not run until consent given

### Step 4: Performance Check

1. **Lighthouse Audit**:
   - Run Lighthouse in Chrome DevTools
   - Check Performance, Accessibility, Best Practices scores

2. **Check Logs**:
   - Railway dashboard → Service → **Logs**
   - Look for errors or warnings
   - Verify secure logger is working (if enabled)

3. **Check Feature Flags**:
   - Verify enabled features are active
   - Check that disabled features are not active

---

## Troubleshooting

### Common Issues

#### 1. Build Fails

**Error**: `npm run build` fails

**Solutions**:
- Check Node.js version (should be 20+)
- Verify all dependencies are in `package.json`
- Check for TypeScript errors: `npx tsc --noEmit`
- Review build logs in GitHub Actions
- Check for missing environment variables during build

#### 2. Deployment Fails

**Error**: Railway deployment fails

**Solutions**:
- Verify `RAILWAY_TOKEN` is correct in GitHub Secrets
- Check `RAILWAY_SERVICE_ID` is correct
- Review Railway service logs
- Ensure environment variables are set in Railway
- Check Railway service is not paused or stopped

#### 3. Application Won't Start

**Error**: Service crashes on startup

**Solutions**:
- Check Railway logs for error messages
- Verify all required environment variables are set
- Check `JWT_SECRET` is at least 32 characters
- Verify `ADMIN_PASSWORD` is at least 12 characters
- Check database connection (if `USE_DATABASE=true`)
- Review `instrumentation.ts` validation errors
- Check for missing feature flag dependencies

#### 4. Database Connection Fails

**Error**: "Database connection failed. Please check your database configuration or set USE_DATABASE=false to use in-memory authentication."

**Solutions**:

**Quick Fix (Use In-Memory Auth):**
- Set `USE_DATABASE=false` in Railway Variables (temporary, for testing)
- This allows login without database (uses default admin/admin123)

**Proper Fix (Use Database):**

1. **Check DATABASE_URL is set:**
   - Go to Railway → PostgreSQL Database service → **Variables** tab
   - Copy the `DATABASE_URL` value (should be automatically provided)
   - Go to Railway → Your Application Service → **Variables** tab
   - Add: `USE_DATABASE=true` and `DATABASE_URL=<copied value>`

2. **If DATABASE_URL is not available, use individual variables:**
   - From PostgreSQL service Variables, copy:
     - `PGHOST` → Set as `DB_HOST` in your app
     - `PGPORT` → Set as `DB_PORT` (usually 5432)
     - `PGDATABASE` → Set as `DB_NAME` (usually "railway")
     - `PGUSER` → Set as `DB_USER` (usually "postgres")
     - `PGPASSWORD` → Set as `DB_PASSWORD`
   - Also set: `DB_SSL=true` (required for Railway PostgreSQL)

3. **Verify database service is running:**
   - Railway → PostgreSQL Database service → Check status is "Active"

4. **Run database migrations:**
   - See "Step 3: Run Database Migrations" section above
   - Migrations must be run before login will work

5. **Check Railway logs:**
   - Railway → Your Application Service → **Logs** tab
   - Look for database connection errors
   - Common errors:
     - **"AggregateError"** → Multiple connection failures. Check:
       - `DATABASE_URL` is set correctly (no extra spaces/quotes)
       - Database service is running and active
       - Both services are in same Railway project
       - Try appending `?sslmode=require` to DATABASE_URL if SSL issues
     - **"ECONNREFUSED"** → Database service not running or wrong host/port
     - **"password authentication failed"** → Wrong DB_USER or DB_PASSWORD
     - **"database does not exist"** → Wrong DB_NAME or migrations not run
     - **"relation 'users' does not exist"** → Migrations not run
     - **"SSL/TLS connection" errors** → Add `?sslmode=require` to DATABASE_URL or set `DB_SSL=true`

6. **Test database connection:**
   ```bash
   railway run bash -c "psql \$DATABASE_URL -c 'SELECT NOW();'"
   ```

#### 5. SMTP Email Fails

**Error**: Emails not sending

**Solutions**:
- Verify `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` are correct
- For Gmail: Use App Password, not regular password
- Check SMTP port (587 for TLS, 465 for SSL)
- Review SMTP logs in Railway
- Verify recipient emails are correct

#### 6. Feature Flags Not Working

**Error**: Feature flag enabled but not active

**Solutions**:
- Verify environment variable is set: `FEATURE_XXX=true` (not `True` or `1`)
- Check Railway Variables (case-sensitive)
- Restart service after changing variables
- Review `lib/feature-flags.ts` for correct flag names
- Check for feature flag dependencies (e.g., `FEATURE_PII_EMAIL_ENCRYPTION` requires `DATA_ENCRYPTION_KEY`)

#### 7. TypeScript Errors in Build

**Error**: TypeScript compilation fails

**Solutions**:
- Run `npx tsc --noEmit` locally to identify errors
- Check for missing type definitions
- Verify all imports are correct
- Check for type mismatches in recent changes

#### 8. Docker Build Fails

**Error**: Docker image build fails

**Solutions**:
- Check Dockerfile syntax
- Verify all required files are present
- Check for missing dependencies
- Review Docker build logs
- Test Docker build locally: `docker build -t test-image .`

### Getting Help

1. **Check Logs**:
   - Railway Dashboard → Service → **Logs**
   - GitHub Actions → Workflow run → **Logs**

2. **Review Documentation**:
   - `OPERATIONS_IT_RUNBOOK.md` - IT operations guide
   - `OPERATIONS_CUSTOMER_CARE_GUIDE.md` - Customer care guide
   - `QA_SECURITY_AUDIT_REPORT.md` - Security documentation
   - `QA_GDPR_COMPLIANCE_REPORT.md` - GDPR documentation

3. **Contact Support**:
   - Railway Support: [railway.app/support](https://railway.app/support)
   - GitHub Actions: [docs.github.com/actions](https://docs.github.com/actions)

---

## Rollback Procedure

### Step 1: Identify Previous Deployment

1. Go to Railway Dashboard → Service → **Deployments**
2. Find the last working deployment
3. Note the deployment ID or commit SHA

### Step 2: Rollback via Railway Dashboard

1. Go to Railway Dashboard → Service → **Deployments**
2. Click on the previous working deployment
3. Click **"Redeploy"** or **"Rollback"**

### Step 3: Rollback via GitHub

1. Revert the problematic commit:
   ```bash
   git revert <commit-sha>
   git push origin main
   ```

2. GitHub Actions will automatically deploy the reverted version

### Step 4: Rollback via Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to project
railway link

# Rollback to previous deployment
railway rollback
```

### Step 5: Verify Rollback

1. Check health endpoint
2. Test critical functionality
3. Review logs for errors
4. Confirm service is stable

---

## Best Practices

### 1. Environment Management

- ✅ Use separate Railway projects for staging and production
- ✅ Use GitHub branch protection for `production` branch
- ✅ Require pull request reviews before merging to `production`
- ✅ Test in staging before deploying to production
- ✅ Use feature flags for gradual rollout

### 2. Security

- ✅ Rotate secrets regularly (every 90 days)
- ✅ Use strong passwords (min 12 characters)
- ✅ Enable security features gradually (test in staging first)
- ✅ Monitor Railway logs for suspicious activity
- ✅ Keep dependencies updated (`npm audit`)
- ✅ Enable `FEATURE_ENV_VALIDATION` in production
- ✅ Use secure logging in production (`FEATURE_SECURE_LOGGER=true`)

### 3. Monitoring

- ✅ Set up Railway alerts for service downtime
- ✅ Monitor GitHub Actions workflow runs
- ✅ Review logs regularly
- ✅ Set up uptime monitoring (e.g., UptimeRobot)
- ✅ Enable performance monitoring (`FEATURE_MONITORING_METRICS=true`)

### 4. Database

- ✅ Run migrations in staging first
- ✅ Backup database before migrations
- ✅ Test migrations on a copy of production data
- ✅ Monitor database performance
- ✅ Use connection pooling (`FEATURE_DB_POOL_TUNING=true`)

### 5. Feature Flags

- ✅ Enable features incrementally
- ✅ Test each feature in staging first
- ✅ Monitor feature flag usage
- ✅ Document feature flag decisions
- ✅ Start with security features, then GDPR, then optimization/UX

### 6. GDPR Compliance

- ✅ Enable `FEATURE_COOKIE_CONSENT` for GDPR compliance
- ✅ Enable `FEATURE_PII_HASHING` for data protection
- ✅ Enable `FEATURE_DSAR_PORTAL` for data subject rights
- ✅ Enable `FEATURE_ROPA_ENDPOINT` for compliance audits
- ✅ Review privacy policy regularly
- ✅ Document data processing activities

---

## Additional Resources

- **Railway Documentation**: [docs.railway.app](https://docs.railway.app)
- **GitHub Actions Documentation**: [docs.github.com/actions](https://docs.github.com/actions)
- **Next.js Deployment**: [nextjs.org/docs/deployment](https://nextjs.org/docs/deployment)
- **Docker Documentation**: [docs.docker.com](https://docs.docker.com)

---

## Quick Reference

### Railway CLI Commands

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to project
railway link

# View logs
railway logs

# Connect to database
railway connect postgres

# Run command in Railway environment
railway run <command>

# View variables
railway variables

# Set variable
railway variables set KEY=value

# Deploy
railway up

# Rollback
railway rollback
```

### GitHub Actions Commands

```bash
# View workflow runs
gh run list

# View specific workflow run
gh run view <run-id>

# Rerun failed workflow
gh run rerun <run-id>

# Cancel workflow
gh run cancel <run-id>
```

### Environment Variable Checklist

**Critical (Required)**:
- [ ] `JWT_SECRET` (min 32 chars)
- [ ] `ADMIN_USERNAME`
- [ ] `ADMIN_PASSWORD` (min 12 chars)
- [ ] `SMTP_HOST`
- [ ] `SMTP_PORT`
- [ ] `SMTP_USER`
- [ ] `SMTP_PASS`
- [ ] `CONTACT_TO_EMAIL`
- [ ] `ACADEMY_TO_EMAIL`
- [ ] `NEXT_PUBLIC_SITE_URL`

**Railway Secrets**:
- [ ] `RAILWAY_TOKEN`
- [ ] `RAILWAY_SERVICE_ID`
- [ ] `RAILWAY_PROJECT_ID` (optional)
- [ ] `RAILWAY_PUBLIC_URL`

**Database (If Using)**:
- [ ] `USE_DATABASE=true`
- [ ] `DATABASE_URL` or individual DB variables
- [ ] `DB_SSL=true`

**Feature Flags (As Needed)**:
- [ ] Security flags (recommended)
- [ ] GDPR flags (required for compliance)
- [ ] Optimization flags (optional)
- [ ] UX flags (recommended)

---

**Last Updated**: 2024-12-19  
**Version**: 2.0.0  
**Maintained By**: IT Operations Team
