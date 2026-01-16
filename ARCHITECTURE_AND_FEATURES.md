# Invent Alliance Limited Website
## Architecture & Site Feature Description Document

**Version:** 2.0  
**Last Updated:** January 2025  
**Project:** Next.js Website Redesign

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture Overview](#architecture-overview)
3. [Site Features](#site-features)
4. [Technical Stack](#technical-stack)
5. [Project Structure](#project-structure)
6. [Key Components](#key-components)
7. [Forms & API Routes](#forms--api-routes)
8. [Admin Dashboard & Analytics](#admin-dashboard--analytics)
9. [Database Integration](#database-integration)
10. [SEO & Performance](#seo--performance)
11. [Deployment & Infrastructure](#deployment--infrastructure)
12. [Security Features](#security-features)
13. [Accessibility](#accessibility)
14. [Future Enhancements](#future-enhancements)

---

## Executive Summary

### For Non-Technical Readers

The Invent Alliance Limited website is a modern, professional web presence rebuilt using cutting-edge web technologies. The site provides:

- **Fast Loading**: Pages load quickly on all devices (desktop, tablet, mobile)
- **Easy Navigation**: Intuitive menu system with dropdown options and Admin Portal access
- **Contact Forms**: Two forms for inquiries and academy registration
- **Interactive Chatbot**: AI-powered assistant to help visitors find information
- **Admin Dashboard**: Secure analytics dashboard with comprehensive website metrics
- **Mobile-Friendly**: Fully responsive design that works on all screen sizes
- **Search Engine Optimized**: Built to rank well in Google and other search engines
- **Professional Design**: Modern, clean interface with enhanced visual effects

### For Technical Readers

The website is built using **Next.js 15** with the **App Router**, leveraging **TypeScript** for type safety and **Tailwind CSS** for styling. The architecture emphasizes:

- **Static Site Generation (SSG)** for optimal performance
- **Server Components** by default to minimize client-side JavaScript
- **API Routes** for form submissions with SMTP email integration
- **Analytics System** with real-time tracking and comprehensive dashboard
- **Database Integration** with PostgreSQL for persistent data storage
- **Authentication System** with JWT-based secure login
- **Docker** containerization for consistent deployment
- **Comprehensive SEO** with metadata, structured data, and sitemaps
- **Performance optimizations** targeting Core Web Vitals

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Browser                          │
│  (Chrome, Firefox, Safari, Edge)                            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ HTTPS
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                    Next.js Application                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Middleware (Edge Runtime)                            │  │
│  │  - Analytics Tracking                                  │  │
│  │  - Session Management                                  │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  App Router (Server Components)                        │  │
│  │  - Static Pages (SSG)                                │  │
│  │  - Dynamic Routes (API)                               │  │
│  │  - Dashboard (Protected)                             │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Client Components                                    │  │
│  │  - Navbar (Interactive + Admin Portal)              │  │
│  │  - Forms (Contact, Academy)                          │  │
│  │  - Chatbot Widget                                    │  │
│  │  - Dashboard (Charts, Tables, Metrics)              │  │
│  └──────────────────────────────────────────────────────┘  │
└──────┬──────────────────────────────┬───────────────────────┘
       │                              │
       │ SMTP                         │ PostgreSQL
       │                              │
┌──────▼──────────────┐    ┌──────────▼──────────────────────┐
│  Email Service      │    │  PostgreSQL Database            │
│  (SMTP)             │    │  - Users & Authentication        │
│  - Gmail / Custom   │    │  - Analytics Data               │
│  - Form submissions │    │  - Sessions & Page Views        │
└─────────────────────┘    │  - System Metrics               │
                           └──────────────────────────────────┘
```

### Rendering Strategy

**Static Site Generation (SSG)**
- All content pages are pre-rendered at build time
- Pages are served as static HTML files
- Zero server-side processing for most requests
- Fastest possible page load times

**Server Components**
- Default rendering mode in Next.js App Router
- Components render on the server
- Zero JavaScript sent to client (unless needed)
- Better SEO and performance

**Client Components**
- Used only when interactivity is required:
  - Navigation dropdowns and mobile menu
  - Form handling and validation
  - Chatbot widget
  - Dashboard charts and interactive elements
  - Error boundaries
  - Protected routes and authentication

### Data Flow

1. **Page Requests**
   - User requests a page → Next.js serves pre-built static HTML
   - No database queries for content pages
   - Instant page loads

2. **Form Submissions**
   - User fills form → Client-side validation
   - Submit → POST to API route (`/api/contact` or `/api/academy-registration`)
   - Server-side validation → Rate limiting check → Honeypot check
   - SMTP email sent → Success/error response to client

3. **Chatbot Interactions**
   - User types message → Client-side processing
   - Message parser analyzes intent → Action provider responds
   - No server round-trip for basic interactions

4. **Analytics Tracking**
   - Page request → Middleware intercepts → Tracks page view
   - Session ID generated/stored in cookie
   - Analytics data stored (in-memory or database)
   - Dashboard queries analytics API → Displays metrics

5. **Authentication Flow**
   - User visits `/login` → Enters credentials
   - POST to `/api/auth/login` → Server validates
   - JWT token generated → Set as HTTP-only cookie
   - Redirect to `/dashboard` → Protected route verifies token

---

## Site Features

### 1. Navigation System

**Features:**
- **Sticky Navigation Bar**: Remains visible while scrolling
- **Responsive Design**: Hamburger menu on mobile devices
- **Dropdown Menus**: Organized navigation for About Us and Services
- **Admin Portal Button**: Secure access to analytics dashboard (desktop: top-right, mobile: in menu)
- **Logo Enhancement**: 3D effects and hover animations
- **Accessible**: Keyboard navigation and ARIA labels

**Navigation Structure:**
```
Home
About Us
  └─ Our Team
Services
  └─ Invent Properties
  └─ Invent Power System
  └─ Invent Bakery
News (Blog)
Careers
Invent Academy
Contact
```

### 2. Home Page

**Sections:**
- **Hero Section**: Vision statement with call-to-action button
- **Products & Services**: Grid of 7 service cards with images and links
- **Recent News Widget**: Latest blog posts preview

**Service Cards Display:**
1. Bakery Services & Consultancy
2. Business Process Outsourcing
3. Virtual Office & Hosted Services
4. High Tech Logistics
5. Invent Power Systems
6. Invent Properties
7. Invent Shortlet

### 3. About Us Page

**Content Sections:**
- **Company Description**: Professional overview of Invent Alliance Limited
- **Strategic Business Units**: List of SBUs with descriptions
- **Mission Statement**: Core mission and values
- **Core Values**: Six key principles
- **Leadership Team**: Team member profiles with photos and descriptions

**Team Members:**
- Francis Chidebe B.Sc, ACA
- Favour David
- Christopher Odinakachi
- Obinna Obasi
- Chizoba Ezeigwe
- Okechukwu Umehan

### 4. Products & Services Page

**Features:**
- Grid layout of all services
- Service cards with:
  - Service name and description
  - High-quality images
  - Links to external subdomains or internal pages
  - Hover effects and animations

### 5. Blog/News Section

**Features:**
- **Blog Listing Page** (`/blog`): Displays all blog posts
- **Blog Post Pages**: Individual articles with:
  - Title and publication date
  - Full article content
  - Back to blog navigation

**Current Blog Posts:**
- An Appreciation from Lead-Fort Gate College (June 5, 2023)
- National Open University Students' Tour At The Invent (April 20, 2023)

### 6. Contact Page

**Features:**
- **Contact Information Display**:
  - Company address
  - Phone number: +234 (0) 906 276 4054
  - Email address
- **Interactive Google Maps**: Embedded map showing company location
- **Contact Form**:
  - Name, Email, Subject, Message fields
  - Real-time validation
  - Success/error feedback
  - Anti-spam protection

### 7. Invent Academy Registration

**Features:**
- **Registration Form** with fields:
  - Name
  - Email
  - Phone
  - Age Range (dropdown: 16-25, 26-35, 36-45, 46-55, 56-65, 66+)
  - Stream Selection (Professional or Investor)
  - Message (optional)
- **Age Validation**: 
  - Minimum 16 years for Professional stream
  - Minimum 18 years for Investor stream
- **Form Validation**: Client-side and server-side

### 8. Interactive Chatbot

**Features:**
- **Floating Button**: Bottom-right corner chat button
- **Expandable Chat Window**: Toggle open/close
- **Quick Action Buttons**: Pre-defined options for common queries
- **Natural Language Processing**: Understands user intent
- **Responses for**:
  - About Us information
  - Services overview
  - Contact details
  - Careers information
  - Academy registration details

### 9. Footer

**Sections:**
- **Company Information**: Brief description and "Learn more" link
- **Recent News**: Latest blog posts with dates
- **Quick Links**: Navigation shortcuts
- **Copyright**: "© 2024 Invent Alliance Limited. All rights reserved."
- **Redesign Credit**: "Redesigned by Invent IT Team"

### 10. Admin Dashboard & Analytics Portal

**Access:**
- **Login Page** (`/login`): Secure authentication portal
- **Admin Portal Button**: Accessible from navbar (desktop and mobile)
- **Protected Routes**: Dashboard requires valid authentication

**Features:**
- **Real-Time Analytics**: Automatic tracking via middleware
- **Comprehensive Metrics**:
  - Page views and unique visitors
  - Session tracking and analysis
  - Popular pages and traffic sources
  - System performance metrics
- **Visual Dashboards**:
  - Overview tab with key metrics cards
  - Interactive charts (Line charts, Bar charts)
  - Data tables with detailed statistics
  - System performance monitoring
- **Report Export**:
  - CSV export for data analysis
  - PDF export for presentations
  - Date range filtering (7, 30, 90 days)
- **Responsive Design**: Fully optimized for all screen sizes

**Dashboard Tabs:**
1. **Overview**: Key metrics, page views over time, top pages
2. **Pages**: Detailed page view statistics and charts
3. **Sources**: Traffic source breakdown and analysis
4. **System**: API performance, response times, error rates

**Goal & Funnel Tracking** (when `FEATURE_FUNNEL_GOALS=true`):
- **Goal Types**: Contact form submissions, Academy registrations, Report downloads
- **Funnel Steps**: Page load, Form start, Form submit, Success
- **Conversion Analytics**: Track user journey through conversion funnels
- **Non-PII Metadata**: Stores only non-personally identifiable information (subject category, stream, etc.)
- **Cookie Consent Integration**: Respects user consent preferences
- **API Endpoint**: `/api/analytics/goals` (GET for data, POST for tracking)

### 11. Error Handling

**Error Pages:**
- **404 Not Found**: Custom page with helpful links
- **Error Boundary**: Catches React errors gracefully
- **Global Error Handler**: Root-level error handling
- **User-Friendly Messages**: Clear error messages with recovery options

---

## Technical Stack

### Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 15.1.0 | React framework with App Router |
| **React** | 18.3.1 | UI library |
| **TypeScript** | 5.7.2 | Type safety and developer experience |
| **Tailwind CSS** | 3.4.17 | Utility-first CSS framework |
| **Node.js** | 20+ | Runtime environment |

### Key Libraries

| Library | Purpose |
|---------|---------|
| **react-chatbot-kit** | Chatbot widget functionality |
| **nodemailer** | SMTP email sending |
| **next/image** | Image optimization |
| **recharts** | Chart library for dashboard visualizations |
| **pdfkit** | PDF generation for report exports |
| **pg** | PostgreSQL client for database operations |
| **bcryptjs** | Password hashing for authentication |
| **jsonwebtoken** | JWT token generation and verification |
| **ESLint** | Code quality and linting |

### Development Tools

- **TypeScript**: Type checking
- **ESLint**: Code linting
- **PostCSS**: CSS processing
- **Autoprefixer**: CSS vendor prefixing

### Deployment

- **Docker**: Containerization
- **Docker Compose**: Multi-container orchestration
- **Node.js Alpine**: Lightweight container base

---

## Project Structure

```
ial-website-redesign/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx               # Root layout (Navbar, Footer, Chatbot)
│   ├── page.tsx                 # Home page
│   ├── globals.css               # Global styles
│   ├── metadata.ts               # SEO metadata configuration
│   ├── about-us/                 # About Us page
│   ├── our-team/                 # Team page
│   ├── products-services/        # Services listing
│   ├── blog/                     # Blog listing
│   ├── careers/                 # Careers page
│   ├── contacts/                 # Contact page with form
│   ├── invent-academy-registration/  # Academy registration form
│   ├── [blog-slug]/             # Individual blog posts
│   ├── login/                    # Login page
│   ├── dashboard/                # Admin dashboard (protected)
│   │   ├── page.tsx             # Dashboard main page
│   │   └── layout.tsx           # Dashboard layout
│   ├── api/                      # API routes
│   │   ├── contact/             # Contact form handler
│   │   ├── academy-registration/ # Academy form handler
│   │   ├── auth/                 # Authentication endpoints
│   │   │   ├── login/            # Login handler
│   │   │   ├── logout/           # Logout handler
│   │   │   └── verify/           # Token verification
│   │   └── analytics/            # Analytics endpoints
│   │       ├── route.ts         # Analytics data retrieval
│   │       ├── track/            # Manual tracking endpoint
│   │       ├── seed/             # Data seeding endpoint
│   │       └── export/           # Report export
│   │           ├── csv/         # CSV export
│   │           └── pdf/         # PDF export
│   ├── sitemap.ts               # Dynamic sitemap generation
│   ├── robots.ts                 # Robots.txt configuration
│   ├── error.tsx                 # Error page
│   ├── global-error.tsx          # Global error handler
│   ├── not-found.tsx            # 404 page
│   └── loading.tsx              # Loading state
├── components/                   # Reusable React components
│   ├── Navbar.tsx               # Navigation bar
│   ├── Footer.tsx               # Footer component
│   ├── ServiceCard.tsx         # Service card component
│   ├── Chatbot.tsx              # Chatbot widget
│   ├── ChatbotOptions.tsx       # Chatbot quick actions
│   ├── ErrorBoundary.tsx        # Error boundary wrapper
│   ├── ErrorBoundaryWrapper.tsx # Error boundary wrapper component
│   ├── ConditionalLayout.tsx    # Conditional layout wrapper
│   ├── ProtectedRoute.tsx       # Route protection component
│   ├── LoadingSkeleton.tsx      # Loading skeleton component
│   ├── StructuredData.tsx        # JSON-LD structured data
│   └── dashboard/               # Dashboard components
│       ├── MetricCard.tsx       # Metric display card
│       ├── LineChart.tsx        # Line chart component
│       ├── BarChart.tsx          # Bar chart component
│       └── DataTable.tsx         # Data table component
├── lib/                          # Utility libraries
│   ├── chatbotConfig.tsx        # Chatbot configuration
│   ├── MessageParser.ts         # Chatbot message parsing
│   ├── ActionProvider.tsx        # Chatbot action handlers
│   ├── auth.ts                  # In-memory authentication
│   ├── auth-db.ts               # Database-backed authentication
│   ├── auth-wrapper.ts          # Authentication wrapper
│   ├── analytics.ts             # In-memory analytics
│   ├── analytics-db.ts          # Database-backed analytics
│   ├── analytics-wrapper.ts     # Analytics wrapper
│   ├── db.ts                    # PostgreSQL connection utility
│   ├── pdf-config.ts            # PDF generation configuration
│   └── utils.ts                 # Utility functions
├── database/                     # Database schema and migrations
│   ├── schema.sql               # Main database schema
│   ├── seed.sql                 # Database seeding script
│   ├── README.md                # Database documentation
│   └── migrations/              # Database migration scripts
├── scripts/                      # Build and utility scripts
│   ├── generate-favicon.js     # Favicon generation (Node.js)
│   ├── generate-favicon-python.py # Favicon generation (Python)
│   ├── setup-pdfkit-fonts.js    # PDFKit font setup
│   └── create-admin-user.js    # Admin user creation script
├── middleware.ts                 # Next.js middleware for analytics
├── public/                       # Static assets
│   ├── favicon.ico              # Favicon files
│   └── [images]/               # Image assets
├── types/                        # TypeScript type definitions
│   └── nodemailer.d.ts          # Nodemailer types
├── scripts/                      # Build scripts
│   ├── generate-favicon.js      # Favicon generation (Node.js)
│   └── generate-favicon-python.py # Favicon generation (Python)
├── Dockerfile                    # Production Docker image
├── Dockerfile.dev                # Development Docker image
├── docker-compose.yml            # Production Docker Compose
├── docker-compose.dev.yml        # Development Docker Compose
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # Dependencies and scripts
└── README.md                     # Project documentation
```

---

## Key Components

### 1. Navbar Component

**Location:** `components/Navbar.tsx`

**Features:**
- Responsive navigation with mobile hamburger menu
- Dropdown menus for About Us and Services
- Logo with 3D hover effects
- Sticky positioning (stays at top while scrolling)
- Keyboard navigation support
- ARIA labels for accessibility

**Technical Details:**
- Client Component (`'use client'`)
- Uses React hooks (`useState`) for menu state
- Tailwind CSS for styling
- Next.js `Link` component for navigation

### 2. Footer Component

**Location:** `components/Footer.tsx`

**Features:**
- Company information section
- Recent news widget
- Quick links navigation
- Copyright and redesign credit

**Technical Details:**
- Server Component (default)
- Static content rendering
- Responsive grid layout

### 3. ServiceCard Component

**Location:** `components/ServiceCard.tsx`

**Features:**
- Reusable card for displaying services
- Image optimization with `next/image`
- Support for internal and external links
- Hover effects and animations

**Props:**
```typescript
{
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  linkUrl: string;
  external?: boolean;
}
```

### 4. Chatbot Component

**Location:** `components/Chatbot.tsx`

**Features:**
- Floating chat button
- Expandable chat window
- Integration with `react-chatbot-kit`
- Custom styling to match site theme

**Technical Details:**
- Client Component
- Dynamic import to avoid SSR issues
- CSS imported from `react-chatbot-kit`

### 5. ErrorBoundary Component

**Location:** `components/ErrorBoundary.tsx`

**Features:**
- Catches React errors in child components
- Displays fallback UI
- Logs errors for debugging

**Technical Details:**
- Client Component
- Uses React Error Boundary API
- Wraps entire application in root layout

### 6. Dashboard Components

**Location:** `components/dashboard/`

**MetricCard Component:**
- Displays key metrics with icons
- Responsive design with hover effects
- Supports different metric types

**LineChart Component:**
- Time series visualization using Recharts
- Responsive container with responsive height
- Customizable colors and styling

**BarChart Component:**
- Bar chart visualization for comparisons
- Responsive design
- Customizable data and colors

**DataTable Component:**
- Sortable and filterable data tables
- Responsive with horizontal scroll
- Clean, modern styling

### 7. AccessibleFormField Component (Gated)

**Location:** `components/AccessibleFormField.tsx`

**Features:**
- WCAG 2.1 AA compliant form field wrapper
- Proper label associations (`htmlFor`/`id`)
- ARIA invalid states for validation errors
- Error announcements with `role="alert"`
- Help text associations via `aria-describedby`
- Minimum touch target size (48px) for mobile
- Enabled when `FEATURE_ACCESSIBILITY_UPGRADES=true`

**Usage:**
```typescript
<AccessibleFormField
  label="Email Address"
  id="email"
  error={errors.email}
  helpText="We'll never share your email"
  required
>
  <input type="email" id="email" />
</AccessibleFormField>
```

### 8. MultiStepAcademyForm Component (Gated)

**Location:** `components/MultiStepAcademyForm.tsx`

**Features:**
- Multi-step registration flow (3 steps)
- Progress indicator
- Step-by-step validation
- Input persistence between steps
- Review step before submission
- Enabled when `FEATURE_ACADEMY_MULTI_STEP_FORM=true`
- Falls back to single-page form when disabled

**Steps:**
1. Personal Information (name, email, phone, age)
2. Program Choices (stream selection, additional info)
3. Review & Submit

### 9. CookieConsent Component (Gated)

**Location:** `components/CookieConsent.tsx`

**Features:**
- GDPR-compliant cookie consent banner
- Granular consent options (analytics, marketing)
- localStorage and cookie-based preference storage
- Blocks analytics until consent given
- Enabled when `FEATURE_COOKIE_CONSENT=true`

### 10. TrustSignals Component (Gated)

**Location:** `components/TrustSignals.tsx`

**Features:**
- Security badges and certifications display
- GDPR compliance indicators
- Privacy policy links
- SSL/TLS certificate indicators
- Enabled when `FEATURE_TRUST_SIGNALS=true`

### 11. CTAButton Component (Gated)

**Location:** `components/CTAButton.tsx`

**Features:**
- Optimized call-to-action button component
- Variants: primary, secondary, success
- Loading state support
- Optional icon support
- Disabled state prevents double submission
- Enabled when `FEATURE_CTA_BUTTONS=true`

### 12. SkipToContent Component (Gated)

**Location:** `components/SkipToContent.tsx`

**Features:**
- Skip link for keyboard/screen reader users
- Visible on focus
- Jumps to main content
- Enabled when `FEATURE_ACCESSIBILITY_UPGRADES=true`

### 13. ProtectedRoute Component

**Location:** `components/ProtectedRoute.tsx`

**Features:**
- Wraps protected pages (dashboard)
- Verifies authentication token
- Redirects to login if unauthorized
- Shows loading state during verification

### 8. ConditionalLayout Component

**Location:** `components/ConditionalLayout.tsx`

**Features:**
- Conditionally renders Navbar/Footer/Chatbot
- Excludes layout for dashboard/login pages
- Prevents hydration mismatches
- Client-side rendering for pathname detection

---

## Forms & API Routes

### Contact Form

**Page:** `/contacts`

**Form Fields:**
- Name (required)
- Email (required, validated)
- Subject (required)
- Message (required)
- Website (honeypot - hidden from users)

**API Route:** `/api/contact`

**Features:**
- Client-side validation
- Server-side validation
- Honeypot anti-spam protection
- Rate limiting (5 requests per 15 minutes per IP)
- SMTP email sending
- Multiple recipient support (comma-separated emails)
- **Accessibility**: Accessible form fields with ARIA labels (when `FEATURE_ACCESSIBILITY_UPGRADES=true`)
- **Analytics**: Goal tracking on successful submission (when `FEATURE_FUNNEL_GOALS=true`)
- **Trust Signals**: Trust indicators panel (when `FEATURE_TRUST_SIGNALS=true`)
- **CTA Optimization**: Optimized submit button (when `FEATURE_CTA_BUTTONS=true`)

**Email Configuration:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
CONTACT_TO_EMAIL=contact@inventallianceco.com,contact@patrickogbonna.com
```

### Academy Registration Form

**Page:** `/invent-academy-registration`

**Form Fields:**
- Name (required)
- Email (required, validated)
- Phone (required)
- Age Range (required, dropdown: 16-25, 26-35, 36-45, 46-55, 56-65, 66+)
- Stream (required: Professional or Investor)
- Message (optional)
- Company (honeypot - hidden from users)

**API Route:** `/api/academy-registration`

**Features:**
- Age validation (16+ for Professional, 18+ for Investor)
- Stream-specific validation
- Client-side and server-side validation
- Honeypot anti-spam protection
- Rate limiting (3 requests per 15 minutes per IP)
- SMTP email sending
- Multiple recipient support
- **Multi-step Form**: Optional multi-step registration flow (when `FEATURE_ACADEMY_MULTI_STEP_FORM=true`)
- **Accessibility**: Accessible form fields with ARIA labels (when `FEATURE_ACCESSIBILITY_UPGRADES=true`)
- **Analytics**: Goal and funnel step tracking (when `FEATURE_FUNNEL_GOALS=true`)
- **Trust Signals**: Trust indicators panel (when `FEATURE_TRUST_SIGNALS=true`)
- **CTA Optimization**: Optimized submit button (when `FEATURE_CTA_BUTTONS=true`)

**Email Configuration:**
```env
ACADEMY_TO_EMAIL=academy@inventallianceco.com,contact@patrickogbonna.com
```

### Rate Limiting

**Implementation:**
- In-memory storage (Map data structure)
- Per-IP address tracking
- Configurable window and max requests
- Automatic reset after window expires

**Limits:**
- Contact Form: 5 requests per 15 minutes
- Academy Form: 3 requests per 15 minutes

**Note:** For production at scale, consider using Redis for distributed rate limiting.

### Authentication API Routes

**Login Route:** `/api/auth/login`

**Features:**
- Validates username and password
- Supports both in-memory and database authentication
- Generates JWT token on success
- Sets HTTP-only cookie for session management
- Returns error messages for invalid credentials

**Logout Route:** `/api/auth/logout`

**Features:**
- Clears authentication cookie
- Invalidates session
- Returns success confirmation

**Verify Route:** `/api/auth/verify`

**Features:**
- Verifies JWT token from cookie
- Returns authentication status
- Used for protected route checks

### Analytics API Routes

**Main Analytics Route:** `/api/analytics`

**Query Parameters:**
- `type`: Data type (overview, pageviews, pages, sources, sessions, system, system-stats, timeseries)
- `startDate`: Unix timestamp for start date
- `endDate`: Unix timestamp for end date (optional)
- `interval`: Time series interval (hour, day, week)

**Features:**
- Requires authentication (JWT token)
- Supports multiple data types
- Date range filtering
- Returns JSON data for dashboard consumption

**Export Routes:**

**CSV Export:** `/api/analytics/export/csv`
- Generates CSV file with analytics data
- Supports date range filtering
- Downloads as CSV file

**PDF Export:** `/api/analytics/export/pdf`
- Generates PDF report with analytics data
- Includes charts and tables
- Custom font handling for PDFKit
- Downloads as PDF file

**Tracking Route:** `/api/analytics/track`
- Manual page view tracking endpoint
- Accepts POST requests with tracking data
- Useful for client-side tracking

**Seed Route:** `/api/analytics/seed`
- Seeds sample analytics data
- Useful for testing and development
- Only available in non-production environments

**Goals & Funnel Tracking Route:** `/api/analytics/goals` (when `FEATURE_FUNNEL_GOALS=true`)
- **GET**: Returns aggregated goal and funnel step data
  - Goal counts by type
  - Funnel conversion rates
  - Step-by-step funnel analytics
- **POST**: Tracks goal events and funnel steps
  - Accepts `{ type, metadata?, timestamp }` for goals
  - Accepts `{ funnel, step, metadata?, timestamp }` for funnel steps
  - Stores in-memory (DB-ready for future migration)
  - Respects cookie consent preferences
  - No PII stored in metadata (only non-PII like subject category, stream)

### Data Subject Access Request (DSAR) API Route

**Route:** `/api/data-subject-request` (when `FEATURE_DSAR_PORTAL=true`)

**Features:**
- Handles GDPR data subject rights requests
- Supports access, rectification, erasure, portability requests
- CSRF protection (when `FEATURE_CSRF=true`)
- Email notifications to data protection officer
- Request tracking and status updates

### Admin API Routes (Protected)

**Processing Activities Route:** `/api/admin/processing-activities` (when `FEATURE_ROPA_ENDPOINT=true`)
- Returns Records of Processing Activities (ROPA) register
- GDPR Article 30 compliance endpoint
- Admin authentication required
- JSON export format

**Retention Route:** `/api/admin/retention` (when `FEATURE_RETENTION_ENDPOINT=true`)
- Manually triggers data retention policies
- Admin authentication required
- Returns retention summary report
- Supports different retention periods per data type

### Health Check Route

**Route:** `/api/health`

**Features:**
- Database connection health check
- Connection pool statistics (when `FEATURE_DB_MONITORING=true`)
- Returns system health status
- Useful for monitoring and load balancers

### CSRF Token Route

**Route:** `/api/csrf-token` (when `FEATURE_CSRF=true`)

**Features:**
- Returns CSRF token for form submissions
- Token expires after configured time
- Required for POST/PUT/DELETE requests when CSRF protection is enabled

---

## Admin Dashboard & Analytics

### Overview

The Admin Dashboard provides comprehensive website analytics and system performance monitoring. It requires authentication and offers real-time insights into user behavior and system health.

### Authentication System

**Implementation:**
- JWT-based authentication with HTTP-only cookies
- Supports both in-memory and database-backed authentication
- Secure password hashing with bcryptjs
- Session management with configurable duration

**Authentication Flow:**
1. User visits `/login` page
2. Enters username and password
3. POST request to `/api/auth/login`
4. Server validates credentials (in-memory or database)
5. JWT token generated and set as HTTP-only cookie
6. Redirect to `/dashboard`
7. Protected routes verify token on each request

**Security Features:**
- HTTP-only cookies prevent XSS attacks
- Secure flag in production (HTTPS only)
- Token expiration handling
- Automatic logout on token expiry

### Analytics Tracking

**Middleware-Based Tracking:**
- Automatic page view tracking via Next.js middleware
- Runs in Edge Runtime for optimal performance
- Tracks: path, IP address, user agent, referrer, session ID
- System metrics: response time, status codes, request methods

**Data Storage:**
- **In-Memory Mode**: Fast, no database required (default)
  - Stores data in Map data structures
  - 30-day retention period
  - Maximum 10,000 records per metric type
- **Database Mode**: Persistent storage with PostgreSQL
  - Full data persistence across restarts
  - Scalable for production use
  - Configurable via `USE_DATABASE` environment variable

**Tracked Metrics:**
- **Page Views**: Every page visit with timestamp
- **Unique Visitors**: Distinct sessions identified by session ID
- **Sessions**: User session tracking with activity timestamps
- **Traffic Sources**: Referrer tracking (Direct, Search, Social, etc.)
- **System Metrics**: API response times, error rates, status codes
- **Time Series Data**: Page views over time (hourly, daily, weekly)

### Dashboard Features

**Overview Tab:**
- Key metric cards: Page Views, Unique Visitors, Sessions, Avg Response Time
- Page views over time (Line Chart)
- Top 10 pages (Bar Chart)
- System statistics: Total requests, error rate, status code distribution

**Pages Tab:**
- Bar chart of page views by path
- Detailed data table with view counts
- Sortable and filterable

**Sources Tab:**
- Traffic source breakdown (Bar Chart)
- Data table with source statistics
- Categorization: Direct, Search Engines, Social Media, Referrals

**System Tab:**
- System metrics cards: Total Requests, Avg Response Time, Error Rate
- Status code distribution visualization
- Performance monitoring

**Date Range Filtering:**
- Last 7 days
- Last 30 days
- Last 90 days
- Custom date ranges via API

**Report Export:**
- CSV export for data analysis
- PDF export with charts and tables
- Date range filtering applied to exports

### Responsive Design

**Mobile Optimization:**
- Responsive charts that adapt to screen size
- Touch-friendly interface
- Optimized table scrolling
- Mobile-first navigation

**Desktop Features:**
- Full-width charts and tables
- Hover effects and interactions
- Keyboard navigation support

---

## Database Integration

### PostgreSQL Support

**Database Schema:**
- **users**: User accounts with password hashing
- **visitor_sessions**: Session tracking with metadata
- **page_views**: Individual page view records
- **system_metrics**: API performance and error tracking

**Key Features:**
- UUID primary keys for scalability
- Automatic timestamps (created_at, updated_at)
- Foreign key relationships
- Comprehensive indexes for performance
- Data retention policies (30 days default)

### Database Configuration

**Environment Variables:**
```env
USE_DATABASE=true
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ial_analytics
DB_USER=postgres
DB_PASSWORD=your_password
DB_SSL=false  # Set to true for production
```

### Migration System

**Migration Scripts:**
- `database/migrations/001_initial_schema.sql`: Initial database setup
- `database/migrations/002_add_user_email_index.sql`: Performance optimization
- `database/schema.sql`: Complete schema definition
- `database/seed.sql`: Sample data seeding

### Connection Management

**Connection Pooling:**
- Configurable connection pool size
- Connection timeout handling
- Automatic retry logic
- Health check utilities

**Error Handling:**
- Graceful fallback to in-memory mode
- Connection error logging
- User-friendly error messages
- Automatic reconnection

### Data Persistence

**Benefits:**
- Data survives server restarts
- Scalable for high-traffic sites
- Historical data analysis
- Production-ready architecture

**Fallback Mode:**
- If database unavailable, falls back to in-memory storage
- Seamless transition between modes
- No data loss during transition

---

## SEO & Performance

### SEO Features

**1. Metadata Management**
- Centralized metadata configuration (`app/metadata.ts`)
- Page-specific metadata overrides
- Open Graph tags for social sharing
- Twitter Card tags
- Canonical URLs

**2. Structured Data (JSON-LD)**
- Organization schema
- Breadcrumb schema (where applicable)
- Article schema for blog posts

**3. Sitemap**
- Dynamic sitemap generation (`app/sitemap.ts`)
- Includes all pages
- Updates automatically on build

**4. Robots.txt**
- Configurable robots.txt (`app/robots.ts`)
- Allows/disallows specific paths
- Sitemap reference

**5. Semantic HTML**
- Proper heading hierarchy (h1, h2, h3)
- Semantic elements (nav, main, footer, article)
- ARIA labels for accessibility

### Performance Optimizations

**1. Static Site Generation (SSG)**
- All content pages pre-rendered at build time
- Zero server-side processing for page requests
- Fastest possible load times

**2. Image Optimization**
- Next.js Image component with automatic optimization
- Modern formats (AVIF, WebP) with fallbacks
- Lazy loading for below-fold images
- Priority loading for above-fold images
- Blur placeholders to prevent layout shift
- Responsive image sizes

**3. Code Splitting**
- Automatic code splitting by Next.js
- Route-based code splitting
- Dynamic imports for heavy components

**4. Caching**
- Static assets cached for 1 year
- Immutable assets marked
- Proper cache headers configured

**5. Bundle Size**
- First Load JS: ~102 kB (shared)
- Page-specific JS: 1.3-2.5 kB per page
- Tree-shaking for unused code

### Core Web Vitals Targets

| Metric | Target | Status |
|--------|--------|--------|
| **LCP** (Largest Contentful Paint) | < 2.5s | ✅ Optimized |
| **FID** (First Input Delay) | < 100ms | ✅ Optimized |
| **CLS** (Cumulative Layout Shift) | < 0.1 | ✅ Optimized |
| **FCP** (First Contentful Paint) | < 1.8s | ✅ Optimized |
| **TTI** (Time to Interactive) | < 3.8s | ✅ Optimized |

---

## Deployment & Infrastructure

### Docker Deployment

**Production Dockerfile:**
- Multi-stage build (deps → builder → runner)
- Node.js 20 Alpine base image
- Non-root user for security
- Standalone output mode
- Optimized for production

**Development Dockerfile:**
- Simpler build for development
- Volume mounting for hot-reload
- All dependencies included

**Docker Compose:**
- Production: `docker-compose.yml`
- Development: `docker-compose.dev.yml`
- Health checks configured
- Environment variable support

### Build Process

**Development:**
```bash
npm run dev
# Starts development server on http://localhost:3000
```

**Production Build:**
```bash
npm run build
# Generates optimized production build
npm start
# Starts production server
```

**Docker Build:**
```bash
docker-compose up --build
# Builds and starts container
```

### Environment Variables

**Required:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
CONTACT_TO_EMAIL=contact@inventallianceco.com
ACADEMY_TO_EMAIL=academy@inventallianceco.com
```

**Optional:**
```env
NEXT_PUBLIC_SITE_URL=https://www.inventallianceco.com
NODE_ENV=production

# Database Configuration (optional)
USE_DATABASE=false  # Set to true to enable PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ial_analytics
DB_USER=postgres
DB_PASSWORD=your_password
DB_SSL=false

# Authentication (optional, defaults provided)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
JWT_SECRET=your-random-secret-key-change-in-production
```

### Hosting Recommendations

**Recommended Platforms:**
- **Vercel**: Optimal for Next.js (zero-config deployment)
- **Netlify**: Good Next.js support
- **AWS Amplify**: Scalable hosting
- **DigitalOcean App Platform**: Simple deployment
- **Self-hosted**: Docker containers on any VPS

**Requirements:**
- Node.js 20+ runtime
- SMTP access for email sending
- HTTPS certificate (Let's Encrypt recommended)
- Domain name with DNS configuration
- PostgreSQL (optional, for database mode)

---

## Feature Flags System

The application uses a comprehensive feature flag system for gradual rollout, A/B testing, and feature toggling. All feature flags are defined in `lib/feature-flags.ts`.

### How Feature Flags Work

Feature flags are controlled via environment variables. Set `FEATURE_NAME=true` to enable a feature, or omit/set to `false` to disable it.

**Example:**
```env
FEATURE_ACCESSIBILITY_UPGRADES=true
FEATURE_FUNNEL_GOALS=false
FEATURE_COOKIE_CONSENT=true
```

### Key Feature Flags

#### Security & GDPR Flags
- `FEATURE_CSRF` - CSRF protection on forms
- `FEATURE_SECURE_HEADERS` - Enhanced security headers (auto-enabled in production)
- `FEATURE_COOKIE_CONSENT` - GDPR cookie consent banner
- `FEATURE_PII_HASHING` - Pseudonymize/hash PII data
- `FEATURE_PII_EMAIL_ENCRYPTION` - Encrypt emails at rest
- `FEATURE_RETENTION_JOBS` - Automated data retention cleanup
- `FEATURE_RETENTION_ENDPOINT` - Manual retention trigger endpoint
- `FEATURE_ROPA_ENDPOINT` - Records of Processing Activities endpoint
- `FEATURE_DSAR_PORTAL` - Data Subject Access Request portal
- `FEATURE_RATE_LIMIT_LOGIN` - Rate limiting on login endpoint
- `FEATURE_STRICT_SAMESITE_AUTH` - Strict SameSite for auth cookies

#### UX & Accessibility Flags
- `FEATURE_ACCESSIBILITY_UPGRADES` - WCAG 2.1 AA accessibility improvements
- `FEATURE_TRUST_SIGNALS` - Trust indicators panel on forms
- `FEATURE_CTA_BUTTONS` - Optimized CTA button component
- `FEATURE_ACADEMY_MULTI_STEP_FORM` - Multi-step academy registration form
- `FEATURE_DASHBOARD_SKELETON_LOADING` - Skeleton loading states
- `FEATURE_DASHBOARD_ERROR_RECOVERY` - Enhanced error handling

#### Analytics & Performance Flags
- `FEATURE_FUNNEL_GOALS` - Goal and funnel tracking
- `FEATURE_API_CACHE` - API response caching
- `FEATURE_MONITORING_METRICS` - Performance monitoring
- `FEATURE_ANALYTICS_BATCH_WRITE` - Batch analytics writes
- `FEATURE_ANALYTICS_JOIN_OPTIMIZED_READS` - Optimized JOIN queries

### Feature Flag Validation

The system includes validation to detect configuration issues:
- Missing dependencies (e.g., CSRF requires secure headers)
- Missing environment variables (e.g., encryption requires encryption key)
- Logical conflicts between flags

See `lib/feature-flags.ts` for complete documentation of all flags.

---

## Security Features

### 1. Form Security

**Honeypot Fields:**
- Hidden fields that bots fill but humans don't
- Contact form: "website" field
- Academy form: "company" field
- Server rejects submissions with filled honeypot fields

**Rate Limiting:**
- Prevents spam and abuse
- Per-IP address tracking
- Configurable limits per form

**Input Validation:**
- Client-side validation for immediate feedback
- Server-side validation for security
- Email format validation
- Phone number validation
- Age range validation

### 2. HTTP Security Headers

**Configured Headers:**
- `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-XSS-Protection: 1; mode=block` - XSS protection
- `Referrer-Policy: strict-origin-when-cross-origin` - Controls referrer information

### 3. SMTP Security

**Best Practices:**
- Use App Passwords (not regular passwords) for Gmail
- TLS/SSL encryption for SMTP connections
- Environment variables for sensitive credentials
- Never commit credentials to version control

### 4. Authentication Security

**JWT Tokens:**
- HTTP-only cookies prevent XSS attacks
- Secure flag in production (HTTPS only)
- Token expiration and refresh handling
- Server-side token verification

**Password Security:**
- bcryptjs hashing with salt rounds
- Never store plain-text passwords
- Environment variable configuration
- Default credentials warning removed from UI

### 5. Error Handling

**Security Considerations:**
- Generic error messages (don't expose system details)
- Error logging for debugging (server-side only)
- User-friendly error pages
- Error boundaries prevent app crashes

---

## Accessibility

### WCAG 2.1 AA Compliance

**Implemented Features:**
- **Semantic HTML**: Proper use of HTML5 elements
- **ARIA Labels**: Descriptive labels for screen readers
- **Keyboard Navigation**: Full keyboard support for all interactive elements
- **Focus States**: Visible focus indicators
- **Alt Text**: Descriptive alt text for all images
- **Color Contrast**: Sufficient contrast ratios for text
- **Form Labels**: Proper label associations

### Enhanced Accessibility Features (when `FEATURE_ACCESSIBILITY_UPGRADES=true`)

**AccessibleFormField Component:**
- Proper label associations (`htmlFor`/`id`)
- ARIA invalid states (`aria-invalid`)
- Error announcements with `role="alert"`
- Help text associations via `aria-describedby`
- Minimum touch target size (48px) for mobile

**Navbar Enhancements:**
- `aria-expanded` for mobile menu toggle
- `aria-controls` linking toggle to menu
- `aria-label` for menu button
- Focus trap when mobile menu is open
- Escape key closes mobile menu

**Skip to Content Link:**
- Visible on keyboard focus
- Jumps to main content (`id="main-content"`)
- Screen reader friendly

**Dashboard ARIA Live Announcements:**
- `aria-live="polite"` announcements for data updates
- Screen reader notifications when dashboard data refreshes
- Non-intrusive status updates

### Keyboard Navigation

**Supported Interactions:**
- Tab navigation through all interactive elements
- Enter/Space to activate buttons and links
- Escape to close dropdowns and modals (when accessibility upgrades enabled)
- Arrow keys for dropdown navigation (where applicable)
- Focus trap in mobile menu (when accessibility upgrades enabled)

### Screen Reader Support

**Features:**
- ARIA labels on navigation elements
- Descriptive link text
- Form field labels and error messages
- Skip to main content link
- ARIA live regions for dynamic content updates
- Proper heading hierarchy
- Form error announcements

---

## Future Enhancements

### Planned Features

**1. Content Management**
- [ ] CMS integration (Contentful, Strapi, or Sanity)
- [ ] Admin dashboard for content updates
- [ ] Blog post management interface

**2. Analytics**
- [x] **Built-in analytics dashboard** ✅
- [x] **Real-time tracking** ✅
- [x] **Report export (CSV/PDF)** ✅
- [x] **Goal & funnel tracking** ✅ (when `FEATURE_FUNNEL_GOALS=true`)
- [ ] Google Analytics integration (optional addition)
- [ ] Advanced funnel visualization in dashboard

**3. Performance**
- [ ] Font optimization with `next/font`
- [ ] Service worker for offline support
- [ ] Resource hints (preconnect, prefetch)
- [ ] CDN integration for static assets

**4. Features**
- [ ] Multi-language support (i18n)
- [ ] Search functionality
- [ ] Newsletter subscription
- [ ] Social media integration
- [ ] Live chat integration (alternative to chatbot)

**5. Infrastructure**
- [ ] Redis for distributed rate limiting
- [x] **PostgreSQL database integration** ✅
- [x] **Database-backed authentication** ✅
- [x] **Database-backed analytics** ✅
- [ ] Email queue system
- [ ] Monitoring and alerting
- [ ] Database backup automation

**6. Testing**
- [ ] Unit tests (Jest)
- [ ] Integration tests
- [ ] E2E tests (Playwright/Cypress)
- [ ] Performance testing

---

## Appendix

### External Subdomains

The website links to the following external subdomains (preserved from original site):

- `bpo.inventallianceco.com` - Business Process Outsourcing
- `properties.inventallianceco.com` - Invent Properties
- `power.inventallianceco.com` - Invent Power Systems
- `ovenfreshng.com` - Invent Bakery
- `logistics.inventallianceco.com` - High Tech Logistics
- `shortlet.inventallianceco.com` - Invent Shortlet

### Browser Support

**Supported Browsers:**
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

**Mobile Browsers:**
- iOS Safari (latest)
- Chrome Mobile (latest)
- Samsung Internet (latest)

### Contact Information

**Company:**
- Invent Alliance Limited
- Phone: +234 (0) 906 276 4054
- Website: https://www.inventallianceco.com

**Development Team:**
- Redesigned by Invent IT Team

---

## Document Maintenance

**Version History:**
- **v2.0** (January 2025): Added Admin Dashboard, Analytics System, Database Integration, Authentication System
- **v1.0** (December 2024): Initial comprehensive documentation

**Update Frequency:**
- This document should be updated when:
  - New features are added
  - Architecture changes occur
  - Dependencies are updated
  - Deployment process changes

**Contributors:**
- Invent IT Team
- Development Team

---

**End of Document**

