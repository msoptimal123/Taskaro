import { NextResponse } from 'next/server';
import { getAuthUrl } from '@/lib/gmail/client';

export async function GET() {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return NextResponse.json(
      { error: 'Gmail OAuth ni konfiguriran. Prosim, nastavi GOOGLE_CLIENT_ID in GOOGLE_CLIENT_SECRET.' },
      { status: 503 }
    );
  }

  const url = getAuthUrl();
  return NextResponse.redirect(url);
}
