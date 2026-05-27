'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@/lib/supabase/client';

type PonudbaRow = {
  id: string;
  stevilka: string;
  naslov: string | null;
  skupaj_z_ddv: number;
  status: string;
  created_at: string;
};

const STATUS_LABEL: Record<string, string> = {
  osnutek: 'Osnutek',
  pripravljena: 'Pripravljena',
  poslana: 'Poslana',
  sprejeta: 'Sprejeta',
  zavrnjena: 'Zavrnjena',
  preklicana: 'Preklicana',
};

const STATUS_COLOR: Record<string, string> = {
  osnutek: 'bg-gray-100 text-gray-500',
  pripravljena: 'bg-blue-100 text-blue-700',
  poslana: 'bg-amber-100 text-amber-700',
  sprejeta: 'bg-green-100 text-green-700',
  zavrnjena: 'bg-red-100 text-red-600',
  preklicana: 'bg-gray-100 text-gray-400',
};

interface PonudbeListSectionProps {
  clientId?: string;
  projectId?: string;
}

export default function PonudbeListSection({ clientId, projectId }: PonudbeListSectionProps) {
  const [ponudbe, setPonudbe] = useState<PonudbaRow[]>([]);

  useEffect(() => {
    const supabase = createBrowserClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from('ponudbe')
      .select('id, stevilka, naslov, skupaj_z_ddv, status, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (clientId) query = query.eq('client_id', clientId);
    else if (projectId) query = query.eq('project_id', projectId);

    query.then(({ data }: { data: PonudbaRow[] | null }) => {
      if (data) setPonudbe(data);
    });
  }, [clientId, projectId]);

  if (ponudbe.length === 0) return null;

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">Ponudbe</h2>
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-accent text-white text-2xs font-semibold">
          {ponudbe.length}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {ponudbe.map(p => (
          <Link key={p.id} href={`/ponudbe/${p.id}`}>
            <div className="bg-card rounded-2xl shadow-card px-4 py-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-text truncate">
                  {p.naslov ?? `Ponudba ${p.stevilka}`}
                </p>
                <p className="text-xs text-muted mt-0.5">{p.stevilka}</p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-sm font-semibold text-text whitespace-nowrap">
                  {p.skupaj_z_ddv.toLocaleString('sl-SI', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{' '}
                  €
                </span>
                <span
                  className={`text-2xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLOR[p.status] ?? 'bg-gray-100 text-gray-500'}`}
                >
                  {STATUS_LABEL[p.status] ?? p.status}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
