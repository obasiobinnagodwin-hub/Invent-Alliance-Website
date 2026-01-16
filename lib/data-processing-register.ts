/**
 * Records of Processing Activities (ROPA) - GDPR Article 30
 * 
 * This file maintains a code-based register of all data processing activities
 * for GDPR compliance. It serves as the official Records of Processing Activities
 * as required by GDPR Article 30.
 * 
 * This register is version-controlled and can be exported via API for internal audits.
 */

export interface ProcessingActivity {
  id: string;
  name: string;
  purpose: string;
  legalBasis: string; // GDPR Art. 6(1) basis
  dataCategories: string[];
  dataSubjects: string[];
  recipients: string[];
  transfers: {
    country: string;
    safeguards: string;
  }[];
  retentionPeriod: string;
  securityMeasures: string[];
  automatedDecisionMaking: boolean;
  description: string;
}

/**
 * Records of Processing Activities Register
 * 
 * This register documents all personal data processing activities conducted by
 * Invent Alliance Limited in compliance with GDPR Article 30.
 */
export const PROCESSING_ACTIVITIES: ProcessingActivity[] = [
  {
    id: 'analytics-tracking',
    name: 'Website Analytics Tracking',
    purpose: 'To understand website usage, improve user experience, analyze traffic patterns, and optimize website performance.',
    legalBasis: 'Consent (GDPR Art. 6(1)(a))',
    dataCategories: [
      'IP address (pseudonymized)',
      'Browser type and version',
      'Device information',
      'Pages visited',
      'Time spent on pages',
      'Referral sources',
      'Session identifiers',
    ],
    dataSubjects: ['Website visitors'],
    recipients: ['Internal analytics team'],
    transfers: [],
    retentionPeriod: '30 days (page views and sessions), 90 days (system metrics)',
    securityMeasures: [
      'IP address pseudonymization',
      'IP address hashing (when FEATURE_PII_HASHING enabled)',
      'Secure session cookies (HttpOnly, Secure in production)',
      'Cookie consent requirement (when FEATURE_COOKIE_CONSENT enabled)',
      'HTTPS/TLS encryption',
    ],
    automatedDecisionMaking: false,
    description: 'Tracks website visitor behavior and system performance metrics. Data is pseudonymized and stored for analytics purposes. Analytics only runs with user consent when cookie consent feature is enabled.',
  },
  {
    id: 'contact-form',
    name: 'Contact Form Submissions',
    purpose: 'To respond to customer inquiries, provide customer support, and maintain business communications.',
    legalBasis: 'Legitimate interest (GDPR Art. 6(1)(f)) - responding to business inquiries',
    dataCategories: [
      'Name',
      'Email address',
      'Subject',
      'Message content',
      'IP address (for spam prevention)',
    ],
    dataSubjects: ['Contact form submitters'],
    recipients: [
      'Internal customer service team',
      'SMTP email service provider',
    ],
    transfers: [
      {
        country: 'SMTP provider jurisdiction (varies by provider)',
        safeguards: 'Data processing agreement, Standard Contractual Clauses (SCCs)',
      },
    ],
    retentionPeriod: '2 years from submission date',
    securityMeasures: [
      'HTTPS/TLS encryption',
      'CSRF protection (when FEATURE_CSRF enabled)',
      'Rate limiting (5 requests per 15 minutes)',
      'Secure logging (when FEATURE_SECURE_LOGGER enabled)',
      'Honeypot spam protection',
    ],
    automatedDecisionMaking: false,
    description: 'Processes contact form submissions sent via website. Emails are sent to operations team via SMTP. Data is stored in email system and may be logged securely for troubleshooting.',
  },
  {
    id: 'academy-registration',
    name: 'Invent Academy Registration',
    purpose: 'To process registrations for Invent Academy programs, communicate with registrants, and manage program enrollment.',
    legalBasis: 'Contract performance (GDPR Art. 6(1)(b)) - processing necessary for program registration',
    dataCategories: [
      'Name',
      'Email address',
      'Phone number',
      'Age range',
      'Program stream selection',
      'Optional message',
      'IP address (for spam prevention)',
    ],
    dataSubjects: ['Academy program registrants'],
    recipients: [
      'Internal academy management team',
      'SMTP email service provider',
    ],
    transfers: [
      {
        country: 'SMTP provider jurisdiction (varies by provider)',
        safeguards: 'Data processing agreement, Standard Contractual Clauses (SCCs)',
      },
    ],
    retentionPeriod: '5 years from registration date (for program records and compliance)',
    securityMeasures: [
      'HTTPS/TLS encryption',
      'CSRF protection (when FEATURE_CSRF enabled)',
      'Rate limiting (3 requests per 15 minutes)',
      'Secure logging (when FEATURE_SECURE_LOGGER enabled)',
      'Honeypot spam protection',
      'Age verification (minimum 16 years, 18 for investor stream)',
    ],
    automatedDecisionMaking: false,
    description: 'Processes registration submissions for Invent Academy programs. Data is used to contact registrants, manage program enrollment, and maintain program records. Age verification ensures compliance with program requirements.',
  },
  {
    id: 'admin-authentication',
    name: 'Admin Dashboard Authentication',
    purpose: 'To provide secure access to admin dashboard, authenticate administrators, and maintain session security.',
    legalBasis: 'Legitimate interest (GDPR Art. 6(1)(f)) - security and access control',
    dataCategories: [
      'Username',
      'Password hash (bcrypt)',
      'Email address (optional, may be encrypted when FEATURE_PII_EMAIL_ENCRYPTION enabled)',
      'Role (admin, editor, viewer)',
      'Session tokens',
      'IP address (for session tracking)',
      'Last login timestamp',
    ],
    dataSubjects: ['Administrative users'],
    recipients: ['Internal IT and operations team'],
    transfers: [],
    retentionPeriod: 'While account is active, deleted upon account closure. Session data: 24 hours.',
    securityMeasures: [
      'Password hashing (bcrypt, 10 rounds)',
      'JWT token authentication',
      'Secure session cookies (HttpOnly, Secure, SameSite)',
      'Email encryption at rest (when FEATURE_PII_EMAIL_ENCRYPTION enabled)',
      'Session expiration (24 hours)',
      'Login rate limiting (when FEATURE_RATE_LIMIT_LOGIN enabled)',
      'CSRF protection (when FEATURE_CSRF enabled)',
      'Secure logging (when FEATURE_SECURE_LOGGER enabled)',
    ],
    automatedDecisionMaking: false,
    description: 'Manages authentication and authorization for admin dashboard access. User credentials are securely hashed and stored. Sessions are tracked for security purposes. Email addresses may be encrypted at rest when encryption feature is enabled.',
  },
];

/**
 * Get processing activity by ID
 */
export function getProcessingActivity(id: string): ProcessingActivity | undefined {
  return PROCESSING_ACTIVITIES.find(activity => activity.id === id);
}

/**
 * Get all processing activities
 */
export function getAllProcessingActivities(): ProcessingActivity[] {
  return PROCESSING_ACTIVITIES;
}

/**
 * Get processing activities by legal basis
 */
export function getProcessingActivitiesByLegalBasis(legalBasis: string): ProcessingActivity[] {
  return PROCESSING_ACTIVITIES.filter(activity => activity.legalBasis.includes(legalBasis));
}

