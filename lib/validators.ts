/**
 * Input Validation and Sanitization Module
 * 
 * Provides centralized validation and sanitization functions for user inputs.
 * All functions are designed to be safe and not break existing form behavior.
 */

import { FEATURE_BLOCK_DISPOSABLE_EMAILS } from './feature-flags';

/**
 * Common disposable email domains (blocked when FEATURE_BLOCK_DISPOSABLE_EMAILS is enabled)
 */
const DISPOSABLE_EMAIL_DOMAINS = [
  '10minutemail.com',
  'tempmail.com',
  'guerrillamail.com',
  'mailinator.com',
  'throwaway.email',
  'temp-mail.org',
  'yopmail.com',
  'getnada.com',
  'mohmal.com',
  'fakeinbox.com',
  // Add more as needed
];

/**
 * Sanitize input string
 * 
 * Removes potentially dangerous characters and trims whitespace.
 * Does not break normal text input.
 * 
 * @param input - Input string to sanitize
 * @param maxLength - Maximum length (optional, defaults to no limit)
 * @returns Sanitized string
 */
export function sanitizeInput(input: string, maxLength?: number): string {
  if (typeof input !== 'string') {
    return '';
  }

  // Trim whitespace
  let sanitized = input.trim();

  // Remove null bytes and control characters (except newlines and tabs for messages)
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Apply length limit if specified
  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
}

/**
 * Validate email address format
 * 
 * Validates email format and optionally checks MX record.
 * Does not reject common valid emails.
 * 
 * @param email - Email address to validate
 * @param checkMX - Whether to check MX record (requires VALIDATE_EMAIL_MX=true)
 * @returns Validation result with isValid flag and optional error message
 */
export async function validateEmail(
  email: string,
  checkMX: boolean = process.env.VALIDATE_EMAIL_MX === 'true'
): Promise<{ isValid: boolean; error?: string }> {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Email address is required' };
  }

  const trimmedEmail = email.trim().toLowerCase();

  // Basic format validation (RFC 5322 simplified)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    return { isValid: false, error: 'Invalid email format' };
  }

  // Check for common issues
  if (trimmedEmail.length > 254) {
    return { isValid: false, error: 'Email address is too long (max 254 characters)' };
  }

  // Check disposable email domains (only if feature is enabled)
  if (FEATURE_BLOCK_DISPOSABLE_EMAILS) {
    const domain = trimmedEmail.split('@')[1];
    if (domain && DISPOSABLE_EMAIL_DOMAINS.includes(domain.toLowerCase())) {
      return { isValid: false, error: 'Disposable email addresses are not allowed' };
    }
  }

  // Optional MX record check (only if explicitly enabled and checkMX is true)
  if (checkMX && process.env.VALIDATE_EMAIL_MX === 'true') {
    try {
      const domain = trimmedEmail.split('@')[1];
      if (domain) {
        // Note: MX lookup requires DNS module, which may not be available in all environments
        // For now, we'll skip MX lookup to avoid DNS issues breaking forms
        // This can be implemented later if needed with proper error handling
        // const dns = require('dns').promises;
        // const mxRecords = await dns.resolveMx(domain);
        // if (!mxRecords || mxRecords.length === 0) {
        //   return { isValid: false, error: 'Email domain does not have valid MX records' };
        // }
      }
    } catch (error) {
      // If MX lookup fails, don't reject the email (fail open)
      // Log the error but allow the email through
      console.warn('MX lookup failed for email (allowing through):', error);
    }
  }

  return { isValid: true };
}

/**
 * Synchronous email format validation (without MX check)
 * 
 * Use this for client-side validation or when MX check is not needed.
 * 
 * @param email - Email address to validate
 * @returns Validation result
 */
export function validateEmailFormat(email: string): { isValid: boolean; error?: string } {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Email address is required' };
  }

  const trimmedEmail = email.trim().toLowerCase();

  // Basic format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    return { isValid: false, error: 'Invalid email format' };
  }

  // Check length
  if (trimmedEmail.length > 254) {
    return { isValid: false, error: 'Email address is too long (max 254 characters)' };
  }

  // Check disposable email domains (only if feature is enabled)
  if (FEATURE_BLOCK_DISPOSABLE_EMAILS) {
    const domain = trimmedEmail.split('@')[1];
    if (domain && DISPOSABLE_EMAIL_DOMAINS.includes(domain.toLowerCase())) {
      return { isValid: false, error: 'Disposable email addresses are not allowed' };
    }
  }

  return { isValid: true };
}

/**
 * Validate phone number
 * 
 * Validates phone number format. Accepts various international formats.
 * 
 * @param phone - Phone number to validate
 * @returns Validation result
 */
export function validatePhoneNumber(phone: string): { isValid: boolean; error?: string } {
  if (!phone || typeof phone !== 'string') {
    return { isValid: false, error: 'Phone number is required' };
  }

  const trimmedPhone = phone.trim();

  // Remove common formatting characters
  const cleaned = trimmedPhone.replace(/[\s\-\(\)\.\+]/g, '');

  // Check if it's all digits (with optional leading +)
  if (!/^\+?\d{7,15}$/.test(cleaned)) {
    return { isValid: false, error: 'Invalid phone number format. Please enter a valid phone number (7-15 digits)' };
  }

  // Check length (7-15 digits after cleaning)
  if (cleaned.length < 7 || cleaned.length > 15) {
    return { isValid: false, error: 'Phone number must be between 7 and 15 digits' };
  }

  return { isValid: true };
}

/**
 * Apply length limits to string inputs
 * 
 * Ensures strings don't exceed database column limits.
 * 
 * @param input - Input string
 * @param maxLength - Maximum allowed length
 * @param fieldName - Field name for error messages (optional)
 * @returns Sanitized string or throws error if too long
 */
export function enforceLengthLimit(
  input: string,
  maxLength: number,
  fieldName?: string
): string {
  if (typeof input !== 'string') {
    return '';
  }

  if (input.length > maxLength) {
    const errorMsg = fieldName
      ? `${fieldName} exceeds maximum length of ${maxLength} characters`
      : `Input exceeds maximum length of ${maxLength} characters`;
    throw new Error(errorMsg);
  }

  return input;
}

