import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { accept } = await req.json() as { accept: boolean };

  const { data: predlog, error: fetchErr } = await supabase
    .from('predlogi')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single();

  if (fetchErr || !predlog) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const payload = accept ? predlog.akcija_payload : predlog.sekundarna_payload;

  if (accept && payload) {
    const p = payload as { server_action: string; args: Record<string, string> };
    if (p.server_action === 'completeTask') {
      await supabase.from('tasks').update({ status: 'done', completed_at: new Date().toISOString() })
        .eq('id', p.args.task_id).eq('user_id', user.id);
    } else if (p.server_action === 'rescheduleTask') {
      await supabase.from('tasks').update({ due_date: p.args.new_date, due_time: p.args.new_time ?? null })
        .eq('id', p.args.task_id).eq('user_id', user.id);
    } else if (p.server_action === 'updatePonudbaStatus') {
      const statusKey = p.args.new_status + '_at';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from('ponudbe').update({ status: p.args.new_status, [statusKey]: new Date().toISOString() })
        .eq('id', p.args.ponudba_id).eq('user_id', user.id);
    } else if (p.server_action === 'closeProject') {
      await supabase.from('projects').update({ status: 'done', closed_at: new Date().toISOString() })
        .eq('id', p.args.project_id).eq('user_id', user.id);
    }
  } else if (!accept && payload) {
    const p = payload as { server_action: string; args: Record<string, string> };
    if (p.server_action === 'completeTask') {
      await supabase.from('tasks').update({ status: 'done', completed_at: new Date().toISOString() })
        .eq('id', p.args.task_id).eq('user_id', user.id);
    } else if (p.server_action === 'rescheduleTask') {
      await supabase.from('tasks').update({ due_date: p.args.new_date, due_time: p.args.new_time ?? null })
        .eq('id', p.args.task_id).eq('user_id', user.id);
    } else if (p.server_action === 'updatePonudbaStatus') {
      const statusKey = p.args.new_status + '_at';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from('ponudbe').update({ status: p.args.new_status, [statusKey]: new Date().toISOString() })
        .eq('id', p.args.ponudba_id).eq('user_id', user.id);
    }
  }

  await supabase.from('predlogi').update({
    status: accept ? 'sprejet' : 'zavrnjen',
    obravnavan_at: new Date().toISOString(),
  }).eq('id', params.id).eq('user_id', user.id);

  return NextResponse.json({ success: true });
}
