'use client';
import { useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const supabase = createBrowserClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) { setError(error.message); setLoading(false); return; }
    router.push('/');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <h1 className="font-serif text-4xl mb-1 tracking-tighter">Taskaro</h1>
        <p className="text-muted text-sm mb-8">Ustvari račun</p>

        <form onSubmit={handleSignup} className="flex flex-col gap-3">
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
