import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { exchangeCodeForTokens } from '@/lib/gmail/client';
import { encrypt } from '@/lib/gmail/encryption';
import { google } from 'googleapis';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error || !code) {
    return NextResponse.redirect(new URL('/settings?gmail=error', req.url));
  }

  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL('/login', req.url));

  try {
    const tokens = await exchangeCodeForTokens(code);

    if (!tokens.refresh_token) {
      return NextResponse.redirect(new URL('/settings?gmail=no_refresh_token', req.url));
    }

    // Get connected Gmail address
    const oauth2 = google.oauth2('v2');
    const { getOAuthClient } = await import('@/lib/gmail/client');
    const authClient = getOAuthClient();
    authClient.setCredentials(tokens);
    const { data: userInfo } = await oauth2.userinfo.get({ auth: authClient });
    const connectedEmail = userInfo.email ?? null;

    // Store encrypted refresh token
    const encryptedRefreshToken = encrypt(tokens.refresh_token);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('company_settings')
      .update({
        gmail_connected_email: connectedEmail,
        gmail_refresh_token_encrypted: encryptedRefreshToken,
        gmail_access_token: tokens.access_token ?? null,
        gmail_token_expires_at: tokens.expiry_date
          ? new Date(tokens.expiry_date).toISOString()
          : null,
      })
      .eq('user_id', user.id);

    return NextResponse.redirect(new URL('/settings?gmail=connected', req.url));
  } catch (err) {
    console.error('Gmail OAuth callback error:', err);
    return NextResponse.redirect(new URL('/settings?gmail=error', req.url));
  }
}
