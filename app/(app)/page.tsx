import { createServerClient } from '@/lib/supabase/server';
import { todayISO, formatDateFull } from '@/lib/utils/date';
import VoiceFab from '@/components/voice/VoiceFab';
import TaskRow from '@/components/tasks/TaskRow';
import PredlogiSection from '@/components/predlogi/PredlogiSection';
import type { Task, Note } from '@/types/domain';

type TaskWithClient = Task & { clients: { name: string } | null };

function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default async function DashboardPage() {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const today = todayISO();

  const [todayTasksRes, overdueTasksRes, notesRes] = await Promise.all([
    supabase
      .from('tasks')
      .select('*, clients(name)')
      .neq('status', 'done')
      .eq('due_date', today)
      .order('created_at', { ascending: true }),
    supabase
      .from('tasks')
      .select('*, clients(name)')
      .neq('status', 'done')
      .lt('due_date', today)
      .order('due_date', { ascending: true })
      .limit(5),
    supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3),
  ]);

  const todayTasks = (todayTasksRes.data ?? []) as TaskWithClient[];
  const overdueTasks = (overdueTasksRes.data ?? []) as TaskWithClient[];
  const notes = (notesRes.data ?? []) as Note[];

  const fullName = user?.user_metadata?.full_name as string | undefined;
  const firstName = fullName
    ? capitalize(fullName.split(' ')[0])
    : capitalize(user?.email?.split('@')[0] ?? '');

  return (
    <div className="px-5 py-6 pb-32 flex flex-col gap-8">
      {/* Greeting */}
      <div>
        <p className="text-sm text-muted">Dober dan,</p>
        <h1 className="font-serif text-3xl tracking-tighter mt-0.5">{firstName}</h1>
        <p className="text-xs text-muted mt-1">{formatDateFull(today)}</p>
      </div>

      {/* Voice FAB */}
      <div className="flex justify-center">
        <VoiceFab />
      </div>

      {/* Predlogi section */}
      <PredlogiSection />

      {/* Danes section */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">Danes</h2>
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-text text-white text-2xs font-semibold">
            {todayTasks.length}
          </span>
        </div>
        {todayTasks.length > 0 ? (
          <div className="flex flex-col gap-2">
            {todayTasks.map((task) => (
              <TaskRow key={task.id} task={task} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">Danes nimate nalog.</p>
        )}
      </section>

      {/* Zamujene section */}
      {overdueTasks.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">Zamujene</h2>
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-2xs font-semibold">
              {overdueTasks.length}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {overdueTasks.map((task) => (
              <TaskRow key={task.id} task={task} />
            ))}
          </div>
        </section>
      )}

      {/* Zapiski section */}
      {notes.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">Zapiski</h2>
          </div>
          <div className="flex flex-col gap-2">
            {notes.map((note) => (
              <div key={note.id} className="bg-card rounded-2xl shadow-card px-4 py-3">
                <p className="text-sm text-text">{note.text}</p>
                <p className="text-xs text-muted mt-0.5">
                  {new Date(note.created_at).toLocaleDateString('sl-SI')}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
