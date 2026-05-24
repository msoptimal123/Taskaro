# Claude Desktop Setup Prompt

Copy-paste the entire block below into a fresh Claude Desktop chat after attaching this handoff folder.

---

## 📋 Prompt to paste

```
I'm building a web app called Taskaro — a voice-first task manager for solo tradespeople, in Slovenian. Mobile-first responsive web app (used primarily on phones).

I've attached a handoff folder with full specifications. Please read these files in order:

1. handoff/README.md  — project overview + MVP scope
2. handoff/architecture.md  — folder structure + conventions
3. handoff/database-schema.md  — Postgres tables + RLS + migrations
4. handoff/voice-flow.md  — Web Speech + Whisper + Claude parser
5. handoff/screen-specs.md  — each screen's behavior
6. handoff/flows.md  — rezervacija→projekt, solo task→projekt, etc.
7. handoff/design-tokens.md  — colors, typography, spacing
8. handoff/api-design.md  — endpoints + server actions

Visual reference: handoff/prototype/Taskaro Draft 2.html (open in browser to see what the app should look like).

Stack:
- Next.js 14 App Router + TypeScript
- Tailwind CSS (use design-tokens.md for theme)
- Supabase (Postgres + Auth + Storage)
- Web Speech API + OpenAI Whisper fallback for voice
- Claude API (claude-haiku-4-5) for parsing voice into structured tasks

Please proceed in these phases. Wait for me to confirm before moving to the next phase.

──────────────────────────────────────────────
PHASE 1 — Project scaffold
──────────────────────────────────────────────
1. Create a Next.js 14 project with TypeScript, Tailwind, App Router
2. Install: @supabase/supabase-js, @supabase/ssr, @anthropic-ai/sdk, openai, browser-image-compression, zod
3. Set up tailwind.config.ts with colors from design-tokens.md
4. Add DM Sans + DM Serif Display Google Fonts via next/font
5. Create .env.local template with all required env vars
6. Set up Supabase client/server helpers in lib/supabase/

Report back when this is ready.

──────────────────────────────────────────────
PHASE 2 — Database
──────────────────────────────────────────────
1. Apply migrations from handoff/database-schema.md to Supabase
2. Generate TypeScript types into types/database.ts
3. Verify RLS policies work (test with two test users)

Ask me for my Supabase project URL and keys when ready.

──────────────────────────────────────────────
PHASE 3 — Auth
──────────────────────────────────────────────
1. Build /login and /signup pages (email/password + Google OAuth button)
2. Set up /auth/callback route
3. Configure middleware.ts to redirect unauthenticated users to /login
4. Add Supabase Google OAuth provider (I'll need to set up Google Cloud Console — guide me)

──────────────────────────────────────────────
PHASE 4 — Core shell + dashboard
──────────────────────────────────────────────
1. Build app/(app)/layout.tsx with bottom tab bar (6 tabs per design-tokens.md)
2. Build / (dashboard) per screen-specs.md section 2
3. Implement basic mic FAB (modal opens, but stubbed voice for now)
4. Build today's tasks list with optimistic complete + reopen confirm dialog

──────────────────────────────────────────────
PHASE 5 — Tasks
──────────────────────────────────────────────
1. /tasks list with filter chips
2. /tasks/{id} detail in read mode
3. Edit mode (Uredi click)
4. Server actions: createTask, updateTask, completeTask, reopenTask, deleteTask
5. CompletionBurst animation component

──────────────────────────────────────────────
PHASE 6 — Projects
──────────────────────────────────────────────
1. /projects list (3 sections by status)
2. /projects/{id} detail + edit
3. /projects/new wizard with optional solo task picker
4. Confirmation dialogs for Zaključi / Briši
5. Server action: moveTasksToProject

──────────────────────────────────────────────
PHASE 7 — Clients
──────────────────────────────────────────────
1. /clients list + search
2. /clients/{id} detail + edit
3. Client autocomplete component (used in task/project forms)
4. tel: / mailto: links

──────────────────────────────────────────────
PHASE 8 — Notes
──────────────────────────────────────────────
1. /notes page
2. Inline mic button (small, separate flow — voice → text → save as note, no AI routing)

──────────────────────────────────────────────
PHASE 9 — Calendar
──────────────────────────────────────────────
1. /calendar page with month grid + day dropdown
2. Multi-day rezervacija display
3. Reservation → project conversion (Potrdi termin button → server action confirmReservation)

──────────────────────────────────────────────
PHASE 10 — Voice (THE big one)
──────────────────────────────────────────────
1. useVoiceCapture hook with Web Speech primary + Whisper fallback
2. /api/voice/whisper route
3. /api/voice/parse route (Claude prompt from voice-flow.md)
4. VoiceModal component matching prototype design
5. Wire mic FAB on dashboard to full flow
6. createFromVoice server action

──────────────────────────────────────────────
PHASE 11 — Attachments
──────────────────────────────────────────────
1. Storage upload helper with image compression
2. Attachment chips in task + project detail
3. Lightbox preview component
4. Signed URL fetching

──────────────────────────────────────────────
PHASE 12 — Polish + deploy
──────────────────────────────────────────────
1. PWA manifest + icons (so users can install on home screen)
2. Loading states + skeletons
3. Error boundaries + toast feedback
4. Mobile keyboard handling (input doesn't get covered)
5. Deploy to Vercel
6. Set up production env vars

Throughout: write clean TypeScript, use Server Components where possible, optimistic UI for snappy feel, accessibility (keyboard nav, ARIA labels). Match the design fidelity of the prototype.

Start with Phase 1. Stop after each phase and show me the result.
```

---

## ⚙️ Setup checklist BEFORE pasting prompt

You'll need to have these ready or create them as Claude guides you:

- [ ] **Supabase project** (free): https://supabase.com → New Project → save URL, anon key, service_role key
- [ ] **Anthropic API key**: https://console.anthropic.com → Settings → API keys
- [ ] **OpenAI API key** (for Whisper fallback): https://platform.openai.com → API keys
- [ ] **Google Cloud Console** (for OAuth) — Claude will guide setup
- [ ] **Vercel account** (free): https://vercel.com — for deployment in Phase 12
- [ ] **Node.js 20+** installed locally
- [ ] **git** installed

## 💡 Tips for working with Claude Desktop

1. **Don't push too fast** — let Claude finish each phase, then test it yourself before approving the next phase
2. **If something looks wrong**, paste a screenshot and describe expected vs actual
3. **Reference files by name** — "Looking at screen-specs.md section 4, the edit mode should allow..."
4. **Commit often** — ask Claude to commit after each phase so you can roll back
5. **Test on actual phone** — open the dev server URL on your phone (use your local network IP) to feel the real UX
6. **Voice is the hardest part** — give Phase 10 extra attention and testing
