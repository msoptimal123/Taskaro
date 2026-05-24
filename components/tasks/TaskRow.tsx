'use client';
import { useState, useTransition } from 'react';
import type { Task } from '@/types/domain';
import { completeTask, reopenTask } from '@/app/(app)/actions';
import { formatDate } from '@/lib/utils/date';

type TaskWithClient = Task & { clients?: { name: string } | null };

interface TaskRowProps {
  task: TaskWithClient;
}

const TYPE_COLOR: Record<Task['type'], string> = {
  task: '#3B82F6',
  deadline: '#D97706',
  rezervacija: '#7C3AED',
};

export default function TaskRow({ task }: TaskRowProps) {
  const [isDone, setIsDone] = useState(task.status === 'done');
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    const next = !isDone;
    setIsDone(next);
    startTransition(async () => {
      try {
        if (next) {
          await completeTask(task.id);
        } else {
          await reopenTask(task.id);
        }
      } catch {
        // Revert optimistic update on error
        setIsDone(!next);
      }
    });
  }

  // Build meta line parts
  const metaParts: string[] = [];
  if (task.clients?.name) metaParts.push(task.clients.name);
  if (task.due_date) metaParts.push(formatDate(task.due_date));
  if (task.due_time) metaParts.push(task.due_time);
  if (task.location) metaParts.push(task.location);
  const metaLine = metaParts.join(' · ');

  return (
    <div className="flex items-stretch bg-card rounded-2xl shadow-card px-4 py-3 gap-3">
      {/* Left type color bar */}
      <div
        className="w-[3px] rounded-full shrink-0 self-stretch"
        style={{ backgroundColor: TYPE_COLOR[task.type] }}
      />

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${isDone ? 'text-muted line-through' : 'text-text'}`}>
          {task.title}
        </p>
        {metaLine ? (
          <p className="text-xs text-muted mt-0.5 truncate">{metaLine}</p>
        ) : null}
      </div>

      {/* Complete button */}
      <button
        onClick={handleToggle}
        disabled={isPending}
        aria-label={isDone ? 'Ponovno odpri' : 'Označi kot opravljeno'}
        className={`
          shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center
          transition-colors duration-150
          ${isDone ? 'bg-text border-text' : 'bg-transparent border-border'}
          ${isPending ? 'opacity-50' : ''}
        `}
      >
        {isDone && (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M2.5 7L5.5 10L11.5 4"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
