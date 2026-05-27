'use server';
import { createServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { ParsedVoice, ParsedIntent } from '@/types/domain';
import type { TablesInsert, TablesUpdate } from '@/types/database';

// ─── Task actions ────────────────────────────────────────────────────────────

export async function completeTask(taskId: string) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const patch: TablesUpdate<'tasks'> = { status: 'done', completed_at: new Date().toISOString() };
  const { error } = await supabase
    .from('tasks')
    .update(patch)
    .eq('id', taskId)
    .eq('user_id', user.id);

  if (error) throw new Error(error.message);
  revalidatePath('/');
  revalidatePath('/tasks');
}

export async function reopenTask(taskId: string) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const patch: TablesUpdate<'tasks'> = { status: 'open', completed_at: null };
  const { error } = await supabase
    .from('tasks')
    .update(patch)
    .eq('id', taskId)
    .eq('user_id', user.id);

  if (error) throw new Error(error.message);
  revalidatePath('/');
  revalidatePath('/tasks');
}

export async function deleteTask(taskId: string) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)
    .eq('user_id', user.id);

  if (error) throw new Error(error.message);
  revalidatePath('/');
  revalidatePath('/tasks');
}

export async function updateTask(
  taskId: string,
  patch: TablesUpdate<'tasks'>
) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { error } = await supabase
    .from('tasks')
    .update(patch)
    .eq('id', taskId)
    .eq('user_id', user.id);

  if (error) throw new Error(error.message);
  revalidatePath('/');
  revalidatePath('/tasks');
  revalidatePath(`/tasks/${taskId}`);
}

// ─── Voice action ─────────────────────────────────────────────────────────────

export async function createFromVoice(parsed: ParsedVoice, finalText: string) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // If it's a note, just create the note
  if (parsed.type === 'note') {
    const noteRow: TablesInsert<'notes'> = { text: parsed.title, source_transcript: finalText, user_id: user.id };
    const { error } = await supabase
      .from('notes')
      .insert(noteRow);
    if (error) throw new Error(error.message);
    revalidatePath('/');
    revalidatePath('/notes');
    return;
  }

  // Resolve or create client
  let clientId: string | null = null;
  if (parsed.client_name) {
    const { data: existing } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', user.id)
      .ilike('name', parsed.client_name)
      .maybeSingle();

    if (existing) {
      clientId = existing.id;
    } else {
      const clientRow: TablesInsert<'clients'> = { name: parsed.client_name, user_id: user.id };
      const { data: created, error: clientError } = await supabase
        .from('clients')
        .insert(clientRow)
        .select('id')
        .single();
      if (clientError) throw new Error(clientError.message);
      clientId = created.id;
    }
  }

  // Create task
  const taskRow: TablesInsert<'tasks'> = {
    user_id: user.id,
    client_id: clientId,
    type: parsed.type as TablesInsert<'tasks'>['type'],
    title: parsed.title,
    description: parsed.description,
    location: parsed.location,
    due_date: parsed.due_date,
    due_time: parsed.due_time,
    start_date: parsed.start_date,
    end_date: parsed.end_date,
    source_transcript: finalText,
    status: 'open',
  };
  const { error } = await supabase.from('tasks').insert(taskRow);

  if (error) throw new Error(error.message);
  revalidatePath('/');
  revalidatePath('/tasks');
}

// ─── Multi-intent voice action ────────────────────────────────────────────────

export async function createFromVoiceMulti(intents: ParsedIntent[], finalText: string) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  // Cache resolved client IDs by name so we don't create duplicates
  const clientCache: Record<string, string> = {};

  async function resolveClient(name: string): Promise<string> {
    if (clientCache[name]) return clientCache[name];
    const { data: existing } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', user!.id)
      .ilike('name', name)
      .maybeSingle();
    if (existing) {
      clientCache[name] = existing.id;
      return existing.id;
    }
    const clientRow: TablesInsert<'clients'> = { name, user_id: user!.id };
    const { data: created, error } = await supabase
      .from('clients')
      .insert(clientRow)
      .select('id')
      .single();
    if (error) throw new Error(error.message);
    clientCache[name] = created.id;
    return created.id;
  }

  for (const intent of intents) {
    if (intent.type === 'note') {
      const noteRow: TablesInsert<'notes'> = {
        text: intent.title,
        source_transcript: finalText,
        user_id: user.id,
      };
      await supabase.from('notes').insert(noteRow);
      continue;
    }

    const clientId = intent.client_name ? await resolveClient(intent.client_name) : null;

    if (intent.type === 'ponudba') {
      // Generate quote number and create ponudba with postavke
      const { data: stevilka } = await db.rpc('generate_ponudba_stevilka', { p_user_id: user.id });
      const { data: settings } = await db
        .from('company_settings')
        .select('privzeti_ddv, privzeta_veljavnost_dni, privzeta_opomba_zacetna, privzeta_opomba_koncna')
        .eq('user_id', user.id)
        .maybeSingle();

      const ddv = settings?.privzeti_ddv ?? 22;
      const postavke = intent.ponudba_postavke ?? [];
      const skupajBrez = postavke.reduce((s, p) => s + (p.kolicina ?? 1) * (p.cena_na_enoto ?? 0), 0);
      const ddvZnesek = skupajBrez * (ddv / 100);
      const skupajZ = skupajBrez + ddvZnesek;

      let veljavnaDo: string | null = null;
      if (settings?.privzeta_veljavnost_dni) {
        const d = new Date();
        d.setDate(d.getDate() + settings.privzeta_veljavnost_dni);
        veljavnaDo = d.toISOString().split('T')[0];
      }

      const { data: ponudba, error: ponErr } = await db
        .from('ponudbe')
        .insert({
          user_id: user.id,
          client_id: clientId,
          stevilka: stevilka ?? `${new Date().getFullYear()}-001`,
          naslov: intent.title,
          opomba_zacetna: settings?.privzeta_opomba_zacetna ?? null,
          opomba_koncna: settings?.privzeta_opomba_koncna ?? null,
          ddv_stopnja: ddv,
          skupaj_brez_ddv: skupajBrez,
          ddv_znesek: ddvZnesek,
          skupaj_z_ddv: skupajZ,
          veljavna_do: veljavnaDo,
          status: 'osnutek',
        })
        .select('id')
        .single();

      if (ponErr) throw new Error(ponErr.message);

      if (postavke.length > 0) {
        await db.from('ponudba_postavke').insert(
          postavke.map((p, idx) => ({
            ponudba_id: ponudba.id,
            vrstni_red: idx + 1,
            naziv: p.naziv,
            enota: p.enota ?? null,
            kolicina: p.kolicina ?? 1,
            cena_na_enoto: p.cena_na_enoto ?? 0,
            skupaj: (p.kolicina ?? 1) * (p.cena_na_enoto ?? 0),
          }))
        );
      }

      revalidatePath('/ponudbe');
      continue;
    }

    // task / deadline / rezervacija
    const taskRow: TablesInsert<'tasks'> = {
      user_id: user.id,
      client_id: clientId,
      type: intent.type as TablesInsert<'tasks'>['type'],
      title: intent.title,
      description: intent.description ?? null,
      location: intent.location ?? null,
      due_date: intent.due_date ?? null,
      due_time: intent.due_time ?? null,
      start_date: intent.start_date ?? null,
      end_date: intent.end_date ?? null,
      source_transcript: finalText,
      status: 'open',
    };
    await supabase.from('tasks').insert(taskRow);
  }

  revalidatePath('/');
  revalidatePath('/tasks');
}

// ─── Project actions ──────────────────────────────────────────────────────────

export async function createProject(data: {
  title: string;
  client_id?: string | null;
  description?: string | null;
  location?: string | null;
  obseg?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  color?: string;
}) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const projectRow: TablesInsert<'projects'> = {
    user_id: user.id,
    title: data.title,
    client_id: data.client_id ?? null,
    description: data.description ?? null,
    location: data.location ?? null,
    obseg: data.obseg ?? null,
    start_date: data.start_date ?? null,
    end_date: data.end_date ?? null,
    color: data.color ?? null,
    status: 'active',
  };
  const { error } = await supabase.from('projects').insert(projectRow);

  if (error) throw new Error(error.message);
  revalidatePath('/');
  revalidatePath('/projects');
}

export async function closeProject(projectId: string) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: project, error: fetchError } = await supabase
    .from('projects')
    .select('status')
    .eq('id', projectId)
    .eq('user_id', user.id)
    .single();

  if (fetchError) throw new Error(fetchError.message);

  const newStatus = project.status === 'done' ? 'active' : 'done';
  const closed_at = newStatus === 'done' ? new Date().toISOString() : null;

  const projectPatch: TablesUpdate<'projects'> = { status: newStatus, closed_at };
  const { error } = await supabase
    .from('projects')
    .update(projectPatch)
    .eq('id', projectId)
    .eq('user_id', user.id);

  if (error) throw new Error(error.message);
  revalidatePath('/');
  revalidatePath('/projects');
  revalidatePath(`/projects/${projectId}`);
}

export async function confirmReservation(taskId: string) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // 1. Get the reservation task
  const { data: task, error: taskFetchError } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', taskId)
    .eq('user_id', user.id)
    .single();

  if (taskFetchError) throw new Error(taskFetchError.message);

  // 2. Create project with status='active'
  const newProjectRow: TablesInsert<'projects'> = {
    user_id: user.id,
    client_id: task.client_id,
    title: task.title,
    description: task.description,
    location: task.location,
    start_date: task.start_date,
    end_date: task.end_date,
    status: 'active',
    converted_from_task_id: task.id,
  };
  const { data: newProject, error: projectError } = await supabase
    .from('projects')
    .insert(newProjectRow)
    .select('id')
    .single();

  if (projectError) throw new Error(projectError.message);

  // 3. Update task: project_id=new_project.id, type='task'
  const taskPatch: TablesUpdate<'tasks'> = { project_id: newProject.id, type: 'task' };
  const { error: updateError } = await supabase
    .from('tasks')
    .update(taskPatch)
    .eq('id', taskId)
    .eq('user_id', user.id);

  if (updateError) throw new Error(updateError.message);

  revalidatePath('/');
  revalidatePath('/tasks');
  revalidatePath('/projects');
}

// ─── Client actions ───────────────────────────────────────────────────────────

export async function createClient(data: {
  name: string;
  phone?: string | null;
  email?: string | null;
  notes?: string | null;
}) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const clientRow: TablesInsert<'clients'> = {
    user_id: user.id,
    name: data.name,
    phone: data.phone ?? null,
    email: data.email ?? null,
    notes: data.notes ?? null,
  };
  const { error } = await supabase.from('clients').insert(clientRow);

  if (error) throw new Error(error.message);
  revalidatePath('/');
  revalidatePath('/clients');
}

export async function updateClient(
  clientId: string,
  patch: TablesUpdate<'clients'>
) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { error } = await supabase
    .from('clients')
    .update(patch)
    .eq('id', clientId)
    .eq('user_id', user.id);

  if (error) throw new Error(error.message);
  revalidatePath('/');
  revalidatePath('/clients');
  revalidatePath(`/clients/${clientId}`);
}

// ─── Note actions ─────────────────────────────────────────────────────────────

export async function createNote(text: string, sourceTranscript?: string | null) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const noteRow: TablesInsert<'notes'> = {
    user_id: user.id,
    text,
    source_transcript: sourceTranscript ?? null,
  };
  const { error } = await supabase.from('notes').insert(noteRow);

  if (error) throw new Error(error.message);
  revalidatePath('/');
  revalidatePath('/notes');
}

export async function deleteNote(noteId: string) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', noteId)
    .eq('user_id', user.id);

  if (error) throw new Error(error.message);
  revalidatePath('/');
  revalidatePath('/notes');
}
