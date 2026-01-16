# IT Operations Runbook
## Invent Alliance Limited Website - Production Support

**Version:** 1.0  
**Last Updated:** January 15, 2026  
**Audience:** IT Operations Team, System Administrators, DevOps Engineers  
**Classification:** INTERNAL USE ONLY

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Access & Credentials](#2-access--credentials)
3. [Daily Operations](#3-daily-operations)
4. [Incident Response](#4-incident-response)
5. [Maintenance Procedures](#5-maintenance-procedures)
6. [Monitoring & Alerts](#6-monitoring--alerts)
7. [Troubleshooting Guide](#7-troubleshooting-guide)
8. [Security Procedures](#8-security-procedures)

---

## 1. System Overview

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Users / Browsers                      │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│                  CDN / Load Balancer                     │
│            (Cloudflare / Vercel Edge)                    │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│              Next.js Application Server                  │
│                  (Node.js Runtime)                       │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Frontend  │  │  API Routes  │  │  Middleware  │  │
│  │   (React)   │  │              │  │  (Analytics) │  │
│  └─────────────┘  └──────────────┘  └──────────────┘  │
└──────────────────────┬──────────────────────────────────┘
                       │
          ┌────────────┴────────────┐
          ▼                         ▼
┌──────────────────┐      ┌──────────────────┐
│  PostgreSQL DB   │      │   SMTP Service   │
│   (Analytics,    │      │   (Email Sending)│
│   Auth, Users)   │      │                  │
└──────────────────┘      └──────────────────┘
```

### Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Frontend Framework | Next.js | 15.1.0 |
| Runtime | Node.js | 18+ |
| Language | TypeScript | 5.7.2 |
| Database | PostgreSQL | 14+ |
| Authentication | JWT + bcrypt | - |
| Email | Nodemailer (SMTP) | 7.0.11 |
| Charts | Recharts | 3.6.0 |
| Styling | Tailwind CSS | 3.4.17 |

### Environment Variables

**Required Variables:**
```bash
# Application
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1

# Authentication (CRITICAL - Must be secure)
JWT_SECRET=<64-char hex string>
ADMIN_USERNAME=<secure username>
ADMIN_PASSWORD=<12+ char secure password>
DATA_ENCRYPTION_KEY=<64-char hex string for data encryption>

# Database (if USE_DATABASE=true)
USE_DATABASE=true
DB_HOST=<database host>
DB_PORT=5432
DB_NAME=ial_analytics
DB_USER=<database user>
DB_PASSWORD=<secure password>
DB_SSL=true
DB_POOL_MAX=10
DB_POOL_MIN=2

# SMTP Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<email address>
SMTP_PASS=<app password - NOT regular password>
CONTACT_TO_EMAIL=<recipient email(s), comma-separated>
ACADEMY_TO_EMAIL=<recipient email(s), comma-separated>

# Optional
ANALYTICS_SALT=<random string for IP hashing>
VALIDATE_EMAIL_MX=false
```

**Generate Secure Values:**
```bash
# JWT Secret (64 hex chars)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Data Encryption Key (64 hex chars)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Secure Password (16 chars)
openssl rand -base64 16
```

---

## 2. Access & Credentials

### Production Access

**Application Access:**
- Dashboard URL: `https://inventallianceco.com/dashboard`
- Login: Stored in secure credential vault (1Password/LastPass)

**Database Access:**
- Host: Stored in credential vault
- Port: 5432
- Database: `ial_analytics`
- User: Stored in credential vault
- Connection: SSL required

**Server Access:**
- SSH: Contact DevOps lead for access
- Sudo: Required for system-level changes

### Credential Rotation Schedule

| Credential | Rotation Frequency | Last Rotated | Next Rotation |
|------------|-------------------|--------------|---------------|
| Admin Password | Every 90 days | - | - |
| JWT Secret | Every 180 days | - | - |
| DB Password | Every 90 days | - | - |
| SMTP Password | Every 90 days | - | - |

**Rotation Procedure:**
1. Generate new credential using secure method
2. Update environment variables
3. Restart application
4. Verify functionality
5. Document rotation in log

---

## 3. Daily Operations

### Daily Checklist (9:00 AM Local Time)

```bash
# 1. Check system health
curl https://inventallianceco.com/api/health

# Expected response:
# {
#   "status": "healthy",
#   "database": { "healthy": true, "poolSize": 5 },
#   "uptime": 86400
# }

# 2. Check application logs
# (If using Vercel)
vercel logs --prod

# (If using Docker)
docker logs ial-website --tail 100

# 3. Monitor error rates
# Check dashboard: /dashboard (system metrics tab)
# Error rate should be < 5%

# 4. Check database connections
# Login to database and run:
SELECT count(*) FROM pg_stat_activity WHERE datname = 'ial_analytics';
# Should be < 10 connections

# 5. Verify email functionality
# Send test email from contact form
# Verify receipt within 2 minutes
```

### Weekly Checklist (Monday 10:00 AM)

```bash
# 1. Database backup verification
# Check last backup timestamp
SELECT pg_backup_start_time FROM pg_backup_history LIMIT 1;

# 2. Review analytics data retention
# Check data volume
SELECT 
  pg_size_pretty(pg_database_size('ial_analytics')) as db_size,
  (SELECT count(*) FROM page_views) as page_views_count,
  (SELECT count(*) FROM system_metrics) as metrics_count;

# 3. Check SSL certificate expiration
openssl s_client -connect inventallianceco.com:443 -servername inventallianceco.com \
  | openssl x509 -noout -dates

# 4. Review security logs
# Check for failed login attempts
# Check for suspicious activity

# 5. Update dependencies (if critical patches available)
npm audit
npm update
```

### Monthly Checklist (First Monday of Month)

- Review and optimize database indexes
- Analyze cost reports
- Update documentation
- Test disaster recovery procedures
- Review access logs
- Conduct security audit

---

## 4. Incident Response

### Severity Levels

| Level | Description | Response Time | Examples |
|-------|-------------|---------------|----------|
| **P0 - Critical** | Site down | < 15 minutes | Complete outage, data breach |
| **P1 - High** | Major functionality broken | < 1 hour | Login broken, forms not working |
| **P2 - Medium** | Degraded performance | < 4 hours | Slow load times, analytics not updating |
| **P3 - Low** | Minor issues | < 24 hours | UI glitches, non-critical errors |

### Incident Response Procedures

#### P0 - Site Down

**Symptoms:**
- Website returns 502/503/504 errors
- Cannot reach domain
- Database connection failures

**Immediate Actions:**
```bash
# 1. Check if site is actually down (not just you)
curl -I https://inventallianceco.com
# or use: https://downforeveryoneorjustme.com/inventallianceco.com

# 2. Check server status
# (Vercel)
vercel logs --prod | tail -50

# (Docker)
docker ps -a
# Check if container is running

# 3. Check database connectivity
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "SELECT 1"

# 4. Restart application
# (Vercel)
vercel deploy --prod

# (Docker)
docker restart ial-website

# 5. Notify stakeholders
# Send email to: operations@inventallianceco.com
# Include: Incident start time, symptoms, actions taken
```

**Escalation Path:**
1. On-call DevOps Engineer (0-15 min)
2. IT Manager (15-30 min)
3. CTO (30-60 min)

---

#### P1 - Authentication Broken

**Symptoms:**
- Cannot login to dashboard
- "Invalid credentials" errors
- JWT verification failures

**Troubleshooting:**
```bash
# 1. Verify environment variables are set
env | grep -E "(JWT_SECRET|ADMIN_USERNAME|ADMIN_PASSWORD)"

# 2. Check database connectivity (if USE_DATABASE=true)
psql -h $DB_HOST -U $DB_USER -d $DB_NAME \
  -c "SELECT username, is_active FROM users WHERE username = 'admin'"

# 3. Test JWT secret
node -e "
const jwt = require('jsonwebtoken');
const token = jwt.sign({ test: true }, process.env.JWT_SECRET);
const verified = jwt.verify(token, process.env.JWT_SECRET);
console.log('JWT test:', verified ? 'PASS' : 'FAIL');
"

# 4. Reset admin password (if needed)
node scripts/create-admin-user.js

# 5. Check rate limiting
# May be blocked due to too many failed attempts
# Clear rate limit: Restart application or wait 15 minutes
```

---

#### P2 - Performance Degradation

**Symptoms:**
- Page load times > 5 seconds
- API responses > 3 seconds
- High CPU/memory usage

**Troubleshooting:**
```bash
# 1. Check resource usage
# (Docker)
docker stats ial-website

# 2. Check database performance
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "
SELECT pid, now() - pg_stat_activity.query_start AS duration, query
FROM pg_stat_activity
WHERE state = 'active' AND query NOT LIKE '%pg_stat_activity%'
ORDER BY duration DESC;
"

# 3. Check slow queries
# Look for queries taking > 1000ms in application logs

# 4. Clear cache (if caching is implemented)
# Restart application to clear in-memory cache

# 5. Optimize database
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "VACUUM ANALYZE;"
```

---

### Incident Communication Template

**Subject:** [P0/P1/P2] Incident: [Brief Description]

```
Incident Details:
- Severity: [P0/P1/P2]
- Start Time: [YYYY-MM-DD HH:MM UTC]
- Impact: [Describe impact on users/business]
- Root Cause: [If known]

Actions Taken:
1. [Action 1]
2. [Action 2]

Current Status: [Investigating/Mitigating/Resolved]

Next Update: [Time]

Contact: [Your Name/Email]
```

---

## 5. Maintenance Procedures

### Planned Maintenance Window

**Schedule:** Every Sunday 2:00 AM - 4:00 AM UTC (Low traffic period)

**Pre-Maintenance Checklist:**
```bash
# 1. Backup database
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Notify users (24 hours advance)
# Post notice on website
# Send email to registered users

# 3. Prepare rollback plan
# Ensure previous version is available
git tag maintenance-$(date +%Y%m%d)

# 4. Test changes in staging environment
npm run build
npm start
# Run smoke tests
```

**Maintenance Steps:**
```bash
# 1. Put site in maintenance mode (if supported)
# Create maintenance.html and route all traffic to it

# 2. Deploy updates
git pull origin main
npm install
npm run build
npm start

# 3. Run database migrations (if any)
psql -h $DB_HOST -U $DB_USER -d $DB_NAME < database/migrations/XXX_migration.sql

# 4. Smoke test critical paths
curl https://inventallianceco.com/
curl https://inventallianceco.com/api/health
curl https://inventallianceco.com/dashboard (login required)

# 5. Remove maintenance mode

# 6. Monitor for 30 minutes
# Watch error logs
# Check performance metrics
```

**Rollback Procedure:**
```bash
# If issues detected, rollback immediately

# 1. Restore previous application version
git checkout maintenance-$(date +%Y%m%d)
npm install
npm run build
npm start

# 2. Restore database (if migrations were run)
psql -h $DB_HOST -U $DB_USER -d $DB_NAME < backup_YYYYMMDD_HHMMSS.sql

# 3. Notify stakeholders
# Document issues encountered
```

---

### Database Maintenance

**Weekly:**
```sql
-- Analyze table statistics
ANALYZE page_views;
ANALYZE visitor_sessions;
ANALYZE system_metrics;
ANALYZE users;
```

**Monthly:**
```sql
-- Vacuum and analyze (during maintenance window)
VACUUM ANALYZE;

-- Reindex if necessary
REINDEX DATABASE ial_analytics;

-- Check for bloat
SELECT schemaname, tablename, 
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

**Automated Data Retention:**
```bash
# Data retention policies run automatically
# To manually trigger:
curl -X POST https://inventallianceco.com/api/admin/retention \
  -H "Cookie: auth-token=YOUR_TOKEN"

# Expected behavior:
# - page_views older than 14 days: DELETED
# - visitor_sessions older than 14 days: DELETED
# - system_metrics older than 30 days: DELETED
# - Archived aggregated data retained for 1 year
```

---

## 6. Monitoring & Alerts

### Health Check Endpoint

**Endpoint:** `GET /api/health`

**Expected Response (Healthy):**
```json
{
  "status": "healthy",
  "timestamp": "2026-01-15T10:00:00.000Z",
  "database": {
    "healthy": true,
    "poolSize": 5,
    "idleConnections": 3,
    "waitingClients": 0
  },
  "uptime": 86400
}
```

**Expected Response (Unhealthy):**
```json
{
  "status": "unhealthy",
  "timestamp": "2026-01-15T10:00:00.000Z",
  "database": {
    "healthy": false,
    "poolSize": 0,
    "idleConnections": 0,
    "waitingClients": 0
  },
  "uptime": 86400
}
```

**HTTP Status Codes:**
- `200`: Healthy
- `503`: Unhealthy

---

### Monitoring Setup

**Recommended Tools:**
- **Uptime Monitoring:** UptimeRobot (free tier: 5-min checks)
- **Application Monitoring:** Vercel Analytics / New Relic
- **Database Monitoring:** pgAdmin / DataDog
- **Log Aggregation:** Better Stack / Logtail

**Alert Configuration:**
```yaml
# Example: UptimeRobot Configuration
monitors:
  - name: "Main Site"
    url: "https://inventallianceco.com"
    interval: 300 # 5 minutes
    alert_contacts:
      - email: operations@inventallianceco.com
      - sms: +234-XXX-XXXX-XXX
  
  - name: "Health Check"
    url: "https://inventallianceco.com/api/health"
    interval: 300
    expected_status: 200
    alert_contacts:
      - email: operations@inventallianceco.com
  
  - name: "Dashboard Login"
    url: "https://inventallianceco.com/login"
    interval: 600 # 10 minutes
    expected_status: 200
```

---

### Key Metrics to Monitor

| Metric | Normal Range | Warning Threshold | Critical Threshold |
|--------|-------------|-------------------|-------------------|
| Response Time | < 1s | > 3s | > 5s |
| Error Rate | < 1% | > 5% | > 10% |
| Database Connections | 2-8 | > 15 | > 18 |
| CPU Usage | < 50% | > 75% | > 90% |
| Memory Usage | < 70% | > 85% | > 95% |
| Disk Usage | < 70% | > 85% | > 95% |

---

## 7. Troubleshooting Guide

### Common Issues & Solutions

#### Issue: "Failed to fetch" errors in dashboard

**Symptoms:**
- Dashboard loads but shows no data
- Console error: `TypeError: Failed to fetch`

**Cause:** API routes not responding or CORS issues

**Solution:**
```bash
# 1. Check if API is accessible
curl https://inventallianceco.com/api/analytics?type=overview

# 2. Check application logs for errors
# Look for database connection errors

# 3. Verify environment variables
echo $USE_DATABASE
echo $DB_HOST

# 4. Test database connection
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "SELECT 1"

# 5. Restart application
# (This usually resolves connection pool issues)
```

---

#### Issue: PDF/CSV downloads failing

**Symptoms:**
- Download button shows error
- Console error about font files or PDFKit

**Cause:** PDFKit font files not found

**Solution:**
```bash
# 1. Run font setup script
node scripts/setup-pdfkit-fonts.js

# 2. Verify font files exist
ls -la .next/server/vendor-chunks/data/*.afm

# 3. Rebuild application
npm run build

# 4. Restart
npm start
```

---

#### Issue: Email not sending

**Symptoms:**
- Form submits successfully but no email received
- Console error about SMTP

**Cause:** SMTP configuration issues

**Solution:**
```bash
# 1. Verify SMTP credentials
env | grep SMTP

# 2. Test SMTP connection
node -e "
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});
transporter.verify().then(() => console.log('SMTP OK')).catch(err => console.error('SMTP ERROR:', err));
"

# 3. Check for rate limiting
# Gmail: 500 emails/day limit
# Solution: Use SendGrid/Mailgun for production

# 4. For Gmail: Ensure App Password is used (not regular password)
# Generate at: https://myaccount.google.com/apppasswords
```

---

#### Issue: High database connection usage

**Symptoms:**
- `pool exhausted` errors
- Slow API responses
- Database showing 18+ connections

**Cause:** Connection pool exhaustion or leaks

**Solution:**
```bash
# 1. Check active connections
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "
SELECT pid, state, query_start, query 
FROM pg_stat_activity 
WHERE datname = 'ial_analytics'
ORDER BY query_start;
"

# 2. Kill long-running queries (if any)
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = 'ial_analytics' 
  AND state = 'active'
  AND now() - query_start > interval '5 minutes';
"

# 3. Reduce pool size if consistently high
# Edit .env:
# DB_POOL_MAX=5 (reduced from 10)

# 4. Restart application to reset pool
```

---

## 8. Security Procedures

### Security Incident Response

**If you detect:**
- Unauthorized access attempts
- Data breach
- DDoS attack
- Malware/ransomware

**Immediate Actions:**
1. **DO NOT** panic or make hasty decisions
2. Isolate affected systems if possible
3. Contact Security Team: security@inventallianceco.com
4. Document everything:
   - Time of detection
   - What was observed
   - Actions taken
5. Preserve logs and evidence
6. Follow company security incident policy

---

### Access Log Review

**Check for suspicious activity:**
```bash
# 1. Failed login attempts
# Check application logs for "Login failed" messages
# Pattern: Multiple failures from same IP

# 2. Unusual access patterns
# Dashboard access from new countries
# Access during unusual hours

# 3. Large data exports
# Multiple CSV/PDF downloads in short time
# Unusually large database queries

# 4. SQL injection attempts
# Look for SQL keywords in URL parameters or POST bodies
# Example: SELECT, UNION, DROP, etc. in logs
```

**Alert security@ if you see:**
- 10+ failed login attempts from single IP
- Access from known malicious IPs/countries
- Attempts to access non-existent admin routes
- Unusual database queries

---

### Backup & Recovery

**Automated Backups:**
- **Frequency:** Daily at 3:00 AM UTC
- **Retention:** 30 days
- **Location:** Secure backup server (details in secure vault)

**Manual Backup:**
```bash
# Full database backup
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME \
  --format=custom \
  --file=backup_$(date +%Y%m%d_%H%M%S).dump

# Backup environment variables (encrypted)
env | grep -E "(JWT_SECRET|DB_PASSWORD|SMTP_PASS)" | \
  openssl enc -aes-256-cbc -salt -out env_backup.enc
```

**Restore Procedure:**
```bash
# 1. Stop application
docker stop ial-website

# 2. Restore database
pg_restore -h $DB_HOST -U $DB_USER -d $DB_NAME \
  --clean --if-exists backup_YYYYMMDD_HHMMSS.dump

# 3. Verify data
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "
SELECT count(*) FROM users;
SELECT count(*) FROM page_views;
"

# 4. Start application
docker start ial-website

# 5. Test functionality
curl https://inventallianceco.com/api/health
```

---

## Appendix A: Contact Information

| Role | Name | Email | Phone | Escalation |
|------|------|-------|-------|------------|
| IT Manager | [Name] | it@inventallianceco.com | [Phone] | Primary |
| DevOps Lead | [Name] | devops@inventallianceco.com | [Phone] | Technical |
| Security Officer | [Name] | security@inventallianceco.com | [Phone] | Security |
| CTO | [Name] | cto@inventallianceco.com | [Phone] | Executive |

**On-Call Rotation:** [Link to schedule]

---

## Appendix B: Useful Commands

```bash
# Quick health check
curl -s https://inventallianceco.com/api/health | jq

# Check database size
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "\l+"

# Clear cache and rebuild
rm -rf .next node_modules/.cache && npm run build

# View real-time logs (Docker)
docker logs -f ial-website

# Check SSL certificate
echo | openssl s_client -servername inventallianceco.com \
  -connect inventallianceco.com:443 2>/dev/null | openssl x509 -noout -dates

# Test database query performance
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "EXPLAIN ANALYZE SELECT * FROM page_views LIMIT 100;"
```

---

## Document Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-15 | QA Team | Initial version |

---

**END OF IT OPERATIONS RUNBOOK**

For customer-facing operations, see `OPERATIONS_CUSTOMER_CARE_GUIDE.md`

