import { NextRequest, NextResponse } from 'next/server';

interface ContactPayload {
  name: string;
  email: string;
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ContactPayload = await request.json();
    const { name, email, message } = body;

    // Validation checks
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid name (at least 2 characters).' },
        { status: 400 }
      );
    }
    if (name.trim().length > 100) {
      return NextResponse.json(
        { success: false, error: 'Name must not exceed 100 characters.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }
    if (email.trim().length > 254) {
      return NextResponse.json(
        { success: false, error: 'Email must not exceed 254 characters.' },
        { status: 400 }
      );
    }

    if (!message || typeof message !== 'string' || message.trim().length < 3) {
      return NextResponse.json(
        { success: false, error: 'Please enter a message (at least 3 characters).' },
        { status: 400 }
      );
    }
    if (message.trim().length > 5000) {
      return NextResponse.json(
        { success: false, error: 'Message must not exceed 5,000 characters.' },
        { status: 400 }
      );
    }

    // In production, this can forward to Resend, SendGrid, or Slack webhook.
    // Target inbox: korumtashuseyin@gmail.com
    console.log(`[Contact API] Delivered to korumtashuseyin@gmail.com from ${name.trim()} <${email.trim()}>: ${message.trim()}`);

    return NextResponse.json(
      {
        success: true,
        message: 'Message sent successfully! Hüseyin will get back to you shortly.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Contact API Error]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error processing contact submission.' },
      { status: 500 }
    );
  }
}
