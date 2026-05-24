'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/', label: null, icon: HomeIcon },
  { href: '/tasks', label: 'Taski', icon: TasksIcon },
  { href: '/calendar', label: 'Kol.', icon: CalendarIcon },
  { href: '/projects', label: 'Projekti', icon: ProjectsIcon },
  { href: '/clients', label: 'Stranke', icon: ClientsIcon },
];

export default function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav className="flex border-t border-border bg-bg pb-safe shrink-0">
      {tabs.map(tab => {
        const isActive = tab.href === '/'
          ? pathname === '/'
          : pathname.startsWith(tab.href);
        return (
          <Link key={tab.href} href={tab.href}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-h-[56px]"
          >
            <tab.icon color={isActive ? '#1A1714' : '#B5B0A8'} />
            {tab.label && (
              <span className={`text-[10px] ${isActive ? 'text-text font-semibold' : 'text-done font-normal'}`}>
                {tab.label}
              </span>
            )}
            {!tab.label && isActive && (
              <div className="w-1 h-1 rounded-full bg-text mt-0.5" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

function HomeIcon({ color = '#B5B0A8' }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M3 9.5L11 3L19 9.5V19C19 19.55 18.55 20 18 20H14V15H8V20H4C3.45 20 3 19.55 3 19V9.5Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  );
}
function TasksIcon({ color = '#B5B0A8' }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="2" y="2" width="18" height="18" rx="4" stroke={color} strokeWidth="1.5"/>
      <path d="M7 11L10 14L15 8" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function CalendarIcon({ color = '#B5B0A8' }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="2" y="4" width="18" height="16" rx="3" stroke={color} strokeWidth="1.5"/>
      <path d="M7 2V5M15 2V5M2 9H20" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
function ProjectsIcon({ color = '#B5B0A8' }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M2 7C2 5.34 3.34 4 5 4h3.17c.55 0 1.06.22 1.44.59L11 6h6c1.66 0 3 1.34 3 3v8c0 1.66-1.34 3-3 3H5c-1.66 0-3-1.34-3-3V7z" stroke={color} strokeWidth="1.5"/>
    </svg>
  );
}
function ClientsIcon({ color = '#B5B0A8' }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="8" cy="8" r="3.5" stroke={color} strokeWidth="1.5"/>
      <path d="M2 18c0-3.31 2.69-6 6-6s6 2.69 6 6" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M16 6c1.38 0 2.5 1.12 2.5 2.5S17.38 11 16 11M20 18c0-2.76-1.79-5.1-4.27-5.82" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
