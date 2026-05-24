'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateClient } from '@/app/(app)/actions';
import type { Client } from '@/types/domain';

const inputClass =
  'w-full bg-border2 rounded-2xl px-4 py-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent';

export default function ClientEditForm({ client }: { client: Client }) {
  const [name, setName] = useState(client.name);
  const [phone, setPhone] = useState(client.phone ?? '');
  const [email, setEmail] = useState(client.email ?? '');
  const [notes, setNotes] = useState(client.notes ?? '');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      await updateClient(client.id, {
        name,
        phone: phone || null,
        email: email || null,
        notes: notes || null,
      });
      router.push(`/clients/${client.id}`);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
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
        />
      </div>

      <div className="flex flex-col gap-1">
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

      <div className="flex flex-col gap-1">
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

      <div className="flex flex-col gap-1">
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

      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={() => router.push(`/clients/${client.id}`)}
          disabled={isPending}
          className="flex-1 rounded-2xl py-3 text-sm font-semibold border border-border text-muted disabled:opacity-50"
        >
          Prekliči
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 bg-text text-white rounded-2xl py-3 text-sm font-semibold disabled:opacity-50"
        >
          {isPending ? 'Shranjujem…' : 'Shrani'}
        </button>
      </div>
    </form>
  );
}
