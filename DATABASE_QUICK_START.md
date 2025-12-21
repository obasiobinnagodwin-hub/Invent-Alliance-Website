# Database Quick Start Guide

## 🚀 Fastest Way to Get Started

### Step 1: Install PostgreSQL
```bash
# macOS
brew install postgresql
brew services start postgresql

# Windows - Download from postgresql.org
# Linux
sudo apt-get install postgresql
sudo systemctl start postgresql
```

### Step 2: Install Dependencies
```bash
npm install pg @types/pg
```

### Step 3: Create Database
```bash
psql -U postgres
CREATE DATABASE ial_analytics;
\q
```

### Step 4: Run Schema
```bash
psql -U postgres -d ial_analytics -f database/schema.sql
```

### Step 5: Configure Environment
Add to `.env.local`:
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ial_analytics
DB_USER=postgres
DB_PASSWORD=your_password
USE_DATABASE=true

# Keep existing
JWT_SECRET=your-secret-key
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

### Step 6: Update Code to Use Wrappers

**Update `app/api/auth/login/route.ts`:**
```typescript
import { login } from '@/lib/auth-wrapper';  // Changed

export async function POST(request: NextRequest) {
  // ...
  const result = await login(username, password);  // Added await
  // ...
}
```

**Update `app/api/analytics/route.ts`:**
```typescript
import {
  getPageViews,
  getUniqueVisitors,
  // ... etc
} from '@/lib/analytics-wrapper';  // Changed

export async function GET(request: NextRequest) {
  // ...
  const pageViews = await getPageViews(filters);  // Added await
  // ...
}
```

**Update `middleware.ts`:**
```typescript
import { trackPageView, trackSystemMetric } from '@/lib/analytics-wrapper';  // Changed

export function middleware(request: NextRequest) {
  // ...
  // Use .catch() for error handling since middleware can't be async
  trackPageView({...}).catch(console.error);
  trackSystemMetric({...}).catch(console.error);
  // ...
}
```

### Step 7: Test
1. Start your dev server: `npm run dev`
2. Visit `/login` and login with admin/admin123
3. Visit some pages on your site
4. Check `/dashboard` - data should persist!

## ✅ Done!

Your application is now using PostgreSQL for persistent storage.

## Troubleshooting

**Can't connect to database?**
- Check PostgreSQL is running: `psql -U postgres -c "SELECT NOW();"`
- Verify credentials in `.env.local`

**Functions are not async?**
- Database functions return Promises - use `await` or `.then()`
- Middleware can't be async, use `.catch()` for error handling

**No data showing?**
- Check database has data: `SELECT COUNT(*) FROM page_views;`
- Verify `USE_DATABASE=true` in `.env.local`
- Check browser console for errors

## Next Steps

- Change default admin password
- Set up database backups
- Review `DATABASE_MIGRATION.md` for detailed info
- See `database/README.md` for production setup

