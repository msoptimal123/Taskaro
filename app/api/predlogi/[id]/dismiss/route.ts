import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await supabase.from('predlogi').update({
    status: 'zavrnjen',
    obravnavan_at: new Date().toISOString(),
  }).eq('id', params.id).eq('user_id', user.id);

  return NextResponse.json({ success: true });
}
