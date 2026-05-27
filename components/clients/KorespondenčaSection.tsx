'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@/lib/supabase/client';

type EmailLogRow = {
  id: string;
  to_email: string;
  subject: string;
  status: string;
  created_at: string;
  ponudba_id: string | null;
};

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const HH = String(d.getHours()).padStart(2, '0');
  const MM = String(d.getMinutes()).padStart(2, '0');
  return `${dd}. ${mm}. ${yyyy} ${HH}:${MM}`;
}

interface KorespondencaSectionProps {
  clientId: string;
}

export default function KorespondencaSection({ clientId }: KorespondencaSectionProps) {
  const [emails, setEmails] = useState<EmailLogRow[]>([]);

  useEffect(() => {
    const supabase = createBrowserClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from('email_log')
      .select('id, to_email, subject, status, created_at, ponudba_id')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }: { data: EmailLogRow[] | null }) => {
        if (data) setEmails(data);
      });
  }, [clientId]);

  if (emails.length === 0) return null;

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">Korespondenca</h2>
      </div>
      <div className="flex flex-col gap-2">
        {emails.map(e => {
          const card = (
            <div className="bg-card rounded-2xl shadow-card px-4 py-3">
              <p className="text-sm font-semibold text-text truncate">{e.subject}</p>
              <p className="text-xs text-muted mt-0.5">{e.to_email}</p>
              <p className="text-2xs text-muted2 mt-1">{formatDateTime(e.created_at)}</p>
            </div>
          );

          if (e.ponudba_id) {
            return (
              <Link key={e.id} href={'/ponudbe/' + e.ponudba_id}>
                {card}
              </Link>
            );
          }

          return <div key={e.id}>{card}</div>;
        })}
      </div>
    </section>
  );
}
