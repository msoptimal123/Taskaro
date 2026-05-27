import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/gmail/client';

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const payload = accept ? predlog.akcija_payload : predlog.sekundarna_payload;

  if (payload) {
    const p = payload as { server_action: string; args: Record<string, string> };

    if (p.server_action === 'completeTask') {
      await supabase.from('tasks').update({ status: 'done', completed_at: new Date().toISOString() })
        .eq('id', p.args.task_id).eq('user_id', user.id);

    } else if (p.server_action === 'rescheduleTask') {
      await supabase.from('tasks').update({ due_date: p.args.new_date, due_time: p.args.new_time ?? null })
        .eq('id', p.args.task_id).eq('user_id', user.id);

    } else if (p.server_action === 'updatePonudbaStatus') {
      const statusKey = p.args.new_status + '_at';
      await db.from('ponudbe').update({ status: p.args.new_status, [statusKey]: new Date().toISOString() })
        .eq('id', p.args.ponudba_id).eq('user_id', user.id);

    } else if (p.server_action === 'closeProject') {
      await supabase.from('projects').update({ status: 'done', closed_at: new Date().toISOString() })
        .eq('id', p.args.project_id).eq('user_id', user.id);

    } else if (p.server_action === 'confirmReservation') {
      await supabase.from('tasks').update({ type: 'task' })
        .eq('id', p.args.task_id).eq('user_id', user.id);

    } else if (p.server_action === 'deleteReservation') {
      await supabase.from('tasks').delete()
        .eq('id', p.args.task_id).eq('user_id', user.id);

    } else if (p.server_action === 'sendPonudbaReminder') {
      // Fetch ponudba + client for the reminder
      const { data: ponudba } = await db
        .from('ponudbe')
        .select('stevilka, rezervacija_start, rezervacija_end, client_id, client:clients(email, name)')
        .eq('id', p.args.ponudba_id)
        .single();

      if (ponudba?.client?.email) {
        const start = ponudba.rezervacija_start ?? '';
        const end = ponudba.rezervacija_end ?? '';
        const termStr = start ? `${start}${end ? ' – ' + end : ''}` : 'dogovorjeni termin';
        const clientName = ponudba.client.name ?? '';

        const reminderSubject = `Opomnik: Ponudba ${ponudba.stevilka} — potrditev rezervacije`;
        const reminderBody = `Spoštovani ${clientName},\n\nVas prijazno opominjamo, da je rezervacija za termin ${termStr} aktivna.\nProsimo vas, da potrdite ponudbo ${ponudba.stevilka}.\nV nasprotnem primeru rezervacije žal ne bomo mogli več držati za vas.\n\nHvala za razumevanje.\n\nLep pozdrav`;

        try {
          await sendEmail(user.id, {
            to: ponudba.client.email,
            subject: reminderSubject,
            body: reminderBody,
          });

          await db.from('email_log').insert({
            user_id: user.id,
            ponudba_id: p.args.ponudba_id,
            client_id: ponudba.client_id,
            to_email: ponudba.client.email,
            subject: reminderSubject,
            body: reminderBody,
            status: 'sent',
          });
        } catch {
          // Gmail not connected — mark predlog but don't crash
        }

        // Mark the deadline task as done
        if (p.args.task_id) {
          await supabase.from('tasks').update({ status: 'done', completed_at: new Date().toISOString() })
            .eq('id', p.args.task_id).eq('user_id', user.id);
        }
      }
    }
  }

  await supabase.from('predlogi').update({
    status: accept ? 'sprejet' : 'zavrnjen',
    obravnavan_at: new Date().toISOString(),
  }).eq('id', params.id).eq('user_id', user.id);

  return NextResponse.json({ success: true });
}
