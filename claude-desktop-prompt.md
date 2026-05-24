# Architecture

## Folder structure

```
taskaro/
├── app/                          # Next.js App Router
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── callback/route.ts     # Supabase OAuth callback
│   ├── (app)/                    # authenticated routes
│   │   ├── layout.tsx            # Bottom tab bar wrapper
│   │   ├── page.tsx              # Dashboard
│   │   ├── tasks/
│   │   │   ├── page.tsx          # Tasks list (Today/Upcoming/Done filters)
│   │   │   └── [id]/page.tsx     # Task detail
│   │   ├── projects/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/page.tsx
│   │   │   └── new/page.tsx      # new project (with optional move-tasks-in step)
│   │   ├── clients/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── notes/page.tsx
│   │   └── calendar/page.tsx
│   ├── api/                      # API routes (server-side only)
│   │   ├── voice/parse/route.ts  # Claude voice → structured entity
│   │   └── voice/whisper/route.ts # Whisper fallback transcription
│   └── layout.tsx                # Root layout + fonts
│
├── components/
│   ├── ui/                       # Primitive components (Button, Dialog, Toast, etc.)
│   ├── nav/
│   │   ├── BottomTabBar.tsx
│   │   └── NavBar.tsx            # screen-level header
│   ├── tasks/
│   │   ├── TaskRow.tsx
│   │   ├── TaskCard.tsx
│   │   └── TaskCompleteButton.tsx
│   ├── projects/
│   │   ├── ProjectCard.tsx
│   │   └── ProjectStats.tsx
│   ├── clients/
│   │   └── ClientRow.tsx
│   ├── voice/
│   │   ├── VoiceFab.tsx          # The big mic button
│   │   ├── VoiceModal.tsx        # Bottom sheet with transcript + AI parse
│   │   └── useVoiceCapture.ts    # Hook: Web Speech API + Whisper fallback
│   ├── completion/
│   │   └── CompletionBurst.tsx
│   └── calendar/
│       ├── MonthGrid.tsx
│       └── DayTaskList.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Browser client
│   │   ├── server.ts             # Server client (cookies)
│   │   └── middleware.ts         # Auth refresh
│   ├── voice/
│   │   ├── web-speech.ts         # Web Speech API wrapper
│   │   ├── whisper.ts            # Whisper API client
│   │   └── parser.ts             # Claude parser client
│   ├── storage/
│   │   ├── upload.ts             # Image compression + Supabase Storage upload
│   │   └── abstraction.ts        # Swap-ready interface (Supabase Storage / R2 / B2)
│   └── utils/
│       ├── date.ts               # Date formatting (Slovenian locale)
│       └── slugs.ts
│
├── types/
│   ├── database.ts               # Generated from Supabase
│   └── domain.ts                 # Task, Project, Client, Note, Reservation
│
├── styles/
│   └── globals.css               # Tailwind directives + custom CSS vars
│
├── supabase/
│   ├── migrations/               # SQL migrations
│   │   ├── 001_initial.sql
│   │   ├── 002_rls.sql
│   │   └── 003_storage.sql
│   └── config.toml
│
├── public/
│   └── icons/                    # PWA icons, favicon
│
├── middleware.ts                 # Next.js middleware for auth
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Conventions

### File naming
- Pages: lowercase folder + `page.tsx` (App Router)
- Components: `PascalCase.tsx`
- Hooks: `useCamelCase.ts`
- Utils: `kebab-case.ts`

### Data fetching
- **Server Components** for initial data (faster, no waterfall)
- **Client Components** with `useEffect` + Supabase realtime only when needed (e.g. live task list)
- **Server Actions** for mutations (create/update/delete) — Next.js 14 pattern

### State management
- Local component state for UI (modal open, edit mode)
- URL params for filter state (e.g. `/tasks?filter=upcoming`)
- Supabase as source of truth — no Redux, no Zustand for MVP
- **Optimistic updates** via `useOptimistic` (React 19) for snappy feel on task complete

### Voice flow boundaries
- `useVoiceCapture` hook returns: `{ isListening, transcript, start, stop, error }`
- Hook tries Web Speech API first, falls back to MediaRecorder → POST `/api/voice/whisper`
- Once transcript is final → POST `/api/voice/parse` → returns `{ type, title, date, client?, etc. }`
- Modal shows parsed result → user confirms → server action creates entity

### Edit mode rule (CRITICAL)
- Voice can only **create**, never update
- Edit screens require explicit "Uredi" click → enters edit mode → only manual text input
- This prevents accidental data mutation from voice

### Image handling
- Upload always goes through `lib/storage/upload.ts`:
  1. Detect type (image/* → compress; PDF → skip)
  2. If image: `browser-image-compression` with `{ maxSizeMB: 0.3, maxWidthOrHeight: 2400, useWebWorker: true, fileType: 'image/webp' }`
  3. Upload result to Supabase Storage bucket `attachments/{user_id}/{entity_type}/{entity_id}/{filename}.webp`
  4. Store `storage_path` in DB, NOT public URL (sign on read)
- Original is **never** retained — compressed version replaces it
