'use client';
import { useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function SignupPage() {
  const supabase = createBrowserClient();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name.trim() } },
    });
    setLoading(false);
    if (error) { setError(error.message); return; }
    // If session is set immediately, email confirmation is disabled — redirect
    if (data.session) {
      window.location.href = '/';
      return;
    }
    // Otherwise email confirmation is required
    setDone(true);
  };

  if (done) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-5">
        <div className="w-full max-w-sm text-center flex flex-col gap-4">
          <div className="w-16 h-16 rounded-full bg-border2 flex items-center justify-center mx-auto">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M4 14l7 7L24 7" stroke="#C2692A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="font-serif text-3xl tracking-tighter">Preverite e-pošto</h1>
          <p className="text-muted text-sm leading-relaxed">
            Poslali smo potrditveno sporočilo na <strong className="text-text">{email}</strong>.<br/>
            Kliknite na povezavo v e-pošti da aktivirate račun.
          </p>
          <Link href="/login" className="text-accent text-sm font-medium">
            Nazaj na vpis
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <h1 className="font-serif text-4xl mb-1 tracking-tighter">Taskaro</h1>
        <p className="text-muted text-sm mb-8">Ustvari račun</p>

        <form onSubmit={handleSignup} className="flex flex-col gap-3">
          <input
            type="text" value={name} onChange={e => setName(e.target.value)}
            placeholder="Ime in priimek" required
            className="w-full bg-white border border-border rounded-2xl px-4 py-3 text-sm outline-none focus:border-accent transition-colors"
          />
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="E-pošta" required
            className="w-full bg-white border border-border rounded-2xl px-4 py-3 text-sm outline-none focus:border-accent transition-colors"
          />
          <input
            type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="Geslo (min. 6 znakov)" required minLength={6}
            className="w-full bg-white border border-border rounded-2xl px-4 py-3 text-sm outline-none focus:border-accent transition-colors"
          />
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button
            type="submit" disabled={loading}
            className="w-full bg-text text-white rounded-2xl py-3 text-sm font-semibold disabled:opacity-50 transition-opacity"
          >
            {loading ? 'Ustvarjanje...' : 'Registracija'}
          </button>
        </form>

        <p className="text-center text-sm text-muted mt-6">
          Že imaš račun?{' '}
          <Link href="/login" className="text-accent font-medium">Vpiši se</Link>
        </p>
      </div>
    </div>
  );
}
