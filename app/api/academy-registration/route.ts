import { NextRequest, NextResponse } from 'next/server';
import { validateCSRFToken, isCSRFEnabled } from '@/lib/csrf';
import { logger } from '@/lib/secure-logger';
import { sanitizeInput, validateEmailFormat, validatePhoneNumber, enforceLengthLimit } from '@/lib/validators';

// Force dynamic rendering to prevent build-time analysis issues
export const dynamic = 'force-dynamic';

// In-memory rate limiting store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 3; // 3 requests per window (more restrictive for registrations)

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  record.count++;
  return true;
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  return forwarded?.split(',')[0] || realIP || 'unknown';
}

async function sendEmail(data: {
  name: string;
  email: string;
  phone: string;
  ageRange: string;
  stream: string;
  message?: string;
}) {
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

    const streamLabel = data.stream === 'professional' 
      ? 'Aspiring Bakery Professional (16+ years)'
      : 'Confectionery and Bakery Investor (18+ years)';

    // Support multiple email addresses (comma-separated)
    const academyEmails = process.env.ACADEMY_TO_EMAIL || process.env.CONTACT_TO_EMAIL || '';
    const emailRecipients = academyEmails.split(',').map(email => email.trim()).filter(email => email.length > 0);
    
    if (emailRecipients.length === 0) {
      throw new Error('No recipient email addresses configured');
    }

    const mailOptions = {
      from: `"${data.name}" <${process.env.SMTP_USER}>`,
      to: emailRecipients.join(', '),
      replyTo: data.email,
      subject: `Invent Academy Registration: ${data.name}`,
      text: `
Invent Academy Registration

Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone}
Age Range: ${data.ageRange}
Stream: ${streamLabel}
${data.message ? `\nAdditional Information:\n${data.message}` : ''}
      `.trim(),
      html: `
        <h2>New Invent Academy Registration</h2>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Phone:</strong> ${data.phone}</p>
        <p><strong>Age Range:</strong> ${data.ageRange}</p>
        <p><strong>Stream:</strong> ${streamLabel}</p>
        ${data.message ? `<h3>Additional Information:</h3><p>${data.message.replace(/\n/g, '<br>')}</p>` : ''}
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (emailError) {
    logger.error('Email sending error', emailError instanceof Error ? emailError : new Error(String(emailError)));
    const errorMessage = emailError instanceof Error ? emailError.message : 'Unknown email error';
    
    // Check for common SMTP authentication errors
    if (errorMessage.includes('Invalid login') || errorMessage.includes('BadCredentials') || errorMessage.includes('535')) {
      logger.error('SMTP Authentication Error: Please check your SMTP credentials. For Gmail, use an App Password instead of your regular password.');
      throw new Error('SMTP_AUTH_FAILED');
    }
    
    throw new Error(`EMAIL_SEND_FAILED: ${errorMessage}`);
  }
}

export async function POST(request: NextRequest) {
  try {
    // CSRF protection (only if feature is enabled)
    if (isCSRFEnabled() && !validateCSRFToken(request)) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      );
    }

    // Rate limiting
    const ip = getClientIP(request);
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many registration attempts. Please try again later.' },
        { status: 429 }
      );
    }

    // Never log request body when secure logger is enabled
    logger.logRequest('/api/academy-registration', 'POST', { ip });

    const body = await request.json();

    // Honeypot check
    if (body.company && body.company !== '') {
      // Bot detected - silently succeed
      return NextResponse.json({ success: true, message: 'Thank you for your registration!' });
    }

    // Validation
    const { name, email, phone, ageRange, stream, message } = body;

    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Please provide a valid name (at least 2 characters).' },
        { status: 400 }
      );
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    // Validate phone number
    const phoneValidation = validatePhoneNumber(phone);
    if (!phoneValidation.isValid) {
      return NextResponse.json(
        { error: phoneValidation.error || 'Please provide a valid phone number.' },
        { status: 400 }
      );
    }

    if (!ageRange) {
      return NextResponse.json(
        { error: 'Please select your age range.' },
        { status: 400 }
      );
    }

    // Extract minimum age from range (e.g., "16-25" -> 16, "66+" -> 66)
    const minAgeStr = ageRange.includes('-') ? ageRange.split('-')[0] : ageRange.replace('+', '');
    const minAge = parseInt(minAgeStr);
    if (isNaN(minAge) || minAge < 16) {
      return NextResponse.json(
        { error: 'You must be at least 16 years old to register.' },
        { status: 400 }
      );
    }

    if (stream === 'investor' && minAge < 18) {
      return NextResponse.json(
        { error: 'You must be at least 18 years old for the Investor stream.' },
        { status: 400 }
      );
    }

    if (!stream || !['professional', 'investor'].includes(stream)) {
      return NextResponse.json(
        { error: 'Please select a valid stream.' },
        { status: 400 }
      );
    }

    // Sanitize inputs and enforce length limits
    try {
      const sanitizedData = {
        name: sanitizeInput(name, 100),
        email: sanitizeInput(email, 100),
        phone: sanitizeInput(phone, 20),
        ageRange: sanitizeInput(ageRange, 50),
        stream,
        message: message ? sanitizeInput(message, 1000) : '',
      };

      // Ensure lengths are within limits (double-check)
      enforceLengthLimit(sanitizedData.name, 100, 'Name');
      enforceLengthLimit(sanitizedData.email, 100, 'Email');
      enforceLengthLimit(sanitizedData.phone, 20, 'Phone');
      enforceLengthLimit(sanitizedData.ageRange, 50, 'Age Range');
      if (sanitizedData.message) {
        enforceLengthLimit(sanitizedData.message, 1000, 'Message');
      }

      // Check if SMTP is configured
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
      logger.error('SMTP configuration missing. Email not sent.');
      // In development, log the data instead of failing (data will be redacted if secure logger is enabled)
      if (process.env.NODE_ENV === 'development') {
        logger.info('Academy registration submission', sanitizedData);
        return NextResponse.json({
          success: true,
          message: 'Thank you for your registration! (Email not configured - logged to console)',
        });
      }
      return NextResponse.json(
        { error: 'Registration service is not configured. Please contact us directly.' },
        { status: 500 }
      );
    }

      // Send email
      await sendEmail(sanitizedData);

      return NextResponse.json({
        success: true,
        message: 'Thank you for your registration! We will contact you soon with further details.',
      });
    } catch (validationError: any) {
      // Handle length limit errors
      if (validationError.message && validationError.message.includes('exceeds maximum length')) {
        return NextResponse.json(
          { error: validationError.message },
          { status: 400 }
        );
      }
      throw validationError; // Re-throw if not a validation error
    }
  } catch (error) {
    logger.error('Academy registration error', error instanceof Error ? error : new Error(String(error)));
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    // Provide user-friendly error messages
    let userMessage = 'An error occurred while processing your registration. Please try again later.';
    
    if (errorMessage.includes('SMTP_AUTH_FAILED')) {
      // Don't expose SMTP configuration issues to end users
      userMessage = 'We are currently experiencing technical difficulties with our email service. Your registration information has been received. Please contact us directly to confirm your registration.';
      logger.error('SMTP Authentication failed. Check server logs and SMTP_TROUBLESHOOTING.md for help.');
    } else if (errorMessage.includes('SMTP_CONNECTION_FAILED')) {
      userMessage = 'We are currently experiencing technical difficulties with our email service. Please try again later or contact us directly.';
      logger.error('SMTP Connection failed. Verify SMTP_HOST and SMTP_PORT in environment variables.');
    } else if (errorMessage.includes('EMAIL_SEND_FAILED')) {
      userMessage = 'Your registration was received, but we encountered an issue sending the confirmation email. Please contact us directly to confirm your registration.';
    }
    
    return NextResponse.json(
      { error: userMessage },
      { status: 500 }
    );
  }
}

