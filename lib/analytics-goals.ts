/**
 * Analytics Goals & Funnel Tracking
 * 
 * Tracks conversion goals and funnel steps without collecting PII.
 * Respects cookie consent when FEATURE_COOKIE_CONSENT is enabled.
 * 
 * Gated behind FEATURE_FUNNEL_GOALS flag.
 */

import { FEATURE_FUNNEL_GOALS, FEATURE_COOKIE_CONSENT } from './feature-flags';

/**
 * Goal types for conversion tracking
 */
export enum GoalType {
  CONTACT_FORM_SUBMIT = 'contact_form_submit',
  ACADEMY_REGISTRATION = 'academy_registration',
  DOWNLOAD_REPORT = 'download_report',
  PAGE_VIEW = 'page_view', // For funnel tracking
}

/**
 * Funnel names
 */
export enum FunnelName {
  CONTACT_FORM = 'contact_form',
  ACADEMY_REGISTRATION = 'academy_registration',
}

/**
 * Funnel step names
 */
export enum FunnelStep {
  PAGE_LOAD = 'page_load',
  FORM_START = 'form_start',
  FORM_SUBMIT = 'form_submit',
  SUCCESS = 'success',
}

/**
 * Goal event structure (no PII)
 */
export interface GoalEvent {
  type: GoalType;
  timestamp: number;
  metadata?: Record<string, string | number | boolean>; // Non-PII only
}

/**
 * Funnel step event structure
 */
export interface FunnelStepEvent {
  funnel: FunnelName;
  step: FunnelStep;
  timestamp: number;
  metadata?: Record<string, string | number | boolean>; // Non-PII only
}

/**
 * Check if analytics consent is given (client-side)
 * Only checks if FEATURE_COOKIE_CONSENT is enabled
 */
function hasAnalyticsConsent(): boolean {
  if (!FEATURE_COOKIE_CONSENT) {
    // If cookie consent feature is disabled, allow tracking (backward compatibility)
    return true;
  }

  if (typeof window === 'undefined') {
    return false;
  }

  // Parse cookie-consent cookie
  const consentCookie = document.cookie
    .split('; ')
    .find(row => row.startsWith('cookie-consent='));

  if (!consentCookie) {
    return false;
  }

  try {
    const consentValue = consentCookie.split('=')[1];
    const consent = JSON.parse(decodeURIComponent(consentValue));
    return consent.analytics === true;
  } catch {
    return false;
  }
}

/**
 * Track a conversion goal
 * 
 * @param goal - Goal type to track
 * @param metadata - Optional non-PII metadata (e.g., { subjectCategory: 'general', stream: 'professional' })
 */
export function trackGoal(goal: GoalType, metadata?: Record<string, string | number | boolean>): void {
  if (!FEATURE_FUNNEL_GOALS) {
    return; // No-op when feature is disabled
  }

  // Check consent before tracking
  if (!hasAnalyticsConsent()) {
    return; // No consent, don't track
  }

  try {
    const goalEvent: GoalEvent = {
      type: goal,
      timestamp: Date.now(),
      metadata: metadata || {},
    };

    // Send to API endpoint
    fetch('/api/analytics/goals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(goalEvent),
      keepalive: true, // Ensure request completes even if page unloads
    }).catch((error) => {
      // Silently fail - don't interrupt user flow
      console.debug('Goal tracking failed:', error);
    });
  } catch (error) {
    // Silently fail - don't interrupt user flow
    console.debug('Goal tracking error:', error);
  }
}

/**
 * Track a funnel step
 * 
 * @param funnel - Funnel name
 * @param step - Step name
 * @param metadata - Optional non-PII metadata
 */
export function trackFunnelStep(
  funnel: FunnelName,
  step: FunnelStep,
  metadata?: Record<string, string | number | boolean>
): void {
  if (!FEATURE_FUNNEL_GOALS) {
    return; // No-op when feature is disabled
  }

  // Check consent before tracking
  if (!hasAnalyticsConsent()) {
    return; // No consent, don't track
  }

  try {
    const stepEvent: FunnelStepEvent = {
      funnel,
      step,
      timestamp: Date.now(),
      metadata: metadata || {},
    };

    // Send to API endpoint
    fetch('/api/analytics/goals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type: 'funnel_step', ...stepEvent }),
      keepalive: true, // Ensure request completes even if page unloads
    }).catch((error) => {
      // Silently fail - don't interrupt user flow
      console.debug('Funnel step tracking failed:', error);
    });
  } catch (error) {
    // Silently fail - don't interrupt user flow
    console.debug('Funnel step tracking error:', error);
  }
}

