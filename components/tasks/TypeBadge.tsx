import type { TaskType } from '@/types/domain';

interface TypeBadgeProps {
  type: TaskType;
}

const TYPE_CONFIG: Record<TaskType, { bg: string; fg: string; label: string }> = {
  task: { bg: 'bg-task-bg', fg: 'text-task-fg', label: 'Nalogo' },
  deadline: { bg: 'bg-deadline-bg', fg: 'text-deadline-fg', label: 'Rok' },
  rezervacija: { bg: 'bg-rezervacija-bg', fg: 'text-rezervacija-fg', label: 'Rezervacijo' },
};

export default function TypeBadge({ type }: TypeBadgeProps) {
  const { bg, fg, label } = TYPE_CONFIG[type];
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-2xs font-semibold ${bg} ${fg}`}>
      {label}
    </span>
  );
}
