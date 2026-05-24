'use client';

// NOTE: This page is a server component (default export) that fetches clients
// and passes them to the NewProjectForm client component defined below.
// Next.js supports mixing server and client code in the same file this way
// only when the server component is the default export and client components
// are used as children — here we put the client component in the same file
// to avoid a separate import while keeping the server fetch at the top level.
//
// Since this file contains 'use client' at the top, we use a workaround:
// the entire page is a client component that fetches clients via a separate
// server component wrapper. See implementation below.

import { useEffect, useState, useTransition, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createProject } from '@/app/(app)/actions';
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

// ─── Constants ────────────────────────────────────────────────────────────────

const COLORS = ['#2DB87A', '#3B82F6', '#D97706', '#7C3AED', '#C2692A', '#EF4444'];

// ─── Input styling ────────────────────────────────────────────────────────────

const INPUT_CLASS =
  'w-full bg-border2 rounded-2xl px-4 py-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent';

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NewProjectPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Form state
  const [title, setTitle] = useState('');
  const [clientId, setClientId] = useState<string>('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [obseg, setObseg] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [color, setColor] = useState(COLORS[0]);

  // Clients list fetched from Supabase on the client
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    const supabase = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    supabase
      .from('clients')
      .select('id, name')
      .order('name')
      .then(({ data }) => {
        if (data) setClients(data);
      });
  }, []);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      await createProject({
        title,
        client_id: clientId || null,
        description: description || null,
        location: location || null,
        obseg: obseg || null,
        start_date: startDate || null,
        end_date: endDate || null,
        color,
      });
      router.push('/projects');
    });
  }

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
        Nazaj
      </Link>

      {/* Page title */}
      <h1 className="font-serif text-3xl tracking-tighter text-text">Nov projekt</h1>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Naslov (required) */}
        <label className="flex flex-col gap-1.5">
          <span className="text-2xs font-semibold uppercase tracking-wide text-muted">
            Naslov <span className="text-accent">*</span>
          </span>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Npr. Kopalnica pri Novaku"
            className={INPUT_CLASS}
          />
        </label>

        {/* Stranka */}
        <label className="flex flex-col gap-1.5">
          <span className="text-2xs font-semibold uppercase tracking-wide text-muted">
            Stranka
          </span>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className={INPUT_CLASS}
          >
            <option value="">— brez stranke —</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        {/* Lokacija */}
        <label className="flex flex-col gap-1.5">
          <span className="text-2xs font-semibold uppercase tracking-wide text-muted">
            Lokacija
          </span>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Naslov ali kraj"
            className={INPUT_CLASS}
          />
        </label>

        {/* Obseg */}
        <label className="flex flex-col gap-1.5">
          <span className="text-2xs font-semibold uppercase tracking-wide text-muted">
            Obseg (m²)
          </span>
          <input
            type="text"
            value={obseg}
            onChange={(e) => setObseg(e.target.value)}
            placeholder="Npr. 24"
            className={INPUT_CLASS}
          />
        </label>

        {/* Termin */}
        <div className="flex flex-col gap-1.5">
          <span className="text-2xs font-semibold uppercase tracking-wide text-muted">
            Termin
          </span>
          <div className="flex gap-3">
            <label className="flex-1 flex flex-col gap-1">
              <span className="text-xs text-muted2">Od</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={INPUT_CLASS}
              />
            </label>
            <label className="flex-1 flex flex-col gap-1">
              <span className="text-xs text-muted2">Do</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={INPUT_CLASS}
              />
            </label>
          </div>
        </div>

        {/* Opis */}
        <label className="flex flex-col gap-1.5">
          <span className="text-2xs font-semibold uppercase tracking-wide text-muted">
            Opis
          </span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Kratki opis dela…"
            className={`${INPUT_CLASS} resize-none`}
          />
        </label>

        {/* Color picker */}
        <div className="flex flex-col gap-2">
          <span className="text-2xs font-semibold uppercase tracking-wide text-muted">
            Barva projekta
          </span>
          <div className="flex gap-3">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                aria-label={`Barva ${c}`}
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-90"
                style={{ backgroundColor: c }}
              >
                {color === c && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path
                      d="M3 8L6.5 11.5L13 5"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending || !title.trim()}
          className={`
            w-full bg-text text-white rounded-2xl py-3.5 font-semibold text-sm
            transition-opacity
            ${isPending || !title.trim() ? 'opacity-50' : 'active:opacity-80'}
          `}
        >
          {isPending ? 'Ustvarjam…' : 'Ustvari projekt'}
        </button>
      </form>
    </div>
  );
}
