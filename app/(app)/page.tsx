import { createServerClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="px-5 py-6">
      <p className="text-muted text-sm">Dober dan,</p>
      <h1 className="font-serif text-3xl tracking-tighter mt-0.5">
        {user?.email?.split('@')[0] ?? 'Janez'}
      </h1>
      <p className="text-muted text-sm mt-2">Dashboard — kmalu na voljo</p>
    </div>
  );
}
