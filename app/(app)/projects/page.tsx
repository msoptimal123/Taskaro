import { createServerClient } from '@/lib/supabase/server';
import Link from 'next/link';
import type { Project, ProjectStatus } from '@/types/domain';
import { formatDate } from '@/lib/utils/date';

type ProjectWithClient = Project & { clients: { name: string } | null };

const STATUS_LABELS: Record<ProjectStatus, string> = {
  active: 'Aktivno',
  reserved: 'Rezervirano',
  done: 'Zaključeno',
};

function ProjectCard({ project }: { project: ProjectWithClient }) {
  const color = project.color ?? '#2DB87A';

  const metaParts: string[] = [];
  if (project.clients?.name) metaParts.push(project.clients.name);
  if (project.start_date && project.end_date) {
    metaParts.push(`${formatDate(project.start_date)} – ${formatDate(project.end_date)}`);
  } else if (project.start_date) {
    metaParts.push(`Od ${formatDate(project.start_date)}`);
  }
  if (project.location) metaParts.push(project.location);
  const metaLine = metaParts.join(' · ');

  return (
    <Link href={`/projects/${project.id}`}>
      <div className="bg-card rounded-2xl shadow-card px-4 py-3 flex items-stretch gap-3 active:shadow-card-hover transition-shadow">
        {/* Color bar */}
        <div
          className="w-[3px] rounded-full shrink-0 self-stretch"
          style={{ backgroundColor: color }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text truncate">{project.title}</p>
          {metaLine ? (
            <p className="text-xs text-muted mt-0.5 truncate">{metaLine}</p>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

function Section({
  title,
  projects,
}: {
  title: string;
  projects: ProjectWithClient[];
}) {
  if (projects.length === 0) return null;
  return (
    <section>
      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted mb-3">{title}</h2>
      <div className="flex flex-col gap-2">
        {projects.map((p) => (
          <ProjectCard key={p.id} project={p} />
        ))}
      </div>
    </section>
  );
}

export default async function ProjectsPage() {
  const supabase = createServerClient();

  const { data } = await supabase
    .from('projects')
    .select('*, clients(name)')
    .order('created_at', { ascending: false });

  const all = (data ?? []) as ProjectWithClient[];

  const active = all.filter((p) => p.status === 'active');
  const reserved = all.filter((p) => p.status === 'reserved');
  const done = all.filter((p) => p.status === 'done').slice(0, 10);

  return (
    <div className="px-5 py-6 pb-32 flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl tracking-tighter">Projekti</h1>
        <Link
          href="/projects/new"
          className="w-9 h-9 flex items-center justify-center rounded-full bg-text text-white shadow-card"
          aria-label="Nov projekt"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <line x1="9" y1="4" x2="9" y2="14" />
            <line x1="4" y1="9" x2="14" y2="9" />
          </svg>
        </Link>
      </div>

      <Section title={STATUS_LABELS.active} projects={active} />
      <Section title={STATUS_LABELS.reserved} projects={reserved} />
      <Section title={STATUS_LABELS.done} projects={done} />

      {all.length === 0 && (
        <p className="text-sm text-muted">Še nimate projektov.</p>
      )}
    </div>
  );
}
