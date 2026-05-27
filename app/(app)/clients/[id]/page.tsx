import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createServerClient } from '@/lib/supabase/server';
import TaskRow from '@/components/tasks/TaskRow';
import ClientEditForm from '@/components/clients/ClientEditForm';
import { formatDate } from '@/lib/utils/date';
import type { Client, Task, Project } from '@/types/domain';
import PredlogiSection from '@/components/predlogi/PredlogiSection';
import PonudbeListSection from '@/components/ponudbe/PonudbeListSection';
import KorespondenčaSection from '@/components/clients/KorespondenčaSection';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PROJECT_STATUS_LABEL: Record<Project['status'], string> = {
  reserved: 'Rezervacija',
  active: 'V teku',
  done: 'Zaključeno',
};

const PROJECT_STATUS_COLOR: Record<Project['status'], string> = {
  reserved: 'bg-purple-100 text-purple-700',
  active: 'bg-blue-100 text-blue-700',
  done: 'bg-green-100 text-green-700',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function ChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M10 12L6 8L10 4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M13.3 10.5c-.4-.4-1-.4-1.4 0l-.8.8c-.2.2-.5.2-.7.1-1-.6-1.9-1.4-2.7-2.3-.8-.9-1.5-1.8-2-2.8-.1-.2 0-.5.1-.7l.8-.8c.4-.4.4-1 0-1.4L5.3 2.1c-.4-.4-1-.4-1.4 0L3 3c-.7.7-.9 1.7-.5 2.6 1 2.3 2.7 4.4 4.9 6.1 1.7 1.3 3.7 2.2 5.8 2.4.6.1 1.2-.1 1.6-.6l.9-.9c.4-.4.4-1 0-1.4l-2.4-2.7z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="2" y="4" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M2 5l6 4.5L14 5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function NotesIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="3" y="2" width="10" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <line x1="5.5" y1="6" x2="10.5" y2="6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="5.5" y1="8.5" x2="10.5" y2="8.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="5.5" y1="11" x2="8.5" y2="11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M11.5 2.5l2 2-8 8H3.5v-2l8-8z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const dateRange =
    project.start_date && project.end_date
      ? `${formatDate(project.start_date)} – ${formatDate(project.end_date)}`
      : project.start_date
      ? `Od ${formatDate(project.start_date)}`
      : null;

  return (
    <Link href={`/projects/${project.id}`}>
      <div className="bg-card rounded-2xl shadow-card px-4 py-3 flex flex-col gap-1 active:opacity-80 transition-opacity">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-text flex-1 min-w-0 truncate">{project.title}</p>
          <span
            className={`text-2xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${PROJECT_STATUS_COLOR[project.status]}`}
          >
            {PROJECT_STATUS_LABEL[project.status]}
          </span>
        </div>
        {dateRange && <p className="text-xs text-muted">{dateRange}</p>}
      </div>
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface PageProps {
  params: { id: string };
  searchParams: { edit?: string };
}

export default async function ClientDetailPage({ params, searchParams }: PageProps) {
  const supabase = createServerClient();

  const [clientRes, tasksRes, projectsRes] = await Promise.all([
    supabase.from('clients').select('*').eq('id', params.id).single(),
    supabase
      .from('tasks')
      .select('*')
      .eq('client_id', params.id)
      .is('project_id', null)
      .order('status')
      .order('created_at', { ascending: false }),
    supabase
      .from('projects')
      .select('*')
      .eq('client_id', params.id)
      .order('created_at', { ascending: false }),
  ]);

  if (!clientRes.data) notFound();

  const client = clientRes.data as Client;
  const allTasks = (tasksRes.data ?? []) as Task[];
  const projects = (projectsRes.data ?? []) as Project[];

  const openTasks = allTasks.filter((t) => t.status !== 'done').slice(0, 20);

  const isEditing = searchParams.edit === '1';

  return (
    <div className="px-5 py-6 pb-32 flex flex-col gap-6">
      {/* Back link */}
      <Link href="/clients" className="flex items-center gap-1 text-muted text-sm -ml-0.5">
        <ChevronLeft />
        Stranke
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <h1 className="font-serif text-3xl tracking-tighter text-text leading-tight">
          {client.name}
        </h1>
        {!isEditing && (
          <Link
            href={`/clients/${client.id}?edit=1`}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-border2 text-muted shrink-0"
            aria-label="Uredi stranko"
          >
            <PencilIcon />
          </Link>
        )}
      </div>

      {/* Edit form */}
      {isEditing ? (
        <div className="bg-card rounded-2xl shadow-card px-4 py-4">
          <p className="text-2xs text-muted font-medium uppercase tracking-wide mb-3">
            Uredi stranko
          </p>
          <ClientEditForm client={client} />
        </div>
      ) : (
        /* Contact info */
        (client.phone || client.email || client.notes) && (
          <div className="bg-card rounded-2xl shadow-card divide-y divide-border">
            {client.phone && (
              <a
                href={`tel:${client.phone}`}
                className="flex items-center gap-3 px-4 py-3 active:bg-border2 transition-colors"
              >
                <span className="text-muted shrink-0">
                  <PhoneIcon />
                </span>
                <span className="text-sm text-text">{client.phone}</span>
              </a>
            )}
            {client.email && (
              <a
                href={`mailto:${client.email}`}
                className="flex items-center gap-3 px-4 py-3 active:bg-border2 transition-colors"
              >
                <span className="text-muted shrink-0">
                  <EmailIcon />
                </span>
                <span className="text-sm text-text">{client.email}</span>
              </a>
            )}
            {client.notes && (
              <div className="flex items-start gap-3 px-4 py-3">
                <span className="text-muted shrink-0 mt-0.5">
                  <NotesIcon />
                </span>
                <p className="text-sm text-text whitespace-pre-wrap">{client.notes}</p>
              </div>
            )}
          </div>
        )
      )}

      {/* Predlogi for this client */}
      <PredlogiSection entityType="client" entityId={client.id} />

      {/* Solo tasks */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-text text-base">
            Naloge
            {allTasks.length > 0 && (
              <span className="ml-2 text-xs text-muted font-normal">{allTasks.length}</span>
            )}
          </h2>
        </div>

        {openTasks.length > 0 ? (
          <div className="flex flex-col gap-2">
            {openTasks.map((task) => (
              <TaskRow key={task.id} task={task} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">Ni solo nalog za to stranko.</p>
        )}
      </div>

      {/* Projects */}
      <div className="flex flex-col gap-3">
        <h2 className="font-semibold text-text text-base">Projekti</h2>

        {projects.length > 0 ? (
          <div className="flex flex-col gap-2">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">Ni projektov za to stranko.</p>
        )}
      </div>

      {/* Ponudbe for this client */}
      <PonudbeListSection clientId={client.id} />

      {/* Email correspondence */}
      <KorespondenčaSection clientId={client.id} />
    </div>
  );
}
