/**
 * Security & GDPR Feature Flags Module
 * 
 * This module centralizes runtime toggles for security and GDPR feature rollouts.
 * Features can be enabled via environment variables (e.g., FEATURE_CSRF=true)
 * 
 * Default behavior: All features default to false unless explicitly enabled.
 * This ensures backward compatibility and allows gradual rollout.
 * 
 * Usage:
 *   import { FEATURE_CSRF, isFeatureEnabled } from '@/lib/feature-flags';
 *   
 *   if (FEATURE_CSRF) {
 *     // CSRF protection code
 *   }
 * 
 *   // Or use helper function
 *   if (isFeatureEnabled('CSRF')) {
 *     // CSRF protection code
 *   }
 */

/**
 * Environment Variable Validation
 * 
 * When enabled: Validates all required environment variables at application startup.
 * Throws error if critical variables (JWT_SECRET, ADMIN_PASSWORD, etc.) are missing or weak.
 * 
 * Gated features:
 * - Startup validation of JWT_SECRET strength
 * - Validation of ADMIN_PASSWORD length and complexity
 * - Validation of DATA_ENCRYPTION_KEY format
 * - Database connection string validation (if USE_DATABASE=true)
 * 
 * Safe to enable in production: YES (recommended)
 * Breaking change: NO (only fails startup if misconfigured)
 */
export const FEATURE_ENV_VALIDATION: boolean = 
  process.env.FEATURE_ENV_VALIDATION === 'true' ||
  process.env.NODE_ENV === 'production'; // Auto-enable in production

/**
 * CSRF Protection
 * 
 * When enabled: Implements CSRF token validation on all POST/PUT/DELETE endpoints.
 * Generates CSRF tokens in middleware, validates in API routes.
 * 
 * Gated features:
 * - CSRF token generation in middleware
 * - CSRF token validation in API routes (contact, academy-registration, auth/login)
 * - Client-side CSRF token inclusion in form submissions
 * 
 * Safe to enable in production: YES
 * Breaking change: NO (adds security, doesn't break existing functionality)
 */
export const FEATURE_CSRF: boolean = 
  process.env.FEATURE_CSRF === 'true';

/**
 * Enhanced Security Headers
 * 
 * When enabled: Adds comprehensive security headers (CSP, HSTS, Permissions-Policy).
 * Replaces basic headers with full security header suite.
 * 
 * Gated features:
 * - Content-Security-Policy (CSP) header
 * - Strict-Transport-Security (HSTS) header
 * - Permissions-Policy header
 * - Enhanced X-Frame-Options, X-Content-Type-Options
 * 
 * Safe to enable in production: YES (recommended)
 * Breaking change: MAYBE (CSP might break inline scripts/styles - test first)
 */
export const FEATURE_SECURE_HEADERS: boolean = 
  process.env.FEATURE_SECURE_HEADERS === 'true' ||
  process.env.NODE_ENV === 'production'; // Auto-enable in production

/**
 * Cookie Consent Banner
 * 
 * When enabled: Shows GDPR-compliant cookie consent banner and blocks analytics
 * until user provides consent. Necessary cookies are always enabled.
 * 
 * Gated features:
 * - Cookie consent banner display
 * - Consent-aware analytics tracking
 * - localStorage and cookie-based preference storage
 * - Analytics blocking until consent given
 * 
 * Safe to enable in production: YES
 * Breaking change: NO (analytics only runs with consent when enabled)
 */
export const FEATURE_COOKIE_CONSENT: boolean = 
  process.env.FEATURE_COOKIE_CONSENT === 'true';

/**
 * PII Pseudonymization/Hashing
 * 
 * When enabled: Pseudonymizes IP addresses and hashes sensitive data before storage.
 * Implements GDPR-friendly data minimization for analytics.
 * 
 * Gated features:
 * - IP address pseudonymization (last octet masked)
 * - User agent hashing for analytics
 * - Email address hashing (for non-essential analytics)
 * - Pseudonymized data storage in database
 * 
 * Safe to enable in production: YES
 * Breaking change: NO (adds new fields, keeps original for backward compatibility)
 */
export const FEATURE_PII_HASHING: boolean = 
  process.env.FEATURE_PII_HASHING === 'true';

/**
 * PII Email Encryption
 * 
 * When enabled: Encrypts user email addresses at rest using AES-256-GCM.
 * Stores encrypted email in email_encrypted column while maintaining backward compatibility
 * with plaintext email column during transition period.
 * 
 * Gated features:
 * - Email encryption at rest (AES-256-GCM)
 * - Dual storage (encrypted + plaintext during transition)
 * - Automatic decryption for lookups
 * 
 * Safe to enable in production: YES (with DATA_ENCRYPTION_KEY set)
 * Breaking change: NO (additive, maintains backward compatibility)
 */
export const FEATURE_PII_EMAIL_ENCRYPTION: boolean = 
  process.env.FEATURE_PII_EMAIL_ENCRYPTION === 'true';

/**
 * Secure Logger
 * 
 * When enabled: Implements secure logging that automatically redacts sensitive data.
 * Prevents passwords, tokens, and PII from appearing in logs.
 * 
 * Gated features:
 * - Automatic redaction of passwords, tokens, secrets
 * - Redaction of email addresses, phone numbers
 * - Structured logging format
 * - Log aggregation integration hooks
 * 
 * Safe to enable in production: YES (recommended)
 * Breaking change: NO (improves security, doesn't break functionality)
 */
export const FEATURE_SECURE_LOGGER: boolean = 
  process.env.FEATURE_SECURE_LOGGER === 'true'; // Default false - must be explicitly enabled

/**
 * Automated Data Retention Jobs
 * 
 * When enabled: Runs automated cleanup jobs to enforce data retention policies.
 * Deletes or archives data older than retention periods (14-30 days for analytics).
 * 
 * Gated features:
 * - Scheduled data retention cleanup (daily)
 * - Analytics data archiving before deletion
 * - Contact form submission retention (2 years)
 * - Academy registration retention (5 years)
 * - Manual retention trigger endpoint
 * 
 * Safe to enable in production: YES (with careful testing)
 * Breaking change: NO (only deletes old data, doesn't affect active data)
 */
export const FEATURE_RETENTION_JOBS: boolean = 
  process.env.FEATURE_RETENTION_JOBS === 'true';

/**
 * Retention Endpoint
 * 
 * When enabled: Provides admin-only endpoint to manually trigger data retention policies.
 * Allows operations team to run retention cleanup on-demand.
 * 
 * Gated features:
 * - Manual retention trigger endpoint (/api/admin/retention)
 * - Admin authentication required
 * - Retention summary reporting
 * 
 * Safe to enable in production: YES
 * Breaking change: NO (additive endpoint)
 */
export const FEATURE_RETENTION_ENDPOINT: boolean = 
  process.env.FEATURE_RETENTION_ENDPOINT === 'true';

/**
 * Records of Processing Activities (ROPA) Endpoint
 * 
 * When enabled: Provides admin-only endpoint to access Records of Processing Activities
 * register (GDPR Article 30) for internal audits and compliance reporting.
 * 
 * Gated features:
 * - ROPA register API endpoint (/api/admin/processing-activities)
 * - Admin authentication required
 * - JSON export of processing activities register
 * 
 * Safe to enable in production: YES
 * Breaking change: NO (additive endpoint)
 */
export const FEATURE_ROPA_ENDPOINT: boolean = 
  process.env.FEATURE_ROPA_ENDPOINT === 'true';

/**
 * Rate Limiting on Authentication
 * 
 * When enabled: Implements rate limiting on login endpoint to prevent brute force attacks.
 * Limits login attempts to 5 per 15 minutes per IP address.
 * 
 * Gated features:
 * - Rate limiting on /api/auth/login
 * - Rate limiting on /api/auth/verify (if needed)
 * - Rate limit headers (Retry-After)
 * - Rate limit store cleanup
 * 
 * Safe to enable in production: YES (recommended)
 * Breaking change: NO (adds security, legitimate users unaffected)
 */
export const FEATURE_RATE_LIMITING: boolean = 
  process.env.FEATURE_RATE_LIMITING === 'true' ||
  process.env.NODE_ENV === 'production'; // Auto-enable in production

/**
 * Rate Limiting on Login Endpoint
 * 
 * When enabled: Implements rate limiting specifically on /api/auth/login endpoint.
 * Limits failed login attempts to 5 per 15 minutes per IP address.
 * Only failed attempts count toward the limit (successful logins are not rate limited).
 * 
 * Gated features:
 * - Rate limiting on /api/auth/login (only counts failed attempts)
 * - Rate limit headers (Retry-After) in 429 responses
 * - Automatic cleanup of expired rate limit entries
 * - IP detection from x-forwarded-for, x-real-ip, cf-connecting-ip headers
 * 
 * Safe to enable in production: YES (recommended)
 * Breaking change: NO (adds security, legitimate users unaffected)
 * 
 * Note: This is a more specific flag than FEATURE_RATE_LIMITING.
 * Set FEATURE_RATE_LIMIT_LOGIN=true to enable login rate limiting.
 */
export const FEATURE_RATE_LIMIT_LOGIN: boolean = 
  process.env.FEATURE_RATE_LIMIT_LOGIN === 'true';

/**
 * Strict SameSite for Auth Cookies
 * 
 * When enabled: Sets auth-token cookie with SameSite=Strict instead of SameSite=Lax.
 * Provides stronger CSRF protection by preventing the cookie from being sent in cross-site requests.
 * 
 * Gated features:
 * - auth-token cookie uses SameSite=Strict when set during login
 * - Maintains httpOnly=true and secure=true (production) settings
 * 
 * Safe to enable in production: YES (recommended for same-domain deployments)
 * Breaking change: MAYBE (can break external auth flows, OAuth redirects, or iframe embeds)
 * 
 * Potential Impact:
 * - External OAuth providers: If users are redirected to external OAuth providers and then
 *   redirected back, the cookie may not be sent if the redirect goes through a third-party domain.
 * - Iframe embeds: If the dashboard is embedded in an iframe from a different domain,
 *   the cookie will not be sent, breaking authentication.
 * - Email links: If users click links in emails that redirect through tracking domains,
 *   the cookie may not be sent on the final redirect to your domain.
 * 
 * Recommendation: Enable this if your application:
 * - Does not use external OAuth providers
 * - Does not embed authenticated content in iframes from other domains
 * - Does not rely on email tracking redirects for authentication flows
 * 
 * Set FEATURE_STRICT_SAMESITE_AUTH=true to enable.
 */
export const FEATURE_STRICT_SAMESITE_AUTH: boolean = 
  process.env.FEATURE_STRICT_SAMESITE_AUTH === 'true';

/**
 * Data Encryption for Sensitive Fields
 * 
 * When enabled: Encrypts sensitive data (emails, PII) before database storage.
 * Uses AES-256-GCM encryption with environment-based key.
 * 
 * Gated features:
 * - Email address encryption in database
 * - Contact form data encryption
 * - Academy registration data encryption
 * - Encryption key rotation support
 * 
 * Safe to enable in production: YES (with proper key management)
 * Breaking change: YES (requires data migration if enabling on existing data)
 */
export const FEATURE_DATA_ENCRYPTION: boolean = 
  process.env.FEATURE_DATA_ENCRYPTION === 'true';

/**
 * Data Subject Access Request (DSAR) Portal
 * 
 * When enabled: Provides UI and API for GDPR data subject rights requests.
 * Allows users to request access, rectification, erasure, portability of their data.
 * 
 * Gated features:
 * - DSAR request form (/data-subject-request)
 * - DSAR API endpoint (/api/data-subject-request)
 * - Data export functionality
 * - Data deletion functionality
 * - Request tracking and status updates
 * 
 * Safe to enable in production: YES
 * Breaking change: NO (adds new functionality, doesn't modify existing)
 */
export const FEATURE_DSAR_PORTAL: boolean = 
  process.env.FEATURE_DSAR_PORTAL === 'true';

/**
 * Enhanced Input Validation
 * 
 * When enabled: Implements comprehensive input validation and sanitization.
 * Validates email formats, phone numbers, prevents SQL injection, XSS.
 * 
 * Gated features:
 * - Email format validation (RFC 5322 compliant)
 * - Phone number format validation
 * - Input sanitization (HTML tags, scripts)
 * - SQL injection prevention
 * 
 * Safe to enable in production: YES (recommended)
 * Breaking change: NO (only rejects invalid input, doesn't change valid input handling)
 */
export const FEATURE_INPUT_VALIDATION: boolean = 
  process.env.FEATURE_INPUT_VALIDATION === 'true' ||
  process.env.NODE_ENV === 'production'; // Auto-enable in production

/**
 * Block Disposable Email Addresses
 * 
 * When enabled: Rejects email addresses from known disposable/temporary email services.
 * Helps prevent spam and fake registrations.
 * 
 * Gated features:
 * - Disposable email domain detection
 * - Block list of temporary email providers
 * 
 * Safe to enable in production: YES
 * Breaking change: MAYBE (may reject some legitimate emails from disposable services)
 */
export const FEATURE_BLOCK_DISPOSABLE_EMAILS: boolean = 
  process.env.FEATURE_BLOCK_DISPOSABLE_EMAILS === 'true';

/**
 * API Response Caching
 * 
 * When enabled: Implements caching for API responses to reduce database load.
 * Caches analytics queries, reduces response times, lowers infrastructure costs.
 * 
 * Gated features:
 * - In-memory cache for API responses
 * - Cache TTL configuration per endpoint
 * - Cache invalidation on data updates
 * - Redis cache support (optional)
 * 
 * Safe to enable in production: YES
 * Breaking change: NO (improves performance, doesn't change API contracts)
 */
export const FEATURE_API_CACHING: boolean = 
  process.env.FEATURE_API_CACHING === 'true';

/**
 * Database Connection Pool Monitoring
 * 
 * When enabled: Adds monitoring and health checks for database connection pool.
 * Tracks pool size, idle connections, waiting clients, slow queries.
 * 
 * Gated features:
 * - Connection pool metrics endpoint (/api/health)
 * - Slow query logging (>1000ms)
 * - Connection pool health checks
 * - Automatic pool reconnection on failures
 * 
 * Safe to enable in production: YES (recommended)
 * Breaking change: NO (adds monitoring, doesn't change behavior)
 */
export const FEATURE_DB_MONITORING: boolean = 
  process.env.FEATURE_DB_MONITORING === 'true' ||
  process.env.NODE_ENV === 'production'; // Auto-enable in production

// ============================================================================
// OPTIMIZATION & PERFORMANCE FEATURE FLAGS
// ============================================================================

/**
 * API Response Caching
 * 
 * When enabled: Implements caching for API responses to reduce database load
 * and improve response times. Uses in-memory cache with configurable TTL.
 * 
 * Gated features:
 * - In-memory cache for API responses (analytics queries, dashboard data)
 * - Cache TTL configuration per endpoint
 * - Cache invalidation on data updates
 * - Redis cache support (optional, if REDIS_URL is set)
 * 
 * Risk notes:
 * - Caching correctness: Ensure cache invalidation is properly implemented
 *   when data changes. Stale data may be served if invalidation fails.
 * - Memory usage: In-memory cache grows with request volume. Monitor memory
 *   usage and consider Redis for distributed deployments.
 * - Cache stampede: High traffic may cause cache stampede. Consider implementing
 *   cache warming or request deduplication.
 * 
 * Safe to enable in production: YES (with proper cache invalidation)
 * Breaking change: NO (improves performance, doesn't change API contracts)
 */
export const FEATURE_API_CACHE: boolean = 
  process.env.FEATURE_API_CACHE === 'true';

/**
 * Database Index Migrations
 * 
 * When enabled: Applies database index optimizations via migrations.
 * Creates indexes on frequently queried columns to improve query performance.
 * 
 * Gated features:
 * - Index creation migrations (run manually or via migration script)
 * - Index performance monitoring
 * - Index usage statistics
 * 
 * Risk notes:
 * - Migration execution: Index creation can lock tables during creation.
 *   Run during low-traffic periods. Large tables may take significant time.
 * - Storage overhead: Indexes consume additional disk space. Monitor disk
 *   usage, especially for large tables.
 * - Write performance: More indexes can slow down INSERT/UPDATE operations.
 *   Balance read vs write performance based on workload.
 * 
 * Safe to enable in production: YES (run migrations during maintenance window)
 * Breaking change: NO (additive, improves query performance)
 * 
 * Note: This flag gates operational execution of index migrations. Migrations
 * themselves are documented in database/migrations/ directory.
 */
export const FEATURE_DB_INDEX_MIGRATIONS: boolean = 
  process.env.FEATURE_DB_INDEX_MIGRATIONS === 'true';

/**
 * Database Connection Pool Tuning
 * 
 * When enabled: Applies optimized connection pool settings based on workload.
 * Adjusts pool size, idle timeout, and connection limits for better performance.
 * 
 * Gated features:
 * - Dynamic pool size adjustment based on load
 * - Connection pool health monitoring
 * - Automatic pool scaling
 * - Connection leak detection
 * 
 * Risk notes:
 * - Pool exhaustion: Incorrect pool sizing can lead to connection exhaustion
 *   under high load. Monitor connection pool metrics and adjust accordingly.
 * - Resource usage: Larger pools consume more memory and database connections.
 *   Ensure database server can handle increased connection count.
 * - Configuration changes: Pool tuning requires careful testing. Monitor
 *   performance metrics after enabling.
 * 
 * Safe to enable in production: YES (with careful monitoring)
 * Breaking change: NO (optimizes existing behavior)
 */
export const FEATURE_DB_POOL_TUNING: boolean = 
  process.env.FEATURE_DB_POOL_TUNING === 'true';

/**
 * Analytics Batch Write Operations
 * 
 * When enabled: Batches multiple analytics writes into single database transactions.
 * Reduces database round-trips and improves write throughput.
 * 
 * Gated features:
 * - Batch insert operations for page views
 * - Batch insert operations for visitor sessions
 * - Transaction batching for analytics events
 * - Batch size configuration
 * 
 * Risk notes:
 * - Data loss: If application crashes before batch is flushed, buffered events
 *   may be lost. Implement graceful shutdown to flush pending batches.
 * - Memory usage: Batches consume memory until flushed. Monitor memory usage
 *   and set appropriate batch size limits.
 * - Latency: Events may be delayed until batch is flushed. Consider flush
 *   interval vs batch size trade-off.
 * 
 * Safe to enable in production: YES (with proper error handling)
 * Breaking change: NO (improves performance, maintains data consistency)
 */
export const FEATURE_ANALYTICS_BATCH_WRITE: boolean = 
  process.env.FEATURE_ANALYTICS_BATCH_WRITE === 'true';

/**
 * Analytics Join-Optimized Reads
 * 
 * When enabled: Optimizes analytics queries using JOINs instead of multiple
 * separate queries. Reduces database round-trips and improves query performance.
 * 
 * Gated features:
 * - JOIN-based analytics queries (page views + sessions)
 * - Query result caching for dashboard
 * - Optimized aggregation queries
 * - Query performance monitoring
 * 
 * Risk notes:
 * - Query complexity: JOIN queries can be more complex and harder to optimize.
 *   Monitor query execution plans and ensure proper indexes exist.
 * - Result set size: JOINs may return larger result sets. Ensure pagination
 *   and result limits are properly implemented.
 * - Query timeout: Complex JOINs may take longer. Set appropriate query timeouts
 *   and consider query result caching.
 * 
 * Safe to enable in production: YES (with proper indexes)
 * Breaking change: NO (optimizes existing queries)
 */
export const FEATURE_ANALYTICS_JOIN_OPTIMIZED_READS: boolean = 
  process.env.FEATURE_ANALYTICS_JOIN_OPTIMIZED_READS === 'true';

/**
 * Analytics Retention (14 Days)
 * 
 * When enabled: Reduces analytics data retention period from 30 days to 14 days.
 * Automatically deletes data older than 14 days to reduce storage costs.
 * 
 * Gated features:
 * - 14-day retention policy for page_views
 * - 14-day retention policy for visitor_sessions
 * - Automated cleanup jobs (if FEATURE_RETENTION_JOBS is enabled)
 * 
 * Risk notes:
 * - Data loss: Shortened retention means less historical data available for
 *   analysis. Ensure business stakeholders are aware of reduced retention.
 * - Compliance: Verify 14-day retention meets GDPR and other regulatory
 *   requirements for data retention.
 * - Historical analysis: Reduced retention may impact long-term trend analysis.
 *   Consider archiving before deletion if historical analysis is needed.
 * 
 * Safe to enable in production: YES (if business requirements allow)
 * Breaking change: NO (only affects data retention, not active functionality)
 */
export const FEATURE_ANALYTICS_RETENTION_14D: boolean = 
  process.env.FEATURE_ANALYTICS_RETENTION_14D === 'true';

/**
 * Analytics Data Archiving
 * 
 * When enabled: Archives old analytics data before deletion instead of hard deletion.
 * Moves data to archive tables or external storage for long-term retention.
 * 
 * Gated features:
 * - Archive tables for page_views and visitor_sessions
 * - Archive data migration jobs
 * - Archive data query support (read-only)
 * - Archive data export functionality
 * 
 * Risk notes:
 * - Storage costs: Archiving increases storage requirements. Monitor storage
 *   usage and consider compression or external storage (S3, etc.).
 * - Archive access: Archived data may be slower to query. Ensure archive
 *   queries are optimized or consider read replicas.
 * - Migration complexity: Archive migration requires careful planning to avoid
 *   data loss or service disruption. Test thoroughly before enabling.
 * 
 * Safe to enable in production: YES (with proper storage planning)
 * Breaking change: NO (additive, improves data retention)
 */
export const FEATURE_ANALYTICS_ARCHIVE: boolean = 
  process.env.FEATURE_ANALYTICS_ARCHIVE === 'true';

/**
 * Optimized Image Loading
 * 
 * When enabled: Implements optimized image loading using Next.js Image component,
 * lazy loading, and responsive images. Reduces bandwidth and improves page load times.
 * 
 * Gated features:
 * - Next.js Image component optimization
 * - Lazy loading for below-fold images
 * - Responsive image sizes (srcset)
 * - WebP/AVIF format support
 * - Image CDN integration (optional)
 * 
 * Risk notes:
 * - CSP compatibility: Image optimization may require additional CSP directives
 *   for image domains. Ensure FEATURE_SECURE_HEADERS CSP allows image sources.
 * - CDN configuration: If using external image CDN, ensure proper CORS and
 *   security headers are configured.
 * - Fallback handling: Ensure fallback images are available for unsupported
 *   formats or CDN failures.
 * 
 * Safe to enable in production: YES (recommended)
 * Breaking change: NO (improves performance, maintains image display)
 */
export const FEATURE_OPTIMIZED_IMAGES: boolean = 
  process.env.FEATURE_OPTIMIZED_IMAGES === 'true';

/**
 * Dynamic Imports (Code Splitting)
 * 
 * When enabled: Implements dynamic imports for large components and libraries
 * to enable code splitting and reduce initial bundle size.
 * 
 * Gated features:
 * - Dynamic imports for dashboard components
 * - Dynamic imports for heavy libraries (charts, maps)
 * - Route-based code splitting
 * - Lazy loading for non-critical components
 * 
 * Risk notes:
 * - Loading states: Dynamically imported components require loading states.
 *   Ensure proper loading indicators to avoid poor UX during component load.
 * - Error handling: Dynamic import failures must be handled gracefully.
 *   Implement error boundaries and fallback UI.
 * - Network dependency: Dynamic imports require network requests. Consider
 *   preloading critical dynamic imports or using service workers for caching.
 * 
 * Safe to enable in production: YES (recommended)
 * Breaking change: NO (improves performance, maintains functionality)
 */
export const FEATURE_DYNAMIC_IMPORTS: boolean = 
  process.env.FEATURE_DYNAMIC_IMPORTS === 'true';

/**
 * Dashboard Render Optimization
 * 
 * When enabled: Applies React memoization (useMemo, useCallback, React.memo)
 * to reduce unnecessary re-renders in the dashboard.
 * 
 * Gated features:
 * - useMemo for expensive derived data
 * - useCallback for event handlers
 * - React.memo for child components (MetricCard, charts, tables)
 * 
 * Risk notes:
 * - Over-memoization: Too much memoization can actually hurt performance.
 *   Only memoize components that are expensive to render or frequently re-render.
 * - Debugging: Memoized components can make debugging harder. Use React DevTools
 *   to verify memoization is working correctly.
 * 
 * Safe to enable in production: YES (recommended)
 * Breaking change: NO (optimizes rendering, doesn't change behavior)
 */
export const FEATURE_DASHBOARD_RENDER_OPTIMIZE: boolean = 
  process.env.FEATURE_DASHBOARD_RENDER_OPTIMIZE === 'true';

/**
 * Performance Monitoring Metrics
 * 
 * When enabled: Tracks performance metrics (DB query times, API response times,
 * export operation durations) and optional cost estimates.
 * 
 * Gated features:
 * - Performance metric tracking (duration, row count, etc.)
 * - Cost metric tracking (optional)
 * - DB query instrumentation
 * - Analytics API response time tracking
 * - Export endpoint instrumentation
 * - Optional external endpoint POST (only when MONITORING_ENDPOINT env is set)
 * 
 * Risk notes:
 * - Performance overhead: Minimal overhead from logging, but should be negligible.
 *   Metrics are logged asynchronously and don't block operations.
 * - External endpoint: Only sends data if MONITORING_ENDPOINT is explicitly set.
 *   By default, metrics are only logged locally.
 * - Data privacy: Ensure no sensitive data is included in metrics metadata.
 * 
 * Safe to enable in production: YES (low risk, lightweight)
 * Breaking change: NO (adds logging, doesn't change behavior)
 */
export const FEATURE_MONITORING_METRICS: boolean = 
  process.env.FEATURE_MONITORING_METRICS === 'true';

// ============================================================================
// USER EXPERIENCE (UX) FEATURE FLAGS
// ============================================================================

/**
 * Dashboard Mobile Header Optimization
 * 
 * When enabled: Implements optimized mobile header for dashboard with improved
 * navigation, responsive design, and touch-friendly interactions.
 * 
 * Gated features:
 * - Responsive mobile header layout
 * - Touch-optimized navigation menu
 * - Mobile-specific navigation patterns
 * - Improved mobile dashboard accessibility
 * 
 * Risk notes:
 * - Layout shifts: Mobile header changes may cause layout shifts. Test on
 *   various devices and screen sizes to ensure stable layout.
 * - Navigation patterns: Mobile navigation changes may confuse users familiar
 *   with desktop navigation. Consider user testing before full rollout.
 * 
 * Safe to enable in production: YES (with device testing)
 * Breaking change: NO (improves mobile UX, desktop unchanged)
 */
export const FEATURE_DASHBOARD_MOBILE_HEADER: boolean = 
  process.env.FEATURE_DASHBOARD_MOBILE_HEADER === 'true';

/**
 * Dashboard Skeleton Loading States
 * 
 * When enabled: Shows skeleton loading placeholders instead of blank screens
 * or spinners during data loading. Improves perceived performance and UX.
 * 
 * Gated features:
 * - Skeleton components for dashboard sections
 * - Skeleton loading for charts and tables
 * - Progressive loading indicators
 * - Shimmer animation effects
 * 
 * Risk notes:
 * - Performance: Skeleton components add DOM nodes. Ensure they don't impact
 *   rendering performance, especially on low-end devices.
 * - Accessibility: Skeleton loaders should be properly announced to screen
 *   readers. Ensure ARIA labels indicate loading state.
 * 
 * Safe to enable in production: YES (recommended)
 * Breaking change: NO (improves UX, maintains functionality)
 */
export const FEATURE_DASHBOARD_SKELETON_LOADING: boolean = 
  process.env.FEATURE_DASHBOARD_SKELETON_LOADING === 'true';

/**
 * Dashboard Error Recovery
 * 
 * When enabled: Implements improved error handling and recovery mechanisms
 * for dashboard errors. Provides retry options and graceful error messages.
 * 
 * Gated features:
 * - Automatic retry for failed API requests
 * - Error boundary components
 * - User-friendly error messages
 * - Error reporting and logging
 * - Offline detection and handling
 * 
 * Risk notes:
 * - Retry logic: Aggressive retry logic may overwhelm servers during outages.
 *   Implement exponential backoff and retry limits.
 * - Error messages: Ensure error messages don't expose sensitive information
 *   (API keys, internal paths, etc.). Use secure logger for error details.
 * 
 * Safe to enable in production: YES (recommended)
 * Breaking change: NO (improves error handling, maintains functionality)
 */
export const FEATURE_DASHBOARD_ERROR_RECOVERY: boolean = 
  process.env.FEATURE_DASHBOARD_ERROR_RECOVERY === 'true';

/**
 * Accessibility Upgrades
 * 
 * When enabled: Implements accessibility improvements including ARIA labels,
 * keyboard navigation, focus management, and screen reader support.
 * 
 * Gated features:
 * - ARIA labels and roles
 * - Keyboard navigation improvements
 * - Focus management
 * - Screen reader announcements
 * - Color contrast improvements
 * - Skip links
 * 
 * Risk notes:
 * - Visual changes: Accessibility improvements may require visual changes
 *   (focus indicators, etc.). Ensure changes don't negatively impact design.
 * - Testing: Accessibility requires testing with screen readers and keyboard
 *   navigation. Ensure comprehensive testing before enabling.
 * - Compliance: Verify improvements meet WCAG 2.1 AA standards. Consider
 *   professional accessibility audit.
 * 
 * Safe to enable in production: YES (recommended for compliance)
 * Breaking change: NO (improves accessibility, maintains functionality)
 */
export const FEATURE_ACCESSIBILITY_UPGRADES: boolean = 
  process.env.FEATURE_ACCESSIBILITY_UPGRADES === 'true';

/**
 * Trust Signals
 * 
 * When enabled: Displays trust signals (security badges, certifications,
 * testimonials) to improve user confidence and conversion rates.
 * 
 * Gated features:
 * - Security badges display
 * - SSL/TLS certificate indicators
 * - Privacy policy links
 * - GDPR compliance indicators
 * - Customer testimonials section
 * - Trust badges (if applicable)
 * 
 * Risk notes:
 * - Accuracy: Ensure trust signals are accurate and up-to-date. Outdated
 *   certifications or badges may harm trust if discovered.
 * - Legal compliance: Trust signals must comply with advertising and
 *   marketing regulations. Verify claims are truthful and verifiable.
 * 
 * Safe to enable in production: YES
 * Breaking change: NO (additive, improves trust and conversion)
 */
export const FEATURE_TRUST_SIGNALS: boolean = 
  process.env.FEATURE_TRUST_SIGNALS === 'true';

/**
 * Call-to-Action (CTA) Button Optimizations
 * 
 * When enabled: Implements optimized CTA buttons with improved visibility,
 * placement, and design to improve conversion rates.
 * 
 * Gated features:
 * - Optimized CTA button design
 * - Strategic CTA placement
 * - A/B testing support for CTAs
 * - CTA click tracking
 * - Mobile-optimized CTAs
 * 
 * Risk notes:
 * - Design changes: CTA changes may impact visual design. Ensure changes
 *   align with brand guidelines and don't negatively impact aesthetics.
 * - A/B testing: If implementing A/B testing, ensure proper tracking and
 *   statistical significance before making permanent changes.
 * 
 * Safe to enable in production: YES
 * Breaking change: NO (improves conversion, maintains functionality)
 */
export const FEATURE_CTA_BUTTONS: boolean = 
  process.env.FEATURE_CTA_BUTTONS === 'true';

/**
 * Funnel Goals and Conversion Tracking
 * 
 * When enabled: Implements funnel goal tracking and conversion analytics
 * to measure user journey effectiveness and optimize conversion funnels.
 * 
 * Gated features:
 * - Funnel goal definition
 * - Conversion event tracking
 * - Funnel visualization in dashboard
 * - Conversion rate analytics
 * - A/B testing integration
 * 
 * Risk notes:
 * - Privacy: Funnel tracking must comply with GDPR and cookie consent
 *   requirements. Ensure FEATURE_COOKIE_CONSENT is properly configured.
 * - Data accuracy: Ensure funnel tracking accurately captures user journeys.
 *   Test thoroughly to avoid false positives or missed conversions.
 * 
 * Safe to enable in production: YES (with proper consent handling)
 * Breaking change: NO (additive analytics, doesn't change user flow)
 */
export const FEATURE_FUNNEL_GOALS: boolean = 
  process.env.FEATURE_FUNNEL_GOALS === 'true';

/**
 * Academy Multi-Step Form
 * 
 * When enabled: Implements a multi-step registration form for the Academy
 * registration page to reduce abandonment and improve user experience.
 * 
 * Gated features:
 * - Multi-step form flow (3 steps)
 * - Progress indicator
 * - Step-by-step validation
 * - Input persistence between steps
 * - Review step before submission
 * 
 * Risk notes:
 * - Form complexity: Multi-step forms may confuse some users. Ensure clear
 *   progress indicators and easy navigation between steps.
 * - Data persistence: Ensure form data persists correctly between steps and
 *   doesn't get lost on page refresh or navigation.
 * - Validation: Step-by-step validation must be clear and prevent users from
 *   proceeding with invalid data.
 * 
 * Safe to enable in production: YES (with user testing)
 * Breaking change: NO (fallback to single-page form when disabled)
 */
export const FEATURE_ACADEMY_MULTI_STEP_FORM: boolean = 
  process.env.FEATURE_ACADEMY_MULTI_STEP_FORM === 'true';

/**
 * Feature flag registry for programmatic access
 */
export const FEATURE_FLAGS = {
  // Security & GDPR Flags
  ENV_VALIDATION: FEATURE_ENV_VALIDATION,
  CSRF: FEATURE_CSRF,
  SECURE_HEADERS: FEATURE_SECURE_HEADERS,
  COOKIE_CONSENT: FEATURE_COOKIE_CONSENT,
  PII_HASHING: FEATURE_PII_HASHING,
  SECURE_LOGGER: FEATURE_SECURE_LOGGER,
  RETENTION_JOBS: FEATURE_RETENTION_JOBS,
  RATE_LIMITING: FEATURE_RATE_LIMITING,
  RATE_LIMIT_LOGIN: FEATURE_RATE_LIMIT_LOGIN,
  STRICT_SAMESITE_AUTH: FEATURE_STRICT_SAMESITE_AUTH,
  DATA_ENCRYPTION: FEATURE_DATA_ENCRYPTION,
  DSAR_PORTAL: FEATURE_DSAR_PORTAL,
  INPUT_VALIDATION: FEATURE_INPUT_VALIDATION,
  BLOCK_DISPOSABLE_EMAILS: FEATURE_BLOCK_DISPOSABLE_EMAILS,
  RETENTION_ENDPOINT: FEATURE_RETENTION_ENDPOINT,
  ROPA_ENDPOINT: FEATURE_ROPA_ENDPOINT,
  PII_EMAIL_ENCRYPTION: FEATURE_PII_EMAIL_ENCRYPTION,
  // Optimization & Performance Flags
  API_CACHE: FEATURE_API_CACHE,
  DB_INDEX_MIGRATIONS: FEATURE_DB_INDEX_MIGRATIONS,
  DB_POOL_TUNING: FEATURE_DB_POOL_TUNING,
  ANALYTICS_BATCH_WRITE: FEATURE_ANALYTICS_BATCH_WRITE,
  ANALYTICS_JOIN_OPTIMIZED_READS: FEATURE_ANALYTICS_JOIN_OPTIMIZED_READS,
  ANALYTICS_RETENTION_14D: FEATURE_ANALYTICS_RETENTION_14D,
  ANALYTICS_ARCHIVE: FEATURE_ANALYTICS_ARCHIVE,
  OPTIMIZED_IMAGES: FEATURE_OPTIMIZED_IMAGES,
  DYNAMIC_IMPORTS: FEATURE_DYNAMIC_IMPORTS,
  DASHBOARD_RENDER_OPTIMIZE: FEATURE_DASHBOARD_RENDER_OPTIMIZE,
  MONITORING_METRICS: FEATURE_MONITORING_METRICS,
  // UX Flags
  DASHBOARD_MOBILE_HEADER: FEATURE_DASHBOARD_MOBILE_HEADER,
  DASHBOARD_SKELETON_LOADING: FEATURE_DASHBOARD_SKELETON_LOADING,
  DASHBOARD_ERROR_RECOVERY: FEATURE_DASHBOARD_ERROR_RECOVERY,
  ACCESSIBILITY_UPGRADES: FEATURE_ACCESSIBILITY_UPGRADES,
  TRUST_SIGNALS: FEATURE_TRUST_SIGNALS,
  CTA_BUTTONS: FEATURE_CTA_BUTTONS,
  FUNNEL_GOALS: FEATURE_FUNNEL_GOALS,
  ACADEMY_MULTI_STEP_FORM: FEATURE_ACADEMY_MULTI_STEP_FORM,
  // Legacy/Deprecated Flags (kept for backward compatibility)
  DB_MONITORING: FEATURE_DB_MONITORING,
} as const;

/**
 * Type for feature flag names
 */
export type FeatureFlagName = keyof typeof FEATURE_FLAGS;

/**
 * Helper function to check if a feature is enabled
 * 
 * @param flagName - Name of the feature flag (e.g., 'CSRF', 'COOKIE_CONSENT')
 * @returns true if the feature is enabled, false otherwise
 * 
 * @example
 * if (isFeatureEnabled('CSRF')) {
 *   // CSRF protection code
 * }
 */
export function isFeatureEnabled(flagName: FeatureFlagName): boolean {
  return FEATURE_FLAGS[flagName] === true;
}

/**
 * Alias for isFeatureEnabled() - provides shorter function name
 * 
 * @param flagName - Name of the feature flag (e.g., 'CSRF', 'COOKIE_CONSENT')
 * @returns true if the feature is enabled, false otherwise
 * 
 * @example
 * if (isEnabled('CSRF')) {
 *   // CSRF protection code
 * }
 */
export function isEnabled(flagName: FeatureFlagName): boolean {
  return isFeatureEnabled(flagName);
}

/**
 * Helper function to get all enabled features
 * 
 * @returns Array of enabled feature flag names
 * 
 * @example
 * const enabled = getEnabledFeatures();
 * console.log('Enabled features:', enabled);
 * // ['ENV_VALIDATION', 'SECURE_HEADERS', 'SECURE_LOGGER']
 */
export function getEnabledFeatures(): FeatureFlagName[] {
  return Object.entries(FEATURE_FLAGS)
    .filter(([_, enabled]) => enabled === true)
    .map(([name]) => name as FeatureFlagName);
}

/**
 * Helper function to check if any features are enabled
 * 
 * @returns true if at least one feature is enabled
 */
export function hasAnyFeaturesEnabled(): boolean {
  return Object.values(FEATURE_FLAGS).some(enabled => enabled === true);
}

/**
 * Get feature flag status summary (useful for debugging/admin)
 * 
 * @returns Object mapping feature names to their enabled status
 */
export function getFeatureFlagsStatus(): Record<FeatureFlagName, boolean> {
  return { ...FEATURE_FLAGS };
}

/**
 * Validate feature flag configuration
 * 
 * Checks for logical conflicts or missing dependencies between flags.
 * 
 * @returns Array of validation warnings/errors (empty if all valid)
 * 
 * @example
 * const warnings = validateFeatureFlags();
 * if (warnings.length > 0) {
 *   console.warn('Feature flag warnings:', warnings);
 * }
 */
export function validateFeatureFlags(): string[] {
  const warnings: string[] = [];

  // CSRF requires secure headers for proper implementation
  if (FEATURE_CSRF && !FEATURE_SECURE_HEADERS) {
    warnings.push('FEATURE_CSRF is enabled but FEATURE_SECURE_HEADERS is disabled. CSRF protection works best with secure headers.');
  }

  // Cookie consent should be enabled if PII hashing is enabled (GDPR best practice)
  if (FEATURE_PII_HASHING && !FEATURE_COOKIE_CONSENT) {
    warnings.push('FEATURE_PII_HASHING is enabled but FEATURE_COOKIE_CONSENT is disabled. Consider enabling cookie consent for GDPR compliance.');
  }

  // Data encryption requires DATA_ENCRYPTION_KEY environment variable
  if (FEATURE_DATA_ENCRYPTION && !process.env.DATA_ENCRYPTION_KEY) {
    warnings.push('FEATURE_DATA_ENCRYPTION is enabled but DATA_ENCRYPTION_KEY is not set. Encryption will fail.');
  }

  // Retention jobs should have secure logger for audit trail
  if (FEATURE_RETENTION_JOBS && !FEATURE_SECURE_LOGGER) {
    warnings.push('FEATURE_RETENTION_JOBS is enabled but FEATURE_SECURE_LOGGER is disabled. Consider enabling secure logger for audit trail.');
  }

  // DSAR portal requires data encryption or at least PII hashing
  if (FEATURE_DSAR_PORTAL && !FEATURE_DATA_ENCRYPTION && !FEATURE_PII_HASHING) {
    warnings.push('FEATURE_DSAR_PORTAL is enabled but data protection features are disabled. Consider enabling FEATURE_DATA_ENCRYPTION or FEATURE_PII_HASHING.');
  }

  return warnings;
}

/**
 * Log feature flags status (useful for startup/debugging)
 * 
 * Logs which features are enabled and any validation warnings.
 * Only logs in development or if explicitly enabled via FEATURE_FLAGS_DEBUG=true
 */
export function logFeatureFlagsStatus(): void {
  const shouldLog = 
    process.env.NODE_ENV === 'development' || 
    process.env.FEATURE_FLAGS_DEBUG === 'true';

  if (!shouldLog) {
    return;
  }

  const enabled = getEnabledFeatures();
  const warnings = validateFeatureFlags();

  console.log('🔐 Feature Flags Status:');
  console.log(`   Enabled (${enabled.length}):`, enabled.length > 0 ? enabled.join(', ') : 'none');
  console.log(`   Disabled (${Object.keys(FEATURE_FLAGS).length - enabled.length}):`, 
    Object.keys(FEATURE_FLAGS).filter(name => !enabled.includes(name as FeatureFlagName)).join(', ') || 'none');

  if (warnings.length > 0) {
    console.warn('⚠️  Feature Flag Warnings:');
    warnings.forEach(warning => console.warn(`   - ${warning}`));
  } else {
    console.log('✅ No feature flag configuration issues detected');
  }
}

// Auto-log feature flags status on module load (only in development/debug mode)
if (process.env.NODE_ENV === 'development' || process.env.FEATURE_FLAGS_DEBUG === 'true') {
  logFeatureFlagsStatus();
}

