import { NextRequest, NextResponse } from 'next/server';
import { validateCSRFToken, isCSRFEnabled } from '@/lib/csrf';
import { logger } from '@/lib/secure-logger';
import { sanitizeInput, validateEmailFormat, enforceLengthLimit } from '@/lib/validators';

// Force dynamic rendering to prevent build-time analysis issues
export const dynamic = 'force-dynamic';

// In-memory rate limiting store
// In production, use Redis or a database
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 5; // 5 requests per window

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
  subject: string;
  message: string;
}) {
  try {
    const nodemailer = require('nodemailer');

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Support multiple email addresses (comma-separated)
    const contactEmails = process.env.CONTACT_TO_EMAIL || '';
    const emailRecipients = contactEmails.split(',').map(email => email.trim()).filter(email => email.length > 0);
    
    if (emailRecipients.length === 0) {
      throw new Error('No recipient email addresses configured');
    }

    const mailOptions = {
      from: `"${data.name}" <${process.env.SMTP_USER}>`,
      to: emailRecipients.join(', '),
      replyTo: data.email,
      subject: `Contact Form: ${data.subject}`,
      text: `
Name: ${data.name}
Email: ${data.email}
Subject: ${data.subject}

Message:
${data.message}
      `.trim(),
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Subject:</strong> ${data.subject}</p>
        <h3>Message:</h3>
        <p>${data.message.replace(/\n/g, '<br>')}</p>
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
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Never log request body when secure logger is enabled
    logger.logRequest('/api/contact', 'POST', { ip });

    const body = await request.json();

    // Honeypot check
    if (body.website && body.website !== '') {
      // Bot detected - silently succeed
      return NextResponse.json({ success: true, message: 'Thank you for your message!' });
    }

    // Validation
    const { name, email, subject, message } = body;

    // Validate name
    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Please provide a valid name (at least 2 characters).' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailValidation = validateEmailFormat(email);
    if (!emailValidation.isValid) {
      return NextResponse.json(
        { error: emailValidation.error || 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    // Validate subject
    if (!subject || subject.trim().length < 3) {
      return NextResponse.json(
        { error: 'Please provide a subject (at least 3 characters).' },
        { status: 400 }
      );
    }

    // Validate message
    if (!message || message.trim().length < 10) {
      return NextResponse.json(
        { error: 'Please provide a message (at least 10 characters).' },
        { status: 400 }
      );
    }

    // Sanitize and enforce length limits
    try {
      const sanitizedData = {
        name: sanitizeInput(name, 100),
        email: sanitizeInput(email, 100),
        subject: sanitizeInput(subject, 200),
        message: sanitizeInput(message, 5000),
      };

      // Ensure lengths are within limits (double-check)
      enforceLengthLimit(sanitizedData.name, 100, 'Name');
      enforceLengthLimit(sanitizedData.email, 100, 'Email');
      enforceLengthLimit(sanitizedData.subject, 200, 'Subject');
      enforceLengthLimit(sanitizedData.message, 5000, 'Message');

      // Check if SMTP is configured
      if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.CONTACT_TO_EMAIL) {
        logger.error('SMTP configuration missing. Email not sent.');
        // In development, log the data instead of failing (data will be redacted if secure logger is enabled)
        if (process.env.NODE_ENV === 'development') {
          logger.info('Contact form submission', sanitizedData);
          return NextResponse.json({
            success: true,
            message: 'Thank you for your message! (Email not configured - logged to console)',
          });
        }
        return NextResponse.json(
          { error: 'Email service is not configured. Please contact us directly.' },
          { status: 500 }
        );
      }

      // Send email
      await sendEmail(sanitizedData);

      return NextResponse.json({
        success: true,
        message: 'Thank you for your message! We will get back to you soon.',
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
    logger.error('Contact form error', error instanceof Error ? error : new Error(String(error)));
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    // Provide user-friendly error messages
    let userMessage = 'An error occurred while sending your message. Please try again later.';
    
    if (errorMessage.includes('SMTP_AUTH_FAILED')) {
      // Don't expose SMTP configuration issues to end users
      userMessage = 'We are currently experiencing technical difficulties with our email service. Please try again later or contact us directly.';
      logger.error('SMTP Authentication failed. Check server logs and SMTP_TROUBLESHOOTING.md for help.');
    } else if (errorMessage.includes('SMTP_CONNECTION_FAILED')) {
      userMessage = 'We are currently experiencing technical difficulties with our email service. Please try again later or contact us directly.';
      logger.error('SMTP Connection failed. Verify SMTP_HOST and SMTP_PORT in environment variables.');
    } else if (errorMessage.includes('EMAIL_SEND_FAILED')) {
      userMessage = 'Your message was received, but we encountered an issue sending the confirmation email. Please contact us directly to confirm your message was received.';
    }
    
    return NextResponse.json(
      { error: userMessage },
      { status: 500 }
    );
  }
}

