import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Rate limiting
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW = 15 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 3;

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
  phone: string;
  ageRange: string;
  stream: string;
  message?: string;
}) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
  throw new Error("Missing SMTP credentials");
}

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for 465
  auth: {
    user: process.env.SMTP_USER!,
    pass: process.env.SMTP_PASS!,
  },
});

  const streamLabel =
    data.stream === 'professional'
      ? 'Aspiring Bakery Professional (16+ years)'
      : 'Confectionery and Bakery Investor (18+ years)';

  const mailOptions = {
    from: `"Website Academy" <${process.env.SMTP_USER}>`, // ✅ avoid spoofing
    to: 'academy@inventallianceco.com', // ✅ correct receiver
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
      ${
        data.message
          ? `<h3>Additional Information:</h3><p>${data.message.replace(/\n/g, '<br>')}</p>`
          : ''
      }
    `,
  };

  // ⏱️ prevent hanging requests
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
        { error: 'Too many registration attempts. Try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Honeypot
    if (body.company && body.company !== '') {
      return NextResponse.json({ success: true });
    }

    const { name, email, phone, ageRange, stream, message } = body;

    // Validation
    if (!name || name.trim().length < 2)
      return NextResponse.json({ error: 'Invalid name' }, { status: 400 });

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });

    if (!phone || phone.trim().length < 10)
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });

    if (!ageRange)
      return NextResponse.json({ error: 'Select age range' }, { status: 400 });

    const minAgeStr = ageRange.includes('-')
      ? ageRange.split('-')[0]
      : ageRange.replace('+', '');

    const minAge = parseInt(minAgeStr);

    if (isNaN(minAge) || minAge < 16)
      return NextResponse.json(
        { error: 'Must be at least 16 years old' },
        { status: 400 }
      );

    if (stream === 'investor' && minAge < 18)
      return NextResponse.json(
        { error: 'Investor stream requires 18+' },
        { status: 400 }
      );

    if (!['professional', 'investor'].includes(stream))
      return NextResponse.json({ error: 'Invalid stream' }, { status: 400 });

    const sanitizedData = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      ageRange,
      stream,
      message: message?.trim() || '',
    };

    // ✅ Try email but don’t break UX
    try {
      await sendEmail(sanitizedData);
    } catch (error) {
      console.error('Email failed but continuing:', error);
    }

    return NextResponse.json({
      success: true,
      message: 'Registration received successfully',
    });

  } catch (error) {
    console.error('API error:', error);

    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}