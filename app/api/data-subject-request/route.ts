import { NextRequest, NextResponse } from 'next/server';
import { FEATURE_DSAR_PORTAL } from '@/lib/feature-flags';
import { logger } from '@/lib/secure-logger';
import { validateCSRFToken, isCSRFEnabled } from '@/lib/csrf';

// Force dynamic rendering to prevent build-time analysis issues
export const dynamic = 'force-dynamic';

/**
 * Send DSAR confirmation email
 */
async function sendDSAREmail(data: {
  name: string;
  email: string;
  requestType: string;
  description: string;
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

    // Support multiple email addresses (comma-separated)
    const dsarEmails = process.env.DSAR_TO_EMAIL || process.env.CONTACT_TO_EMAIL || '';
    const emailRecipients = dsarEmails.split(',').map((email: string) => email.trim()).filter((email: string) => email.length > 0);
    
    if (emailRecipients.length === 0) {
      throw new Error('No recipient email addresses configured');
    }

    const requestTypeLabels: Record<string, string> = {
      access: 'Access my data (GDPR Art. 15)',
      rectification: 'Rectify incorrect data (GDPR Art. 16)',
      erasure: 'Delete my data (GDPR Art. 17 - Right to be forgotten)',
      restrict: 'Restrict processing (GDPR Art. 18)',
      portability: 'Data portability (GDPR Art. 20)',
      object: 'Object to processing (GDPR Art. 21)',
      other: 'Other request',
    };

    const requestTypeLabel = requestTypeLabels[data.requestType] || data.requestType;

    const mailOptions = {
      from: `"DSAR Portal" <${process.env.SMTP_USER}>`,
      to: emailRecipients.join(', '),
      replyTo: data.email,
      subject: `Data Subject Access Request: ${requestTypeLabel}`,
      text: `
New Data Subject Access Request

Name: ${data.name}
Email: ${data.email}
Request Type: ${requestTypeLabel}
Description:
${data.description}

---
This is an automated notification from the DSAR portal.
Please process this request within 30 days as required by GDPR.
      `.trim(),
      html: `
        <h2>New Data Subject Access Request</h2>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Request Type:</strong> ${requestTypeLabel}</p>
        <h3>Description:</h3>
        <p>${data.description.replace(/\n/g, '<br>')}</p>
        <hr>
        <p style="color: #888; font-size: 12px;">
          This is an automated notification from the DSAR portal.<br>
          Please process this request within 30 days as required by GDPR.
        </p>
      `,
    };

    // Send notification to operations team
    await transporter.sendMail(mailOptions);

    // Send confirmation email to requester
    const confirmationMailOptions = {
      from: `"Invent Alliance Limited" <${process.env.SMTP_USER}>`,
      to: data.email,
      subject: 'Data Subject Access Request Received',
      text: `
Dear ${data.name},

We have received your Data Subject Access Request (DSAR).

Request Type: ${requestTypeLabel}

We will process your request within 30 days as required by the General Data Protection Regulation (GDPR).

If you have any questions, please contact us through our contact form.

Best regards,
Invent Alliance Limited
      `.trim(),
      html: `
        <h2>Data Subject Access Request Received</h2>
        <p>Dear ${data.name},</p>
        <p>We have received your Data Subject Access Request (DSAR).</p>
        <p><strong>Request Type:</strong> ${requestTypeLabel}</p>
        <p>We will process your request within 30 days as required by the General Data Protection Regulation (GDPR).</p>
        <p>If you have any questions, please <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.inventallianceco.com'}/contacts">contact us</a>.</p>
        <p>Best regards,<br>Invent Alliance Limited</p>
      `,
    };

    await transporter.sendMail(confirmationMailOptions);
  } catch (emailError) {
    logger.error('DSAR email sending error', emailError instanceof Error ? emailError : new Error(String(emailError)));
    const errorMessage = emailError instanceof Error ? emailError.message : 'Unknown email error';
    
    // Check for common SMTP authentication errors
    if (errorMessage.includes('Invalid login') || errorMessage.includes('BadCredentials') || errorMessage.includes('535')) {
      logger.error('SMTP Authentication Error: Please check your SMTP credentials.');
      throw new Error('SMTP_AUTH_FAILED');
    }
    
    throw new Error(`EMAIL_SEND_FAILED: ${errorMessage}`);
  }
}

export async function POST(request: NextRequest) {
  // Check if feature is enabled
  if (!FEATURE_DSAR_PORTAL) {
    return NextResponse.json(
      { error: 'Data Subject Request portal is not available' },
      { status: 404 }
    );
  }

  try {
    // CSRF protection (only if feature is enabled)
    if (isCSRFEnabled() && !validateCSRFToken(request)) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate input fields
    const { name, email, requestType, description, verification } = body;

    // Validation
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

    if (!requestType || !['access', 'rectification', 'erasure', 'restrict', 'portability', 'object', 'other'].includes(requestType)) {
      return NextResponse.json(
        { error: 'Please select a valid request type.' },
        { status: 400 }
      );
    }

    if (!description || description.trim().length < 10) {
      return NextResponse.json(
        { error: 'Please provide a description of your request (at least 10 characters).' },
        { status: 400 }
      );
    }

    if (!verification || verification.trim().length < 5) {
      return NextResponse.json(
        { error: 'Please provide identity verification information (at least 5 characters).' },
        { status: 400 }
      );
    }

    // Log DSAR request via secure logger (verification info will be redacted)
    // Never log sensitive verification information - only log metadata
    logger.info('DSAR request received', {
      name,
      email, // Will be redacted by secure logger
      requestType,
      descriptionLength: description.length,
      verificationLength: verification.length, // Log length, not content
      timestamp: new Date().toISOString(),
    });

    // Check if SMTP is configured
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
      logger.warn('SMTP configuration missing. DSAR email not sent. Request logged only.');
      // Still return success - request is logged, email can be sent manually
      return NextResponse.json({
        success: true,
        message: 'Your data subject request has been received. We will process it within 30 days. Note: Confirmation email could not be sent due to email configuration issues.',
      });
    }

    // Send confirmation email
    try {
      await sendDSAREmail({
        name,
        email,
        requestType,
        description,
      });

      return NextResponse.json({
        success: true,
        message: 'Your data subject request has been submitted successfully. A confirmation email has been sent to your email address. We will process your request within 30 days as required by GDPR.',
      });
    } catch (emailError) {
      const errorMessage = emailError instanceof Error ? emailError.message : 'Unknown error';
      
      // If email fails, still return success (request is logged)
      logger.error('DSAR email sending failed, but request is logged', emailError instanceof Error ? emailError : new Error(String(emailError)));
      
      return NextResponse.json({
        success: true,
        message: 'Your data subject request has been received. We will process it within 30 days. Note: Confirmation email could not be sent, but your request has been logged.',
      });
    }
  } catch (error) {
    logger.error('DSAR request processing error', error instanceof Error ? error : new Error(String(error)));
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { error: 'An error occurred while processing your request. Please try again later or contact us directly.' },
      { status: 500 }
    );
  }
}

// Return 404 for all other methods if feature is disabled
export async function GET() {
  if (!FEATURE_DSAR_PORTAL) {
    return NextResponse.json(
      { error: 'Data Subject Request portal is not available' },
      { status: 404 }
    );
  }
  return NextResponse.json({ message: 'DSAR API endpoint' });
}

export async function OPTIONS() {
  if (!FEATURE_DSAR_PORTAL) {
    return NextResponse.json(
      { error: 'Data Subject Request portal is not available' },
      { status: 404 }
    );
  }
  return NextResponse.json({});
}

