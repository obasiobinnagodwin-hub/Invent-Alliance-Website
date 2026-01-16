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
    // Note: In Railway/production environments, we want to log warnings but not crash
    // if validation fails. This allows the app to start and logs can be reviewed.
    try {
      const { validateAndLog } = await import('./lib/config-validator');
      
      // Run validation (non-strict by default for Railway compatibility)
      // Set CONFIG_VALIDATION_STRICT=true to enable strict mode (throws on errors)
      const strictMode = process.env.CONFIG_VALIDATION_STRICT === 'true';
      validateAndLog(isProduction, strictMode);
    } catch (error) {
      // If the module itself fails to load, log but don't crash
      console.error('⚠️  Failed to load configuration validator (non-blocking):', error instanceof Error ? error.message : String(error));
      console.error('   Application will continue without configuration validation.');
    }
  }
}

