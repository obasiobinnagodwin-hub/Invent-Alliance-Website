# GDPR Compliance Audit Report
## Invent Alliance Limited Website - Production Environment

**Audit Date:** January 15, 2026  
**Framework:** GDPR (General Data Protection Regulation) - EU 2016/679  
**Scope:** Website, Analytics, Forms, Database  
**Classification:** CONFIDENTIAL

---

## Executive Summary

**Compliance Status:** ⚠️ **NON-COMPLIANT** - 8 Critical Violations Identified

The current implementation **does not meet GDPR requirements** for processing personal data of EU citizens. Immediate action required before processing EU user data.

### Critical GDPR Violations

1. ❌ **No Cookie Consent Banner** (Art. 6, 7) - Storing cookies without consent
2. ❌ **No Privacy Policy** (Art. 13, 14) - Missing transparency requirements
3. ❌ **No Data Subject Rights Implementation** (Art. 15-22) - No access/deletion mechanisms
4. ❌ **Unlimited Data Retention** (Art. 5(1)(e)) - No retention periods defined
5. ❌ **No Data Processing Records** (Art. 30) - Missing processing activities register
6. ❌ **No Data Protection Impact Assessment** (Art. 35) - Required for analytics
7. ❌ **Analytics Tracking Without Consent** (Art. 6) - Lawful basis missing
8. ❌ **International Data Transfers** (Art. 44-50) - No safeguards for transfers

---

## Table of Contents

1. [Lawfulness of Processing](#1-lawfulness-of-processing)
2. [Transparency & Information](#2-transparency--information)
3. [Data Subject Rights](#3-data-subject-rights)
4. [Data Protection by Design](#4-data-protection-by-design)
5. [Data Retention & Deletion](#5-data-retention--deletion)
6. [Third-Party Processing](#6-third-party-processing)
7. [Implementation Plan](#7-implementation-plan)

---

## 1. Lawfulness of Processing

### 1.1 Consent Management (GDPR Art. 6, 7)

#### ❌ CRITICAL: No Cookie Consent Banner
**Violation:** Art. 6(1)(a), Art. 7, ePrivacy Directive  
**Current State:** Cookies set automatically without consent:
- `session-id` (middleware.ts:70)
- `auth-token` (app/api/auth/login/route.ts:45)
- No consent mechanism exists

**Required Actions:**
```typescript
// components/CookieConsent.tsx (NEW FILE)
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type ConsentPreferences = {
  necessary: boolean; // Always true
  analytics: boolean;
  marketing: boolean;
};

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Check if consent already given
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowBanner(true);
    } else {
      const saved = JSON.parse(consent);
      setPreferences(saved);
      applyConsent(saved);
    }
  }, []);

  function applyConsent(prefs: ConsentPreferences) {
    // Set consent cookie
    document.cookie = `cookie-consent=${JSON.stringify(prefs)}; path=/; max-age=31536000; SameSite=Lax`;
    
    // Enable/disable analytics based on consent
    if (prefs.analytics) {
      // Enable analytics tracking
      (window as any).enableAnalytics = true;
    } else {
      // Disable analytics and delete cookies
      (window as any).enableAnalytics = false;
      document.cookie = 'session-id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
    
    // Store in localStorage for persistence
    localStorage.setItem('cookie-consent', JSON.stringify(prefs));
  }

  function handleAcceptAll() {
    const allConsent = { necessary: true, analytics: true, marketing: false };
    setPreferences(allConsent);
    applyConsent(allConsent);
    setShowBanner(false);
  }

  function handleRejectNonEssential() {
    const minimalConsent = { necessary: true, analytics: false, marketing: false };
    setPreferences(minimalConsent);
    applyConsent(minimalConsent);
    setShowBanner(false);
  }

  function handleSavePreferences() {
    applyConsent(preferences);
    setShowBanner(false);
  }

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-4 border-blue-600 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {!showDetails ? (
          // Simple banner
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                🍪 We value your privacy
              </h3>
              <p className="text-sm text-gray-700">
                We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. 
                By clicking "Accept All", you consent to our use of cookies.{' '}
                <Link href="/privacy-policy" className="text-blue-600 underline hover:text-blue-800">
                  Privacy Policy
                </Link>
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 min-w-fit">
              <button
                onClick={() => setShowDetails(true)}
                className="px-6 py-2 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cookie Settings
              </button>
              <button
                onClick={handleRejectNonEssential}
                className="px-6 py-2 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Reject Non-Essential
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md"
              >
                Accept All
              </button>
            </div>
          </div>
        ) : (
          // Detailed preferences
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Cookie Preferences</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close cookie settings"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1 pr-4">
                  <h4 className="font-bold text-gray-900 mb-1">Necessary Cookies</h4>
                  <p className="text-sm text-gray-600">
                    Required for the website to function. Cannot be disabled.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={true}
                  disabled
                  className="mt-1 w-5 h-5"
                />
              </div>
              
              <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1 pr-4">
                  <h4 className="font-bold text-gray-900 mb-1">Analytics Cookies</h4>
                  <p className="text-sm text-gray-600">
                    Help us understand how visitors interact with our website by collecting anonymous information.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                  className="mt-1 w-5 h-5 cursor-pointer"
                />
              </div>
              
              <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1 pr-4">
                  <h4 className="font-bold text-gray-900 mb-1">Marketing Cookies</h4>
                  <p className="text-sm text-gray-600">
                    Used to track visitors across websites to display relevant advertisements. (Currently not used)
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.marketing}
                  disabled
                  className="mt-1 w-5 h-5"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={handleRejectNonEssential}
                className="px-6 py-2 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Reject Non-Essential
              </button>
              <button
                onClick={handleSavePreferences}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Save Preferences
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

**Update middleware to respect consent:**
```typescript
// middleware.ts - Modified
import { NextRequest, NextResponse } from 'next/server';
import { trackPageView, trackSystemMetric } from '@/lib/analytics';

function hasAnalyticsConsent(request: NextRequest): boolean {
  const consentCookie = request.cookies.get('cookie-consent')?.value;
  if (!consentCookie) return false;
  
  try {
    const consent = JSON.parse(consentCookie);
    return consent.analytics === true;
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const startTime = Date.now();
  const path = request.nextUrl.pathname;
  
  // Skip tracking for certain paths
  if (
    path.startsWith('/api/') ||
    path.startsWith('/_next/') ||
    path.startsWith('/dashboard') ||
    path.startsWith('/login') ||
    path.includes('.')
  ) {
    return NextResponse.next();
  }
  
  // Only track if user has given consent
  const hasConsent = hasAnalyticsConsent(request);
  
  if (hasConsent) {
    // Generate or get session ID
    let sessionId = request.cookies.get('session-id')?.value;
    if (!sessionId) {
      sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // Get client information
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const referrer = request.headers.get('referer') || '';
    
    // Track page view
    try {
      trackPageView({ path, ip, userAgent, referrer, sessionId });
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
    
    // Create response with session cookie
    const response = NextResponse.next();
    response.cookies.set('session-id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
    });
    
    return response;
  }
  
  return NextResponse.next();
}
```

**Add to root layout:**
```typescript
// app/layout.tsx
import CookieConsent from '@/components/CookieConsent';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
```

---

### 1.2 Lawful Basis Documentation

**Required:** Document lawful basis for each processing activity

```typescript
// lib/data-processing-register.ts (NEW FILE)
export interface ProcessingActivity {
  id: string;
  name: string;
  purpose: string;
  lawfulBasis: 'consent' | 'contract' | 'legal_obligation' | 'vital_interests' | 'public_task' | 'legitimate_interests';
  dataCategories: string[];
  dataSubjects: string[];
  recipients: string[];
  retentionPeriod: string;
  securityMeasures: string[];
}

export const PROCESSING_ACTIVITIES: ProcessingActivity[] = [
  {
    id: 'analytics-tracking',
    name: 'Website Analytics Tracking',
    purpose: 'Monitor website performance and user behavior to improve user experience',
    lawfulBasis: 'consent',
    dataCategories: ['IP address (pseudonymized)', 'User agent', 'Page views', 'Referrer'],
    dataSubjects: ['Website visitors'],
    recipients: ['Internal analytics team'],
    retentionPeriod: '30 days (configurable in database cleanup)',
    securityMeasures: [
      'IP pseudonymization',
      'Encrypted database storage',
      'Access control via authentication',
      'HTTPS encryption in transit'
    ],
  },
  {
    id: 'contact-form',
    name: 'Contact Form Processing',
    purpose: 'Respond to customer inquiries and provide customer support',
    lawfulBasis: 'consent',
    dataCategories: ['Name', 'Email address', 'Message content', 'IP address', 'Timestamp'],
    dataSubjects: ['Website visitors submitting contact form'],
    recipients: ['Customer service team', 'SMTP email service'],
    retentionPeriod: '2 years or until request for deletion',
    securityMeasures: [
      'Rate limiting',
      'Input validation and sanitization',
      'Honeypot spam protection',
      'HTTPS encryption',
      'Secure email transmission via SMTP'
    ],
  },
  {
    id: 'academy-registration',
    name: 'Academy Registration Processing',
    purpose: 'Process registrations for Invent Academy training programs',
    lawfulBasis: 'contract',
    dataCategories: ['Name', 'Email', 'Phone number', 'Age range', 'Stream selection', 'Additional information'],
    dataSubjects: ['Academy applicants'],
    recipients: ['Academy administration team', 'SMTP email service'],
    retentionPeriod: '5 years for training records (legal requirement) or until withdrawal of consent',
    securityMeasures: [
      'Age verification',
      'Rate limiting',
      'Input validation',
      'Honeypot spam protection',
      'HTTPS encryption'
    ],
  },
  {
    id: 'admin-authentication',
    name: 'Administrator Authentication',
    purpose: 'Secure access to dashboard and analytics',
    lawfulBasis: 'legitimate_interests',
    dataCategories: ['Username', 'Hashed password', 'Session tokens', 'Login timestamps', 'IP address'],
    dataSubjects: ['Website administrators'],
    recipients: ['Internal IT team'],
    retentionPeriod: 'Sessions: 24 hours, Login records: 90 days',
    securityMeasures: [
      'Bcrypt password hashing',
      'JWT token authentication',
      'Session expiration',
      'Rate limiting on login attempts',
      'HttpOnly secure cookies'
    ],
  },
];
```

---

## 2. Transparency & Information

### 2.1 Privacy Policy (GDPR Art. 13, 14)

#### ❌ CRITICAL: No Privacy Policy
**Violation:** Art. 13 (information to be provided where personal data collected from data subject)

**Required:** Comprehensive privacy policy covering all Art. 13 requirements

```typescript
// app/privacy-policy/page.tsx (NEW FILE)
export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-800 via-slate-700/50 to-slate-800">
      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-8 space-y-6 text-gray-800">
          <section>
            <p className="text-sm text-gray-600 mb-4">
              <strong>Last Updated:</strong> January 15, 2026<br/>
              <strong>Effective Date:</strong> January 15, 2026
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">1. Data Controller</h2>
            <p>
              Invent Alliance Limited<br/>
              The Invent HQ, Lagos, Nigeria<br/>
              Email: privacy@inventallianceco.com<br/>
              Phone: +234 (0) 906 276 4054
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">2. Personal Data We Collect</h2>
            
            <h3 className="text-xl font-semibold mb-2">2.1 Information You Provide</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Contact Forms:</strong> Name, email address, subject, message</li>
              <li><strong>Academy Registration:</strong> Name, email, phone number, age range, training stream preferences</li>
              <li><strong>Admin Login:</strong> Username, password (hashed), login timestamps</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">2.2 Automatically Collected Information</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Analytics Data:</strong> Pseudonymized IP addresses, browser type, device information, pages visited, referrer URLs, timestamps</li>
              <li><strong>Cookies:</strong> Session identifiers, authentication tokens, consent preferences</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">3. Purpose and Legal Basis</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2 text-left">Purpose</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Legal Basis</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Website analytics and improvements</td>
                    <td className="border border-gray-300 px-4 py-2">Consent (Art. 6(1)(a))</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Responding to contact inquiries</td>
                    <td className="border border-gray-300 px-4 py-2">Consent (Art. 6(1)(a))</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Processing academy registrations</td>
                    <td className="border border-gray-300 px-4 py-2">Contract performance (Art. 6(1)(b))</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Securing administrator access</td>
                    <td className="border border-gray-300 px-4 py-2">Legitimate interests (Art. 6(1)(f))</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">4. Data Retention</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Analytics Data:</strong> 30 days, then automatically deleted</li>
              <li><strong>Contact Form Submissions:</strong> 2 years or until deletion request</li>
              <li><strong>Academy Registrations:</strong> 5 years (legal requirement for training records)</li>
              <li><strong>Admin Sessions:</strong> 24 hours, login logs 90 days</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">5. Your Rights Under GDPR</h2>
            <p className="mb-2">You have the following rights regarding your personal data:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Right of Access (Art. 15):</strong> Request a copy of your personal data</li>
              <li><strong>Right to Rectification (Art. 16):</strong> Correct inaccurate or incomplete data</li>
              <li><strong>Right to Erasure (Art. 17):</strong> Request deletion of your data ("right to be forgotten")</li>
              <li><strong>Right to Restriction (Art. 18):</strong> Limit how we use your data</li>
              <li><strong>Right to Data Portability (Art. 20):</strong> Receive your data in a machine-readable format</li>
              <li><strong>Right to Object (Art. 21):</strong> Object to processing based on legitimate interests</li>
              <li><strong>Right to Withdraw Consent (Art. 7(3)):</strong> Withdraw consent at any time</li>
            </ul>
            <p className="mt-4">
              <strong>To exercise your rights:</strong> Email us at <a href="mailto:privacy@inventallianceco.com" className="text-blue-600 underline">privacy@inventallianceco.com</a> or use our <a href="/data-subject-request" className="text-blue-600 underline">Data Subject Request Form</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">6. Data Security</h2>
            <p>We implement appropriate technical and organizational measures:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>HTTPS encryption for all data in transit</li>
              <li>Database encryption for sensitive data at rest</li>
              <li>IP pseudonymization for analytics</li>
              <li>Password hashing using bcrypt</li>
              <li>Rate limiting to prevent abuse</li>
              <li>Regular security audits and updates</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">7. International Data Transfers</h2>
            <p>
              Your data may be processed in Nigeria and other jurisdictions. When transferring data outside the EEA, 
              we ensure appropriate safeguards are in place (Art. 46).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">8. Third-Party Services</h2>
            <p>We share data with:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>SMTP Email Service:</strong> For sending contact form and registration emails</li>
              <li><strong>Google Maps:</strong> For displaying location information (embedded, no direct data sharing)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">9. Cookies</h2>
            <p className="mb-2">We use the following cookies:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Necessary:</strong> session-id (session management), auth-token (authentication)</li>
              <li><strong>Analytics:</strong> cookie-consent (consent preferences) - Only with your consent</li>
            </ul>
            <p className="mt-2">
              You can manage your cookie preferences at any time via our <a href="#" onClick={(e) => { e.preventDefault(); localStorage.removeItem('cookie-consent'); window.location.reload(); }} className="text-blue-600 underline">Cookie Settings</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">10. Children's Privacy</h2>
            <p>
              The Invent Academy accepts registrations from individuals aged 16+. We do not knowingly collect 
              data from children under 16 without parental consent. If you believe we have collected data 
              from a child under 16, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">11. Changes to This Policy</h2>
            <p>
              We may update this policy from time to time. We will notify you of significant changes by 
              posting a notice on our website or via email.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">12. Complaints</h2>
            <p>
              If you have concerns about how we handle your personal data, you have the right to lodge a 
              complaint with your local data protection authority.
            </p>
            <p className="mt-2">
              <strong>EU Data Protection Supervisor:</strong> <a href="https://edpb.europa.eu" className="text-blue-600 underline" target="_blank" rel="noopener">European Data Protection Board</a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">13. Contact Us</h2>
            <p>
              For privacy-related questions or to exercise your rights:<br/>
              <strong>Email:</strong> <a href="mailto:privacy@inventallianceco.com" className="text-blue-600 underline">privacy@inventallianceco.com</a><br/>
              <strong>Phone:</strong> +234 (0) 906 276 4054<br/>
              <strong>Address:</strong> The Invent HQ, Lagos, Nigeria
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
```

---

## 3. Data Subject Rights

### 3.1 Data Subject Access Request (DSAR) Implementation

#### ❌ CRITICAL: No mechanism to exercise data subject rights
**Violation:** Art. 15-22 (Right to access, rectification, erasure, etc.)

**Required:** Implement DSAR portal

```typescript
// app/data-subject-request/page.tsx (NEW FILE)
'use client';

import { useState } from 'react';

type RequestType = 'access' | 'rectification' | 'erasure' | 'portability' | 'restriction' | 'object';

export default function DataSubjectRequestPage() {
  const [formData, setFormData] = useState({
    requestType: '' as RequestType | '',
    fullName: '',
    email: '',
    description: '',
    verificationInfo: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch('/api/data-subject-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit request');
      }

      setSubmitStatus({
        type: 'success',
        message: 'Your request has been submitted. We will respond within 30 days as required by GDPR.',
      });
      setFormData({ requestType: '', fullName: '', email: '', description: '', verificationInfo: '' });
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'An error occurred',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-800 via-slate-700/50 to-slate-800 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-white mb-8">Data Subject Access Request</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <p className="text-sm text-blue-900">
              <strong>Response Time:</strong> We will respond to your request within <strong>30 days</strong> as required by GDPR.
              For complex requests, we may extend this period by an additional 60 days.
            </p>
          </div>

          {submitStatus && (
            <div className={`mb-6 p-4 rounded-md ${submitStatus.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
              {submitStatus.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Request Type *
              </label>
              <select
                required
                value={formData.requestType}
                onChange={(e) => setFormData({ ...formData, requestType: e.target.value as RequestType })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a request type</option>
                <option value="access">Right of Access - Request a copy of my data</option>
                <option value="rectification">Right to Rectification - Correct my data</option>
                <option value="erasure">Right to Erasure - Delete my data</option>
                <option value="portability">Right to Data Portability - Export my data</option>
                <option value="restriction">Right to Restriction - Limit processing of my data</option>
                <option value="object">Right to Object - Object to processing</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-600 mt-1">
                Must match the email address associated with your data in our system.
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Description of Request *
              </label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Please provide details about your request..."
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Verification Information *
              </label>
              <input
                type="text"
                required
                value={formData.verificationInfo}
                onChange={(e) => setFormData({ ...formData, verificationInfo: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Last 4 digits of phone number or registration date"
              />
              <p className="text-xs text-gray-600 mt-1">
                To verify your identity, please provide additional information (e.g., last 4 digits of your phone number, 
                approximate date of registration, or subject of your last contact with us).
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="font-bold text-gray-900 mb-2">Important Information</h4>
              <ul className="text-sm text-gray-700 space-y-1 list-disc pl-5">
                <li>We will verify your identity before processing your request.</li>
                <li>Response time: 30 days (may be extended for complex requests).</li>
                <li>There is no fee for most requests.</li>
                <li>We may refuse manifestly unfounded or excessive requests.</li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-md font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
```

**Backend API route:**
```typescript
// app/api/data-subject-request/route.ts (NEW FILE)
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/secure-logger';

// Store requests in database (or send to privacy team)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { requestType, fullName, email, description, verificationInfo } = body;

    // Validation
    if (!requestType || !fullName || !email || !description || !verificationInfo) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Log the request (in production, save to database and notify privacy team)
    logger.info('GDPR data subject request received', {
      requestType,
      email,
      timestamp: new Date().toISOString(),
    });

    // TODO: Save to database
    // TODO: Send notification to privacy@inventallianceco.com
    // TODO: Create ticket in tracking system

    // Send confirmation email to user
    try {
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: email,
        subject: `Data Subject Request Received - Reference #${Date.now()}`,
        html: `
          <h2>Data Subject Request Confirmation</h2>
          <p>Dear ${fullName},</p>
          <p>We have received your ${requestType} request submitted on ${new Date().toLocaleDateString()}.</p>
          <p><strong>Request Reference:</strong> #${Date.now()}</p>
          <p>We will respond to your request within 30 days as required by GDPR Article ${requestType === 'access' ? '15' : requestType === 'erasure' ? '17' : '16-22'}.</p>
          <p>If you have any questions, please contact us at privacy@inventallianceco.com.</p>
          <p>Best regards,<br/>Invent Alliance Limited Privacy Team</p>
        `,
      });
    } catch (emailError) {
      logger.error('Failed to send DSAR confirmation email', { error: emailError });
      // Continue even if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Your request has been submitted successfully. You will receive a confirmation email shortly.',
      reference: `#${Date.now()}`,
    });
  } catch (error) {
    logger.error('DSAR submission error', { error });
    return NextResponse.json(
      { error: 'Failed to submit request. Please try again later.' },
      { status: 500 }
    );
  }
}
```

---

## 4. Data Protection by Design

### 4.1 Pseudonymization & Anonymization

Already addressed in Security section - implement IP pseudonymization and data encryption.

### 4.2 Data Minimization

**Review each data collection point:**

```typescript
// lib/data-minimization.ts (NEW FILE)
/**
 * Data Minimization Guidelines (GDPR Art. 5(1)(c))
 * 
 * Only collect data that is:
 * 1. Adequate - sufficient for the purpose
 * 2. Relevant - has rational link to purpose
 * 3. Limited - not excessive
 */

// Contact Form - CURRENT vs MINIMIZED
interface ContactFormData {
  // Necessary
  name: string;      // ✅ Needed for personalized response
  email: string;     // ✅ Needed for response
  subject: string;   // ✅ Needed to categorize inquiry
  message: string;   // ✅ Needed for inquiry content
  
  // Metadata - Can be pseudonymized
  ip: string;        // ⚠️ Pseudonymize (already implemented)
  timestamp: Date;   // ✅ Needed for tracking
  
  // NOT collected (good)
  // phone: string;  // ❌ Not needed for contact form
  // address: string; // ❌ Not needed for contact form
}

// Academy Registration - Review
interface AcademyRegistrationData {
  // Necessary
  name: string;      // ✅ Needed for registration
  email: string;     // ✅ Needed for communication
  phone: string;     // ✅ Needed for contact
  ageRange: string;  // ✅ Needed for eligibility
  stream: string;    // ✅ Needed for program selection
  
  // Optional but justified
  message: string;   // ✅ Additional context (optional field)
  
  // Consider removing or making optional
  // fullAddress: string; // ⚠️ Only collect if legally required
}
```

---

## 5. Data Retention & Deletion

### 5.1 Automated Data Retention Policy

#### ❌ CRITICAL: No defined retention periods beyond analytics
**Violation:** Art. 5(1)(e) - Storage limitation

**Solution:**
```typescript
// lib/data-retention.ts (NEW FILE)
import { query } from './db';
import { logger } from './secure-logger';

export interface RetentionPolicy {
  dataType: string;
  retentionDays: number;
  deletionMethod: 'hard' | 'soft';
  legalBasis?: string;
}

export const RETENTION_POLICIES: RetentionPolicy[] = [
  {
    dataType: 'page_views',
    retentionDays: 30,
    deletionMethod: 'hard',
  },
  {
    dataType: 'system_metrics',
    retentionDays: 90,
    deletionMethod: 'hard',
  },
  {
    dataType: 'visitor_sessions',
    retentionDays: 30,
    deletionMethod: 'hard',
  },
  {
    dataType: 'user_sessions',
    retentionDays: 90,
    deletionMethod: 'hard',
  },
  {
    dataType: 'contact_submissions', // NEW TABLE NEEDED
    retentionDays: 730, // 2 years
    deletionMethod: 'soft', // Soft delete for audit trail
  },
  {
    dataType: 'academy_registrations', // NEW TABLE NEEDED
    retentionDays: 1825, // 5 years (legal requirement)
    deletionMethod: 'soft',
    legalBasis: 'Legal obligation - training record retention',
  },
];

export async function applyRetentionPolicies(): Promise<void> {
  logger.info('Starting data retention policy enforcement');

  for (const policy of RETENTION_POLICIES) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - policy.retentionDays);

      if (policy.deletionMethod === 'hard') {
        // Permanent deletion
        const result = await query(
          `DELETE FROM ${policy.dataType} WHERE created_at < $1`,
          [cutoffDate]
        );
        logger.info(`Retention policy applied: ${policy.dataType}`, {
          rowsDeleted: result.length,
          cutoffDate: cutoffDate.toISOString(),
        });
      } else {
        // Soft delete (mark as deleted)
        const result = await query(
          `UPDATE ${policy.dataType} SET deleted_at = CURRENT_TIMESTAMP, deleted = true 
           WHERE created_at < $1 AND deleted = false`,
          [cutoffDate]
        );
        logger.info(`Retention policy applied (soft delete): ${policy.dataType}`, {
          rowsMarked: result.length,
          cutoffDate: cutoffDate.toISOString(),
        });
      }
    } catch (error) {
      logger.error(`Failed to apply retention policy for ${policy.dataType}`, { error });
    }
  }

  logger.info('Data retention policy enforcement completed');
}

// Schedule retention policy enforcement (daily at 2 AM)
if (typeof setInterval !== 'undefined') {
  // Calculate milliseconds until next 2 AM
  const now = new Date();
  const next2AM = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    2,
    0,
    0
  );
  const msUntil2AM = next2AM.getTime() - now.getTime();

  setTimeout(() => {
    applyRetentionPolicies();
    // Run daily
    setInterval(applyRetentionPolicies, 24 * 60 * 60 * 1000);
  }, msUntil2AM);
}
```

**Add retention endpoint for manual triggering:**
```typescript
// app/api/admin/retention/route.ts (NEW FILE)
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth-wrapper';
import { applyRetentionPolicies } from '@/lib/data-retention';

export async function POST(request: NextRequest) {
  // Verify admin authentication
  const token = request.cookies.get('auth-token')?.value;
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await applyRetentionPolicies();
    return NextResponse.json({
      success: true,
      message: 'Retention policies applied successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to apply retention policies' },
      { status: 500 }
    );
  }
}
```

---

## 6. Third-Party Processing

### 6.1 Data Processing Agreements (DPAs)

#### ⚠️ MEDIUM: Need DPAs with third-party processors
**Requirement:** Art. 28 - Processor obligations

**Current Third Parties:**
1. SMTP Email Service (configured by deployment)
2. Hosting Provider (deployment-specific)

**Action Required:**
```markdown
# Third-Party Data Processing Checklist

## SMTP Email Service
- [ ] Identify provider (Gmail, SendGrid, Mailgun, etc.)
- [ ] Execute Data Processing Agreement (DPA)
- [ ] Verify GDPR compliance of provider
- [ ] Document Standard Contractual Clauses (if non-EU)
- [ ] Review sub-processors list
- [ ] Establish data breach notification procedures

## Hosting Provider
- [ ] Identify provider (AWS, Azure, Vercel, etc.)
- [ ] Execute Data Processing Agreement (DPA)
- [ ] Verify data center locations
- [ ] Implement data residency controls (if needed)
- [ ] Review security certifications (ISO 27001, SOC 2)
- [ ] Document data transfer mechanisms

## Google Maps (Embedded)
- [ ] Review Google Maps Platform Terms
- [ ] Implement privacy-enhanced mode (no cookies)
- [ ] Update privacy policy to disclose Google Maps usage
- [ ] Consider self-hosted alternative for full control
```

---

## 7. Implementation Plan

### Phase 1: Critical Compliance (Week 1-2)

**Priority 1: Legal Basis & Transparency**
- [ ] Deploy Cookie Consent Banner
- [ ] Create and publish Privacy Policy
- [ ] Update middleware to respect consent
- [ ] Add consent management API

**Priority 2: Data Subject Rights**
- [ ] Implement DSAR portal
- [ ] Create API for handling requests
- [ ] Set up privacy@ email monitoring
- [ ] Document DSAR process for staff

### Phase 2: Data Protection (Week 3-4)

**Priority 3: Data Security & Minimization**
- [ ] Implement IP pseudonymization
- [ ] Deploy data encryption for sensitive fields
- [ ] Review and minimize data collection
- [ ] Implement automated retention policies

**Priority 4: Documentation**
- [ ] Create Records of Processing Activities (ROPA)
- [ ] Conduct Data Protection Impact Assessment (DPIA)
- [ ] Execute DPAs with third-party processors
- [ ] Document data flows and architecture

### Phase 3: Ongoing Compliance (Continuous)

**Monitoring & Audits**
- [ ] Quarterly privacy audits
- [ ] Annual GDPR compliance review
- [ ] Staff privacy training
- [ ] Incident response testing

---

## Summary

### Compliance Gaps Summary

| Area | Violations | Priority | Estimated Effort |
|------|-----------|----------|------------------|
| Consent Management | 2 | CRITICAL | 2-3 days |
| Transparency | 2 | CRITICAL | 2-3 days |
| Data Subject Rights | 2 | CRITICAL | 3-5 days |
| Data Retention | 1 | HIGH | 2 days |
| Documentation | 3 | HIGH | 3-5 days |
| Third-Party DPAs | 2 | MEDIUM | Varies |
| **TOTAL** | **12** | | **12-20 days** |

### Post-Implementation

After implementing these measures:
1. ✅ Website will be GDPR-compliant for EU visitors
2. ✅ Data subject rights can be exercised
3. ✅ Transparent data processing
4. ✅ Automated data protection measures
5. ✅ Legal defense in case of audits

**Next Steps:** Proceed to Cost Optimization section →

