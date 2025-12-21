import { NextRequest, NextResponse } from 'next/server';

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
    console.error('Email sending error:', emailError);
    const errorMessage = emailError instanceof Error ? emailError.message : 'Unknown email error';
    
    // Check for common SMTP authentication errors
    if (errorMessage.includes('Invalid login') || errorMessage.includes('BadCredentials') || errorMessage.includes('535')) {
      console.error('SMTP Authentication Error: Please check your SMTP credentials. For Gmail, use an App Password instead of your regular password.');
      throw new Error('SMTP_AUTH_FAILED');
    }
    
    throw new Error(`EMAIL_SEND_FAILED: ${errorMessage}`);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIP(request);
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Honeypot check
    if (body.website && body.website !== '') {
      // Bot detected - silently succeed
      return NextResponse.json({ success: true, message: 'Thank you for your message!' });
    }

    // Validation
    const { name, email, subject, message } = body;

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

    if (!subject || subject.trim().length < 3) {
      return NextResponse.json(
        { error: 'Please provide a subject (at least 3 characters).' },
        { status: 400 }
      );
    }

    if (!message || message.trim().length < 10) {
      return NextResponse.json(
        { error: 'Please provide a message (at least 10 characters).' },
        { status: 400 }
      );
    }

    // Sanitize inputs (basic)
    const sanitizedData = {
      name: name.trim().substring(0, 100),
      email: email.trim().substring(0, 100),
      subject: subject.trim().substring(0, 200),
      message: message.trim().substring(0, 5000),
    };

    // Check if SMTP is configured
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.CONTACT_TO_EMAIL) {
      console.error('SMTP configuration missing. Email not sent.');
      // In development, log the data instead of failing
      if (process.env.NODE_ENV === 'development') {
        console.log('Contact form submission:', sanitizedData);
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
  } catch (error) {
    console.error('Contact form error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error details:', {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    // Provide user-friendly error messages
    let userMessage = 'An error occurred while sending your message. Please try again later.';
    
    if (errorMessage.includes('SMTP_AUTH_FAILED')) {
      // Don't expose SMTP configuration issues to end users
      userMessage = 'We are currently experiencing technical difficulties with our email service. Please try again later or contact us directly.';
      console.error('SMTP Authentication failed. Check server logs and SMTP_TROUBLESHOOTING.md for help.');
    } else if (errorMessage.includes('SMTP_CONNECTION_FAILED')) {
      userMessage = 'We are currently experiencing technical difficulties with our email service. Please try again later or contact us directly.';
      console.error('SMTP Connection failed. Verify SMTP_HOST and SMTP_PORT in environment variables.');
    } else if (errorMessage.includes('EMAIL_SEND_FAILED')) {
      userMessage = 'Your message was received, but we encountered an issue sending the confirmation email. Please contact us directly to confirm your message was received.';
    }
    
    return NextResponse.json(
      { error: userMessage },
      { status: 500 }
    );
  }
}

