import Link from 'next/link';
import { createServerClient } from '@/lib/supabase/server';
import { todayISO, formatDate } from '@/lib/utils/date';
import TaskRow from '@/components/tasks/TaskRow';
import type { Task } from '@/types/domain';

type TaskWithClient = Task & { clients: { name: string } | null };

// Slovenian month names (capitalize first letter for header display)
const MONTHS_SL = [
  'januar', 'februar', 'marec', 'april', 'maj', 'junij',
  'julij', 'avgust', 'september', 'oktober', 'november', 'december',
];

// Slovenian day headers (Mon–Sun)
const DAY_HEADERS = ['Pon', 'Tor', 'Sre', 'Čet', 'Pet', 'Sob', 'Ned'];

// Slovenian full day names for selected date title
const DAYS_SL_FULL = ['Nedelja', 'Ponedeljek', 'Torek', 'Sreda', 'Četrtek', 'Petek', 'Sobota'];

const MONTHS_SL_GENITIVE = [
  'januarja', 'februarja', 'marca', 'aprila', 'maja', 'junija',
  'julija', 'avgusta', 'septembra', 'oktobra', 'novembra', 'decembra',
];

function addMonths(yearMonth: string, delta: number): string {
  const [y, m] = yearMonth.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function isValidMonth(value: string | undefined): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}$/.test(value);
}

function isValidDate(value: string | undefined): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function getCurrentYearMonth(): string {
  return todayISO().slice(0, 7);
}

/** Returns ISO date strings for all cells in the calendar grid (always 6 rows × 7 cols) */
function buildCalendarDays(yearMonth: string): string[] {
  const [y, m] = yearMonth.split('-').map(Number);

  // First day of month
  const firstDay = new Date(y, m - 1, 1);
  // Last day of month
  const lastDay = new Date(y, m, 0);

  // ISO weekday of first day: 0=Mon, 6=Sun
  let startDow = firstDay.getDay() - 1; // getDay: 0=Sun,1=Mon...
  if (startDow < 0) startDow = 6; // Sunday becomes 6

  const days: string[] = [];

  // Fill leading days from previous month
  for (let i = startDow - 1; i >= 0; i--) {
    const d = new Date(y, m - 1, -i);
    days.push(d.toISOString().split('T')[0]);
  }

  // Fill current month
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(y, m - 1, d);
    days.push(date.toISOString().split('T')[0]);
  }

  // Fill trailing days to complete 6 rows (42 cells)
  const remaining = 42 - days.length;
  for (let d = 1; d <= remaining; d++) {
    const date = new Date(y, m, d);
    days.push(date.toISOString().split('T')[0]);
  }

  return days;
}

function formatSelectedDayTitle(iso: string): string {
  const date = new Date(iso + 'T00:00:00');
  const dayName = DAYS_SL_FULL[date.getDay()];
  const [, m, d] = iso.split('-');
  return `${dayName}, ${parseInt(d)}. ${MONTHS_SL_GENITIVE[parseInt(m) - 1]}`;
}

interface PageProps {
  searchParams: { month?: string; date?: string };
}

export default async function CalendarPage({ searchParams }: PageProps) {
  const today = todayISO();
  const currentYearMonth = getCurrentYearMonth();

  // Validate and resolve month param
  const month = isValidMonth(searchParams.month) ? searchParams.month : currentYearMonth;

  // Validate selected date
  const selectedDate = isValidDate(searchParams.date) ? searchParams.date : null;

  const [y, m] = month.split('-').map(Number);
  const firstDay = `${month}-01`;
  const lastDayNum = new Date(y, m, 0).getDate();
  const lastDay = `${month}-${String(lastDayNum).padStart(2, '0')}`;

  const prevMonth = addMonths(month, -1);
  const nextMonth = addMonths(month, 1);

  // Build calendar grid
  const calendarDays = buildCalendarDays(month);

  const supabase = createServerClient();

  // Fetch tasks for the visible month (for dot indicators)
  const { data: monthTasksRaw } = await supabase
    .from('tasks')
    .select('due_date, start_date, end_date, type, status')
    .neq('status', 'done')
    .or(
      `due_date.gte.${firstDay},and(start_date.lte.${lastDay},end_date.gte.${firstDay})`
    );

  // Build a Set of dates that have tasks
  const datesWithTasks = new Set<string>();
  for (const task of monthTasksRaw ?? []) {
    if (task.due_date && task.due_date >= firstDay && task.due_date <= lastDay) {
      datesWithTasks.add(task.due_date);
    }
    // For rezervacija spanning the month
    if (task.start_date && task.end_date) {
      const start = task.start_date > firstDay ? task.start_date : firstDay;
      const end = task.end_date < lastDay ? task.end_date : lastDay;
      // Mark each day in range
      const startDate = new Date(start + 'T00:00:00');
      const endDate = new Date(end + 'T00:00:00');
      for (
        let d = new Date(startDate);
        d <= endDate;
        d.setDate(d.getDate() + 1)
      ) {
        datesWithTasks.add(d.toISOString().split('T')[0]);
      }
    }
  }

  // Fetch tasks for selected date
  let selectedDateTasks: TaskWithClient[] = [];
  if (selectedDate) {
    const { data } = await supabase
      .from('tasks')
      .select('*, clients(name)')
      .eq('due_date', selectedDate)
      .neq('status', 'done')
      .order('due_time', { ascending: true, nullsFirst: false });
    selectedDateTasks = (data ?? []) as TaskWithClient[];
  }

  const monthLabel =
    MONTHS_SL[m - 1].charAt(0).toUpperCase() + MONTHS_SL[m - 1].slice(1) + ' ' + y;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-6 shrink-0">
        <div className="flex items-center justify-between">
          {/* Month label */}
          <h1 className="text-xl font-bold text-text font-sans">{monthLabel}</h1>

          {/* Navigation */}
          <div className="flex items-center gap-1">
            <Link
              href={`/calendar?month=${prevMonth}`}
              className="w-9 h-9 flex items-center justify-center rounded-full text-muted2 hover:bg-border transition-colors"
              aria-label="Prejšnji mesec"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M11 13L7 9L11 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>

            <Link
              href="/calendar"
              className="px-3 h-9 flex items-center rounded-full text-sm font-medium text-muted2 hover:bg-border transition-colors"
            >
              danes
            </Link>

            <Link
              href={`/calendar?month=${nextMonth}`}
              className="w-9 h-9 flex items-center justify-center rounded-full text-muted2 hover:bg-border transition-colors"
              aria-label="Naslednji mesec"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M7 13L11 9L7 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="px-5 shrink-0">
        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {DAY_HEADERS.map((day) => (
            <div
              key={day}
              className="h-8 flex items-center justify-center text-2xs font-semibold text-muted uppercase tracking-wide"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {calendarDays.map((iso) => {
            const isCurrentMonth = iso.startsWith(month);
            const isToday = iso === today;
            const isSelected = iso === selectedDate;
            const hasTasks = datesWithTasks.has(iso);
            const dayNum = parseInt(iso.split('-')[2]);

            let cellBg = '';
            let cellText = '';

            if (isSelected) {
              cellBg = 'bg-accent';
              cellText = 'text-white';
            } else if (isToday) {
              cellBg = 'bg-text';
              cellText = 'text-white';
            } else if (isCurrentMonth) {
              cellText = 'text-text';
            } else {
              cellText = 'text-muted opacity-50';
            }

            // Build href for selection: preserve current month param if needed
            const href =
              isSelected
                ? `/calendar?month=${month}` // deselect
                : `/calendar?month=${month}&date=${iso}`;

            return (
              <Link
                key={iso}
                href={href}
                className="flex flex-col items-center justify-center py-0.5"
              >
                <span
                  className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium transition-colors ${cellBg} ${cellText}`}
                >
                  {dayNum}
                </span>
                {hasTasks && isCurrentMonth ? (
                  <span className="w-1 h-1 rounded-full bg-accent mt-0.5" />
                ) : (
                  <span className="w-1 h-1 mt-0.5" />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 mt-4 border-t border-border shrink-0" />

      {/* Selected day tasks */}
      <div className="flex-1 overflow-y-auto px-5 pb-6">
        {selectedDate ? (
          <>
            <p className="text-sm font-semibold text-text py-4">
              {formatSelectedDayTitle(selectedDate)}
            </p>
            {selectedDateTasks.length === 0 ? (
              <p className="text-sm text-muted text-center pt-6">Ni nalog ta dan</p>
            ) : (
              <div className="flex flex-col gap-3">
                {selectedDateTasks.map((task) => (
                  <TaskRow key={task.id} task={task} />
                ))}
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-muted text-center pt-8">Izberi dan za prikaz nalog</p>
        )}
      </div>
    </div>
  );
}
