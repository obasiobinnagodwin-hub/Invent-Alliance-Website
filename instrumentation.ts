/**
 * Next.js Instrumentation File
 * 
 * This file runs once when the server starts (not in Edge Runtime).
 * Use it to initialize monitoring, validation, or other server-side setup.
 * 
 * See: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // Only run in Node.js runtime (not Edge Runtime)
  if (typeof window === 'undefined' && process.env.NEXT_RUNTIME !== 'edge') {
    const isProduction = process.env.NODE_ENV === 'production';
    
    // Run configuration validation
    try {
      const { validateAndLog } = await import('./lib/config-validator');
      validateAndLog(isProduction);
    } catch (error) {
      // If validation fails in production, it will throw and prevent startup
      // In development, we log but continue
      if (isProduction) {
        throw error;
      } else {
        console.error('Configuration validation error (non-blocking in development):', error);
      }
    }
  }
}

