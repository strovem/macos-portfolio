import { NextRequest, NextResponse } from 'next/server';

interface ContactPayload {
  name: string;
  email: string;
  message: string;
}

const TARGET_EMAIL = 'korumtashuseyin@gmail.com';

export async function POST(request: NextRequest) {
  try {
    const body: ContactPayload = await request.json();
    const { name, email, message } = body;

    // Validation checks
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Lütfen geçerli bir isim girin (en az 2 karakter).' },
        { status: 400 }
      );
    }
    if (name.trim().length > 100) {
      return NextResponse.json(
        { success: false, error: 'İsim 100 karakteri aşamaz.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
      return NextResponse.json(
        { success: false, error: 'Lütfen geçerli bir e-posta adresi girin.' },
        { status: 400 }
      );
    }
    if (email.trim().length > 254) {
      return NextResponse.json(
        { success: false, error: 'E-posta 254 karakteri aşamaz.' },
        { status: 400 }
      );
    }

    if (!message || typeof message !== 'string' || message.trim().length < 3) {
      return NextResponse.json(
        { success: false, error: 'Lütfen bir mesaj yazın (en az 3 karakter).' },
        { status: 400 }
      );
    }
    if (message.trim().length > 5000) {
      return NextResponse.json(
        { success: false, error: 'Mesaj 5,000 karakteri aşamaz.' },
        { status: 400 }
      );
    }

    const sanitizedName = name.trim();
    const sanitizedEmail = email.trim();
    const sanitizedMessage = message.trim();

    // 1. Live Email Dispatch via FormSubmit directly to korumtashuseyin@gmail.com
    try {
      const res = await fetch(`https://formsubmit.co/ajax/${TARGET_EMAIL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name: sanitizedName,
          email: sanitizedEmail,
          message: sanitizedMessage,
          _subject: `Hüseyin Korumtaş Portfolyo: ${sanitizedName} yeni bir mesaj gönderdi`,
          _replyto: sanitizedEmail,
          _template: 'table',
        }),
      });

      if (!res.ok) {
        console.warn(`[FormSubmit HTTP Warning]: status ${res.status}`);
      }
    } catch (deliverError) {
      console.warn('[Contact Delivery Attempt]:', deliverError);
    }

    console.log(
      `[Contact API] Delivered to ${TARGET_EMAIL} from ${sanitizedName} <${sanitizedEmail}>: "${sanitizedMessage.slice(0, 50)}..."`
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Mesajınız başarıyla iletildi! Hüseyin Korumtaş en kısa sürede size dönüş yapacaktır.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Contact API Error]:', error);
    return NextResponse.json(
      { success: false, error: 'Mesaj iletilirken sunucu hatası oluştu.' },
      { status: 500 }
    );
  }
}
