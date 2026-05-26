import { google } from 'googleapis';
import { encrypt, decrypt } from './encryption';
import { createServerClient } from '@/lib/supabase/server';

const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];

export function getOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GMAIL_REDIRECT_URI,
  );
}

export function getAuthUrl(): string {
  const oAuth2Client = getOAuthClient();
  return oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  });
}

export async function exchangeCodeForTokens(code: string) {
  const oAuth2Client = getOAuthClient();
  const { tokens } = await oAuth2Client.getToken(code);
  return tokens;
}

export async function getAuthorizedClient(userId: string) {
  const supabase = createServerClient();
  const { data: settings } = await supabase
    .from('company_settings')
    .select('gmail_access_token, gmail_refresh_token_encrypted, gmail_token_expires_at')
    .eq('user_id', userId)
    .single();

  if (!settings?.gmail_refresh_token_encrypted) {
    throw new Error('Gmail ni povezan. Prosim, poveži Gmail v nastavitvah.');
  }

  const oAuth2Client = getOAuthClient();
  const refreshToken = decrypt(settings.gmail_refresh_token_encrypted);

  oAuth2Client.setCredentials({
    refresh_token: refreshToken,
    access_token: settings.gmail_access_token ?? undefined,
    expiry_date: settings.gmail_token_expires_at
      ? new Date(settings.gmail_token_expires_at).getTime()
      : undefined,
  });

  // If token is expired or missing, refresh it
  const expiresAt = settings.gmail_token_expires_at
    ? new Date(settings.gmail_token_expires_at).getTime()
    : 0;

  if (!settings.gmail_access_token || expiresAt < Date.now() + 60000) {
    const { credentials } = await oAuth2Client.refreshAccessToken();
    oAuth2Client.setCredentials(credentials);

    await supabase.from('company_settings').update({
      gmail_access_token: credentials.access_token,
      gmail_token_expires_at: credentials.expiry_date
        ? new Date(credentials.expiry_date).toISOString()
        : null,
    }).eq('user_id', userId);
  }

  return oAuth2Client;
}

export async function sendEmail(userId: string, opts: {
  to: string;
  subject: string;
  body: string;
  pdfBuffer?: Buffer;
  pdfFilename?: string;
}) {
  const auth = await getAuthorizedClient(userId);
  const gmail = google.gmail({ version: 'v1', auth });

  let rawEmail: string;

  if (opts.pdfBuffer) {
    const boundary = 'boundary_taskaro_' + Date.now();
    const pdfBase64 = opts.pdfBuffer.toString('base64');
    rawEmail = [
      `MIME-Version: 1.0`,
      `Content-Type: multipart/mixed; boundary="${boundary}"`,
      `To: ${opts.to}`,
      `Subject: ${opts.subject}`,
      ``,
      `--${boundary}`,
      `Content-Type: text/plain; charset="UTF-8"`,
      ``,
      opts.body,
      ``,
      `--${boundary}`,
      `Content-Type: application/pdf; name="${opts.pdfFilename ?? 'ponudba.pdf'}"`,
      `Content-Transfer-Encoding: base64`,
      `Content-Disposition: attachment; filename="${opts.pdfFilename ?? 'ponudba.pdf'}"`,
      ``,
      pdfBase64,
      `--${boundary}--`,
    ].join('\r\n');
  } else {
    rawEmail = [
      `MIME-Version: 1.0`,
      `Content-Type: text/plain; charset="UTF-8"`,
      `To: ${opts.to}`,
      `Subject: ${opts.subject}`,
      ``,
      opts.body,
    ].join('\r\n');
  }

  const encodedEmail = Buffer.from(rawEmail).toString('base64url');
  const result = await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw: encodedEmail },
  });

  return {
    messageId: result.data.id ?? null,
    threadId: result.data.threadId ?? null,
  };
}

export { encrypt };
