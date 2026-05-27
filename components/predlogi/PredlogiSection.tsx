'use client';
import { useState, useEffect } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import PredlogCard from './PredlogCard';
import type { Predlog } from '@/types/domain';

interface PredlogiSectionProps {
  entityType?: string;
  entityId?: string;
  limit?: number;
}

export default function PredlogiSection({ entityType, entityId, limit = 5 }: PredlogiSectionProps) {
  const [predlogi, setPredlogi] = useState<Predlog[]>([]);

  useEffect(() => {
    const supabase = createBrowserClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let query: any = supabase
        .from('predlogi')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'aktiven')
        .order('prioriteta', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit);

      if (entityType) query = query.eq('entity_type', entityType);
      if (entityId) query = query.eq('entity_id', entityId);

      query.then(({ data }: { data: Predlog[] | null }) => {
        if (data) setPredlogi(data);
      });
    });
  }, [entityType, entityId, limit]);

  function handleHandled(id: string) {
    setPredlogi(prev => prev.filter(p => p.id !== id));
  }

  if (predlogi.length === 0) return null;

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">Predlogi</h2>
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-accent text-white text-2xs font-semibold">
          {predlogi.length}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {predlogi.map(p => (
          <PredlogCard key={p.id} predlog={p} onHandled={handleHandled} />
        ))}
      </div>
    </section>
  );
}
