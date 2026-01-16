'use client';

import { FEATURE_ACCESSIBILITY_UPGRADES } from '@/lib/feature-flags';

/**
 * Skip to Content Link Component
 * 
 * Provides a keyboard-accessible skip link for screen reader and keyboard users.
 * WCAG 2.1 AA compliant - allows users to skip navigation and jump directly to main content.
 * 
 * Features:
 * - Visible on focus (keyboard navigation)
 * - Hidden by default (doesn't disrupt visual layout)
 * - Jumps to main content area
 * - Proper focus management
 * 
 * Gated behind FEATURE_ACCESSIBILITY_UPGRADES flag.
 */
export default function SkipToContent() {
  if (!FEATURE_ACCESSIBILITY_UPGRADES) {
    return null;
  }

  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md focus:font-bold focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
      onClick={(e) => {
        e.preventDefault();
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
          mainContent.focus();
          mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }}
    >
      Skip to main content
    </a>
  );
}

