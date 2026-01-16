'use client';

import { FEATURE_CTA_BUTTONS } from '@/lib/feature-flags';
import React from 'react';

interface CTAButtonProps {
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'success';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

/**
 * CTA Button Component
 * 
 * Improved call-to-action button with variants, loading states, and optional icons.
 * Designed to improve clarity and consistency across forms.
 * 
 * Features:
 * - Variant support (primary/secondary/success)
 * - Loading state with disabled prevention
 * - Optional icon support
 * - Consistent styling with Tailwind design system
 * - Prevents double submission when loading
 * 
 * Gated behind FEATURE_CTA_BUTTONS flag.
 */
export default function CTAButton({
  type = 'button',
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  children,
  onClick,
  className = '',
}: CTAButtonProps) {
  // If feature is disabled, render as simple button
  if (!FEATURE_CTA_BUTTONS) {
    return (
      <button
        type={type}
        disabled={disabled || loading}
        onClick={onClick}
        className={className}
      >
        {children}
      </button>
    );
  }

  // Variant styles
  const variantStyles = {
    primary: 'bg-gradient-neon-blue text-white hover-glow-blue shadow-neon-cyan',
    secondary: 'bg-slate-600 text-white hover:bg-slate-700',
    success: 'bg-green-600 text-white hover:bg-green-700',
  };

  const baseStyles = `w-full py-3 px-6 rounded-md font-bold transition-all duration-300 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-elevated ${
    variantStyles[variant]
  }`;

  const focusRingColors = {
    primary: 'focus:ring-neon-cyan',
    secondary: 'focus:ring-slate-400',
    success: 'focus:ring-green-400',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${focusRingColors[variant]} ${className}`}
      aria-busy={loading}
    >
      <span className="flex items-center justify-center gap-2">
        {loading ? (
          <>
            <svg
              className="animate-spin h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Processing...</span>
          </>
        ) : (
          <>
            {icon && <span className="flex-shrink-0">{icon}</span>}
            <span>{children}</span>
          </>
        )}
      </span>
    </button>
  );
}

