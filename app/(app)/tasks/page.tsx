import { createServerClient } from '@/lib/supabase/server';
import { todayISO } from '@/lib/utils/date';
import TaskRow from '@/components/tasks/TaskRow';
import Link from 'next/link';
import type { Task } from '@/types/domain';

type TaskWithClient = Task & { clients: { name: string } | null };

const FILTERS = [
  { key: 'danes', label: 'Danes' },
  { key: 'prihajajoce', label: 'Prihajajoče' },
  { key: 'vse', label: 'Vse' },
  { key: 'opravljeno', label: 'Opravljeno' },
] as const;

type FilterKey = (typeof FILTERS)[number]['key'];

function isValidFilter(value: string | undefined): value is FilterKey {
  return FILTERS.some((f) => f.key === value);
}

interface PageProps {
  searchParams: { filter?: string };
}

export default async function TasksPage({ searchParams }: PageProps) {
  const rawFilter = searchParams.filter;
  const filter: FilterKey = isValidFilter(rawFilter) ? rawFilter : 'danes';
  const today = todayISO();

  const supabase = createServerClient();

  let query = supabase
    .from('tasks')
    .select('*, clients(name)')
    .order('due_time', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (filter === 'danes') {
    query = query.eq('due_date', today).neq('status', 'done');
  } else if (filter === 'prihajajoce') {
    query = query.gt('due_date', today).neq('status', 'done');
  } else if (filter === 'vse') {
    query = query.neq('status', 'done');
  } else if (filter === 'opravljeno') {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];
    query = query.eq('status', 'done').gte('created_at', thirtyDaysAgo);
  }

  const { data: tasks } = await query;
  const typedTasks = (tasks ?? []) as TaskWithClient[];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 pt-6 pb-0 shrink-0">
        <h1 className="text-2xl font-bold text-text">Taski</h1>
      </div>

      {/* Filter tabs */}
      <div className="shrink-0 overflow-x-auto scrollbar-none">
        <div className="flex gap-1 px-5 py-3 w-max">
          {FILTERS.map((f) => (
            <Link
              key={f.key}
              href={`/tasks?filter=${f.key}`}
              className={`
                px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors
                ${
                  filter === f.key
                    ? 'bg-text text-white font-semibold'
                    : 'text-muted font-normal'
                }
              `}
            >
              {f.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto px-5 pb-6 flex flex-col gap-3">
        {typedTasks.length === 0 ? (
          <div className="flex-1 flex items-center justify-center pt-16">
            <p className="text-muted text-sm">Ni nalog</p>
          </div>
        ) : (
          typedTasks.map((task) => <TaskRow key={task.id} task={task} />)
        )}
      </div>
    </div>
  );
}
