import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import BottomTabBar from '@/components/nav/BottomTabBar';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return (
    <div className="flex flex-col h-screen max-w-lg mx-auto bg-bg">
      <main className="flex-1 overflow-y-auto overscroll-none">
        {children}
      </main>
      <BottomTabBar />
    </div>
  );
}
