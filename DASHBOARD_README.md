# Operations & Analytics Dashboard

## Overview

The Operations & Analytics Dashboard is a secure web portal that provides comprehensive insights into website user behavior and system performance metrics. It requires authentication to access and presents data in both visual (charts/graphs) and tabular (reports) formats.

## Features

### Authentication
- **Login Page** (`/login`): Secure authentication with username/password
- **Session Management**: JWT-based sessions with HTTP-only cookies
- **Protected Routes**: Dashboard access requires valid authentication
- **Logout**: Secure session termination

### Analytics Tracking

#### User Behavior Metrics
- **Page Views**: Total page views tracked automatically via middleware
- **Unique Visitors**: Distinct sessions identified by session ID
- **Sessions**: User session tracking with activity timestamps
- **Popular Pages**: Most visited pages with view counts
- **Traffic Sources**: Referrer tracking (Direct, Search Engines, Social Media, etc.)
- **Time Series Data**: Page views over time (hourly, daily, weekly)

#### System Metrics
- **Response Times**: Average API and page response times
- **Error Rates**: Percentage of requests resulting in errors
- **Status Codes**: Distribution of HTTP status codes (200, 404, 500, etc.)
- **Request Counts**: Total API requests tracked
- **Performance Monitoring**: Real-time system performance tracking

### Dashboard Views

#### Overview Tab
- **Metric Cards**: Key metrics at a glance
  - Total Page Views
  - Unique Visitors
  - Total Sessions
  - Average Response Time
- **Charts**:
  - Page Views Over Time (Line Chart)
  - Top 10 Pages (Bar Chart)
- **System Stats**: Status code distribution

#### Pages Tab
- **Bar Chart**: Page views by path
- **Data Table**: Detailed page view statistics

#### Sources Tab
- **Bar Chart**: Traffic sources visualization
- **Data Table**: Traffic source breakdown

#### System Tab
- **System Metrics Cards**: Request counts, response times, error rates
- **Status Code Distribution**: Visual breakdown of HTTP status codes

## Access

### Default Credentials
- **Username**: `admin`
- **Password**: `admin123`

**⚠️ IMPORTANT**: Change these credentials in production by setting environment variables:
```env
ADMIN_USERNAME=
ADMIN_PASSWORD=
JWT_SECRET=your-random-secret-key
```

### Login
1. Navigate to `/login`
2. Enter credentials
3. Redirected to `/dashboard` upon successful login

## Technical Architecture

### Authentication Flow
```
User → /login → POST /api/auth/login → JWT Token → Cookie Set → /dashboard
```

### Analytics Flow
```
Page Request → Middleware → Track Page View → Store in Memory → Dashboard Query → Display
```

### Data Storage
- **Current**: In-memory storage (Map data structures)
- **Production Recommendation**: Database (PostgreSQL, MongoDB, etc.)
- **Retention**: 30 days (configurable)
- **Max Records**: 10,000 per metric type

### API Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/verify` - Verify authentication status

#### Analytics
- `GET /api/analytics?type=overview` - Overview metrics
- `GET /api/analytics?type=pageviews` - Page view data
- `GET /api/analytics?type=pages` - Page statistics
- `GET /api/analytics?type=sources` - Traffic sources
- `GET /api/analytics?type=sessions` - Session data
- `GET /api/analytics?type=system` - System metrics
- `GET /api/analytics?type=system-stats` - System statistics
- `GET /api/analytics?type=timeseries` - Time series data

#### Query Parameters
- `startDate` (number): Unix timestamp for start date
- `endDate` (number): Unix timestamp for end date
- `interval` ('hour' | 'day' | 'week'): Time series interval

## Configuration

### Environment Variables

```env
# Authentication
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
JWT_SECRET=your-secret-key-change-in-production

# Analytics (optional)
ANALYTICS_RETENTION_DAYS=30
ANALYTICS_MAX_STORAGE_SIZE=10000
```

### Middleware Configuration

The middleware (`middleware.ts`) automatically tracks:
- Page views for all routes (except API, static files, dashboard, login)
- System metrics for API routes
- Session management

## Dashboard Components

### MetricCard
Displays a single metric with optional trend indicator and icon.

### LineChart
Time series visualization using Recharts library.

### BarChart
Categorical data visualization (pages, sources, etc.).

### DataTable
Tabular data display with sorting and formatting.

## Security Considerations

### Current Implementation
- JWT-based authentication
- HTTP-only cookies
- Password verification (basic)
- Protected API routes

### Production Recommendations
1. **Password Hashing**: Use bcrypt for password storage
2. **Database Storage**: Store credentials in database, not environment variables
3. **Rate Limiting**: Add rate limiting to login endpoint
4. **2FA**: Consider two-factor authentication
5. **Audit Logging**: Log all dashboard access
6. **Role-Based Access**: Implement user roles and permissions
7. **HTTPS Only**: Enforce HTTPS in production
8. **Session Timeout**: Implement automatic session timeout

## Data Privacy

### GDPR Compliance
- Analytics data is stored in-memory (not persisted)
- No personal data is collected (IP addresses are anonymized)
- Session IDs are randomly generated
- Data retention is limited (30 days)

### Production Considerations
- Implement data anonymization
- Add user consent mechanisms
- Provide data export/deletion capabilities
- Comply with privacy regulations

## Performance

### Current Performance
- **Dashboard Load Time**: < 2 seconds
- **Data Refresh**: Every 60 seconds
- **Chart Rendering**: Client-side with Recharts
- **API Response Time**: < 100ms (in-memory)

### Optimization Opportunities
1. **Database Indexing**: For faster queries
2. **Caching**: Cache frequently accessed metrics
3. **Pagination**: For large datasets
4. **Lazy Loading**: Load charts on demand
5. **WebSockets**: Real-time updates instead of polling

## Future Enhancements

### Planned Features
- [ ] Export reports (PDF, CSV)
- [ ] Custom date range picker
- [ ] Real-time updates (WebSockets)
- [ ] Email alerts for anomalies
- [ ] Custom dashboard widgets
- [ ] User management (multiple users)
- [ ] Role-based access control
- [ ] Database integration
- [ ] Historical data comparison
- [ ] A/B testing metrics
- [ ] Conversion tracking
- [ ] Geographic analytics
- [ ] Device/browser analytics

## Troubleshooting

### Login Issues
- Verify environment variables are set correctly
- Check browser console for errors
- Ensure cookies are enabled
- Clear browser cache and cookies

### No Data Showing
- Verify middleware is running
- Check that pages are being visited
- Ensure analytics API is accessible
- Review browser console for API errors

### Performance Issues
- Reduce date range
- Limit number of records displayed
- Check server resources
- Consider database migration for large datasets

## Support

For issues or questions:
1. Check browser console for errors
2. Review server logs
3. Verify environment configuration
4. Consult technical documentation

---

**Last Updated**: December 2024  
**Version**: 1.0

