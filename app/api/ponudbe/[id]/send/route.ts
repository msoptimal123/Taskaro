import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/gmail/client';
import { renderToBuffer } from '@react-pdf/renderer';
import PonudbaPDF from '@/lib/pdf/PonudbaPDF';
import React from 'react';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { to, subject, body: emailBody } = await req.json() as {
    to: string;
    subject: string;
    body: string;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  // Fetch ponudba + postavke + client
  const { data: ponudba, error: pErr } = await db
    .from('ponudbe')
    .select('*, client:clients(*), postavke:ponudba_postavke(*)')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single();

  if (pErr || !ponudba) return NextResponse.json({ error: 'Ponudba ni najdena' }, { status: 404 });

  // Fetch company settings
  const { data: settings } = await db
    .from('company_settings')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  // Generate PDF
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfElement = React.createElement(PonudbaPDF, {
    ponudba,
    postavke: ponudba.postavke ?? [],
    client: ponudba.client ?? { name: '' },
    company: settings ?? {},
  }) as any;
  const pdfBuffer = await renderToBuffer(pdfElement);

  // Send via Gmail
  const { messageId, threadId } = await sendEmail(user.id, {
    to,
    subject,
    body: emailBody,
    pdfBuffer,
    pdfFilename: `ponudba-${ponudba.stevilka}.pdf`,
  });

  // Update ponudba status
  await db.from('ponudbe').update({
    status: 'poslana',
    poslana_at: new Date().toISOString(),
    email_sent_to: to,
    email_subject: subject,
    email_body: emailBody,
  }).eq('id', params.id);

  // Log email
  await db.from('email_log').insert({
    user_id: user.id,
    ponudba_id: params.id,
    client_id: ponudba.client_id,
    to_email: to,
    subject,
    body: emailBody,
    status: 'sent',
    gmail_message_id: messageId,
    gmail_thread_id: threadId,
  });

  return NextResponse.json({ success: true });
}
