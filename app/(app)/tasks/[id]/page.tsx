import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createServerClient } from '@/lib/supabase/server';
import TypeBadge from '@/components/tasks/TypeBadge';
import { formatDate, formatDateFull, formatDayName } from '@/lib/utils/date';
import TaskActions from './TaskActions';
import type { TaskType, TaskStatus } from '@/types/domain';
import PredlogiSection from '@/components/predlogi/PredlogiSection';

// ─── Types ────────────────────────────────────────────────────────────────────

type TaskRow = {
  id: string;
  user_id: string;
  client_id: string | null;
  project_id: string | null;
  type: TaskType;
  title: string;
  description: string | null;
  location: string | null;
  due_date: string | null;
  due_time: string | null;
  start_date: string | null;
  end_date: string | null;
  status: TaskStatus;
  source_transcript: string | null;
  completed_at: string | null;
  reminded: boolean;
  reminder_at: string | null;
  created_at: string;
  updated_at: string;
  clients: { name: string; phone: string | null } | null;
  projects: { title: string; color: string | null } | null;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TYPE_LABEL: Record<TaskType, string> = {
  task: 'Naloga',
  deadline: 'Rok',
  rezervacija: 'Rezervacija',
};

const STATUS_LABEL: Record<TaskStatus, string> = {
  open: 'Odprto',
  in_progress: 'V teku',
  done: 'Opravljeno',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-2xs text-muted font-medium uppercase tracking-wide">{label}</span>
      <div className="text-sm text-text font-medium">{children}</div>
    </div>
  );
}

function StatusDot({ status }: { status: TaskStatus }) {
  const colorMap: Record<TaskStatus, string> = {
    open: 'bg-blue-400',
    in_progress: 'bg-amber-400',
    done: 'bg-green-500',
  };
  return (
    <span
      className={`inline-block w-2.5 h-2.5 rounded-full ${colorMap[status]}`}
      aria-hidden="true"
    />
  );
}

function TranscriptBox({ text }: { text: string }) {
  const isLong = text.length > 80;
  if (!isLong) {
    return (
      <div className="mt-1 rounded-xl bg-border2 px-3 py-2.5">
        <p className="text-xs text-muted2 leading-relaxed">{text}</p>
      </div>
    );
  }
  return (
    <div className="mt-1 rounded-xl bg-border2 px-3 py-2.5">
      <details className="group">
        <summary className="list-none cursor-pointer select-none">
          <p className="text-xs text-muted2 leading-relaxed line-clamp-2 group-open:line-clamp-none">
            {text}
          </p>
          <span className="text-2xs text-accent font-medium mt-1 inline-block group-open:hidden">
            Prikaži več
          </span>
        </summary>
      </details>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface PageProps {
  params: { id: string };
}

export default async function TaskDetailPage({ params }: PageProps) {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('tasks')
    .select('*, clients(name, phone), projects(title, color)')
    .eq('id', params.id)
    .single();

  if (!data || error) notFound();

  const task = data as unknown as TaskRow;

  return (
    <div className="px-5 py-6 flex flex-col gap-5 pb-8">
      {/* Back link */}
      <Link href="/tasks" className="flex items-center gap-1 text-muted text-sm -ml-0.5">
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M10 12L6 8L10 4"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Nazaj
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted font-medium">{TYPE_LABEL[task.type]}</span>
          <TypeBadge type={task.type} />
        </div>
        <h1 className="font-serif text-2xl text-text leading-tight">{task.title}</h1>
      </div>

      {/* Info cards */}
      <div className="bg-card rounded-2xl shadow-card divide-y divide-border">
        {task.client_id && task.clients && (
          <div className="px-4 py-3">
            <InfoRow label="Stranka">
              <Link
                href={`/clients/${task.client_id}`}
                className="text-accent underline underline-offset-2"
              >
                {task.clients.name}
              </Link>
            </InfoRow>
          </div>
        )}

        {task.project_id && task.projects && (
          <div className="px-4 py-3">
            <InfoRow label="Projekt">
              <Link
                href={`/projects/${task.project_id}`}
                className="text-accent underline underline-offset-2"
              >
                {task.projects.title}
              </Link>
            </InfoRow>
          </div>
        )}

        {task.due_date && (
          <div className="px-4 py-3">
            <InfoRow label="Datum">
              {formatDayName(task.due_date)}, {formatDateFull(task.due_date)}
            </InfoRow>
          </div>
        )}

        {task.due_time && (
          <div className="px-4 py-3">
            <InfoRow label="Ura">{task.due_time}</InfoRow>
          </div>
        )}

        {task.type === 'rezervacija' && task.start_date && task.end_date && (
          <div className="px-4 py-3">
            <InfoRow label="Termin">
              {formatDate(task.start_date)} &ndash; {formatDate(task.end_date)}
            </InfoRow>
          </div>
        )}

        {task.location && (
          <div className="px-4 py-3">
            <InfoRow label="Lokacija">{task.location}</InfoRow>
          </div>
        )}

        {task.description && (
          <div className="px-4 py-3">
            <InfoRow label="Opis">
              <span className="whitespace-pre-wrap">{task.description}</span>
            </InfoRow>
          </div>
        )}

        {task.source_transcript && (
          <div className="px-4 py-3">
            <InfoRow label="Vir (glasovni vnos)">
              <TranscriptBox text={task.source_transcript} />
            </InfoRow>
          </div>
        )}
      </div>

      {/* Status section */}
      <div className="bg-card rounded-2xl shadow-card px-4 py-3 flex flex-col gap-1">
        <span className="text-2xs text-muted font-medium uppercase tracking-wide">Status</span>
        <div className="flex items-center gap-2">
          <StatusDot status={task.status} />
          <span className="text-sm text-text font-medium">{STATUS_LABEL[task.status]}</span>
        </div>
        {task.status === 'done' && task.completed_at && (
          <span className="text-xs text-muted mt-0.5">
            Opravljeno: {formatDateFull(task.completed_at.split('T')[0])}
          </span>
        )}
      </div>

      {/* Predlogi for this task */}
      <PredlogiSection entityType="task" entityId={task.id} limit={2} />

      {/* Action buttons */}
      <TaskActions taskId={task.id} status={task.status} />
    </div>
  );
}
