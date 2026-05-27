'use client';

import { useState, useEffect, useCallback } from 'react';
import { useVoiceCapture } from '@/lib/voice/useVoiceCapture';
import { createFromVoiceMulti } from '@/app/(app)/actions';
import type { ParsedIntent, TaskType } from '@/types/domain';

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ModalState = 'idle' | 'listening' | 'parsing' | 'review' | 'saving';

type IntentType = TaskType | 'note' | 'ponudba';

const TYPE_COLORS: Record<IntentType, string> = {
  task: '#3B82F6',
  deadline: '#D97706',
  rezervacija: '#7C3AED',
  note: '#6B7280',
  ponudba: '#C2692A',
};

const TYPE_LABELS: Record<IntentType, string> = {
  task: 'Naloga',
  deadline: 'Rok',
  rezervacija: 'Rezervacija',
  note: 'Zapis',
  ponudba: 'Ponudba',
};

export default function VoiceModal({ isOpen, onClose }: VoiceModalProps) {
  const [modalState, setModalState] = useState<ModalState>('idle');
  const [intents, setIntents] = useState<ParsedIntent[] | null>(null);
  const [editedTranscript, setEditedTranscript] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const { isListening, transcript, finalTranscript, start, stop, reset, error } = useVoiceCapture();

  // When modal closes, reset everything
  useEffect(() => {
    if (!isOpen) {
      reset();
      setModalState('idle');
      setIntents(null);
      setEditedTranscript('');
      setSaveError(null);
    }
  }, [isOpen, reset]);

  // When finalTranscript arrives, start parsing
  useEffect(() => {
    if (!finalTranscript) return;
    setEditedTranscript(finalTranscript);
    setModalState('parsing');

    fetch('/api/voice/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript: finalTranscript }),
    })
      .then((r) => r.json())
      .then((data: { intents: ParsedIntent[]; transcript: string }) => {
        setIntents(data.intents);
        setModalState('review');
      })
      .catch(() => {
        setSaveError('Napaka pri analizi glasovnega vnosa.');
        setModalState('idle');
      });
  }, [finalTranscript]);

  // When recognition ends without producing a final transcript, go back to idle
  useEffect(() => {
    if (isListening) return;
    if (modalState !== 'listening') return;
    // Give the browser 600ms to fire onFinal — if nothing, reset to idle
    const timer = setTimeout(() => {
      setModalState(prev => prev === 'listening' ? 'idle' : prev);
    }, 600);
    return () => clearTimeout(timer);
  }, [isListening]); // eslint-disable-line react-hooks/exhaustive-deps

  // Mirror isListening into modalState
  useEffect(() => {
    if (isListening) setModalState('listening');
  }, [isListening]);

  const handleStart = useCallback(() => {
    reset();
    setIntents(null);
    setSaveError(null);
    setModalState('listening');
    start();
  }, [reset, start]);

  const handleStop = useCallback(() => {
    stop();
    // parsing state will be set after finalTranscript effect
  }, [stop]);

  const handleRetry = useCallback(() => {
    reset();
    setIntents(null);
    setSaveError(null);
    setModalState('idle');
  }, [reset]);

  const handleSave = useCallback(async () => {
    if (!intents) return;
    setModalState('saving');
    try {
      await createFromVoiceMulti(intents, editedTranscript);
      onClose();
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Napaka pri shranjevanju');
      setModalState('review');
    }
  }, [intents, editedTranscript, onClose]);

  const handleOverlayClick = useCallback(() => {
    if (modalState === 'listening') {
      handleStop();
    } else {
      onClose();
    }
  }, [modalState, handleStop, onClose]);

  if (!isOpen && !showToast) return null;

  return (
    <>
      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] bg-text text-white text-sm font-medium px-4 py-2.5 rounded-full shadow-modal animate-fade-in">
          Shranjeno
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/45"
            onClick={handleOverlayClick}
          />

          {/* Bottom sheet */}
          <div
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 pb-8 overflow-y-auto"
            style={{ maxHeight: '80vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <span className="text-base font-semibold text-text">Nov vnos</span>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full text-muted hover:bg-border transition-colors"
                aria-label="Zapri"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <line x1="4" y1="4" x2="14" y2="14" />
                  <line x1="14" y1="4" x2="4" y2="14" />
                </svg>
              </button>
            </div>

            {/* Idle state */}
            {modalState === 'idle' && (
              <div className="flex flex-col items-center gap-5 py-6">
                <p className="text-sm text-muted text-center">
                  Pritisnite mikrofon in spregovorite nalogo, rok ali rezervacijo.
                </p>
                {(error ?? saveError) && (
                  <p className="text-sm text-red-500 text-center">{error ?? saveError}</p>
                )}
                <button
                  type="button"
                  onClick={handleStart}
                  className="flex items-center justify-center rounded-full shadow-mic focus:outline-none"
                  style={{
                    width: 72,
                    height: 72,
                    background: 'linear-gradient(135deg, #1A1714 0%, #2D2520 100%)',
                  }}
                >
                  <svg width="30" height="30" viewBox="0 0 30 30" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="11" y="3" width="8" height="16" rx="4" />
                    <path d="M7 15c0 4.4 3.6 8 8 8s8-3.6 8-8" />
                    <line x1="15" y1="23" x2="15" y2="27" />
                    <line x1="11" y1="27" x2="19" y2="27" />
                  </svg>
                </button>
              </div>
            )}

            {/* Listening state */}
            {modalState === 'listening' && (
              <div className="flex flex-col gap-4">
                <div
                  className="bg-border2 rounded-2xl p-4 min-h-16 text-sm text-text"
                  style={{ minHeight: 64 }}
                >
                  {transcript || (
                    <span className="text-muted">Poslušam...</span>
                  )}
                </div>
                <div className="flex items-center justify-center gap-2 py-2">
                  {[0, 150, 300].map((delay) => (
                    <span
                      key={delay}
                      className="inline-block w-2 h-2 rounded-full bg-accent animate-dot-bounce"
                      style={{ animationDelay: `${delay}ms` }}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted text-center">Tapnite prekrivalo za ustavitev</p>
                <button
                  type="button"
                  onClick={handleStop}
                  className="w-full py-3 rounded-2xl border border-border text-sm text-muted"
                >
                  Ustavi snemanje
                </button>
              </div>
            )}

            {/* Parsing state */}
            {modalState === 'parsing' && (
              <div className="flex flex-col items-center gap-4 py-8">
                <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-muted">Analiziram...</p>
              </div>
            )}

            {/* Review state */}
            {modalState === 'review' && intents && (
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-xs text-muted mb-1 block">Prepisano besedilo</label>
                  <textarea
                    value={editedTranscript}
                    onChange={(e) => setEditedTranscript(e.target.value)}
                    rows={3}
                    className="w-full bg-border2 rounded-2xl p-4 text-sm text-text resize-none focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                {/* Intent list */}
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-muted">
                    Zaznano
                    {intents.length > 1 && (
                      <span className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-accent text-white text-2xs font-semibold">
                        {intents.length}
                      </span>
                    )}
                  </p>
                  {intents.map((intent, i) => {
                    const color = TYPE_COLORS[intent.type as IntentType] ?? '#6B7280';
                    const label = TYPE_LABELS[intent.type as IntentType] ?? intent.type;
                    return (
                      <div key={i} className="bg-border2 rounded-2xl p-3 flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold text-white shrink-0"
                            style={{ backgroundColor: color }}
                          >
                            {label}
                          </span>
                          <p className="text-sm font-semibold text-text truncate">{intent.title}</p>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {intent.due_date && (
                            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs bg-border text-muted2">
                              {intent.due_date}
                            </span>
                          )}
                          {intent.start_date && !intent.due_date && (
                            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs bg-border text-muted2">
                              {intent.start_date}{intent.end_date ? ` — ${intent.end_date}` : ''}
                            </span>
                          )}
                          {intent.client_name && (
                            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs bg-border text-muted2">
                              {intent.client_name}
                            </span>
                          )}
                          {intent.location && (
                            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs bg-border text-muted2">
                              {intent.location}
                            </span>
                          )}
                          {intent.ponudba_postavke && intent.ponudba_postavke.length > 0 && (
                            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs bg-border text-muted2">
                              {intent.ponudba_postavke.length} postavk
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {saveError && (
                  <p className="text-sm text-red-500">{saveError}</p>
                )}

                {/* Action buttons */}
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="flex-1 py-3 rounded-2xl border border-border text-sm font-medium text-text"
                  >
                    Poskusi znova
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="flex-1 py-3 rounded-2xl bg-text text-white text-sm font-medium"
                  >
                    Shrani{intents.length > 1 ? ` (${intents.length})` : ''}
                  </button>
                </div>
              </div>
            )}

            {/* Saving state */}
            {modalState === 'saving' && (
              <div className="flex flex-col items-center gap-4 py-8">
                <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-muted">Shranjujem...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
