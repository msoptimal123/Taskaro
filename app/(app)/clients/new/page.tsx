'use client';
import { useState, useTransition, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/app/(app)/actions';

const inputClass =
  'w-full bg-border2 rounded-2xl px-4 py-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent';

// Contact Picker API types
interface ContactInfo {
  name?: string[];
  tel?: string[];
  email?: string[];
}
interface ContactsManager {
  select(props: string[], opts?: { multiple: boolean }): Promise<ContactInfo[]>;
}
declare global {
  interface Navigator { contacts?: ContactsManager; }
}

function NewClientForm() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [isPending, startTransition] = useTransition();
  const [contactsSupported, setContactsSupported] = useState(false);
  const [scanning, setScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    setContactsSupported(!!navigator.contacts);
  }, []);

  async function handleScanImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setScanning(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await fetch('/api/vision/contact', { method: 'POST', body: fd });
      const data = await res.json() as { name: string | null; phone: string | null; email: string | null };
      if (data.name) setName(data.name);
      if (data.phone) setPhone(data.phone);
      if (data.email) setEmail(data.email);
    } catch {
      // silently fail — user can fill manually
    } finally {
      setScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleImportContact() {
    if (!navigator.contacts) return;
    try {
      const results = await navigator.contacts.select(['name', 'tel', 'email'], { multiple: false });
      if (!results.length) return;
      const contact = results[0];
      if (contact.name?.[0]) setName(contact.name[0]);
      if (contact.tel?.[0]) setPhone(contact.tel[0]);
      if (contact.email?.[0]) setEmail(contact.email[0]);
    } catch {
      // User cancelled or permission denied
    }
  }

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
          <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Nazaj
      </Link>

      {/* Hidden file input for scan */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleScanImage}
      />

      {/* Title + import buttons */}
      <div className="flex flex-col gap-3">
        <h1 className="font-serif text-3xl tracking-tighter text-text">Nova stranka</h1>
        <div className="flex gap-2">
          {/* Scan screenshot / photo */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={scanning}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-2xl border border-border bg-card text-sm font-medium text-text active:bg-border2 transition-colors disabled:opacity-50"
          >
            {scanning ? (
              <>
                <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                Berem...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <rect x="2" y="4" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
                  <circle cx="8" cy="8.5" r="2" stroke="currentColor" strokeWidth="1.4"/>
                  <path d="M6 4V3.5A1.5 1.5 0 0 1 7.5 2h1A1.5 1.5 0 0 1 10 3.5V4" stroke="currentColor" strokeWidth="1.4"/>
                </svg>
                Skeniraj kontakt
              </>
            )}
          </button>
          {/* Import from contacts (Android/supported browsers) */}
          {contactsSupported && (
            <button
              type="button"
              onClick={handleImportContact}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-2xl border border-border bg-card text-sm font-medium text-text active:bg-border2 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="6.5" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M2 13c0-2.5 2-4.5 4.5-4.5S11 10.5 11 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                <path d="M13 6v4M11 8h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              Iz imenika
            </button>
          )}
        </div>
        <p className="text-2xs text-muted">
          Skeniraj slikaj vizitko, screenshot stika ali kontakt iz telefona.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-2xs text-muted font-medium uppercase tracking-wide">Ime *</label>
          <input
            type="text" required value={name} onChange={(e) => setName(e.target.value)}
            className={inputClass} placeholder="Janez Novak" autoFocus
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-2xs text-muted font-medium uppercase tracking-wide">Telefon</label>
          <input
            type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
            className={inputClass} placeholder="+386 41 123 456"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-2xs text-muted font-medium uppercase tracking-wide">E-pošta</label>
          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            className={inputClass} placeholder="janez@primer.si"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-2xs text-muted font-medium uppercase tracking-wide">Opombe</label>
          <textarea
            rows={3} value={notes} onChange={(e) => setNotes(e.target.value)}
            className={inputClass} placeholder="Dodatne opombe..."
          />
        </div>

        <button
          type="submit" disabled={isPending}
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
