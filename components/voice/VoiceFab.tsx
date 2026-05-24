'use client';

import { useState } from 'react';
import VoiceModal from '@/components/voice/VoiceModal';

export default function VoiceFab() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Pulsing ring */}
      <div className="relative flex items-center justify-center">
        <span
          className="absolute rounded-full animate-mic-pulse"
          style={{ width: 88, height: 88, background: 'rgba(194,105,42,0.18)' }}
        />
        <button
          type="button"
          aria-label="Glasovni vnos"
          onClick={() => setOpen(true)}
          className="relative z-10 flex items-center justify-center rounded-full shadow-mic focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          style={{
            width: 72,
            height: 72,
            background: 'linear-gradient(135deg, #1A1714 0%, #2D2520 100%)',
          }}
        >
          <svg
            width="30"
            height="30"
            viewBox="0 0 30 30"
            fill="none"
            stroke="white"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="11" y="3" width="8" height="16" rx="4" />
            <path d="M7 15c0 4.4 3.6 8 8 8s8-3.6 8-8" />
            <line x1="15" y1="23" x2="15" y2="27" />
            <line x1="11" y1="27" x2="19" y2="27" />
          </svg>
        </button>
      </div>

      <VoiceModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
