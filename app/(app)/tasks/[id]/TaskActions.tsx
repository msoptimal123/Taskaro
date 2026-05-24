'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { completeTask, reopenTask, deleteTask } from '@/app/(app)/actions';
import type { TaskStatus } from '@/types/domain';

interface TaskActionsProps {
  taskId: string;
  status: TaskStatus;
}

export default function TaskActions({ taskId, status }: TaskActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);

  function handleComplete() {
    startTransition(async () => {
      await completeTask(taskId);
    });
  }

  function handleReopen() {
    startTransition(async () => {
      await reopenTask(taskId);
    });
  }

  function handleDeleteConfirmed() {
    startTransition(async () => {
      await deleteTask(taskId);
      router.push('/tasks');
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Complete / reopen */}
      {status === 'done' ? (
        <button
          onClick={handleReopen}
          disabled={isPending}
          className="w-full py-3.5 rounded-2xl border border-border text-sm font-semibold text-text transition-opacity disabled:opacity-50"
        >
          Znova odpri
        </button>
      ) : (
        <button
          onClick={handleComplete}
          disabled={isPending}
          className="w-full py-3.5 rounded-2xl bg-text text-white text-sm font-semibold transition-opacity disabled:opacity-50"
        >
          Označeno opravljeno
        </button>
      )}

      {/* Delete */}
      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          disabled={isPending}
          className="w-full py-3.5 rounded-2xl border border-border text-sm font-semibold text-red-500 transition-opacity disabled:opacity-50"
        >
          Izbriši
        </button>
      ) : (
        <div className="bg-card rounded-2xl shadow-card px-4 py-4 flex flex-col gap-3">
          <p className="text-sm text-text font-medium text-center">
            Ste prepričani, da želite izbrisati to nalogo?
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowConfirm(false)}
              disabled={isPending}
              className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold text-text transition-opacity disabled:opacity-50"
            >
              Prekliči
            </button>
            <button
              onClick={handleDeleteConfirmed}
              disabled={isPending}
              className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold transition-opacity disabled:opacity-50"
            >
              {isPending ? 'Brišem…' : 'Izbriši'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
