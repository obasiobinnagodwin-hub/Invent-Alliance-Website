# Invent Alliance Limited Website - Next.js Redesign

A modern, responsive rebuild of the Invent Alliance Limited website using Next.js 15, TypeScript, and Tailwind CSS.

## Features

- ✅ **Next.js 15** with App Router
- ✅ **TypeScript** for type safety
- ✅ **Tailwind CSS** for styling
- ✅ **Responsive Design** - Mobile-first approach
- ✅ **SEO Optimized** - Meta tags and semantic HTML
- ✅ **Image Optimization** - Using next/image
- ✅ **Accessible** - ARIA labels, keyboard navigation
- ✅ **Fast Performance** - Optimized for Lighthouse scores

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
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home page
│   ├── about-us/          # About Us page
│   ├── our-team/          # Team page
│   ├── products-services/ # Services page
│   ├── blog/              # Blog listing
│   ├── careers/           # Careers page
│   ├── invent-academy-registration/ # Academy form
│   ├── contacts/          # Contact page
│   └── [blog-slug]/       # Blog post pages
├── components/            # Reusable components
│   ├── Navbar.tsx        # Navigation component
│   ├── Footer.tsx        # Footer component
│   └── ServiceCard.tsx   # Service card component
├── public/               # Static assets
└── ...config files
```

## Key Components

### Navbar
- Responsive navigation with mobile hamburger menu
- Dropdown menus for About Us and Services
- Accessible with ARIA labels

### Footer
- Company information
- Recent news widget
- Quick links navigation

### ServiceCard
- Reusable card component for services
- Supports internal and external links
- Image optimization with next/image

## Forms

### Contact Form (`/contacts`)
- Name, email, subject, and message fields
- Client-side and server-side validation
- Real-time error messages
- Honeypot anti-spam protection
- Rate limiting (5 requests per 15 minutes per IP)
- SMTP email integration via `/api/contact`

### Academy Registration Form (`/invent-academy-registration`)
- Registration form for Invent Academy
- Stream selection (Professional/Investor)
- Age validation (16+ for Professional, 18+ for Investor)
- Client-side and server-side validation
- Honeypot anti-spam protection
- Rate limiting (3 requests per 15 minutes per IP)
- SMTP email integration via `/api/academy-registration`

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

