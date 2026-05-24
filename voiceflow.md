# Voice Flow

## Goal
Tap mic → speak → automatic transcript → AI classifies into Task / Deadline / Rezervacija / Note + extracts metadata → user confirms → entity created.

**Critical rule**: Voice only **creates**, never updates. Edit operations require manual "Uredi" click first.

---

## Pipeline

```
┌──────────────┐    ┌──────────────────┐    ┌────────────────┐    ┌──────────────┐
│ User taps    │ →  │ Transcription    │ →  │ Claude parser  │ →  │ Confirmation │
│ mic on       │    │ (Web Speech or   │    │ (structured    │    │ modal + save │
│ dashboard    │    │  Whisper API)    │    │  JSON output)  │    │              │
└──────────────┘    └──────────────────┘    └────────────────┘    └──────────────┘
```

---

## Step 1: Transcription

### Primary: Web Speech API

Browser-native, free, fast. Works on Chrome desktop, Chrome Android, Safari iOS 14.5+ (limited).

```ts
// lib/voice/web-speech.ts
export function isWebSpeechSupported() {
  return typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
}

export function createWebSpeechRecognizer(opts: {
  onPartial: (text: string) => void;
  onFinal: (text: string) => void;
  onError: (err: Error) => void;
}) {
  const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const rec = new SR();
  rec.lang = 'sl-SI';                  // Slovenian
  rec.continuous = false;
  rec.interimResults = true;
  rec.maxAlternatives = 1;

  rec.onresult = (e: any) => {
    let interim = '', final = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const t = e.results[i][0].transcript;
      if (e.results[i].isFinal) final += t; else interim += t;
    }
    if (interim) opts.onPartial(interim);
    if (final) opts.onFinal(final);
  };
  rec.onerror = (e: any) => opts.onError(new Error(e.error));
  return rec;
}
```

### Fallback: Whisper

If Web Speech is unsupported OR `lang='sl-SI'` returns empty results (some browsers ignore the lang), fall back to recording audio with `MediaRecorder` and POSTing to our Whisper endpoint.

```ts
// app/api/voice/whisper/route.ts
import OpenAI from 'openai';

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('audio') as File;

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const result = await openai.audio.transcriptions.create({
    file,
    model: 'whisper-1',
    language: 'sl',
  });
  return Response.json({ text: result.text });
}
```

Cost: ~$0.006/min. For a typical 10-second voice input = $0.001. Negligible.

### Detection strategy

```ts
// In useVoiceCapture hook
async function start() {
  if (isWebSpeechSupported()) {
    try {
      await tryWebSpeech();
      return;
    } catch (e) {
      console.warn('Web Speech failed, falling back to Whisper', e);
    }
  }
  await recordAndWhisper();
}
```

---

## Step 2: Claude parser

Once we have a final transcript, we send it to Claude to extract structured data.

### Endpoint

```ts
// app/api/voice/parse/route.ts
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';

const ResultSchema = z.object({
  type: z.enum(['task', 'deadline', 'rezervacija', 'note']),
  title: z.string(),
  description: z.string().nullable(),
  client_name: z.string().nullable(),
  location: z.string().nullable(),
  due_date: z.string().nullable(),       // ISO YYYY-MM-DD
  due_time: z.string().nullable(),       // HH:mm
  start_date: z.string().nullable(),     // for rezervacija
  end_date: z.string().nullable(),
});

const SYSTEM = `You parse Slovenian voice transcripts from a tradesperson (builder/contractor) into structured tasks.

Output ONLY a JSON object matching this exact schema:
{
  "type": "task" | "deadline" | "rezervacija" | "note",
  "title": "short title in Slovenian",
  "description": null | "longer detail if mentioned",
  "client_name": null | "client surname or full name if mentioned",
  "location": null | "address or place if mentioned",
  "due_date": null | "YYYY-MM-DD",
  "due_time": null | "HH:mm",
  "start_date": null | "YYYY-MM-DD",     // ONLY for rezervacija (multi-day)
  "end_date": null | "YYYY-MM-DD"
}

Type classification rules:
- "rezervacija" if user mentions reserving/booking a date range or multi-day commitment ("rezerviraj", "rezervacija", "od X do Y", "blokira termin")
- "deadline" if user mentions a hard deadline ("do petka", "do konca tedna", "rok je...")
- "note" if it's a personal reminder, idea, or research note not tied to a client action ("ne pozabi...", "razmisli...", "preveri ceno...")
- "task" otherwise (default: ogled, sestanek, klic, izvedba)

Date parsing (today is {TODAY_ISO}, day-of-week is {TODAY_DOW}):
- "jutri" = tomorrow
- "v sredo" = next Wednesday from today
- "naslednji teden" = +7 days, leave date null if too vague
- "do petka" = upcoming Friday
- If no date mentioned, leave null

Slovenian month names: januar, februar, marec, april, maj, junij, julij, avgust, september, oktober, november, december.

If transcript is unclear, set type="task" with the literal text as title.
NEVER include explanation or commentary, ONLY the JSON object.`;

export async function POST(req: Request) {
  const { transcript } = await req.json();
  const today = new Date();
  const todayISO = today.toISOString().split('T')[0];
  const todayDOW = ['nedelja','ponedeljek','torek','sreda','četrtek','petek','sobota'][today.getDay()];

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const msg = await client.messages.create({
    model: 'claude-haiku-4-5',           // fast + cheap, fine for this
    max_tokens: 400,
    system: SYSTEM.replace('{TODAY_ISO}', todayISO).replace('{TODAY_DOW}', todayDOW),
    messages: [{ role: 'user', content: transcript }],
  });

  const raw = msg.content[0].type === 'text' ? msg.content[0].text : '';
  // Strip any accidental markdown fences
  const json = raw.replace(/^```(?:json)?\s*|\s*```$/g, '').trim();

  try {
    const parsed = ResultSchema.parse(JSON.parse(json));
    return Response.json(parsed);
  } catch (e) {
    // Fallback: treat as plain task
    return Response.json({
      type: 'task', title: transcript, description: null,
      client_name: null, location: null,
      due_date: null, due_time: null,
      start_date: null, end_date: null,
    });
  }
}
```

### Cost

claude-haiku-4-5: $1/MTok input, $5/MTok output. Typical request: ~500 input + ~150 output = $0.001 per voice input. **At 100 voice inputs/day = $0.10/day**.

---

## Step 3: Confirmation modal

After parsing returns, show modal with:

```
┌─────────────────────────────────────────┐
│ Nov vnos                      [Prekliči]│
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ Jutri ob 10h ogled pri Novaku       │ │   ← editable transcript
│ │ v Mariboru                          │ │
│ │                                     │ │
│ │ ╿─ TASK ─ jutri 10:00 ─ AI ───────╿ │ │   ← AI-detected badges
│ └─────────────────────────────────────┘ │
│                                         │
│  [🎤]              [    Shrani    ]    │
└─────────────────────────────────────────┘
```

User can:
- Edit the transcript text directly
- Re-record (mic icon)
- Tap "Shrani" → server action creates the entity

The parsed metadata badges (type, date, client) update live if the user edits text (re-run parser on edit, debounced 600ms).

---

## Step 4: Server action

```ts
// app/(app)/actions.ts
'use server';
import { createServerClient } from '@/lib/supabase/server';

export async function createFromVoice(parsed: ParsedVoice, finalText: string) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // 1. Resolve client (find or create)
  let clientId = null;
  if (parsed.client_name) {
    const { data: existing } = await supabase
      .from('clients').select('id')
      .ilike('name', `%${parsed.client_name}%`)
      .limit(1).maybeSingle();

    if (existing) clientId = existing.id;
    else {
      const { data: created } = await supabase
        .from('clients').insert({ user_id: user.id, name: parsed.client_name })
        .select('id').single();
      clientId = created!.id;
    }
  }

  // 2. Route by type
  if (parsed.type === 'note') {
    return supabase.from('notes').insert({
      user_id: user.id,
      text: finalText,
      source_transcript: finalText,
    });
  }

  return supabase.from('tasks').insert({
    user_id: user.id,
    client_id: clientId,
    type: parsed.type,             // 'task' | 'deadline' | 'rezervacija'
    title: parsed.title,
    description: parsed.description,
    location: parsed.location,
    due_date: parsed.due_date,
    due_time: parsed.due_time,
    start_date: parsed.type === 'rezervacija' ? parsed.start_date : null,
    end_date: parsed.type === 'rezervacija' ? parsed.end_date : null,
    source_transcript: finalText,
  });
}
```

---

## Error states to handle

1. **Mic permission denied** → show explainer with instructions to enable in browser settings
2. **No speech detected** (5s timeout) → show "Nič nismo slišali" with retry button
3. **Whisper API fails** → fall back to plain text input
4. **Claude API fails** → save as plain task with full transcript as title
5. **Browser doesn't support either** → show only text input, no voice button

---

## Phase 2 enhancements (out of MVP, schema ready)

- Streaming Claude responses → show parsed fields populating in real-time
- Multi-language support (Croatian, German for Austrian customers)
- Voice commands for navigation ("odpri taske")
- Voice editing of existing items (after Uredi click)
