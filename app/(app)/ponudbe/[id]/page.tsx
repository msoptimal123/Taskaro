'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';

// ─── Types ────────────────────────────────────────────────────────────────────

type PonudbaStatus =
  | 'osnutek'
  | 'pripravljena'
  | 'poslana'
  | 'sprejeta'
  | 'zavrnjena'
  | 'preklicana';

type Postavka = {
  id: string;
  vrstni_red: number;
  naziv: string;
  opis: string | null;
  enota: string | null;
  kolicina: number;
  cena_na_enoto: number;
  skupaj: number;
};

type Ponudba = {
  id: string;
  stevilka: string;
  naslov: string | null;
  opomba_zacetna: string | null;
  opomba_koncna: string | null;
  ddv_stopnja: number;
  popust_odstotek: number;
  skupaj_brez_ddv: number | null;
  ddv_znesek: number | null;
  skupaj_z_ddv: number | null;
  veljavna_do: string | null;
  status: PonudbaStatus;
  created_at: string;
  rezervacija_start: string | null;
  rezervacija_end: string | null;
  brez_rezervacije: boolean;
  rezervacija_task_id: string | null;
  client: { id: string; name: string; email: string | null; phone: string | null } | null;
  project: { id: string; title: string } | null;
  postavke: Postavka[];
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

const STATUS_BADGE_CLASS: Record<PonudbaStatus, string> = {
  osnutek: 'bg-border2 text-muted',
  pripravljena: 'bg-blue-50 text-blue-600',
  poslana: 'bg-orange-50 text-accent',
  sprejeta: 'bg-green-50 text-green-600',
  zavrnjena: 'bg-red-50 text-red-500',
  preklicana: 'bg-border2 text-muted',
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('sl-SI', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatEur(n: number | null | undefined): string {
  if (n == null) return '—';
  return `${n.toFixed(2)} €`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="px-4 py-3 flex flex-col gap-0.5">
      <span className="text-2xs text-muted font-medium uppercase tracking-wide">{label}</span>
      <div className="text-sm text-text font-medium">{children}</div>
    </div>
  );
}

// ─── Send modal ───────────────────────────────────────────────────────────────

function SendModal({ ponudba, onClose, onSent }: {
  ponudba: Ponudba;
  onClose: () => void;
  onSent: () => void;
}) {
  const defaultSubject = `Ponudba ${ponudba.stevilka}${ponudba.naslov ? ` — ${ponudba.naslov}` : ''}`;
  const defaultBody = `Pozdravljeni,\n\nv prilogi vam pošiljam ponudbo ${ponudba.stevilka}.\n\nV primeru vprašanj sem vam na voljo.\n\nLep pozdrav`;

  const [to, setTo] = useState(ponudba.client?.email ?? '');
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState(defaultBody);
  const [rezervacijaStart, setRezervacijaStart] = useState(ponudba.rezervacija_start ?? '');
  const [rezervacijaEnd, setRezervacijaEnd] = useState(ponudba.rezervacija_end ?? '');
  const [brezRezervacije, setBrezRezervacije] = useState(ponudba.brez_rezervacije ?? false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    if (!to) { setError('Vnesite e-poštni naslov prejemnika'); return; }
    setSending(true);
    setError(null);
    try {
      const res = await fetch(`/api/ponudbe/${ponudba.id}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to, subject, body,
          rezervacija_start: brezRezervacije ? null : (rezervacijaStart || null),
          rezervacija_end: brezRezervacije ? null : (rezervacijaEnd || null),
          brez_rezervacije: brezRezervacije,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error((d as { error?: string }).error ?? 'Napaka pri pošiljanju');
      }
      onSent();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Napaka pri pošiljanju');
      setSending(false);
    }
  }

  const inputCls = 'w-full bg-border2 rounded-2xl px-4 py-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent';

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-bg rounded-t-3xl px-5 pt-5 pb-safe z-10 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-serif text-xl tracking-tight">Pošlji ponudbo</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-border2 text-lg text-muted">×</button>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-2xs text-muted font-medium uppercase tracking-wide">Za:</label>
          <input type="email" value={to} onChange={e => setTo(e.target.value)} className={inputCls} placeholder="stranka@email.si" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-2xs text-muted font-medium uppercase tracking-wide">Zadeva:</label>
          <input type="text" value={subject} onChange={e => setSubject(e.target.value)} className={inputCls} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-2xs text-muted font-medium uppercase tracking-wide">Sporočilo:</label>
          <textarea rows={5} value={body} onChange={e => setBody(e.target.value)} className={`${inputCls} resize-none`} />
        </div>

        {/* Rezervacija */}
        <div className="flex flex-col gap-2 border border-border rounded-2xl p-3">
          <div className="flex items-center justify-between">
            <span className="text-2xs text-muted font-medium uppercase tracking-wide">Rezervacija termina</span>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={brezRezervacije} onChange={e => setBrezRezervacije(e.target.checked)} className="w-3.5 h-3.5 accent-accent" />
              <span className="text-xs text-muted">Brez rezervacije</span>
            </label>
          </div>
          {!brezRezervacije && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={rezervacijaStart}
                onChange={e => setRezervacijaStart(e.target.value)}
                className={`flex-1 ${inputCls} py-2`}
                placeholder="Od"
              />
              <span className="text-muted text-sm shrink-0">–</span>
              <input
                type="date"
                value={rezervacijaEnd}
                onChange={e => setRezervacijaEnd(e.target.value)}
                className={`flex-1 ${inputCls} py-2`}
                placeholder="Do"
              />
            </div>
          )}
          {brezRezervacije && (
            <p className="text-xs text-muted2">Rezervacija ne bo ustvarjena.</p>
          )}
        </div>

        <p className="text-xs text-muted">Ponudba bo priložena kot PDF.</p>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <button
          onClick={handleSend}
          disabled={sending}
          className="w-full bg-text text-white rounded-2xl py-3.5 text-sm font-semibold disabled:opacity-50"
        >
          {sending ? 'Pošiljam…' : 'Pošlji email'}
        </button>
        <div className="pb-4" />
      </div>
    </div>
  );
}

// ─── Action buttons ───────────────────────────────────────────────────────────

function PonudbaActions({ ponudba, onStatusChange }: { ponudba: Ponudba; onStatusChange: (s: PonudbaStatus) => void }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showSendModal, setShowSendModal] = useState(false);

  async function updateStatus(status: PonudbaStatus) {
    startTransition(async () => {
      await fetch(`/api/ponudbe/${ponudba.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      onStatusChange(status);
    });
  }

  const canEdit = ponudba.status === 'osnutek' || ponudba.status === 'pripravljena';
  const canSend = canEdit;
  const isSent = ponudba.status === 'poslana';

  return (
    <>
    {showSendModal && (
      <SendModal
        ponudba={ponudba}
        onClose={() => setShowSendModal(false)}
        onSent={() => { setShowSendModal(false); onStatusChange('poslana'); }}
      />
    )}
    <div className="flex flex-col gap-3 mt-2">
      {canEdit && (
        <Link
          href={`/ponudbe/${ponudba.id}/uredi`}
          className="w-full py-3.5 rounded-2xl bg-text text-white text-sm font-semibold text-center block"
        >
          Uredi
        </Link>
      )}
      {canSend && (
        <button
          onClick={() => setShowSendModal(true)}
          disabled={isPending}
          className="w-full py-3.5 rounded-2xl border border-accent text-accent text-sm font-semibold transition-opacity disabled:opacity-50"
        >
          Pošlji po emailu
        </button>
      )}
      {canSend && (
        <button
          onClick={() => updateStatus('poslana')}
          disabled={isPending}
          className="w-full py-3.5 rounded-2xl border border-border text-muted text-sm font-medium transition-opacity disabled:opacity-50"
        >
          {isPending ? '…' : 'Označi kot poslano (brez emaila)'}
        </button>
      )}
      {isSent && (
        <>
          <button
            onClick={() => setShowSendModal(true)}
            className="w-full py-3.5 rounded-2xl border border-accent text-accent text-sm font-semibold"
          >
            Pošlji opomnik
          </button>
          <button
            onClick={() => updateStatus('sprejeta')}
            disabled={isPending}
            className="w-full py-3.5 rounded-2xl bg-green-500 text-white text-sm font-semibold transition-opacity disabled:opacity-50"
          >
            Označi sprejeto
          </button>
          <button
            onClick={() => updateStatus('zavrnjena')}
            disabled={isPending}
            className="w-full py-3.5 rounded-2xl border border-red-300 text-red-500 text-sm font-semibold transition-opacity disabled:opacity-50"
          >
            Označi zavrnjeno
          </button>
        </>
      )}
      <a
        href={`/api/ponudbe/${ponudba.id}/pdf`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full py-3.5 rounded-2xl border border-border text-muted text-sm font-semibold text-center block"
      >
        Generiraj PDF
      </a>
    </div>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PonudbaDetailPage({ params }: { params: { id: string } }) {
  const [ponudba, setPonudba] = useState<Ponudba | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const supabase = createBrowserClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from('ponudbe')
        .select('*, client:clients(id, name, email, phone), project:projects(id, title), postavke:ponudba_postavke(*)')
        .eq('id', params.id)
        .eq('user_id', user.id)
        .single()
        .then(({ data, error }) => {
          if (!data || error) {
            setNotFound(true);
          } else {
            // Sort postavke by vrstni_red
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const d = data as any;
            const sorted = { ...d, postavke: (d.postavke ?? []).sort((a: any, b: any) => a.vrstni_red - b.vrstni_red) };
            setPonudba(sorted as unknown as Ponudba);
          }
          setLoading(false);
        });
    });
  }, [params.id]);

  if (loading) {
    return (
      <div className="px-5 py-6 pb-32 flex flex-col gap-5">
        <div className="h-6 bg-border2 rounded-xl w-24 animate-pulse" />
        <div className="h-10 bg-border2 rounded-2xl w-48 animate-pulse" />
        <div className="bg-card rounded-2xl h-40 animate-pulse" />
      </div>
    );
  }

  if (notFound || !ponudba) {
    return (
      <div className="px-5 py-20 flex flex-col items-center gap-3">
        <p className="text-sm text-muted">Ponudba ni najdena.</p>
        <Link href="/ponudbe" className="text-accent text-sm underline">
          Nazaj na ponudbe
        </Link>
      </div>
    );
  }

  const badgeClass = STATUS_BADGE_CLASS[ponudba.status];
  const statusLabel = STATUS_LABEL[ponudba.status];

  return (
    <div className="px-5 py-6 pb-32 flex flex-col gap-5">
      {/* Back link */}
      <Link href="/ponudbe" className="flex items-center gap-1 text-muted text-sm -ml-0.5">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Ponudbe
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <h1 className="font-serif text-3xl tracking-tighter text-text flex-1 min-w-0 truncate">
            {ponudba.stevilka}
          </h1>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${badgeClass}`}>
            {statusLabel}
          </span>
        </div>
        {ponudba.naslov && (
          <p className="text-sm text-muted">{ponudba.naslov}</p>
        )}
      </div>

      {/* Info section */}
      <div className="bg-card rounded-2xl shadow-card divide-y divide-border">
        {ponudba.client && (
          <InfoRow label="Stranka">
            <Link href={`/clients/${ponudba.client.id}`} className="text-accent underline underline-offset-2">
              {ponudba.client.name}
            </Link>
            {ponudba.client.phone && <p className="text-xs text-muted mt-0.5">{ponudba.client.phone}</p>}
            {ponudba.client.email && <p className="text-xs text-muted">{ponudba.client.email}</p>}
          </InfoRow>
        )}
        {ponudba.project && (
          <InfoRow label="Projekt">
            <Link href={`/projects/${ponudba.project.id}`} className="text-accent underline underline-offset-2">
              {ponudba.project.title}
            </Link>
          </InfoRow>
        )}
        <InfoRow label="Datum">
          {formatDate(ponudba.created_at)}
        </InfoRow>
        {ponudba.veljavna_do && (
          <InfoRow label="Veljavno do">
            {formatDate(ponudba.veljavna_do)}
          </InfoRow>
        )}
      </div>

      {/* Opomba začetna */}
      {ponudba.opomba_zacetna && (
        <div className="bg-card rounded-2xl shadow-card px-4 py-3">
          <p className="text-xs text-muted font-medium uppercase tracking-wide mb-1">Uvodni tekst</p>
          <p className="text-sm text-text whitespace-pre-wrap">{ponudba.opomba_zacetna}</p>
        </div>
      )}

      {/* Postavke */}
      <div className="bg-card rounded-2xl shadow-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <p className="text-xs text-muted font-medium uppercase tracking-wide">Postavke</p>
        </div>
        {ponudba.postavke.length === 0 ? (
          <div className="px-4 py-5">
            <p className="text-sm text-muted">Ni postavk.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {ponudba.postavke.map((p, i) => (
              <div key={p.id} className="px-4 py-3 flex gap-3">
                <span className="text-xs text-muted mt-0.5 w-5 shrink-0 text-right">{i + 1}.</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text">{p.naziv}</p>
                  {p.opis && <p className="text-xs text-muted mt-0.5">{p.opis}</p>}
                  <p className="text-xs text-muted mt-1">
                    {p.kolicina} {p.enota ?? ''} × {formatEur(p.cena_na_enoto)}
                  </p>
                </div>
                <div className="text-sm font-semibold text-text shrink-0 text-right">
                  {formatEur(p.skupaj)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Totals */}
        <div className="border-t border-border px-4 py-3 flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted">Skupaj brez DDV</span>
            <span className="text-sm text-text">{formatEur(ponudba.skupaj_brez_ddv)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted">DDV ({ponudba.ddv_stopnja}%)</span>
            <span className="text-sm text-text">{formatEur(ponudba.ddv_znesek)}</span>
          </div>
          <div className="flex justify-between items-center pt-1 border-t border-border">
            <span className="text-sm font-semibold text-text">Skupaj z DDV</span>
            <span className="text-base font-bold text-text">{formatEur(ponudba.skupaj_z_ddv)}</span>
          </div>
        </div>
      </div>

      {/* Opomba končna */}
      {ponudba.opomba_koncna && (
        <div className="bg-card rounded-2xl shadow-card px-4 py-3">
          <p className="text-xs text-muted font-medium uppercase tracking-wide mb-1">Zaključni tekst</p>
          <p className="text-sm text-text whitespace-pre-wrap">{ponudba.opomba_koncna}</p>
        </div>
      )}

      {/* Actions */}
      <PonudbaActions
        ponudba={ponudba}
        onStatusChange={(s) => setPonudba((prev) => prev ? { ...prev, status: s } : prev)}
      />
    </div>
  );
}
