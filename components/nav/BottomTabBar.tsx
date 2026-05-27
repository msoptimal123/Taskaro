'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

const mainTabs = [
  { href: '/', label: null, icon: HomeIcon },
  { href: '/tasks', label: 'Taski', icon: TasksIcon },
  { href: '/calendar', label: 'Kol.', icon: CalendarIcon },
  { href: '/projects', label: 'Projekti', icon: ProjectsIcon },
];

const vecItems = [
  { href: '/ponudbe', label: 'Ponudbe', icon: PonudbeIcon },
  { href: '/clients', label: 'Stranke', icon: ClientsIcon },
  { href: '/notes', label: 'Beležke', icon: NotesIcon },
  { href: '/settings', label: 'Nastavitve', icon: SettingsIcon },
];

export default function BottomTabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [vecOpen, setVecOpen] = useState(false);

  const isVecActive = vecItems.some(item => pathname.startsWith(item.href));

  function handleVecItemClick(href: string) {
    setVecOpen(false);
    router.push(href);
  }

  return (
    <>
      {/* Bottom-sheet overlay */}
      {vecOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30"
          onClick={() => setVecOpen(false)}
        />
      )}
      <div
        className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg z-50 bg-bg rounded-t-2xl shadow-xl transition-transform duration-300 ${
          vecOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ maxHeight: '60vh' }}
      >
        {/* Sheet header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-2">
          <h2 className="font-serif text-xl tracking-tight text-text">Več</h2>
          <button
            onClick={() => setVecOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-border2 text-muted text-lg leading-none"
            aria-label="Zapri"
          >
            ×
          </button>
        </div>

        {/* Sheet items */}
        <ul className="pb-safe">
          {vecItems.map((item, i) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <button
                  onClick={() => handleVecItemClick(item.href)}
                  className={`w-full flex items-center gap-4 px-5 py-4 text-left ${
                    i < vecItems.length - 1 ? 'border-b border-border' : ''
                  } active:bg-border2`}
                >
                  <item.icon color={isActive ? '#1A1714' : '#9B968F'} />
                  <span
                    className={`text-sm ${
                      isActive ? 'text-text font-semibold' : 'text-text font-normal'
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Tab bar */}
      <nav className="flex border-t border-border bg-bg pb-safe shrink-0">
        {mainTabs.map(tab => {
          const isActive =
            tab.href === '/'
              ? pathname === '/'
              : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-h-[56px]"
            >
              <tab.icon color={isActive ? '#1A1714' : '#B5B0A8'} />
              {tab.label && (
                <span
                  className={`text-[10px] ${
                    isActive ? 'text-text font-semibold' : 'text-done font-normal'
                  }`}
                >
                  {tab.label}
                </span>
              )}
              {!tab.label && isActive && (
                <div className="w-1 h-1 rounded-full bg-text mt-0.5" />
              )}
            </Link>
          );
        })}

        {/* Več tab button */}
        <button
          onClick={() => setVecOpen(v => !v)}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-h-[56px]"
        >
          <VecIcon color={vecOpen || isVecActive ? '#1A1714' : '#B5B0A8'} />
          <span
            className={`text-[10px] ${
              vecOpen || isVecActive
                ? 'text-text font-semibold'
                : 'text-done font-normal'
            }`}
          >
            Več
          </span>
        </button>
      </nav>
    </>
  );
}

function HomeIcon({ color = '#B5B0A8' }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path
        d="M3 9.5L11 3L19 9.5V19C19 19.55 18.55 20 18 20H14V15H8V20H4C3.45 20 3 19.55 3 19V9.5Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TasksIcon({ color = '#B5B0A8' }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="2" y="2" width="18" height="18" rx="4" stroke={color} strokeWidth="1.5" />
      <path
        d="M7 11L10 14L15 8"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CalendarIcon({ color = '#B5B0A8' }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="2" y="4" width="18" height="16" rx="3" stroke={color} strokeWidth="1.5" />
      <path d="M7 2V5M15 2V5M2 9H20" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ProjectsIcon({ color = '#B5B0A8' }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path
        d="M2 7C2 5.34 3.34 4 5 4h3.17c.55 0 1.06.22 1.44.59L11 6h6c1.66 0 3 1.34 3 3v8c0 1.66-1.34 3-3 3H5c-1.66 0-3-1.34-3-3V7z"
        stroke={color}
        strokeWidth="1.5"
      />
    </svg>
  );
}

function PonudbeIcon({ color = '#B5B0A8' }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path
        d="M5 3h12a1 1 0 0 1 1 1v15l-3-2-3 2-3-2-3 2V4a1 1 0 0 1 1-1z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M8 8h6M8 11h4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function VecIcon({ color = '#B5B0A8' }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="6" r="1.2" fill={color} />
      <circle cx="11" cy="11" r="1.2" fill={color} />
      <circle cx="11" cy="16" r="1.2" fill={color} />
    </svg>
  );
}

function ClientsIcon({ color = '#9B968F' }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="8" cy="8" r="3.5" stroke={color} strokeWidth="1.5" />
      <path
        d="M2 18c0-3.31 2.69-6 6-6s6 2.69 6 6"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M16 6c1.38 0 2.5 1.12 2.5 2.5S17.38 11 16 11M20 18c0-2.76-1.79-5.1-4.27-5.82"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function NotesIcon({ color = '#9B968F' }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path
        d="M4 4h14a1 1 0 0 1 1 1v10l-4 4H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M7 8h8M7 11h5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function SettingsIcon({ color = '#9B968F' }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="3" stroke={color} strokeWidth="1.5" />
      <path
        d="M11 2v2M11 18v2M2 11h2M18 11h2M4.22 4.22l1.42 1.42M16.36 16.36l1.42 1.42M4.22 17.78l1.42-1.42M16.36 5.64l1.42-1.42"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
