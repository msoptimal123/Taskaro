'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@/lib/supabase/client';

// ─── Types ────────────────────────────────────────────────────────────────────

type Client = { id: string; name: string };
type Project = { id: string; title: string; client_id: string | null };

type PostavkaRow = {
  naziv: string;
  enota: string;
  kolicina: string;
  cena_na_enoto: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const inputClass =
  'w-full bg-border2 rounded-2xl px-4 py-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent';

const labelClass = 'text-2xs text-muted font-medium uppercase tracking-wide';

function rowTotal(row: PostavkaRow): number {
  const k = parseFloat(row.kolicina) || 0;
  const c = parseFloat(row.cena_na_enoto) || 0;
  return k * c;
}

function formatEur(n: number): string {
  return `${n.toFixed(2)} €`;
}

function emptyPostavka(): PostavkaRow {
  return { naziv: '', enota: '', kolicina: '', cena_na_enoto: '' };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UrediPonudboPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;

  // Meta fields
  const [clientId, setClientId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [naslov, setNaslov] = useState('');
  const [opombaZacetna, setOpombaZacetna] = useState('');
  const [opombaKoncna, setOpombaKoncna] = useState('');
  const [ddvStopnja, setDdvStopnja] = useState('22');
  const [veljavnaDo, setVeljavnaDo] = useState('');

  // Postavke
  const [postavke, setPostavke] = useState<PostavkaRow[]>([emptyPostavka()]);

  // Remote data
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  // Fetch existing ponudba + clients + projects
  useEffect(() => {
    const supabase = createBrowserClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;

      // Fetch all three in parallel
      Promise.all([
        supabase
          .from('ponudbe')
          .select('*, postavke:ponudba_postavke(*)')
          .eq('id', id)
          .eq('user_id', user.id)
          .single(),
        supabase
          .from('clients')
          .select('id, name')
          .eq('user_id', user.id)
          .order('name'),
        supabase
          .from('projects')
          .select('id, title, client_id')
          .eq('user_id', user.id)
          .in('status', ['reserved', 'active'])
          .order('title'),
      ]).then(([ponudbaRes, clientsRes, projectsRes]) => {
        setClients((clientsRes.data ?? []) as Client[]);
        setProjects((projectsRes.data ?? []) as Project[]);

        if (!ponudbaRes.data || ponudbaRes.error) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        const p = ponudbaRes.data as any;
        setClientId(p.client_id ?? '');
        setProjectId(p.project_id ?? '');
        setNaslov(p.naslov ?? '');
        setOpombaZacetna(p.opomba_zacetna ?? '');
        setOpombaKoncna(p.opomba_koncna ?? '');
        setDdvStopnja(String(p.ddv_stopnja ?? 22));
        setVeljavnaDo(p.veljavna_do ?? '');

        const sorted = (p.postavke ?? []).sort((a: any, b: any) => a.vrstni_red - b.vrstni_red);
        setPostavke(
          sorted.length > 0
            ? sorted.map((row: any) => ({
                naziv: row.naziv ?? '',
                enota: row.enota ?? '',
                kolicina: String(row.kolicina ?? ''),
                cena_na_enoto: String(row.cena_na_enoto ?? ''),
              }))
            : [emptyPostavka()]
        );

        setLoading(false);
      });
    });
  }, [id]);

  // Filter projects by client if one is selected
  const filteredProjects = clientId
    ? projects.filter((p) => !p.client_id || p.client_id === clientId)
    : projects;

  // Postavke helpers
  function updatePostavka(i: number, field: keyof PostavkaRow, value: string) {
    setPostavke((prev) => prev.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)));
  }

  function addPostavka() {
    setPostavke((prev) => [...prev, emptyPostavka()]);
  }

  function removePostavka(i: number) {
    setPostavke((prev) => prev.filter((_, idx) => idx !== i));
  }

  // Totals
  const skupajBrezDdv = postavke.reduce((sum, row) => sum + rowTotal(row), 0);
  const ddv = skupajBrezDdv * ((parseFloat(ddvStopnja) || 0) / 100);
  const skupajZDdv = skupajBrezDdv + ddv;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const body = {
        client_id: clientId || null,
        project_id: projectId || null,
        naslov: naslov || null,
        opomba_zacetna: opombaZacetna || null,
        opomba_koncna: opombaKoncna || null,
        ddv_stopnja: parseFloat(ddvStopnja) || 22,
        veljavna_do: veljavnaDo || null,
        postavke: postavke.map((row, i) => ({
          vrstni_red: i + 1,
          naziv: row.naziv,
          enota: row.enota || null,
          kolicina: parseFloat(row.kolicina) || 0,
          cena_na_enoto: parseFloat(row.cena_na_enoto) || 0,
          skupaj: rowTotal(row),
        })),
      };

      const res = await fetch(`/api/ponudbe/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as any).error ?? 'Napaka pri shranjevanju');
      }

      router.push(`/ponudbe/${id}`);
    } catch (err: any) {
      setError(err.message ?? 'Prišlo je do napake');
      setSaving(false);
    }
  }

  // ─── Loading / Not Found ───────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="px-5 py-6 pb-32 flex flex-col gap-5">
        <div className="h-6 bg-border2 rounded-xl w-24 animate-pulse" />
        <div className="h-10 bg-border2 rounded-2xl w-48 animate-pulse" />
        <div className="bg-card rounded-2xl h-48 animate-pulse" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="px-5 py-20 flex flex-col items-center gap-3">
        <p className="text-sm text-muted">Ponudba ni najdena.</p>
        <Link href="/ponudbe" className="text-accent text-sm underline">
          Nazaj na ponudbe
        </Link>
      </div>
    );
  }

  return (
    <div className="px-5 py-6 pb-32 flex flex-col gap-6">
      {/* Back */}
      <Link href={`/ponudbe/${id}`} className="flex items-center gap-1 text-muted text-sm -ml-0.5">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Ponudba
      </Link>

      <h1 className="font-serif text-3xl tracking-tighter text-text">Uredi ponudbo</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Client */}
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Stranka</label>
          <select
            value={clientId}
            onChange={(e) => { setClientId(e.target.value); setProjectId(''); }}
            className={inputClass}
          >
            <option value="">— Izberi stranko —</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Project */}
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Projekt (neobvezno)</label>
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className={inputClass}
          >
            <option value="">— Izberi projekt —</option>
            {filteredProjects.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Naslov ponudbe (neobvezno)</label>
          <input
            type="text"
            value={naslov}
            onChange={(e) => setNaslov(e.target.value)}
            className={inputClass}
            placeholder="npr. Keramika kopalnica"
          />
        </div>

        {/* Date + DDV row */}
        <div className="flex gap-3">
          <div className="flex flex-col gap-1.5 flex-1">
            <label className={labelClass}>Veljavna do</label>
            <input
              type="date"
              value={veljavnaDo}
              onChange={(e) => setVeljavnaDo(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1.5 w-28">
            <label className={labelClass}>DDV %</label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={ddvStopnja}
              onChange={(e) => setDdvStopnja(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        {/* Intro note */}
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Uvodni tekst (neobvezno)</label>
          <textarea
            rows={3}
            value={opombaZacetna}
            onChange={(e) => setOpombaZacetna(e.target.value)}
            className={inputClass}
            placeholder="Spoštovani, v skladu z vašo zahtevo..."
          />
        </div>

        {/* Postavke */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className={labelClass}>Postavke</span>
          </div>

          <div className="bg-card rounded-2xl shadow-card overflow-hidden">
            {/* Column headers */}
            <div className="px-4 py-2 border-b border-border grid grid-cols-[1fr_56px_72px_84px_32px] gap-2">
              <span className="text-2xs text-muted">Naziv</span>
              <span className="text-2xs text-muted text-center">Enota</span>
              <span className="text-2xs text-muted text-right">Kol.</span>
              <span className="text-2xs text-muted text-right">Cena/enoto</span>
              <span />
            </div>

            <div className="divide-y divide-border">
              {postavke.map((row, i) => (
                <div key={i} className="px-4 py-3 flex flex-col gap-2">
                  {/* Row 1: naziv */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={row.naziv}
                      onChange={(e) => updatePostavka(i, 'naziv', e.target.value)}
                      placeholder={`Postavka ${i + 1}`}
                      className="flex-1 bg-border2 rounded-xl px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => removePostavka(i)}
                      disabled={postavke.length === 1}
                      className="w-7 h-7 flex items-center justify-center text-muted hover:text-red-400 transition-colors disabled:opacity-30"
                      aria-label="Odstrani postavko"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                  {/* Row 2: enota, kolicina, cena + skupaj */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={row.enota}
                      onChange={(e) => updatePostavka(i, 'enota', e.target.value)}
                      placeholder="m²"
                      className="w-14 bg-border2 rounded-xl px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent text-center"
                    />
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={row.kolicina}
                      onChange={(e) => updatePostavka(i, 'kolicina', e.target.value)}
                      placeholder="0"
                      className="w-18 bg-border2 rounded-xl px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent text-right"
                    />
                    <span className="text-muted text-xs shrink-0">×</span>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={row.cena_na_enoto}
                      onChange={(e) => updatePostavka(i, 'cena_na_enoto', e.target.value)}
                      placeholder="0.00"
                      className="w-22 bg-border2 rounded-xl px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent text-right"
                    />
                    <span className="text-xs text-muted shrink-0 ml-auto">
                      = {formatEur(rowTotal(row))}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Add row button */}
            <div className="px-4 py-3 border-t border-border">
              <button
                type="button"
                onClick={addPostavka}
                className="w-full py-2 rounded-xl border border-dashed border-border text-sm text-muted hover:border-accent hover:text-accent transition-colors"
              >
                + Dodaj postavko
              </button>
            </div>

            {/* Running totals */}
            <div className="border-t border-border px-4 py-3 flex flex-col gap-1.5 bg-border2 rounded-b-2xl">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted">Skupaj brez DDV</span>
                <span className="text-sm text-text font-medium">{formatEur(skupajBrezDdv)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted">DDV ({ddvStopnja || 0}%)</span>
                <span className="text-sm text-text">{formatEur(ddv)}</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-border">
                <span className="text-sm font-semibold text-text">Skupaj z DDV</span>
                <span className="text-base font-bold text-text">{formatEur(skupajZDdv)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Closing note */}
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Zaključni tekst (neobvezno)</label>
          <textarea
            rows={3}
            value={opombaKoncna}
            onChange={(e) => setOpombaKoncna(e.target.value)}
            className={inputClass}
            placeholder="Ponudba velja 30 dni..."
          />
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-2xl">{error}</p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-text text-white rounded-2xl py-3.5 text-sm font-semibold disabled:opacity-50 transition-opacity mt-2"
        >
          {saving ? 'Shranjujem…' : 'Shrani spremembe'}
        </button>
      </form>
    </div>
  );
}
