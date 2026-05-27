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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const update: Record<string, unknown> = { status };
  const tsField = TIMESTAMP_FIELDS[status];
  if (tsField) update[tsField] = new Date().toISOString();

  const { error } = await db
    .from('ponudbe')
    .update(update)
    .eq('id', params.id)
    .eq('user_id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Fetch ponudba for rezervacija logic
  const { data: ponudba } = await db
    .from('ponudbe')
    .select('rezervacija_task_id, client_id, naslov, stevilka, project_id')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single();

  if (status === 'sprejeta' && ponudba?.rezervacija_task_id) {
    // Fetch the rezervacija task
    const { data: rezervTask } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', ponudba.rezervacija_task_id)
      .eq('user_id', user.id)
      .single();

    if (rezervTask) {
      // Create project from the reservation
      const { data: newProject } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          client_id: rezervTask.client_id,
          title: rezervTask.title,
          start_date: rezervTask.start_date,
          end_date: rezervTask.end_date,
          status: 'active',
          converted_from_task_id: rezervTask.id,
        })
        .select('id')
        .single();

      if (newProject) {
        // Convert rezervacija task → done, link to new project
        await db.from('tasks').update({
          type: 'task',
          project_id: newProject.id,
          status: 'done',
          completed_at: new Date().toISOString(),
        }).eq('id', rezervTask.id).eq('user_id', user.id);

        // Link ponudba to the new project
        await db.from('ponudbe').update({ project_id: newProject.id })
          .eq('id', params.id).eq('user_id', user.id);
      }
    }
  }

  if (status === 'zavrnjena' && ponudba?.rezervacija_task_id) {
    // Fetch rezervacija details for the predlog description
    const { data: rezervTask } = await supabase
      .from('tasks')
      .select('start_date, end_date')
      .eq('id', ponudba.rezervacija_task_id)
      .maybeSingle();

    const start = rezervTask?.start_date ?? '';
    const end = rezervTask?.end_date ?? '';
    const termStr = start ? `${start}${end ? ' – ' + end : ''}` : 'dogovorjeni termin';

    // Create predlog to delete the reservation
    await supabase.from('predlogi').insert({
      user_id: user.id,
      vir: 'system',
      kategorija: 'rezervacija_release',
      prioriteta: 9,
      entity_type: 'task',
      entity_id: ponudba.rezervacija_task_id,
      naslov: `Ponudba ${ponudba.stevilka} zavrnjena — briši rezervacijo?`,
      opis: `Rezervacija za ${termStr} ni več potrebna.`,
      akcija_label: 'Briši rezervacijo',
      akcija_payload: { server_action: 'deleteReservation', args: { task_id: ponudba.rezervacija_task_id } },
      sekundarna_label: 'Pusti',
      sekundarna_payload: null,
      poteče_at: new Date(Date.now() + 7 * 86400000).toISOString(),
    });
  }

  return NextResponse.json({ success: true });
}
