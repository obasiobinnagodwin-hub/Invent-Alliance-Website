# Forms Implementation Guide

## Overview

Both the Contact Form and Invent Academy Registration Form have been rebuilt with full backend functionality, anti-spam protection, and improved user experience.

## Features Implemented

### 1. Backend API Routes

#### Contact Form API (`/api/contact/route.ts`)
- **Endpoint**: `POST /api/contact`
- **Functionality**: Sends contact form submissions via SMTP email
- **Rate Limiting**: 5 requests per 15 minutes per IP
- **Validation**: Server-side validation for all fields

#### Academy Registration API (`/api/academy-registration/route.ts`)
- **Endpoint**: `POST /api/academy-registration`
- **Functionality**: Sends academy registration submissions via SMTP email
- **Rate Limiting**: 3 requests per 15 minutes per IP (more restrictive)
- **Validation**: Server-side validation including age and stream validation

### 2. Anti-Spam Protection

#### Honeypot Fields
- **Contact Form**: Hidden `website` field
- **Academy Form**: Hidden `company` field
- Bots that fill these fields are silently rejected (appears successful to them)

#### Rate Limiting
- In-memory rate limiting using Map storage
- Tracks IP addresses and request counts
- Prevents abuse while allowing legitimate users
- **Note**: For production at scale, consider using Redis for distributed rate limiting

### 3. Form Validation

#### Client-Side Validation
- Real-time validation as users type
- Field-specific error messages
- Visual error indicators (red borders)
- Accessibility: ARIA labels and error announcements

#### Server-Side Validation
- Double-checks all inputs
- Sanitizes data (length limits, trimming)
- Returns friendly error messages
- Prevents malicious input

### 4. User Experience Improvements

#### Visual Feedback
- Success/error messages displayed prominently
- Loading states during submission ("Sending...", "Submitting...")
- Disabled submit button during submission
- Clear error messages for each field

#### Accessibility
- ARIA labels and descriptions
- Error announcements for screen readers
- Keyboard navigation support
- Focus management

## Environment Variables

Create a `.env.local` file in the root directory:

```bash
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Email Recipients
CONTACT_TO_EMAIL=contact@inventallianceco.com
ACADEMY_TO_EMAIL=academy@inventallianceco.com  # Optional
```

### Gmail Setup
1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the App Password (not your regular password) in `SMTP_PASS`

### Other SMTP Providers
- **Outlook/Hotmail**: `smtp-mail.outlook.com`, port `587`
- **Yahoo**: `smtp.mail.yahoo.com`, port `587`
- **Custom SMTP**: Use your provider's SMTP settings

## Form Fields

### Contact Form
- **Name** (required, min 2 characters)
- **Email** (required, valid email format)
- **Subject** (required, min 3 characters)
- **Message** (required, min 10 characters)
- **Website** (honeypot - hidden)

### Academy Registration Form
- **Name** (required, min 2 characters)
- **Email** (required, valid email format)
- **Phone** (required, min 10 characters)
- **Age** (required, min 16, min 18 for Investor stream)
- **Stream** (required: "professional" or "investor")
- **Message** (optional, additional information)
- **Company** (honeypot - hidden)

## Error Handling

### Client-Side Errors
- Displayed inline below each field
- Red border on invalid fields
- Clear, actionable error messages

### Server-Side Errors
- Network errors: "An error occurred. Please try again later."
- Validation errors: Specific field errors returned
- Rate limit errors: "Too many requests. Please try again later."
- SMTP errors: Logged to console, user sees friendly message

## Development Mode

If SMTP is not configured:
- Forms still work and validate
- Submissions are logged to console
- User sees success message (for testing)
- No emails are sent

## Production Considerations

1. **Rate Limiting**: Consider Redis for distributed rate limiting
2. **Email Queue**: For high volume, consider a queue system (Bull, BullMQ)
3. **Monitoring**: Add logging/monitoring for form submissions
4. **Backup Storage**: Consider storing submissions in database as backup
5. **CAPTCHA**: For additional protection, consider adding reCAPTCHA v3

## Testing

### Manual Testing Checklist
- [ ] Submit valid form - should succeed
- [ ] Submit form with invalid email - should show error
- [ ] Submit form too quickly (rate limit) - should show rate limit error
- [ ] Fill honeypot field - should silently succeed (bot behavior)
- [ ] Test with SMTP not configured - should log to console in dev
- [ ] Test accessibility with screen reader
- [ ] Test keyboard navigation

## Security Notes

1. **Honeypot**: Effective against basic bots, not sophisticated attacks
2. **Rate Limiting**: Prevents abuse but can be bypassed with VPN/proxy
3. **Input Sanitization**: Basic sanitization implemented, consider additional measures for production
4. **Email Injection**: Inputs are sanitized to prevent email header injection
5. **CORS**: API routes are same-origin only (secure by default)

## Future Enhancements

- [ ] Add reCAPTCHA v3 for additional bot protection
- [ ] Store submissions in database
- [ ] Email confirmation to user
- [ ] Admin dashboard to view submissions
- [ ] Export submissions to CSV
- [ ] Email templates with better formatting

