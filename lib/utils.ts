/**
 * Utility functions for performance optimization
 */

/**
 * Generate static params for dynamic routes
 * This ensures all pages are statically generated at build time
 */
export function generateStaticParams() {
  return [];
}

/**
 * Revalidate time for ISR (Incremental Static Regeneration)
 * Set to false for fully static pages, or a number in seconds for ISR
 */
export const revalidate = false;

/**
 * Force static generation
 */
export const dynamic = 'force-static';

/**
 * Dynamic route segment config
 */
export const dynamicParams = false;

