import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

function tomorrow(): string {
  return new Date(Date.now() + 86400000).toISOString().split('T')[0];
}

export async function GET(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const supabase = createServiceRoleClient();
  const today = new Date().toISOString().split('T')[0];
  const fiveDaysAgo = new Date(Date.now() - 5 * 86400000).toISOString();

  // Rule 1: Ponudbe poslane >5 dni brez odgovora
  const { data: stalePonudbe } = await supabase
    .from('ponudbe')
    .select('id, user_id, stevilka, client_id')
    .eq('status', 'poslana')
    .lt('poslana_at', fiveDaysAgo);

  for (const p of stalePonudbe ?? []) {
    const { data: existing } = await supabase.from('predlogi')
      .select('id').eq('entity_type', 'ponudba').eq('entity_id', p.id)
      .eq('kategorija', 'ponudba_send_reminder').eq('status', 'aktiven').maybeSingle();

    if (!existing) {
      await supabase.from('predlogi').insert({
        user_id: p.user_id,
        vir: 'system',
        kategorija: 'ponudba_send_reminder',
        prioriteta: 7,
        entity_type: 'ponudba',
        entity_id: p.id,
        naslov: `Ponudba ${p.stevilka} brez odgovora že 5+ dni`,
        opis: 'Predlagam pošiljanje vljudnega opomnika stranki.',
        akcija_label: 'Pripravi opomnik',
        akcija_payload: { server_action: 'sendPonudbaReminder', args: { ponudba_id: p.id } },
        sekundarna_label: 'Označi izgubljeno',
        sekundarna_payload: { server_action: 'updatePonudbaStatus', args: { ponudba_id: p.id, new_status: 'zavrnjena' } },
        poteče_at: new Date(Date.now() + 7 * 86400000).toISOString(),
      });
    }
  }

  // Rule 2: Taski po datumu, ki niso opravljeni
  const { data: overdueTasks } = await supabase
    .from('tasks')
    .select('id, user_id, title, due_date')
    .neq('status', 'done')
    .lt('due_date', today)
    .not('due_date', 'is', null);

  for (const t of overdueTasks ?? []) {
    const { data: existing } = await supabase.from('predlogi')
      .select('id').eq('entity_type', 'task').eq('entity_id', t.id)
      .in('kategorija', ['task_complete', 'task_reschedule']).eq('status', 'aktiven').maybeSingle();

    if (!existing) {
      await supabase.from('predlogi').insert({
        user_id: t.user_id,
        vir: 'system',
        kategorija: 'task_reschedule',
        prioriteta: 6,
        entity_type: 'task',
        entity_id: t.id,
        naslov: `"${t.title}" — po datumu`,
        opis: `Načrtovan za ${t.due_date}, še ni opravljen.`,
        akcija_label: 'Premakni na jutri',
        akcija_payload: { server_action: 'rescheduleTask', args: { task_id: t.id, new_date: tomorrow() } },
        sekundarna_label: 'Označi končano',
        sekundarna_payload: { server_action: 'completeTask', args: { task_id: t.id } },
        poteče_at: new Date(Date.now() + 3 * 86400000).toISOString(),
      });
    }
  }

  // Rule 3: Upcoming rezervacije (2 days out)
  const twoDaysFromNow = new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0];
  const { data: upcomingRezervacije } = await supabase
    .from('tasks')
    .select('id, user_id, title, start_date')
    .eq('type', 'rezervacija')
    .neq('status', 'done')
    .gte('start_date', today)
    .lte('start_date', twoDaysFromNow)
    .not('start_date', 'is', null);

  for (const t of upcomingRezervacije ?? []) {
    const { data: existing } = await supabase.from('predlogi')
      .select('id').eq('entity_type', 'task').eq('entity_id', t.id)
      .eq('kategorija', 'rezervacija_activate').eq('status', 'aktiven').maybeSingle();

    if (!existing) {
      await supabase.from('predlogi').insert({
        user_id: t.user_id,
        vir: 'system',
        kategorija: 'rezervacija_activate',
        prioriteta: 8,
        entity_type: 'task',
        entity_id: t.id,
        naslov: `"${t.title}" — čez 2 dni`,
        opis: `Rezervacija se začne ${t.start_date}. Potrdite aktivacijo?`,
        akcija_label: 'Potrdi projekt',
        akcija_payload: { server_action: 'confirmReservation', args: { task_id: t.id } },
        sekundarna_label: 'Opomni pozneje',
        sekundarna_payload: null,
        poteče_at: new Date(Date.now() + 3 * 86400000).toISOString(),
      });
    }
  }

  // Rule 4: Overdue active projects
  const { data: overdueProjects } = await supabase
    .from('projects')
    .select('id, user_id, title, end_date')
    .eq('status', 'active')
    .lt('end_date', today)
    .not('end_date', 'is', null);

  for (const p of overdueProjects ?? []) {
    const { data: existing } = await supabase.from('predlogi')
      .select('id').eq('entity_type', 'project').eq('entity_id', p.id)
      .eq('kategorija', 'project_close').eq('status', 'aktiven').maybeSingle();

    if (!existing) {
      await supabase.from('predlogi').insert({
        user_id: p.user_id,
        vir: 'system',
        kategorija: 'project_close',
        prioriteta: 5,
        entity_type: 'project',
        entity_id: p.id,
        naslov: `Projekt "${p.title}" — rok je potekel`,
        opis: `Rok za projekt je bil ${p.end_date}. Zaključite projekt?`,
        akcija_label: 'Zaključi projekt',
        akcija_payload: { server_action: 'closeProject', args: { project_id: p.id } },
        sekundarna_label: 'Podaljšaj rok',
        sekundarna_payload: null,
        poteče_at: new Date(Date.now() + 7 * 86400000).toISOString(),
      });
    }
  }

  // Cleanup: označi zastarele predloge
  await supabase.from('predlogi').update({ status: 'zastarel' })
    .eq('status', 'aktiven').lt('poteče_at', new Date().toISOString());

  return NextResponse.json({ ok: true });
}
