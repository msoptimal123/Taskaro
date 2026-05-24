# API Design

Most data flow uses **Supabase client directly** (server components for reads, server actions for writes). Only voice processing needs custom API routes.

## Environment variables

Create `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...           # server-only, never expose

# Voice / AI
ANTHROPIC_API_KEY=sk-ant-...               # for Claude parser
OPENAI_API_KEY=sk-...                      # for Whisper fallback (optional)

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000  # or production URL
```

## Custom API routes

| Route | Method | Purpose |
|---|---|---|
| `/api/voice/whisper` | POST | Audio file → text (fallback) |
| `/api/voice/parse` | POST | Text → structured entity (Claude) |
| `/auth/callback` | GET | Supabase OAuth callback |

All other operations use Supabase client + server actions.

## Server Actions

Located in `app/(app)/actions.ts` or co-located with screens. Key ones:

```ts
// Tasks
createFromVoice(parsed, finalText)
completeTask(taskId)
reopenTask(taskId)
updateTask(taskId, patch)
deleteTask(taskId)
moveTaskToProject(taskId, projectId)

// Projects
createProject(data)
updateProject(projectId, patch)
closeProject(projectId, alsoCloseTasks)
deleteProject(projectId)
confirmReservation(taskId)              // see flows.md
moveTasksToProject(taskIds, projectId)

// Clients
createClient(data)
updateClient(clientId, patch)
deleteClient(clientId)
findOrCreateClient(name)                // used by voice flow

// Notes
createNote(text, sourceTranscript)
deleteNote(noteId)

// Attachments
uploadAttachment(file, entityType, entityId)   // client-side, uses storage API
deleteAttachment(attachmentId)
```

## Read patterns

```ts
// Server Component example: /tasks page
import { createServerClient } from '@/lib/supabase/server';

export default async function TasksPage({ searchParams }) {
  const supabase = createServerClient();
  const filter = searchParams.filter || 'today';

  let query = supabase.from('tasks').select('*');
  if (filter === 'today') query = query.eq('due_date', new Date().toISOString().split('T')[0]).neq('status','done');
  // ...

  const { data: tasks } = await query.order('due_time', { ascending: true, nullsFirst: false });
  return <TaskList tasks={tasks} />;
}
```

## Optimistic updates (React 19)

```tsx
'use client';
import { useOptimistic } from 'react';

export function TaskList({ tasks }) {
  const [optimisticTasks, addOptimistic] = useOptimistic(tasks, (state, action) => {
    if (action.type === 'complete') {
      return state.map(t => t.id === action.id ? { ...t, status: 'done' } : t);
    }
    return state;
  });

  const handleComplete = async (id) => {
    addOptimistic({ type: 'complete', id });
    await completeTask(id);    // server action
  };

  return /* ... */;
}
```

## Supabase TypeScript types

After defining schema in Supabase, generate types:

```bash
npx supabase gen types typescript --project-id <your-project-ref> > types/database.ts
```

Use as `Database['public']['Tables']['tasks']['Row']` etc.

## Realtime (optional, Phase 1 or 2)

Subscribe to changes for live multi-device sync:

```ts
useEffect(() => {
  const channel = supabase
    .channel('tasks-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${userId}` },
      (payload) => { /* refetch or merge */ })
    .subscribe();
  return () => supabase.removeChannel(channel);
}, [userId]);
```

For a single-user app, not critical for MVP. Add if user uses multiple devices.
