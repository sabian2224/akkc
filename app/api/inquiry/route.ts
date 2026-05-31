import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { sendInquiryEmail } from '@/lib/email';
import { randomBytes } from 'crypto';

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateInquiryId(): string {
  const rand = Array.from(randomBytes(5))
    .map((b) => CHARS[b % CHARS.length])
    .join('');
  return `PYE-${new Date().getFullYear()}-${rand}`;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      email?: string;
      category?: string;
      subject?: string;
      message?: string;
      applicationId?: string;
      consent?: boolean;
    };

    const email = (body.email ?? '').trim();
    const category = (body.category ?? '').trim();
    const subject = (body.subject ?? '').trim();
    const message = (body.message ?? '').trim();
    const applicationId = (body.applicationId ?? '').trim() || undefined;

    // Server-side validation — never trust the client's own checks.
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'E-mail i pavlefshëm.' }, { status: 400 });
    }
    if (!category || !subject || !message) {
      return NextResponse.json(
        { error: 'Plotësoni kategorinë, subjektin dhe pyetjen.' },
        { status: 400 }
      );
    }
    if (!body.consent) {
      return NextResponse.json(
        { error: 'Pranimi i përdorimit të të dhënave është i detyrueshëm.' },
        { status: 400 }
      );
    }
    if (subject.length > 200 || message.length > 5000) {
      return NextResponse.json({ error: 'Teksti është shumë i gjatë.' }, { status: 400 });
    }

    const inquiryId = generateInquiryId();
    const supabase = createServerClient();

    const { error: dbError } = await supabase.from('inquiries').insert({
      inquiry_id: inquiryId,
      email,
      category,
      subject,
      message,
      application_id: applicationId ?? null,
    });
    if (dbError) throw dbError;

    const now = new Date().toLocaleString('sq-AL', { timeZone: 'Europe/Tirane' });

    // Email failure must not block the response — the inquiry is already saved.
    try {
      await sendInquiryEmail({
        inquiryId,
        email,
        category,
        subject,
        message,
        applicationId,
        submittedAt: now,
      });
    } catch (emailErr) {
      console.error('[inquiry] email send failed:', emailErr);
    }

    return NextResponse.json({ success: true, inquiryId });
  } catch (err) {
    console.error('[inquiry]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
