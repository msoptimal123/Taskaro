'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@/lib/supabase/client';
import imageCompression from 'browser-image-compression';

// ─── Types ────────────────────────────────────────────────────────────────────

type CompanySettings = {
  naziv: string;
  naslov_ulica: string;
  naslov_posta: string;
  davcna_stevilka: string;
  maticna_stevilka: string;
  telefon: string;
  email: string;
  spletna_stran: string;
  iban: string;
  bic_swift: string;
  banka: string;
  logo_path: string;
  privzeti_ddv: string;
  privzeta_veljavnost_dni: string;
  privzeta_opomba_zacetna: string;
  privzeta_opomba_koncna: string;
};

const EMPTY: CompanySettings = {
  naziv: '',
  naslov_ulica: '',
  naslov_posta: '',
  davcna_stevilka: '',
  maticna_stevilka: '',
  telefon: '',
  email: '',
  spletna_stran: '',
  iban: '',
  bic_swift: '',
  banka: '',
  logo_path: '',
  privzeti_ddv: '22',
  privzeta_veljavnost_dni: '30',
  privzeta_opomba_zacetna: '',
  privzeta_opomba_koncna: '',
};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function logoPublicUrl(path: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/company-logos/${path}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-2xs text-muted font-semibold uppercase tracking-widest mb-3 mt-6">
      {children}
    </h2>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-2xs text-muted font-medium uppercase tracking-wide mb-1">
      {children}
    </label>
  );
}

const inputClass =
  'w-full bg-border2 rounded-2xl px-4 py-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent placeholder:text-done';

function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = 'text',
  step,
}: {
  label: string;
  name: keyof CompanySettings;
  value: string;
  onChange: (name: keyof CompanySettings, val: string) => void;
  placeholder?: string;
  type?: string;
  step?: string | number;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        placeholder={placeholder}
        step={step}
        className={inputClass}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
      />
    </div>
  );
}

function TextareaField({
  label,
  name,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  name: keyof CompanySettings;
  value: string;
  onChange: (name: keyof CompanySettings, val: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <textarea
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        placeholder={placeholder}
        rows={3}
        className={`${inputClass} resize-none`}
      />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const supabase = createBrowserClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();

  const [form, setForm] = useState<CompanySettings>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('Nastavitve shranjene');
  const [userId, setUserId] = useState<string | null>(null);
  const [gmailEmail, setGmailEmail] = useState<string | null>(null);

  // Show Gmail connection status from URL params
  useEffect(() => {
    const gmailStatus = searchParams.get('gmail');
    if (gmailStatus === 'connected') {
      setToastMsg('Gmail uspešno povezan!');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } else if (gmailStatus === 'error') {
      setToastMsg('Napaka pri povezavi z Gmailom.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  }, [searchParams]);

  // ── Load settings on mount ──────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;
      setUserId(user.id);

      const res = await fetch('/api/settings');
      if (!res.ok) return;
      const json = await res.json();
      const d = json.data ?? {};

      setForm({
        naziv: d.naziv ?? '',
        naslov_ulica: d.naslov_ulica ?? '',
        naslov_posta: d.naslov_posta ?? '',
        davcna_stevilka: d.davcna_stevilka ?? '',
        maticna_stevilka: d.maticna_stevilka ?? '',
        telefon: d.telefon ?? '',
        email: d.email ?? '',
        spletna_stran: d.spletna_stran ?? '',
        iban: d.iban ?? '',
        bic_swift: d.bic_swift ?? '',
        banka: d.banka ?? '',
        logo_path: d.logo_path ?? '',
        privzeti_ddv: d.privzeti_ddv != null ? String(d.privzeti_ddv) : '22',
        privzeta_veljavnost_dni:
          d.privzeta_veljavnost_dni != null ? String(d.privzeta_veljavnost_dni) : '30',
        privzeta_opomba_zacetna: d.privzeta_opomba_zacetna ?? '',
        privzeta_opomba_koncna: d.privzeta_opomba_koncna ?? '',
      });
      setGmailEmail(d.gmail_connected_email ?? null);
      setLoading(false);
    }
    load();
  }, []);

  // ── Field change handler ────────────────────────────────────────────────────
  function handleChange(name: keyof CompanySettings, val: string) {
    setForm((prev) => ({ ...prev, [name]: val }));
  }

  // ── Save ────────────────────────────────────────────────────────────────────
  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          privzeti_ddv: form.privzeti_ddv !== '' ? Number(form.privzeti_ddv) : null,
          privzeta_veljavnost_dni:
            form.privzeta_veljavnost_dni !== '' ? Number(form.privzeta_veljavnost_dni) : null,
        }),
      });

      if (res.ok) {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  }

  // ── Logo upload ─────────────────────────────────────────────────────────────
  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    setUploading(true);
    try {
      // Compress
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 800,
        useWebWorker: true,
      });

      // Determine extension
      const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
      const path = `${userId}/logo.${ext}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('company-logos')
        .upload(path, compressed, { upsert: true, contentType: compressed.type });

      if (uploadError) {
        console.error('Logo upload error:', uploadError.message);
        return;
      }

      // Save logo_path
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logo_path: path }),
      });

      if (res.ok) {
        setForm((prev) => ({ ...prev, logo_path: path }));
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
      }
    } finally {
      setUploading(false);
      // Reset input so same file can be re-uploaded
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="px-5 py-6 pb-32">
        <div className="h-8 w-48 bg-border2 rounded-xl animate-pulse mb-6" />
        <div className="flex flex-col gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 bg-border2 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 py-6 pb-32">
      {/* Back link */}
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted mb-5">
        <span>←</span>
        <span>Nazaj</span>
      </Link>

      {/* Title */}
      <h1 className="font-serif text-3xl tracking-tighter text-text">Nastavitve podjetja</h1>

      {/* ── Logo ── */}
      <SectionHeading>Logotip</SectionHeading>

      <div className="flex items-center gap-4">
        {form.logo_path ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoPublicUrl(form.logo_path)}
            alt="Logotip podjetja"
            className="w-16 h-16 rounded-2xl object-contain bg-border2 border border-border"
          />
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-border2 border border-border flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="3" stroke="#B5B0A8" strokeWidth="1.5" />
              <circle cx="8.5" cy="8.5" r="1.5" stroke="#B5B0A8" strokeWidth="1.5" />
              <path d="M3 15l5-4 4 3 3-2 6 5" stroke="#B5B0A8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}

        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2 bg-text text-white rounded-2xl text-sm font-semibold disabled:opacity-50"
          >
            {uploading ? 'Nalagam...' : 'Naloži logotip'}
          </button>
          <p className="text-2xs text-muted">PNG, JPG, SVG do 2 MB</p>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleLogoChange}
      />

      {/* ── Podjetje ── */}
      <SectionHeading>Podjetje</SectionHeading>

      <div className="flex flex-col gap-3">
        <Field
          label="Naziv podjetja"
          name="naziv"
          value={form.naziv}
          onChange={handleChange}
          placeholder="Vaše podjetje d.o.o."
        />
        <Field
          label="Naslov"
          name="naslov_ulica"
          value={form.naslov_ulica}
          onChange={handleChange}
          placeholder="Ulica 1"
        />
        <Field
          label="Poštna številka in kraj"
          name="naslov_posta"
          value={form.naslov_posta}
          onChange={handleChange}
          placeholder="2000 Maribor"
        />
        <Field
          label="Davčna številka"
          name="davcna_stevilka"
          value={form.davcna_stevilka}
          onChange={handleChange}
          placeholder="SI12345678"
        />
        <Field
          label="Matična številka"
          name="maticna_stevilka"
          value={form.maticna_stevilka}
          onChange={handleChange}
          placeholder="1234567"
        />
      </div>

      {/* ── Kontakt ── */}
      <SectionHeading>Kontakt</SectionHeading>

      <div className="flex flex-col gap-3">
        <Field
          label="Telefon"
          name="telefon"
          value={form.telefon}
          onChange={handleChange}
          placeholder="+386 40 123 456"
          type="tel"
        />
        <Field
          label="E-pošta"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="info@podjetje.si"
          type="email"
        />
        <Field
          label="Spletna stran"
          name="spletna_stran"
          value={form.spletna_stran}
          onChange={handleChange}
          placeholder="https://www.podjetje.si"
          type="url"
        />
      </div>

      {/* ── Bančni podatki ── */}
      <SectionHeading>Bančni podatki</SectionHeading>

      <div className="flex flex-col gap-3">
        <Field
          label="IBAN"
          name="iban"
          value={form.iban}
          onChange={handleChange}
          placeholder="SI56 0000 0000 0000 000"
        />
        <Field
          label="BIC/SWIFT"
          name="bic_swift"
          value={form.bic_swift}
          onChange={handleChange}
          placeholder="BACXSI22"
        />
        <Field
          label="Banka"
          name="banka"
          value={form.banka}
          onChange={handleChange}
          placeholder="Nova KBM d.d."
        />
      </div>

      {/* ── Privzete vrednosti ponudb ── */}
      <SectionHeading>Privzete vrednosti ponudb</SectionHeading>

      <div className="flex flex-col gap-3">
        <Field
          label="DDV %"
          name="privzeti_ddv"
          value={form.privzeti_ddv}
          onChange={handleChange}
          placeholder="22"
          type="number"
          step={0.5}
        />
        <Field
          label="Veljavnost ponudbe v dneh"
          name="privzeta_veljavnost_dni"
          value={form.privzeta_veljavnost_dni}
          onChange={handleChange}
          placeholder="30"
          type="number"
        />
        <TextareaField
          label="Začetna opomba"
          name="privzeta_opomba_zacetna"
          value={form.privzeta_opomba_zacetna}
          onChange={handleChange}
          placeholder="Spoštovani, v prilogi pošiljam ponudbo..."
        />
        <TextareaField
          label="Končna opomba"
          name="privzeta_opomba_koncna"
          value={form.privzeta_opomba_koncna}
          onChange={handleChange}
          placeholder="Plačilo v 8 dneh po prejemu računa..."
        />
      </div>

      {/* ── Gmail integracija ── */}
      <SectionHeading>Gmail integracija</SectionHeading>
      <div className="bg-card rounded-2xl p-4 flex items-center justify-between gap-3">
        {gmailEmail ? (
          <>
            <div>
              <p className="text-sm font-semibold text-text">Povezan</p>
              <p className="text-xs text-muted mt-0.5">{gmailEmail}</p>
            </div>
            <span className="text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">Aktiven</span>
          </>
        ) : (
          <>
            <div>
              <p className="text-sm font-semibold text-text">Gmail ni povezan</p>
              <p className="text-xs text-muted mt-0.5">Potrebno za pošiljanje ponudb</p>
            </div>
            <a
              href="/api/auth/gmail"
              className="bg-text text-white rounded-xl px-4 py-2 text-sm font-semibold whitespace-nowrap"
            >
              Poveži Gmail
            </a>
          </>
        )}
      </div>

      {/* ── Save button ── */}
      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-text text-white rounded-2xl py-3.5 text-sm font-semibold mt-8 disabled:opacity-60 active:opacity-80 transition-opacity"
      >
        {saving ? 'Shranjujem...' : 'Shrani nastavitve'}
      </button>

      {/* ── Toast ── */}
      {showToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-text text-white rounded-2xl px-6 py-3 text-sm z-50 shadow-modal pointer-events-none">
          {toastMsg}
        </div>
      )}
    </div>
  );
}
