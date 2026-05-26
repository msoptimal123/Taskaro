import { createServerClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';

// ─── Types ────────────────────────────────────────────────────────────────────

type PonudbaStatus =
  | 'osnutek'
  | 'pripravljena'
  | 'poslana'
  | 'sprejeta'
  | 'zavrnjena'
  | 'preklicana';

type Ponudba = {
  id: string;
  stevilka: string;
  naslov: string | null;
  skupaj_brez_ddv: number | null;
  skupaj_z_ddv: number | null;
  status: PonudbaStatus;
  created_at: string;
  client: { id: string; name: string } | null;
  project: { id: string; title: string } | null;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<PonudbaStatus, string> = {
  osnutek: 'Osnutek',
  pripravljena: 'Pripravljena',
  poslana: 'Poslana',
  sprejeta: 'Sprejeta',
  zavrnjena: 'Zavrnjena',
  preklicana: 'Preklicana',
};

const STATUS_BAR_COLOR: Record<PonudbaStatus, string> = {
  osnutek: '#B5B0A8',
  pripravljena: '#3B82F6',
  poslana: '#C2692A',
  sprejeta: '#22C55E',
  zavrnjena: '#EF4444',
  preklicana: '#B5B0A8',
};

const STATUS_BADGE_CLASS: Record<PonudbaStatus, string> = {
  osnutek: 'bg-border2 text-muted',
  pripravljena: 'bg-blue-50 text-blue-600',
  poslana: 'bg-orange-50 text-accent',
  sprejeta: 'bg-green-50 text-green-600',
  zavrnjena: 'bg-red-50 text-red-500',
  preklicana: 'bg-border2 text-muted',
};

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return 'pravkar';
  if (diff < 3600) return `pred ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `pred ${Math.floor(diff / 3600)} ur`;
  const days = Math.floor(diff / 86400);
  if (days === 1) return 'včeraj';
  if (days < 30) return `pred ${days} dnevi`;
  if (days < 365) return `pred ${Math.floor(days / 30)} mes.`;
  return `pred ${Math.floor(days / 365)} leti`;
}

// ─── PonudbaCard ──────────────────────────────────────────────────────────────

function PonudbaCard({ ponudba }: { ponudba: Ponudba }) {
  const barColor = STATUS_BAR_COLOR[ponudba.status];
  const badgeClass = STATUS_BADGE_CLASS[ponudba.status];
  const label = STATUS_LABEL[ponudba.status];
  const displayTitle = ponudba.naslov || ponudba.client?.name || ponudba.stevilka;
  const subtitle = ponudba.naslov && ponudba.client?.name ? ponudba.client.name : null;

  return (
    <Link href={`/ponudbe/${ponudba.id}`}>
      <div className="bg-card rounded-2xl shadow-card p-4 flex gap-3 active:shadow-card-hover transition-shadow">
        {/* Status bar */}
        <div
          className="w-1 rounded-full shrink-0 self-stretch"
          style={{ backgroundColor: barColor }}
        />
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-xs text-muted">{ponudba.stevilka}</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badgeClass}`}>
              {label}
            </span>
          </div>
          <p className="text-sm font-semibold text-text truncate">{displayTitle}</p>
          {subtitle && (
            <p className="text-xs text-muted truncate mt-0.5">{subtitle}</p>
          )}
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-xs text-muted">
              {ponudba.skupaj_brez_ddv != null
                ? `${ponudba.skupaj_brez_ddv.toFixed(2)} € brez DDV`
                : '—'}
            </span>
            <span className="text-muted text-xs">•</span>
            <span className="text-xs text-muted">{timeAgo(ponudba.created_at)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Filter chips ─────────────────────────────────────────────────────────────

const FILTERS = [
  { key: 'vse', label: 'Vse' },
  { key: 'osnutki', label: 'Osnutki' },
  { key: 'poslane', label: 'Poslane' },
  { key: 'sprejete', label: 'Sprejete' },
  { key: 'arhiv', label: 'Arhiv' },
] as const;

type FilterKey = (typeof FILTERS)[number]['key'];

function applyFilter(ponudbe: Ponudba[], filter: FilterKey): Ponudba[] {
  switch (filter) {
    case 'osnutki':
      return ponudbe.filter((p) => p.status === 'osnutek' || p.status === 'pripravljena');
    case 'poslane':
      return ponudbe.filter((p) => p.status === 'poslana');
    case 'sprejete':
      return ponudbe.filter((p) => p.status === 'sprejeta');
    case 'arhiv':
      return ponudbe.filter((p) => p.status === 'zavrnjena' || p.status === 'preklicana');
    default:
      return ponudbe;
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface PageProps {
  searchParams: { filter?: string };
}

export default async function PonudbePage({ searchParams }: PageProps) {
  const supabase = createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data } = await supabase
    .from('ponudbe')
    .select('*, client:clients(id, name), project:projects(id, title)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const all = (data ?? []) as unknown as Ponudba[];
  const activeFilter = (searchParams.filter ?? 'vse') as FilterKey;
  const filtered = applyFilter(all, activeFilter);

  return (
    <div className="px-5 py-6 pb-32 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl tracking-tighter">Ponudbe</h1>
        <Link
          href="/ponudbe/nova"
          className="bg-text text-white rounded-2xl px-4 py-2 text-sm font-semibold"
        >
          +
        </Link>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-5 px-5">
        {FILTERS.map((f) => {
          const isActive = f.key === activeFilter;
          return (
            <Link
              key={f.key}
              href={`/ponudbe?filter=${f.key}`}
              className={`shrink-0 px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-text text-white'
                  : 'bg-card text-muted border border-border'
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {/* List */}
      {filtered.length > 0 ? (
        <div className="flex flex-col gap-2">
          {filtered.map((p) => (
            <PonudbaCard key={p.id} ponudba={p} />
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center py-20 gap-2">
          <p className="text-sm font-semibold text-muted">Še ni ponudb</p>
          {activeFilter === 'vse' && (
            <p className="text-xs text-muted">
              Ustvarite prvo ponudbo s klikom na +
            </p>
          )}
        </div>
      )}
    </div>
  );
}
