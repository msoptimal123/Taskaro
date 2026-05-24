# Database Schema

PostgreSQL via Supabase. All tables are user-scoped via `user_id` + Row Level Security.

## Migration: `001_initial.sql`

```sql
-- ── Extensions ──────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── Enums ───────────────────────────────────────────────────────────────────
create type task_type as enum ('task', 'deadline', 'rezervacija');
create type task_status as enum ('open', 'in_progress', 'done');
create type project_status as enum ('reserved', 'active', 'done');

-- ── Clients ─────────────────────────────────────────────────────────────────
create table clients (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  phone text,
  email text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index clients_user_idx on clients(user_id);
create index clients_name_idx on clients(user_id, name);

-- ── Projects ────────────────────────────────────────────────────────────────
create table projects (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid references clients(id) on delete set null,
  title text not null,
  description text,
  location text,
  obseg text,                                  -- scope (e.g. "18m²")
  status project_status not null default 'active',
  start_date date,
  end_date date,
  color text default '#2DB87A',                -- hex, for UI accent
  -- Reservation conversion tracking
  converted_from_task_id uuid,                 -- if this project came from a reservation task
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  closed_at timestamptz
);
create index projects_user_idx on projects(user_id);
create index projects_client_idx on projects(client_id);
create index projects_status_idx on projects(user_id, status);

-- ── Tasks ───────────────────────────────────────────────────────────────────
create table tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references projects(id) on delete set null,    -- NULL = solo task
  client_id uuid references clients(id) on delete set null,      -- denormalized for solo tasks
  type task_type not null default 'task',
  status task_status not null default 'open',
  title text not null,
  description text,
  location text,

  -- Scheduling
  due_date date,
  due_time time,
  -- For rezervacija (multi-day blocking)
  start_date date,
  end_date date,

  -- Reminders (Phase 2, schema ready)
  reminder_at timestamptz,
  reminded boolean not null default false,

  -- Original voice transcript (audit trail)
  source_transcript text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);
create index tasks_user_idx on tasks(user_id);
create index tasks_project_idx on tasks(project_id);
create index tasks_client_idx on tasks(client_id);
create index tasks_status_idx on tasks(user_id, status);
create index tasks_due_idx on tasks(user_id, due_date);
create index tasks_solo_idx on tasks(user_id) where project_id is null;

-- ── Notes (free-form, never linked to project/client) ───────────────────────
create table notes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  text text not null,
  source_transcript text,
  created_at timestamptz not null default now()
);
create index notes_user_idx on notes(user_id);
create index notes_created_idx on notes(user_id, created_at desc);

-- ── Attachments ─────────────────────────────────────────────────────────────
create type attachment_entity as enum ('task', 'project');

create table attachments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entity_type attachment_entity not null,
  entity_id uuid not null,
  storage_path text not null,                  -- path inside Supabase Storage bucket
  filename text not null,                      -- original filename for display
  mime_type text not null,
  size_bytes integer not null,
  created_at timestamptz not null default now()
);
create index attachments_entity_idx on attachments(entity_type, entity_id);
create index attachments_user_idx on attachments(user_id);

-- ── Updated-at triggers ─────────────────────────────────────────────────────
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger clients_updated_at before update on clients
  for each row execute function set_updated_at();
create trigger projects_updated_at before update on projects
  for each row execute function set_updated_at();
create trigger tasks_updated_at before update on tasks
  for each row execute function set_updated_at();
```

## Migration: `002_rls.sql`

```sql
-- Enable RLS on all user tables
alter table clients enable row level security;
alter table projects enable row level security;
alter table tasks enable row level security;
alter table notes enable row level security;
alter table attachments enable row level security;

-- Policy template: user can only see/modify their own rows
-- (Re-applied for each table)

-- Clients
create policy "clients select own" on clients for select using (auth.uid() = user_id);
create policy "clients insert own" on clients for insert with check (auth.uid() = user_id);
create policy "clients update own" on clients for update using (auth.uid() = user_id);
create policy "clients delete own" on clients for delete using (auth.uid() = user_id);

-- Projects
create policy "projects select own" on projects for select using (auth.uid() = user_id);
create policy "projects insert own" on projects for insert with check (auth.uid() = user_id);
create policy "projects update own" on projects for update using (auth.uid() = user_id);
create policy "projects delete own" on projects for delete using (auth.uid() = user_id);

-- Tasks
create policy "tasks select own" on tasks for select using (auth.uid() = user_id);
create policy "tasks insert own" on tasks for insert with check (auth.uid() = user_id);
create policy "tasks update own" on tasks for update using (auth.uid() = user_id);
create policy "tasks delete own" on tasks for delete using (auth.uid() = user_id);

-- Notes
create policy "notes select own" on notes for select using (auth.uid() = user_id);
create policy "notes insert own" on notes for insert with check (auth.uid() = user_id);
create policy "notes update own" on notes for update using (auth.uid() = user_id);
create policy "notes delete own" on notes for delete using (auth.uid() = user_id);

-- Attachments
create policy "attachments select own" on attachments for select using (auth.uid() = user_id);
create policy "attachments insert own" on attachments for insert with check (auth.uid() = user_id);
create policy "attachments delete own" on attachments for delete using (auth.uid() = user_id);
```

## Migration: `003_storage.sql`

```sql
-- Create storage bucket for attachments
insert into storage.buckets (id, name, public)
values ('attachments', 'attachments', false);

-- RLS for storage: users can only read/write objects in their own folder
-- Path format: attachments/{user_id}/{entity_type}/{entity_id}/{filename}

create policy "attachments storage read own"
on storage.objects for select
using (
  bucket_id = 'attachments'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "attachments storage insert own"
on storage.objects for insert
with check (
  bucket_id = 'attachments'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "attachments storage delete own"
on storage.objects for delete
using (
  bucket_id = 'attachments'
  and (storage.foldername(name))[1] = auth.uid()::text
);
```

## Key relationship rules (enforced in app logic, documented here)

1. **Solo task** = `tasks.project_id IS NULL`. Can have a `client_id` or not.
2. **Project task** = `tasks.project_id IS NOT NULL`. Inherits client from project.
3. **Rezervacija** = `tasks.type = 'rezervacija'` AND `tasks.project_id IS NULL`. Has `start_date` + `end_date` for calendar blocking.
4. **Reservation → Project conversion**:
   - User clicks "Potrdi rezervacijo" on a `rezervacija` task
   - Server action:
     - Create new `project` with `status='active'`, `client_id` from task, `start_date`/`end_date` from task, `converted_from_task_id = task.id`
     - The original reservation task gets `project_id = new_project.id` and `type = 'task'` (it becomes a regular task within the project)
5. **Solo task → Project move**: User opens project (or new project), sees solo tasks list filtered by matching `client_id`, checks which to move, server action sets `project_id` on selected.
6. **Client creation from voice**: If voice parser extracts a client name that doesn't match existing clients (case-insensitive partial match), create new client with just `name`. Phone/email added later via Uredi.

## Why no `users` / `profiles` table?

For MVP (1:1 user:account), `auth.users` is enough. When we add team support (Phase 2), add a `profiles` table with `display_name`, `avatar_url`, `org_id`, and an `organizations` table.
