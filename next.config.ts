import type { NextConfig } from "next";

// Check if secure headers feature is enabled
// Defaults to false - must be explicitly enabled via FEATURE_SECURE_HEADERS=true
const FEATURE_SECURE_HEADERS = process.env.FEATURE_SECURE_HEADERS === 'true';
// CSP enforcement toggle - set CSP_ENFORCE=true to switch from Report-Only to enforced CSP
const CSP_ENFORCE = process.env.CSP_ENFORCE === 'true';

const nextConfig: NextConfig = {
  output: 'standalone',
  // Enable instrumentation hook for server startup validation
  // Note: instrumentationHook is available in Next.js 15 but TypeScript types may lag
  experimental: {
    // @ts-ignore - instrumentationHook is valid in Next.js 15
    instrumentationHook: true,
  } as any,
  // Don't fail build on ESLint errors (warnings will still be shown)
  // Set to false if you want strict linting during build
  eslint: {
    ignoreDuringBuilds: process.env.ESLINT_STRICT !== 'true',
  },
  // Don't fail build on TypeScript errors (warnings will still be shown)
  // Set to false if you want strict type checking during build
  typescript: {
    ignoreBuildErrors: process.env.TYPESCRIPT_STRICT !== 'true',
  },
  webpack: (config, { isServer }) => {
    // Fix PDFKit font loading issues in Next.js
    if (isServer) {
      // PDFKit needs fs and path modules, so don't disable them
      // Only configure font file handling
      config.module = config.module || {};
      config.module.rules = config.module.rules || [];
      
      // Ensure PDFKit can access its font files
      // Copy font files to a location accessible at runtime
      config.module.rules.push({
        test: /node_modules[\\/]pdfkit[\\/]js[\\/]data[\\/].*\.afm$/,
        type: 'asset/resource',
        generator: {
          filename: 'static/fonts/[name][ext]'
        }
      });
    }
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.inventallianceco.com',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    // Optimize image sizes when FEATURE_OPTIMIZED_IMAGES is enabled
    // Reduced sizes to save bandwidth while maintaining quality
    deviceSizes: process.env.FEATURE_OPTIMIZED_IMAGES === 'true'
      ? [640, 750, 828, 1080, 1200, 1920] // Removed 2048, 3840 (rarely needed)
      : [640, 750, 828, 1080, 1200, 1920, 2048, 3840], // Default sizes
    imageSizes: process.env.FEATURE_OPTIMIZED_IMAGES === 'true'
      ? [16, 32, 48, 64, 96, 128, 256] // Removed 384 (rarely needed)
      : [16, 32, 48, 64, 96, 128, 256, 384], // Default sizes
    minimumCacheTTL: process.env.FEATURE_OPTIMIZED_IMAGES === 'true'
      ? 31536000 // 1 year when optimized
      : 60, // Default 60 seconds
  },
  trailingSlash: false,
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/services',
        destination: '/products-services',
        permanent: true,
      },
      {
        source: '/services/',
        destination: '/products-services',
        permanent: true,
      },
    ];
  },
  async headers() {
    const baseHeaders = [
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff',
      },
      {
        key: 'X-Frame-Options',
        value: 'DENY',
      },
      {
        key: 'X-XSS-Protection',
        value: '1; mode=block',
      },
      {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin',
      },
    ];

    // Add enhanced security headers if feature is enabled
    if (FEATURE_SECURE_HEADERS) {
      // Content Security Policy
      // Start in Report-Only mode to avoid breaking production unexpectedly
      // Set CSP_ENFORCE=true to switch to enforced CSP
      // 
      // Conservative CSP that allows Next.js to function:
      // - 'self' for same-origin resources
      // - 'unsafe-inline' for styles (Next.js uses inline styles) - TODO: Remove after migrating to CSS modules
      // - 'unsafe-eval' for Next.js development mode - TODO: Remove in production
      // - data: for inline images/data URIs
      // - blob: for Next.js image optimization
      // - Google Maps domains for embedded maps
      // 
      // To tighten CSP later:
      // 1. Remove 'unsafe-inline' from style-src and use nonces/hashes for inline styles
      // 2. Remove 'unsafe-eval' in production (only needed for Next.js dev mode)
      // 3. Add specific domain allowlists instead of wildcards
      // 4. Use nonces for inline scripts
      const cspDirectives = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.google.com https://maps.googleapis.com", // unsafe-eval needed for Next.js dev, unsafe-inline for inline scripts
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com", // unsafe-inline needed for Next.js inline styles
        "img-src 'self' data: blob: https: http:", // Allow all HTTPS/HTTP images (Next.js image optimization)
        "font-src 'self' data: https://fonts.gstatic.com",
        "connect-src 'self' https://www.google.com https://maps.googleapis.com", // For Google Maps API calls
        "frame-src 'self' https://www.google.com https://maps.google.com", // Google Maps iframe
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'", // Equivalent to X-Frame-Options: DENY
        "upgrade-insecure-requests", // Upgrade HTTP to HTTPS
      ];

      const cspValue = cspDirectives.join('; ');
      
      // Use Report-Only mode unless CSP_ENFORCE is set
      if (CSP_ENFORCE) {
        baseHeaders.push({
          key: 'Content-Security-Policy',
          value: cspValue,
        });
      } else {
        baseHeaders.push({
          key: 'Content-Security-Policy-Report-Only',
          value: cspValue,
        });
      }

      // Strict-Transport-Security (HSTS)
      // Tells browsers to only use HTTPS for this domain
      // max-age=31536000 = 1 year
      // includeSubDomains = applies to all subdomains
      // preload = allows inclusion in HSTS preload lists
      baseHeaders.push({
        key: 'Strict-Transport-Security',
        value: 'max-age=31536000; includeSubDomains; preload',
      });

      // Permissions-Policy (formerly Feature-Policy)
      // Restricts browser features to prevent abuse
      // Disables features that aren't needed for this application
      baseHeaders.push({
        key: 'Permissions-Policy',
        value: [
          'accelerometer=()',
          'ambient-light-sensor=()',
          'autoplay=()',
          'battery=()',
          'camera=()',
          'cross-origin-isolated=()',
          'display-capture=()',
          'document-domain=()',
          'encrypted-media=()',
          'execution-while-not-rendered=()',
          'execution-while-out-of-viewport=()',
          'fullscreen=(self)',
          'geolocation=()',
          'gyroscope=()',
          'keyboard-map=()',
          'magnetometer=()',
          'microphone=()',
          'midi=()',
          'navigation-override=()',
          'payment=()',
          'picture-in-picture=()',
          'publickey-credentials-get=()',
          'screen-wake-lock=()',
          'sync-xhr=()',
          'usb=()',
          'web-share=()',
          'xr-spatial-tracking=()',
        ].join(', '),
      });
    }

    return [
      {
        source: '/(.*)',
        headers: baseHeaders,
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/favicon.ico',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;

