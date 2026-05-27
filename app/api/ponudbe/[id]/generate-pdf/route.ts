import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { renderToBuffer } from '@react-pdf/renderer';
import PonudbaPDF from '@/lib/pdf/PonudbaPDF';
import React from 'react';

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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

  // Upload to Supabase Storage
  const path = `${user.id}/${params.id}.pdf`;
  const { error: uploadErr } = await supabase.storage
    .from('ponudbe-pdf')
    .upload(path, pdfBuffer, {
      contentType: 'application/pdf',
      upsert: true,
    });

  if (uploadErr) return NextResponse.json({ error: 'Upload failed', details: uploadErr.message }, { status: 500 });

  // Create signed URL valid 1 hour
  const { data: signedData, error: signErr } = await supabase.storage
    .from('ponudbe-pdf')
    .createSignedUrl(path, 3600);

  if (signErr || !signedData?.signedUrl) {
    return NextResponse.json({ error: 'Failed to create signed URL' }, { status: 500 });
  }

  // Update ponudba with pdf_path and pdf_generated_at
  await db.from('ponudbe').update({
    pdf_path: path,
    pdf_generated_at: new Date().toISOString(),
  }).eq('id', params.id).eq('user_id', user.id);

  return NextResponse.json({ url: signedData.signedUrl });
}
