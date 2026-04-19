import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// In-memory rate limiting (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW = 15 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) return false;

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
  const transporter = nodemailer.createTransport({
    service: 'gmail', // ✅ Gmail config
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 10000,
  });

  const mailOptions = {
    from: `"Website Contact" <${process.env.SMTP_USER}>`, // ✅ avoid spoofing
    to: 'info@inventallianceco.com', // ✅ correct receiver
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

  // ⏱️ Prevent long hangs
  await Promise.race([
    transporter.sendMail(mailOptions),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('EMAIL_TIMEOUT')), 10000)
    ),
  ]);
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request);

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Honeypot
    if (body.website && body.website !== '') {
      return NextResponse.json({ success: true });
    }

    const { name, email, subject, message } = body;

    // Validation
    if (!name || name.trim().length < 2)
      return NextResponse.json({ error: 'Invalid name' }, { status: 400 });

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });

    if (!subject || subject.trim().length < 3)
      return NextResponse.json({ error: 'Invalid subject' }, { status: 400 });

    if (!message || message.trim().length < 10)
      return NextResponse.json({ error: 'Message too short' }, { status: 400 });

    const sanitizedData = {
      name: name.trim().substring(0, 100),
      email: email.trim().substring(0, 100),
      subject: subject.trim().substring(0, 200),
      message: message.trim().substring(0, 5000),
    };

    // ✅ Try email but don't break UX
    try {
      await sendEmail(sanitizedData);
    } catch (err) {
      console.error('Email failed but continuing:', err);
    }

    return NextResponse.json({
      success: true,
      message: 'Thank you for your message! We will get back to you soon.',
    });

  } catch (error) {
    console.error('Contact form error:', error);

    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}