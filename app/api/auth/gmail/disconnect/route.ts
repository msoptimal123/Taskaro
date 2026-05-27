import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function POST() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from('company_settings').update({
    gmail_connected_email: null,
    gmail_refresh_token_encrypted: null,
    gmail_access_token: null,
    gmail_token_expires_at: null,
  }).eq('user_id', user.id);

  return NextResponse.json({ success: true });
}
