'use client';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { closeProject } from '@/app/(app)/actions';
import type { ProjectStatus } from '@/types/domain';

interface ProjectActionsProps {
  projectId: string;
  status: ProjectStatus;
}

export default function ProjectActions({ projectId, status }: ProjectActionsProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleToggle() {
    startTransition(async () => {
      await closeProject(projectId);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {status !== 'done' ? (
        <button
          onClick={handleToggle}
          disabled={isPending}
          className={`
            w-full rounded-2xl py-3.5 text-sm font-semibold border-2
            border-amber-500 text-amber-600 bg-amber-50
            active:bg-amber-100 transition-colors
            ${isPending ? 'opacity-50' : ''}
          `}
        >
          {isPending ? 'Zapiram…' : 'Zaključi projekt'}
        </button>
      ) : (
        <button
          onClick={handleToggle}
          disabled={isPending}
          className={`
            w-full rounded-2xl py-3.5 text-sm font-semibold border-2
            border-border text-muted2 bg-card
            active:bg-border2 transition-colors
            ${isPending ? 'opacity-50' : ''}
          `}
        >
          {isPending ? 'Odpiram…' : 'Znova odpri'}
        </button>
      )}
    </div>
  );
}
