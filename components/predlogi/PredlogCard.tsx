'use client';
import { useState } from 'react';
import type { Predlog } from '@/types/domain';

interface PredlogCardProps {
  predlog: Predlog;
  onHandled: (id: string) => void;
}

export default function PredlogCard({ predlog, onHandled }: PredlogCardProps) {
  const [loading, setLoading] = useState<'accept' | 'decline' | 'dismiss' | null>(null);

  async function handle(action: 'accept' | 'decline' | 'dismiss') {
    setLoading(action);
    try {
      if (action === 'dismiss') {
        await fetch(`/api/predlogi/${predlog.id}/dismiss`, { method: 'POST' });
      } else {
        await fetch(`/api/predlogi/${predlog.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accept: action === 'accept' }),
        });
      }
      onHandled(predlog.id);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="bg-card rounded-2xl shadow-card px-4 py-3 flex flex-col gap-2.5 border-l-4 border-accent">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text leading-snug">{predlog.naslov}</p>
          {predlog.opis && (
            <p className="text-xs text-muted mt-0.5 leading-relaxed">{predlog.opis}</p>
          )}
        </div>
        <button
          onClick={() => handle('dismiss')}
          disabled={!!loading}
          className="text-muted text-lg leading-none mt-0.5 shrink-0 active:text-text transition-colors"
          aria-label="Skrij"
        >
          ×
        </button>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => handle('accept')}
          disabled={!!loading}
          className="flex-1 bg-text text-white rounded-xl py-2 text-sm font-semibold disabled:opacity-50 active:opacity-80 transition-opacity"
        >
          {loading === 'accept' ? '…' : predlog.akcija_label}
        </button>
        {predlog.sekundarna_label && (
          <button
            onClick={() => handle('decline')}
            disabled={!!loading}
            className="flex-1 bg-border2 text-text rounded-xl py-2 text-sm font-medium disabled:opacity-50 active:opacity-70 transition-opacity"
          >
            {loading === 'decline' ? '…' : predlog.sekundarna_label}
          </button>
        )}
      </div>

      {predlog.vir === 'voice' && (
        <p className="text-2xs text-done">Iz glasovnega vnosa</p>
      )}
    </div>
  );
}
