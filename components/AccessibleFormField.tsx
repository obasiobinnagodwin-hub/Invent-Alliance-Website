'use client';

import { FEATURE_ACCESSIBILITY_UPGRADES } from '@/lib/feature-flags';
import React from 'react';

interface AccessibleFormFieldProps {
  id: string;
  name: string;
  label: string;
  type?: 'text' | 'email' | 'tel' | 'textarea';
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  error?: string;
  helpText?: string;
  required?: boolean;
  placeholder?: string;
  rows?: number;
  className?: string;
  'aria-describedby'?: string;
}

/**
 * Accessible Form Field Component
 * 
 * WCAG 2.1 AA compliant form field with proper label associations,
 * error announcements, and touch-friendly sizing.
 * 
 * Features:
 * - Proper label/htmlFor/id associations
 * - aria-invalid for error states
 * - aria-describedby for help text and errors
 * - role="alert" for error messages
 * - Minimum touch target size (48px height)
 * - Screen reader friendly
 * 
 * Gated behind FEATURE_ACCESSIBILITY_UPGRADES flag.
 */
export default function AccessibleFormField({
  id,
  name,
  label,
  type = 'text',
  value,
  onChange,
  error,
  helpText,
  required = false,
  placeholder,
  rows = 6,
  className = '',
  'aria-describedby': ariaDescribedBy,
}: AccessibleFormFieldProps) {
  // Generate IDs for error and help text
  const errorId = error ? `${id}-error` : undefined;
  const helpId = helpText ? `${id}-help` : undefined;
  
  // Combine aria-describedby values
  const describedBy = [
    ariaDescribedBy,
    errorId,
    helpId,
  ].filter(Boolean).join(' ') || undefined;

  // Base input classes - ensure min height for touch targets
  const baseInputClasses = `w-full px-4 py-2 border rounded-md bg-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-neon-cyan focus:border-neon-cyan min-h-[48px] ${
    error ? 'border-red-400' : 'border-purple-500/50'
  } ${className}`;
  
  // For textarea, adjust min-height differently
  const textareaClasses = type === 'textarea' 
    ? baseInputClasses.replace('min-h-[48px]', 'min-h-[120px]')
    : baseInputClasses;

  // If accessibility upgrades are disabled, render as a simple wrapper
  if (!FEATURE_ACCESSIBILITY_UPGRADES) {
    if (type === 'textarea') {
      return (
        <div>
          <label htmlFor={id} className="block text-sm font-bold text-white mb-2 text-elevated">
            {label} {required && '*'}
          </label>
          <textarea
            id={id}
            name={name}
            required={required}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            className={baseInputClasses}
          />
          {error && (
            <p className="mt-1 text-sm text-red-300 font-semibold">{error}</p>
          )}
        </div>
      );
    }

    return (
      <div>
        <label htmlFor={id} className="block text-sm font-bold text-white mb-2 text-elevated">
          {label} {required && '*'}
        </label>
        <input
          type={type}
          id={id}
          name={name}
          required={required}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={baseInputClasses}
        />
        {error && (
          <p className="mt-1 text-sm text-red-300 font-semibold">{error}</p>
        )}
      </div>
    );
  }

  // Full accessibility implementation when flag is enabled
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-bold text-white mb-2 text-elevated">
        {label} {required && <span aria-label="required">*</span>}
      </label>
      
      {helpText && (
        <p id={helpId} className="text-sm text-gray-300 mb-2">
          {helpText}
        </p>
      )}

      {type === 'textarea' ? (
        <textarea
          id={id}
          name={name}
          required={required}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          className={textareaClasses}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={describedBy}
          aria-required={required}
        />
      ) : (
        <input
          type={type}
          id={id}
          name={name}
          required={required}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={baseInputClasses}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={describedBy}
          aria-required={required}
        />
      )}

      {error && (
        <p
          id={errorId}
          className="mt-1 text-sm text-red-300 font-semibold"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}
    </div>
  );
}

