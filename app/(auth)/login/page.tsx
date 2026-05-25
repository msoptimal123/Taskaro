'use client';
import { useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createBrowserClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); return; }
    router.push('/');
    router.refresh();
  };

  const handleGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setError('Google prijava ni konfigurirana. Prosimo, uporabite e-pošto in geslo.');
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <h1 className="font-serif text-4xl mb-1 tracking-tighter">Taskaro</h1>
        <p className="text-muted text-sm mb-8">Vpis v račun</p>

        <form onSubmit={handleLogin} className="flex flex-col gap-3">
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="E-pošta" required
            className="w-full bg-white border border-border rounded-2xl px-4 py-3 text-sm outline-none focus:border-accent transition-colors"
          />
          <input
            type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="Geslo" required
            className="w-full bg-white border border-border rounded-2xl px-4 py-3 text-sm outline-none focus:border-accent transition-colors"
          />
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button
            type="submit" disabled={loading}
            className="w-full bg-text text-white rounded-2xl py-3 text-sm font-semibold disabled:opacity-50 transition-opacity"
          >
            {loading ? 'Vpisovanje...' : 'Vpiši se'}
          </button>
        </form>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-muted text-xs">ali</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <button
          onClick={handleGoogle}
          className="w-full bg-white border border-border rounded-2xl py-3 text-sm font-medium flex items-center justify-center gap-2 hover:border-muted2 transition-colors"
        >
          <GoogleIcon />
          Nadaljuj z Google
        </button>

        <p className="text-center text-sm text-muted mt-6">
          Nimaš računa?{' '}
          <Link href="/signup" className="text-accent font-medium">Registracija</Link>
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18L12.048 13.56C11.243 14.1 10.212 14.42 9 14.42c-3.321 0-6.138-2.242-7.142-5.25H-.036v2.332C1.447 15.983 4.98 18 9 18z" fill="#34A853"/>
      <path d="M1.858 9.17A5.4 5.4 0 0 1 1.77 8c0-.403.069-.793.088-1.17V4.497H-1.036A9.01 9.01 0 0 0 0 9c0 1.453.348 2.827.964 4.042L1.858 9.17z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 4.98 0 1.447 2.017-.036 4.957l2.894 2.332C3.862 5.82 6.679 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}
