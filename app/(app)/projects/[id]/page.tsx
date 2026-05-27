import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createServerClient } from '@/lib/supabase/server';
import TaskRow from '@/components/tasks/TaskRow';
import { formatDate } from '@/lib/utils/date';
import type { Task, ProjectStatus } from '@/types/domain';
import ProjectActions from './ProjectActions';
import PredlogiSection from '@/components/predlogi/PredlogiSection';
import PonudbeListSection from '@/components/ponudbe/PonudbeListSection';

// ─── Types ────────────────────────────────────────────────────────────────────

type ProjectWithClient = {
  id: string;
  user_id: string;
  client_id: string | null;
  title: string;
  description: string | null;
  location: string | null;
  obseg: string | null;
  color: string | null;
  start_date: string | null;
  end_date: string | null;
  status: ProjectStatus;
  closed_at: string | null;
  converted_from_task_id: string | null;
  created_at: string;
  updated_at: string;
  clients: { name: string; phone: string | null; email: string | null } | null;
};

type TaskWithClient = Task & { clients?: { name: string } | null };

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ProjectStatus }) {
  const config: Record<ProjectStatus, { label: string; className: string }> = {
    active:   { label: 'Aktivno',     className: 'bg-green-100 text-green-700' },
    reserved: { label: 'Rezervirano', className: 'bg-purple-100 text-purple-700' },
    done:     { label: 'Zaključeno',  className: 'bg-gray-100 text-gray-500' },
  };
  const { label, className } = config[status];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}>
      {label}
    </span>
  );
}

// ─── Info row ─────────────────────────────────────────────────────────────────

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="px-4 py-3 flex flex-col gap-0.5">
      <span className="text-2xs text-muted font-medium uppercase tracking-wide">{label}</span>
      <div className="text-sm text-text font-medium">{children}</div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface PageProps {
  params: { id: string };
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const supabase = createServerClient();

  const [projectRes, tasksRes] = await Promise.all([
    supabase
      .from('projects')
      .select('*, clients(name, phone, email)')
      .eq('id', params.id)
      .single(),
    supabase
      .from('tasks')
      .select('*, clients(name)')
      .eq('project_id', params.id)
      .order('status')
      .order('due_date', { ascending: true, nullsFirst: false }),
  ]);

  if (!projectRes.data) notFound();

  const project = projectRes.data as unknown as ProjectWithClient;
  const tasks = (tasksRes.data ?? []) as unknown as TaskWithClient[];

  const openTasks = tasks.filter((t) => t.status === 'open' || t.status === 'in_progress');
  const doneTasks = tasks.filter((t) => t.status === 'done');

  const color = project.color ?? '#2DB87A';

  return (
    <div className="px-5 py-6 pb-32 flex flex-col gap-6">
      {/* Back link */}
      <Link href="/projects" className="flex items-center gap-1 text-muted text-sm -ml-0.5">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="M10 12L6 8L10 4"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Projekti
      </Link>

      {/* Header */}
      <div className="flex items-stretch gap-3">
        {/* Color bar */}
        <div
          className="w-[3px] rounded-full shrink-0 self-stretch"
          style={{ backgroundColor: color }}
        />
        <div className="flex flex-col gap-2 min-w-0">
          <h1 className="font-serif text-3xl tracking-tighter text-text leading-tight">
            {project.title}
          </h1>
          <StatusBadge status={project.status} />
        </div>
      </div>

      {/* Info section */}
      {(project.client_id ||
        project.location ||
        project.obseg ||
        project.start_date ||
        project.description) && (
        <div className="bg-card rounded-2xl shadow-card divide-y divide-border">
          {/* Client */}
          {project.client_id && project.clients && (
            <InfoRow label="Stranka">
              <Link
                href={`/clients/${project.client_id}`}
                className="text-accent underline underline-offset-2"
              >
                {project.clients.name}
              </Link>
              {project.clients.phone && (
                <p className="text-xs text-muted mt-0.5">{project.clients.phone}</p>
              )}
            </InfoRow>
          )}

          {/* Location */}
          {project.location && (
            <InfoRow label="Lokacija">{project.location}</InfoRow>
          )}

          {/* Obseg */}
          {project.obseg && (
            <InfoRow label="Obseg">{project.obseg} m²</InfoRow>
          )}

          {/* Termin */}
          {(project.start_date || project.end_date) && (
            <InfoRow label="Termin">
              {project.start_date && project.end_date
                ? `${formatDate(project.start_date)} – ${formatDate(project.end_date)}`
                : project.start_date
                ? `Od ${formatDate(project.start_date)}`
                : project.end_date
                ? `Do ${formatDate(project.end_date)}`
                : null}
            </InfoRow>
          )}

          {/* Description */}
          {project.description && (
            <InfoRow label="Opis">
              <span className="whitespace-pre-wrap">{project.description}</span>
            </InfoRow>
          )}
        </div>
      )}

      {/* Tasks section */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">Naloge</h2>
          {tasks.length > 0 && (
            <span className="inline-flex items-center justify-center rounded-full bg-border2 text-muted2 text-2xs font-semibold min-w-[20px] h-5 px-1.5">
              {tasks.length}
            </span>
          )}
        </div>

        {tasks.length === 0 ? (
          <div className="bg-card rounded-2xl shadow-card px-4 py-5 flex flex-col gap-1">
            <p className="text-sm text-muted">Ni nalog v projektu.</p>
            <p className="text-xs text-muted2">
              Naloge dodajte z glasovnim vnosom ali iz pregleda nalog.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Open tasks */}
            {openTasks.length > 0 && (
              <div className="flex flex-col gap-2">
                <h3 className="text-xs font-semibold text-muted uppercase tracking-wider">
                  Odprte
                </h3>
                {openTasks.map((task) => (
                  <TaskRow key={task.id} task={task} />
                ))}
              </div>
            )}

            {/* Done tasks */}
            {doneTasks.length > 0 && (
              <div className="flex flex-col gap-2">
                <h3 className="text-xs font-semibold text-muted uppercase tracking-wider">
                  Opravljene
                </h3>
                {doneTasks.map((task) => (
                  <TaskRow key={task.id} task={task} />
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Ponudbe za ta projekt */}
      <PonudbeListSection projectId={project.id} />

      {/* Predlogi for this project */}
      <PredlogiSection entityType="project" entityId={project.id} />

      {/* Action buttons */}
      <ProjectActions projectId={project.id} status={project.status} />
    </div>
  );
}
