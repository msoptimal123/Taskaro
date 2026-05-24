'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/app/(app)/actions';

const inputClass =
  'w-full bg-border2 rounded-2xl px-4 py-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent';

function NewClientForm() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      await createClient({
        name,
        phone: phone || null,
        email: email || null,
        notes: notes || null,
      });
      router.push('/clients');
    });
  }

  return (
    <div className="px-5 py-6 pb-32 flex flex-col gap-6">
      {/* Back link */}
      <Link href="/clients" className="flex items-center gap-1 text-muted text-sm -ml-0.5">
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

      {/* Title */}
      <h1 className="font-serif text-3xl tracking-tighter text-text">Nova stranka</h1>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-2xs text-muted font-medium uppercase tracking-wide">
            Ime in priimek *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
            placeholder="Janez Novak"
            autoFocus
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-2xs text-muted font-medium uppercase tracking-wide">
            Telefon
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputClass}
            placeholder="+386 41 123 456"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-2xs text-muted font-medium uppercase tracking-wide">
            E-pošta
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="janez@primer.si"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-2xs text-muted font-medium uppercase tracking-wide">
            Opombe
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={inputClass}
            placeholder="Dodatne opombe..."
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-text text-white rounded-2xl py-3.5 text-sm font-semibold disabled:opacity-50 mt-2"
        >
          {isPending ? 'Shranjujem…' : 'Dodaj stranko'}
        </button>
      </form>
    </div>
  );
}

export default function NewClientPage() {
  return <NewClientForm />;
}
