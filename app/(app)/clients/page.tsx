import { createServerClient } from '@/lib/supabase/server';
import Link from 'next/link';
import type { Client } from '@/types/domain';

function ClientCard({ client }: { client: Client }) {
  const metaParts: string[] = [];
  if (client.phone) metaParts.push(client.phone);
  if (client.email) metaParts.push(client.email);
  const metaLine = metaParts.join(' · ');

  return (
    <Link href={`/clients/${client.id}`}>
      <div className="bg-card rounded-2xl shadow-card px-4 py-3 active:shadow-card-hover transition-shadow">
        <p className="text-sm font-semibold text-text">{client.name}</p>
        {metaLine ? (
          <p className="text-xs text-muted mt-0.5 truncate">{metaLine}</p>
        ) : null}
      </div>
    </Link>
  );
}

export default async function ClientsPage() {
  const supabase = createServerClient();

  const { data } = await supabase
    .from('clients')
    .select('*')
    .order('name', { ascending: true });

  const clients = (data ?? []) as Client[];

  return (
    <div className="px-5 py-6 pb-32 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl tracking-tighter">Stranke</h1>
        <Link
          href="/clients/new"
          className="w-9 h-9 flex items-center justify-center rounded-full bg-text text-white shadow-card"
          aria-label="Nova stranka"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <line x1="9" y1="4" x2="9" y2="14" />
            <line x1="4" y1="9" x2="14" y2="9" />
          </svg>
        </Link>
      </div>

      {clients.length > 0 ? (
        <div className="flex flex-col gap-2">
          {clients.map((client) => (
            <ClientCard key={client.id} client={client} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted">Še nimate strank.</p>
      )}
    </div>
  );
}
