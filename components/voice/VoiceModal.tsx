'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useVoiceCapture } from '@/lib/voice/useVoiceCapture';
import { createFromVoiceForm, type VoiceFormPayload } from '@/app/(app)/actions';
import { createBrowserClient } from '@/lib/supabase/client';

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ModalState = 'idle' | 'listening' | 'parsing' | 'form' | 'saving';

interface Project {
  id: string;
  title: string;
}

interface FormState {
  type: 'task' | 'project';
  title: string;
  date: string;
  date_end: string;
  time: string;
  client_name: string;
  project_id: string; // existing project id | 'new' | 'none'
  project_name: string; // for project_id === 'new'
  location: string;
  description: string;
  // ponudba
  ponudba_detected: boolean;
  ustvari_ponudbo: boolean;
  rezerviraj_termin: boolean;
  deadline_5_dni: boolean;
  ponudba_title: string;
  ponudba_postavke: Array<{ naziv: string; enota?: string; kolicina?: number; cena_na_enoto?: number }>;
}

const EMPTY_FORM: FormState = {
  type: 'task',
  title: '',
  date: '',
  date_end: '',
  time: '',
  client_name: '',
  project_id: 'none',
  project_name: '',
  location: '',
  description: '',
  ponudba_detected: false,
  ustvari_ponudbo: false,
  rezerviraj_termin: false,
  deadline_5_dni: false,
  ponudba_title: '',
  ponudba_postavke: [],
};

export default function VoiceModal({ isOpen, onClose }: VoiceModalProps) {
  const [modalState, setModalState] = useState<ModalState>('idle');
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [transcript, setTranscriptState] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const { isListening, transcript: liveTranscript, finalTranscript, start, stop, reset, error: voiceError } = useVoiceCapture();
  const projectsFetched = useRef(false);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      reset();
      setModalState('idle');
      setForm(EMPTY_FORM);
      setTranscriptState('');
      setSaveError(null);
      setFieldErrors({});
      projectsFetched.current = false;
    }
  }, [isOpen, reset]);

  // Sync isListening → modalState
  useEffect(() => {
    if (isListening) setModalState('listening');
  }, [isListening]);

  // When isListening stops while in listening state, wait 600ms then go idle if no final
  useEffect(() => {
    if (isListening) return;
    if (modalState !== 'listening') return;
    const timer = setTimeout(() => {
      setModalState(prev => prev === 'listening' ? 'idle' : prev);
    }, 600);
    return () => clearTimeout(timer);
  }, [isListening]); // eslint-disable-line react-hooks/exhaustive-deps

  // When finalTranscript arrives, call parse API
  useEffect(() => {
    if (!finalTranscript) return;
    setTranscriptState(finalTranscript);
    setModalState('parsing');

    fetch('/api/voice/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript: finalTranscript }),
    })
      .then(r => r.json())
      .then((data: { form: {
        type: 'task' | 'project';
        title: string;
        date: string | null;
        date_end: string | null;
        time: string | null;
        client_name: string | null;
        project_name: string | null;
        location: string | null;
        description: string | null;
        ponudba: { detected: true; title: string | null; postavke?: Array<{ naziv: string; enota?: string; kolicina?: number; cena_na_enoto?: number }> } | null;
      }; transcript: string }) => {
        const f = data.form;
        const ponudbaDetected = !!f.ponudba;
        setForm({
          type: f.type,
          title: f.title ?? '',
          date: f.date ?? '',
          date_end: f.date_end ?? '',
          time: f.time ?? '',
          client_name: f.client_name ?? '',
          project_id: 'none',
          project_name: f.project_name ?? '',
          location: f.location ?? '',
          description: f.description ?? '',
          ponudba_detected: ponudbaDetected,
          ustvari_ponudbo: ponudbaDetected,
          rezerviraj_termin: ponudbaDetected,
          deadline_5_dni: ponudbaDetected,
          ponudba_title: f.ponudba?.title ?? f.title ?? '',
          ponudba_postavke: f.ponudba?.postavke ?? [],
        });
        setModalState('form');
      })
      .catch(() => {
        setSaveError('Napaka pri analizi glasovnega vnosa.');
        setModalState('idle');
      });
  }, [finalTranscript]);

  // Fetch open projects when form state is shown
  useEffect(() => {
    if (modalState !== 'form' || projectsFetched.current) return;
    projectsFetched.current = true;
    const supabase = createBrowserClient();
    supabase
      .from('projects')
      .select('id, title')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(30)
      .then(({ data }) => {
        if (data) setProjects(data);
      });
  }, [modalState]);

  const handleStart = useCallback(() => {
    reset();
    setForm(EMPTY_FORM);
    setSaveError(null);
    setFieldErrors({});
    setModalState('listening');
    start();
  }, [reset, start]);

  const handleStop = useCallback(() => {
    stop();
  }, [stop]);

  const handleRetry = useCallback(() => {
    reset();
    setForm(EMPTY_FORM);
    setSaveError(null);
    setFieldErrors({});
    setModalState('idle');
    projectsFetched.current = false;
  }, [reset]);

  const set = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setFieldErrors(prev => ({ ...prev, [key]: undefined }));
  }, []);

  const handleSave = useCallback(async () => {
    // Validate required fields
    const errors: Partial<Record<keyof FormState, string>> = {};
    if (!form.title.trim()) errors.title = 'Naslov je obvezen';
    if (!form.date) errors.date = 'Datum je obvezen';
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setModalState('saving');
    setSaveError(null);

    const payload: VoiceFormPayload = {
      type: form.type,
      title: form.title.trim(),
      date: form.date || null,
      date_end: form.date_end || null,
      time: form.time || null,
      client_name: form.client_name.trim() || null,
      project_id: form.project_id !== 'none' && form.project_id !== 'new' ? form.project_id : null,
      create_project: form.project_id === 'new',
      project_name: form.project_id === 'new' ? form.project_name.trim() || null : null,
      location: form.location.trim() || null,
      description: form.description.trim() || null,
      transcript,
      ustvari_ponudbo: form.ustvari_ponudbo,
      rezerviraj_termin: form.ustvari_ponudbo && form.rezerviraj_termin,
      deadline_5_dni: form.ustvari_ponudbo && form.deadline_5_dni,
      ponudba_title: form.ponudba_title.trim() || null,
      ponudba_postavke: form.ponudba_postavke,
    };

    try {
      await createFromVoiceForm(payload);
      onClose();
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Napaka pri shranjevanju');
      setModalState('form');
    }
  }, [form, transcript, onClose]);

  const handleOverlayClick = useCallback(() => {
    if (modalState === 'listening') handleStop();
    else onClose();
  }, [modalState, handleStop, onClose]);

  const showClientInput = form.type === 'task'
    ? (form.project_id === 'none' || form.project_id === 'new')
    : true; // projects always show client

  if (!isOpen && !showToast) return null;

  return (
    <>
      {showToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] bg-text text-white text-sm font-medium px-4 py-2.5 rounded-full shadow-modal animate-fade-in">
          Shranjeno
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/45" onClick={handleOverlayClick} />

          <div
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl overflow-y-auto"
            style={{ maxHeight: '90vh' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-2">
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

            {/* Idle */}
            {modalState === 'idle' && (
              <div className="flex flex-col items-center gap-5 px-5 pb-10 pt-4">
                <p className="text-sm text-muted text-center">
                  Pritisnite mikrofon, spregovorite in pritisnite stop.
                </p>
                {(voiceError ?? saveError) && (
                  <p className="text-sm text-red-500 text-center">{voiceError ?? saveError}</p>
                )}
                <button
                  type="button"
                  onClick={handleStart}
                  className="flex items-center justify-center rounded-full shadow-mic focus:outline-none"
                  style={{ width: 72, height: 72, background: 'linear-gradient(135deg, #1A1714 0%, #2D2520 100%)' }}
                >
                  <MicIcon />
                </button>
              </div>
            )}

            {/* Listening */}
            {modalState === 'listening' && (
              <div className="flex flex-col gap-4 px-5 pb-8 pt-4">
                <div className="bg-border2 rounded-2xl p-4 min-h-[64px] text-sm text-text">
                  {liveTranscript || <span className="text-muted">Poslušam...</span>}
                </div>
                <div className="flex items-center justify-center gap-2 py-1">
                  {[0, 150, 300].map(delay => (
                    <span
                      key={delay}
                      className="inline-block w-2 h-2 rounded-full bg-accent animate-dot-bounce"
                      style={{ animationDelay: `${delay}ms` }}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleStop}
                  className="w-full py-3.5 rounded-2xl bg-text text-white text-sm font-semibold"
                >
                  Ustavi snemanje
                </button>
              </div>
            )}

            {/* Parsing */}
            {modalState === 'parsing' && (
              <div className="flex flex-col items-center gap-4 py-12">
                <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-muted">Analiziram...</p>
              </div>
            )}

            {/* Form */}
            {modalState === 'form' && (
              <div className="flex flex-col gap-4 px-5 pb-8 pt-2">
                {/* Transcript preview */}
                <p className="text-xs text-muted italic line-clamp-2">{transcript}</p>

                {/* Type toggle */}
                <div className="flex rounded-xl bg-border2 p-0.5 gap-0.5">
                  {(['task', 'project'] as const).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => set('type', t)}
                      className={`flex-1 py-2 rounded-[10px] text-sm font-medium transition-colors ${
                        form.type === t ? 'bg-white text-text shadow-sm' : 'text-muted'
                      }`}
                    >
                      {t === 'task' ? 'Naloga' : 'Projekt'}
                    </button>
                  ))}
                </div>

                {/* Title */}
                <Field label="Naslov *" error={fieldErrors.title}>
                  <input
                    type="text"
                    value={form.title}
                    onChange={e => set('title', e.target.value)}
                    placeholder="npr. Ogled hiše pri Novaku"
                    className={inputCls(!!fieldErrors.title)}
                  />
                </Field>

                {/* Date row */}
                <div className="flex gap-3">
                  <Field label="Datum *" error={fieldErrors.date} className="flex-1">
                    <input
                      type="date"
                      value={form.date}
                      onChange={e => set('date', e.target.value)}
                      className={inputCls(!!fieldErrors.date)}
                    />
                  </Field>
                  <Field label="Čas" className="w-28">
                    <input
                      type="time"
                      value={form.time}
                      onChange={e => set('time', e.target.value)}
                      className={inputCls(false)}
                    />
                  </Field>
                </div>

                {/* Date end */}
                <Field label="Datum do">
                  <input
                    type="date"
                    value={form.date_end}
                    onChange={e => set('date_end', e.target.value)}
                    className={inputCls(false)}
                  />
                </Field>

                {/* Project dropdown (tasks only) */}
                {form.type === 'task' && (
                  <Field label="Projekt">
                    <select
                      value={form.project_id}
                      onChange={e => set('project_id', e.target.value)}
                      className={inputCls(false)}
                    >
                      <option value="none">Brez projekta</option>
                      <option value="new">+ Ustvari projekt</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                      ))}
                    </select>
                  </Field>
                )}

                {/* New project name */}
                {form.type === 'task' && form.project_id === 'new' && (
                  <Field label="Ime projekta">
                    <input
                      type="text"
                      value={form.project_name}
                      onChange={e => set('project_name', e.target.value)}
                      placeholder="npr. Obnova hiše Novak"
                      className={inputCls(false)}
                    />
                  </Field>
                )}

                {/* Client */}
                {showClientInput && (
                  <Field label="Stranka">
                    <input
                      type="text"
                      value={form.client_name}
                      onChange={e => set('client_name', e.target.value)}
                      placeholder="Ime stranke"
                      className={inputCls(false)}
                    />
                  </Field>
                )}

                {/* Location */}
                {(form.location || form.type === 'project') && (
                  <Field label="Lokacija">
                    <input
                      type="text"
                      value={form.location}
                      onChange={e => set('location', e.target.value)}
                      placeholder="Naslov ali kraj"
                      className={inputCls(false)}
                    />
                  </Field>
                )}

                {/* Description */}
                {form.description && (
                  <Field label="Opis">
                    <textarea
                      value={form.description}
                      onChange={e => set('description', e.target.value)}
                      rows={2}
                      className={`${inputCls(false)} resize-none`}
                    />
                  </Field>
                )}

                {/* Ponudba section */}
                {form.ponudba_detected && (
                  <div className="rounded-2xl border border-border p-4 flex flex-col gap-3">
                    <p className="text-xs font-semibold text-text uppercase tracking-wide">Ponudba</p>

                    <Field label="Naslov ponudbe">
                      <input
                        type="text"
                        value={form.ponudba_title}
                        onChange={e => set('ponudba_title', e.target.value)}
                        className={inputCls(false)}
                      />
                    </Field>

                    <Checkbox
                      checked={form.ustvari_ponudbo}
                      onChange={v => set('ustvari_ponudbo', v)}
                      label="Ustvari ponudbo"
                    />

                    {form.ustvari_ponudbo && (
                      <>
                        <Checkbox
                          checked={form.rezerviraj_termin}
                          onChange={v => set('rezerviraj_termin', v)}
                          label="Rezerviraj termin (iz datumov zgoraj)"
                        />
                        <Checkbox
                          checked={form.deadline_5_dni}
                          onChange={v => set('deadline_5_dni', v)}
                          label="Deadline +5 dni"
                        />
                      </>
                    )}
                  </div>
                )}

                {saveError && (
                  <p className="text-sm text-red-500">{saveError}</p>
                )}

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
                    className="flex-1 py-3 rounded-2xl bg-text text-white text-sm font-semibold"
                  >
                    Shrani
                  </button>
                </div>
              </div>
            )}

            {/* Saving */}
            {modalState === 'saving' && (
              <div className="flex flex-col items-center gap-4 py-12">
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

function inputCls(hasError: boolean) {
  return `w-full bg-border2 rounded-xl px-3.5 py-2.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent ${
    hasError ? 'ring-2 ring-red-400' : ''
  }`;
}

function Field({
  label,
  error,
  className,
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`flex flex-col gap-1 ${className ?? ''}`}>
      <label className="text-xs text-muted">{label}</label>
      {children}
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}

function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div
        onClick={() => onChange(!checked)}
        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${
          checked ? 'bg-text border-text' : 'border-border'
        }`}
      >
        {checked && (
          <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
            <path d="M1 4L4 7.5L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span className="text-sm text-text">{label}</span>
    </label>
  );
}

function MicIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="11" y="3" width="8" height="16" rx="4" />
      <path d="M7 15c0 4.4 3.6 8 8 8s8-3.6 8-8" />
      <line x1="15" y1="23" x2="15" y2="27" />
      <line x1="11" y1="27" x2="19" y2="27" />
    </svg>
  );
}
