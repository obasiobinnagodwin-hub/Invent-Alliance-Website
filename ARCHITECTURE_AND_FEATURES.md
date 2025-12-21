# Invent Alliance Limited Website
## Architecture & Site Feature Description Document

**Version:** 1.0  
**Last Updated:** December 2024  
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
8. [SEO & Performance](#seo--performance)
9. [Deployment & Infrastructure](#deployment--infrastructure)
10. [Security Features](#security-features)
11. [Accessibility](#accessibility)
12. [Future Enhancements](#future-enhancements)

---

## Executive Summary

### For Non-Technical Readers

The Invent Alliance Limited website is a modern, professional web presence rebuilt using cutting-edge web technologies. The site provides:

- **Fast Loading**: Pages load quickly on all devices (desktop, tablet, mobile)
- **Easy Navigation**: Intuitive menu system with dropdown options
- **Contact Forms**: Two forms for inquiries and academy registration
- **Interactive Chatbot**: AI-powered assistant to help visitors find information
- **Mobile-Friendly**: Fully responsive design that works on all screen sizes
- **Search Engine Optimized**: Built to rank well in Google and other search engines
- **Professional Design**: Modern, clean interface with enhanced visual effects

### For Technical Readers

The website is built using **Next.js 15** with the **App Router**, leveraging **TypeScript** for type safety and **Tailwind CSS** for styling. The architecture emphasizes:

- **Static Site Generation (SSG)** for optimal performance
- **Server Components** by default to minimize client-side JavaScript
- **API Routes** for form submissions with SMTP email integration
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
│  │  App Router (Server Components)                        │  │
│  │  - Static Pages (SSG)                                │  │
│  │  - Dynamic Routes (API)                               │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Client Components                                    │  │
│  │  - Navbar (Interactive)                              │  │
│  │  - Forms (Contact, Academy)                          │  │
│  │  - Chatbot Widget                                    │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ SMTP
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                  Email Service (SMTP)                        │
│  - Gmail / Custom SMTP Server                               │
│  - Sends form submissions to recipients                    │
└──────────────────────────────────────────────────────────────┘
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
  - Error boundaries

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

---

## Site Features

### 1. Navigation System

**Features:**
- **Sticky Navigation Bar**: Remains visible while scrolling
- **Responsive Design**: Hamburger menu on mobile devices
- **Dropdown Menus**: Organized navigation for About Us and Services
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

### 10. Error Handling

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
│   ├── api/                      # API routes
│   │   ├── contact/             # Contact form handler
│   │   └── academy-registration/ # Academy form handler
│   ├── sitemap.ts               # Dynamic sitemap generation
│   ├── robots.ts                 # Robots.txt configuration
│   ├── error.tsx                 # Error page
│   ├── not-found.tsx            # 404 page
│   └── loading.tsx              # Loading state
├── components/                   # Reusable React components
│   ├── Navbar.tsx               # Navigation bar
│   ├── Footer.tsx               # Footer component
│   ├── ServiceCard.tsx         # Service card component
│   ├── Chatbot.tsx              # Chatbot widget
│   ├── ChatbotOptions.tsx       # Chatbot quick actions
│   ├── ErrorBoundary.tsx        # Error boundary wrapper
│   ├── LoadingSkeleton.tsx      # Loading skeleton component
│   └── StructuredData.tsx       # JSON-LD structured data
├── lib/                          # Utility libraries
│   ├── chatbotConfig.tsx        # Chatbot configuration
│   ├── MessageParser.ts         # Chatbot message parsing
│   ├── ActionProvider.tsx      # Chatbot action handlers
│   └── utils.ts                 # Utility functions
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

### 4. Error Handling

**Security Considerations:**
- Generic error messages (don't expose system details)
- Error logging for debugging (server-side only)
- User-friendly error pages

---

## Accessibility

### WCAG Compliance

**Implemented Features:**
- **Semantic HTML**: Proper use of HTML5 elements
- **ARIA Labels**: Descriptive labels for screen readers
- **Keyboard Navigation**: Full keyboard support for all interactive elements
- **Focus States**: Visible focus indicators
- **Alt Text**: Descriptive alt text for all images
- **Color Contrast**: Sufficient contrast ratios for text
- **Form Labels**: Proper label associations

### Keyboard Navigation

**Supported Interactions:**
- Tab navigation through all interactive elements
- Enter/Space to activate buttons and links
- Escape to close dropdowns and modals
- Arrow keys for dropdown navigation (where applicable)

### Screen Reader Support

**Features:**
- ARIA labels on navigation elements
- Descriptive link text
- Form field labels and error messages
- Skip to main content link (where applicable)

---

## Future Enhancements

### Planned Features

**1. Content Management**
- [ ] CMS integration (Contentful, Strapi, or Sanity)
- [ ] Admin dashboard for content updates
- [ ] Blog post management interface

**2. Analytics**
- [ ] Google Analytics integration
- [ ] Form submission tracking
- [ ] User behavior analytics

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
- [ ] Database for form submissions
- [ ] Email queue system
- [ ] Monitoring and alerting

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

