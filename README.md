# Invent Alliance Limited Website - Next.js Redesign

A modern, responsive rebuild of the Invent Alliance Limited website using Next.js 15, TypeScript, and Tailwind CSS.

## Features

### Core Features
- ✅ **Next.js 15** with App Router
- ✅ **TypeScript** for type safety
- ✅ **Tailwind CSS** for styling
- ✅ **Responsive Design** - Mobile-first approach
- ✅ **SEO Optimized** - Meta tags and semantic HTML
- ✅ **Image Optimization** - Using next/image
- ✅ **Accessible** - ARIA labels, keyboard navigation (WCAG 2.1 AA)
- ✅ **Fast Performance** - Optimized for Lighthouse scores

### Analytics & Tracking
- ✅ **Real-time Analytics Dashboard** - Comprehensive website metrics
- ✅ **Goal & Funnel Tracking** - Conversion tracking (gated: `FEATURE_FUNNEL_GOALS`)
- ✅ **Page View Tracking** - Automatic tracking via middleware
- ✅ **Session Management** - Visitor session tracking
- ✅ **Export Capabilities** - CSV and PDF exports

### Security & GDPR
- ✅ **JWT Authentication** - Secure admin dashboard access
- ✅ **CSRF Protection** - Cross-site request forgery protection (gated)
- ✅ **Cookie Consent** - GDPR-compliant cookie consent banner (gated)
- ✅ **PII Protection** - Pseudonymization and hashing (gated)
- ✅ **Data Retention** - Automated data retention policies (gated)
- ✅ **DSAR Portal** - Data Subject Access Request portal (gated)
- ✅ **Secure Headers** - Comprehensive security headers (gated)

### Accessibility
- ✅ **Accessible Forms** - WCAG 2.1 AA compliant form fields (gated: `FEATURE_ACCESSIBILITY_UPGRADES`)
- ✅ **Keyboard Navigation** - Full keyboard support
- ✅ **Screen Reader Support** - ARIA live announcements
- ✅ **Skip Links** - Skip to content navigation
- ✅ **Focus Management** - Proper focus trapping and indicators

## Pages

- `/` - Home page with services overview
- `/about-us` - About Us page with company info and mission
- `/our-team` - Team members page
- `/products-services` - Services listing page
- `/blog` - News/Blog listing page
- `/careers` - Careers page
- `/invent-academy-registration` - Academy registration form
- `/contacts` - Contact page with feedback form
- `/an-appreciation-from-lead-fort-gate-college` - Blog post
- `/national-open-university-students-tour-at-the-invent` - Blog post

## External Subdomains (Preserved)

All external service links are preserved:
- `bpo.inventallianceco.com` - Business Process Outsourcing
- `properties.inventallianceco.com` - Invent Properties
- `power.inventallianceco.com` - Invent Power Systems
- `ovenfreshng.com` - Invent Bakery
- `logistics.inventallianceco.com` - High Tech Logistics
- `shortlet.inventallianceco.com` - Invent Shortlet

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
├── app/                          # Next.js App Router pages
│   ├── page.tsx                 # Home page
│   ├── about-us/                 # About Us page
│   ├── our-team/                 # Team page
│   ├── products-services/        # Services page
│   ├── blog/                     # Blog listing
│   ├── careers/                  # Careers page
│   ├── invent-academy-registration/ # Academy form
│   ├── contacts/                 # Contact page
│   ├── dashboard/                # Admin dashboard (protected)
│   ├── login/                    # Login page
│   ├── data-subject-request/     # DSAR portal (gated)
│   ├── privacy-policy/           # Privacy policy page
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── analytics/            # Analytics endpoints
│   │   ├── contact/              # Contact form endpoint
│   │   ├── academy-registration/ # Academy form endpoint
│   │   ├── admin/                # Admin endpoints (protected)
│   │   └── health/               # Health check endpoint
│   └── [blog-slug]/              # Blog post pages
├── components/                   # Reusable components
│   ├── Navbar.tsx                # Navigation component
│   ├── Footer.tsx                # Footer component
│   ├── ServiceCard.tsx           # Service card component
│   ├── AccessibleFormField.tsx   # Accessible form field (gated)
│   ├── MultiStepAcademyForm.tsx  # Multi-step form (gated)
│   ├── CookieConsent.tsx         # Cookie consent banner (gated)
│   ├── TrustSignals.tsx          # Trust signals panel (gated)
│   ├── CTAButton.tsx             # CTA button component (gated)
│   ├── SkipToContent.tsx         # Skip link (gated)
│   └── dashboard/                # Dashboard components
├── lib/                          # Utility libraries
│   ├── analytics-goals.ts       # Goal & funnel tracking
│   ├── feature-flags.ts          # Feature flag system
│   ├── auth-wrapper.ts           # Authentication wrapper
│   ├── analytics-wrapper.ts      # Analytics wrapper
│   ├── db.ts                     # Database utilities
│   └── ...                       # Other utilities
├── database/                     # Database files
│   ├── migrations/               # Database migrations
│   ├── schema.sql                # Database schema
│   └── seed.sql                  # Seed data
├── public/                       # Static assets
└── ...config files
```

## Key Components

### Navbar
- Responsive navigation with mobile hamburger menu
- Dropdown menus for About Us and Services
- Accessible with ARIA labels (when `FEATURE_ACCESSIBILITY_UPGRADES=true`)
- Keyboard navigation and focus trap (when accessibility upgrades enabled)
- Admin Portal button for dashboard access

### Footer
- Company information
- Recent news widget
- Quick links navigation

### ServiceCard
- Reusable card component for services
- Supports internal and external links
- Image optimization with next/image

### AccessibleFormField (Gated)
- WCAG 2.1 AA compliant form field component
- Proper label associations (`htmlFor`/`id`)
- ARIA invalid states
- Error announcements with `role="alert"`
- Help text associations
- Enabled when `FEATURE_ACCESSIBILITY_UPGRADES=true`

### Analytics Components
- **Goal Tracking**: Track conversion goals (contact form, academy registration)
- **Funnel Tracking**: Track user journey through multi-step processes
- **Dashboard**: Real-time analytics visualization
- Enabled when `FEATURE_FUNNEL_GOALS=true`

## Forms

### Contact Form (`/contacts`)
- Name, email, subject, and message fields
- Client-side and server-side validation
- Real-time error messages
- Honeypot anti-spam protection
- Rate limiting (5 requests per 15 minutes per IP)
- SMTP email integration via `/api/contact`
- **Accessibility**: Accessible form fields with ARIA labels (when `FEATURE_ACCESSIBILITY_UPGRADES=true`)
- **Analytics**: Goal tracking on successful submission (when `FEATURE_FUNNEL_GOALS=true`)

### Academy Registration Form (`/invent-academy-registration`)
- Registration form for Invent Academy
- Stream selection (Professional/Investor)
- Age validation (16+ for Professional, 18+ for Investor)
- Client-side and server-side validation
- Honeypot anti-spam protection
- Rate limiting (3 requests per 15 minutes per IP)
- SMTP email integration via `/api/academy-registration`
- **Multi-step Form**: Optional multi-step registration flow (when `FEATURE_ACADEMY_MULTI_STEP_FORM=true`)
- **Accessibility**: Accessible form fields with ARIA labels (when `FEATURE_ACCESSIBILITY_UPGRADES=true`)
- **Analytics**: Goal and funnel step tracking (when `FEATURE_FUNNEL_GOALS=true`)

## Email Configuration

Both forms send emails via SMTP. Configure the following environment variables:

```bash
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Email Recipients
CONTACT_TO_EMAIL=contact@inventallianceco.com,contact@patrickogbonna.com  # Multiple emails can be comma-separated
ACADEMY_TO_EMAIL=academy@inventallianceco.com,contact@patrickogbonna.com  # Optional, defaults to CONTACT_TO_EMAIL. Multiple emails can be comma-separated
```

**Important Notes:**
- For Gmail, use an App Password (not your regular password)
- Create a `.env.local` file in the root directory with these variables
- In development, if SMTP is not configured, form submissions will be logged to console
- Rate limiting uses in-memory storage (for production, consider Redis)

## SEO & Performance

- Meta tags on all pages
- Semantic HTML structure
- Image optimization with next/image
- Responsive images with proper sizing
- Fast page loads with Next.js optimizations

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## API Routes

### Public Endpoints
- `GET /api/health` - Health check endpoint
- `POST /api/contact` - Contact form submission
- `POST /api/academy-registration` - Academy registration submission
- `POST /api/data-subject-request` - Data Subject Access Request (when `FEATURE_DSAR_PORTAL=true`)
- `GET /api/csrf-token` - Get CSRF token (when `FEATURE_CSRF=true`)

### Analytics Endpoints
- `GET /api/analytics` - Get analytics data (protected)
- `POST /api/analytics/track` - Track system metrics
- `GET /api/analytics/export/csv` - Export analytics as CSV (protected)
- `GET /api/analytics/export/pdf` - Export analytics as PDF (protected)
- `GET /api/analytics/goals` - Get goal tracking data (when `FEATURE_FUNNEL_GOALS=true`)
- `POST /api/analytics/goals` - Track goals and funnel steps (when `FEATURE_FUNNEL_GOALS=true`)

### Authentication Endpoints
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout
- `GET /api/auth/verify` - Verify authentication token

### Admin Endpoints (Protected)
- `GET /api/admin/processing-activities` - Get ROPA register (when `FEATURE_ROPA_ENDPOINT=true`)
- `POST /api/admin/retention` - Trigger data retention (when `FEATURE_RETENTION_ENDPOINT=true`)

## Feature Flags

The application uses a comprehensive feature flag system for gradual rollout and A/B testing. See `lib/feature-flags.ts` for complete documentation.

### Key Feature Flags
- `FEATURE_ACCESSIBILITY_UPGRADES` - Enable accessibility improvements
- `FEATURE_FUNNEL_GOALS` - Enable goal and funnel tracking
- `FEATURE_COOKIE_CONSENT` - Enable GDPR cookie consent banner
- `FEATURE_CSRF` - Enable CSRF protection
- `FEATURE_SECURE_HEADERS` - Enable enhanced security headers
- `FEATURE_ACADEMY_MULTI_STEP_FORM` - Enable multi-step academy form
- `FEATURE_TRUST_SIGNALS` - Enable trust signals panel
- `FEATURE_CTA_BUTTONS` - Enable optimized CTA buttons

See `RAILWAY_DEPLOYMENT_GUIDE.md` for complete list of feature flags and configuration.

## GDPR Compliance Documentation

GDPR compliance documentation and templates are available in the `docs/gdpr/` directory:

- **[Third-Party DPAs Checklist](docs/gdpr/third-party-dpas.md)** - Checklists for evaluating Data Processing Agreements with third-party providers (SMTP, hosting, Google Maps)
- **[DPIA Template](docs/gdpr/dpia.md)** - Data Protection Impact Assessment template with examples for current processing activities
- **[GDPR Documentation Index](docs/gdpr/README.md)** - Overview of all GDPR documentation

See also:
- **Privacy Policy:** `/privacy-policy` (live page)
- **DSAR Portal:** `/data-subject-request` (when `FEATURE_DSAR_PORTAL=true`)
- **ROPA Register:** Available via `/api/admin/processing-activities` (when `FEATURE_ROPA_ENDPOINT=true`)

## License

Copyright © Invent Alliance Limited. All rights reserved.

