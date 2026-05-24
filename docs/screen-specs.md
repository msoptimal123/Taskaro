# Taskaro — Developer Handoff

This package contains everything Claude Desktop (or any developer) needs to build the **Taskaro** web app from the design prototype in this project.

---

## What Taskaro is

A **voice-first task manager for solo tradespeople / contractors** (in Slovenian). Single-user web app, mobile-optimized, used primarily from phones in the field.

The killer feature: tap mic → speak → AI parses your speech into a structured Task, Deadline, Rezervacija, or Note → confirm → saved.

---

## MVP Scope

### IN (Phase 1)
- Auth: email/password + Google login (Supabase Auth)
- Dashboard with greeting, today's open tasks count, voice mic, task list
- Tasks (CRUD): solo or attached to projects
- Projects (CRUD): grouped Active / Reserved / Closed
- Clients (CRUD): name, phone, email — created inline from task/projekt voice input
- Notes (CRUD): user-only, voice or text
- Calendar: month view + day dropdown of tasks
- Voice input on dashboard: Web Speech API → Claude parser → structured entity → manual confirm
- File attachments: images auto-compressed (WebP, max 2400px, no original kept), PDFs as-is, all in Supabase Storage
- Reservation → project conversion flow (confirm reservation creates project)
- Solo task → project: manual move only (user decides which tasks belong)
- Edit flows: user MUST click "Uredi" first, then can use mic dictation
- Optimistic UI for completing tasks + confetti celebration

### OUT (Phase 2, prepare schema for)
- Push notifications
- Email reminders
- Calendar sync (Google / iCloud)
- Multi-user / team accounts
- Search across all entities

---

## Stack

| Layer | Choice |
|---|---|
| Frontend | **Next.js 14** (App Router) + TypeScript |
| Styling | **Tailwind CSS** with custom config matching `design-tokens.md` |
| Backend | **Supabase** (Postgres + Auth + Storage + RLS) |
| Voice transcription | **Web Speech API** (primary) → **OpenAI Whisper** fallback for unsupported browsers |
| Voice → structured data | **Claude API** (claude-sonnet-4-5 or haiku-4-5) |
| Hosting | **Vercel** (free tier) |
| Image optimization | `browser-image-compression` library (client-side) |
| Fonts | DM Sans (UI) + DM Serif Display (greeting) via Google Fonts |

---

## File index

| File | Purpose |
|---|---|
| `README.md` | This file — overview |
| `architecture.md` | Folder structure, file org, conventions |
| `database-schema.md` | All Postgres tables, RLS policies, migrations |
| `api-design.md` | Supabase queries per screen, server actions |
| `voice-flow.md` | Web Speech + Whisper + Claude parser spec |
| `design-tokens.md` | Colors, type, spacing, components |
| `screen-specs.md` | Each screen described with behavior + states |
| `flows.md` | Critical flows: voice capture, rezervacija → projekt, solo task → projekt |
| `claude-desktop-prompt.md` | Exact prompt to paste into Claude Desktop to start building |
| `prototype/` | The HTML prototype + assets (for visual reference) |

---

## How to use this with Claude Desktop

1. Open **Claude Desktop** on your machine (latest version, has filesystem + shell access)
2. Create a new project / chat
3. Attach this entire `handoff/` folder
4. Paste the prompt from `claude-desktop-prompt.md`
5. Claude will: scaffold Next.js, install dependencies, set up Supabase, implement screens one-by-one, run dev server

Have ready before starting:
- A new **Supabase project** (free tier) — get URL + anon key + service_role key
- An **Anthropic API key** (for Claude voice parser)
- An **OpenAI API key** (for Whisper fallback) — optional but recommended
- A **Vercel account** for deployment (later)
