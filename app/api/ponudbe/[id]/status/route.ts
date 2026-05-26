import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

type PonudbaStatus = 'osnutek' | 'pripravljena' | 'poslana' | 'sprejeta' | 'zavrnjena' | 'preklicana';

const TIMESTAMP_FIELDS: Partial<Record<PonudbaStatus, string>> = {
  poslana: 'poslana_at',
  sprejeta: 'sprejeta_at',
  zavrnjena: 'zavrnjena_at',
};

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { status } = await req.json() as { status: PonudbaStatus };

  const update: Record<string, unknown> = { status };
  const tsField = TIMESTAMP_FIELDS[status];
  if (tsField) update[tsField] = new Date().toISOString();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('ponudbe')
    .update(update)
    .eq('id', params.id)
    .eq('user_id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
