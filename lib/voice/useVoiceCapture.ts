'use client';

import { useState, useRef, useCallback } from 'react';
import { isWebSpeechSupported, createWebSpeechRecognizer } from '@/lib/voice/web-speech';

export interface VoiceCaptureResult {
  isListening: boolean;
  transcript: string;
  finalTranscript: string;
  start: () => void;
  stop: () => void;
  reset: () => void;
  error: string | null;
}

export function useVoiceCapture(): VoiceCaptureResult {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognizerRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const accumulatedRef = useRef('');

  const stopRecognizer = useCallback(() => {
    if (recognizerRef.current) {
      try { recognizerRef.current.stop(); } catch { /* ignore */ }
      recognizerRef.current = null;
    }
  }, []);

  const stopMediaRecorder = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const start = useCallback(() => {
    setError(null);
    setIsListening(true);
    accumulatedRef.current = '';

    if (isWebSpeechSupported()) {
      const rec = createWebSpeechRecognizer({
        onPartial: (text) => setTranscript(text),
        onFinal: (text) => {
          accumulatedRef.current += (accumulatedRef.current ? ' ' : '') + text;
          setTranscript(accumulatedRef.current);
        },
        onError: (err) => {
          setError(err.message);
          setIsListening(false);
          recognizerRef.current = null;
        },
      });
      recognizerRef.current = rec;
      rec.start();
    } else {
      // MediaRecorder fallback
      chunksRef.current = [];
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          const recorder = new MediaRecorder(stream);
          mediaRecorderRef.current = recorder;
          chunksRef.current = [];

          recorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunksRef.current.push(e.data);
          };

          recorder.onstop = async () => {
            // Stop all tracks to release the mic
            stream.getTracks().forEach((t) => t.stop());

            const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
            const formData = new FormData();
            formData.append('audio', blob, 'recording.webm');

            try {
              const res = await fetch('/api/voice/whisper', {
                method: 'POST',
                body: formData,
              });
              if (!res.ok) throw new Error('Whisper API error');
              const json = await res.json() as { text: string };
              setFinalTranscript(json.text);
              setTranscript('');
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Napaka pri prepoznavanju govora');
            } finally {
              setIsListening(false);
            }
          };

          recorder.start();
        })
        .catch((err: Error) => {
          setError(err.message ?? 'Mikrofon ni dostopen');
          setIsListening(false);
        });
    }
  }, []);

  const stop = useCallback(() => {
    if (isWebSpeechSupported()) {
      stopRecognizer();
      if (accumulatedRef.current) {
        setFinalTranscript(accumulatedRef.current);
        setTranscript('');
        setIsListening(false);
      } else {
        setIsListening(false);
      }
    } else {
      stopMediaRecorder();
      // isListening will be set false in onstop handler
    }
  }, [stopRecognizer, stopMediaRecorder]);

  const reset = useCallback(() => {
    stopRecognizer();
    stopMediaRecorder();
    accumulatedRef.current = '';
    setTranscript('');
    setFinalTranscript('');
    setError(null);
    setIsListening(false);
  }, [stopRecognizer, stopMediaRecorder]);

  return { isListening, transcript, finalTranscript, start, stop, reset, error };
}
