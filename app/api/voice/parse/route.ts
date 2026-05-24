import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { NextResponse } from 'next/server';

const ResultSchema = z.object({
  type: z.enum(['task', 'deadline', 'rezervacija', 'note']),
  title: z.string(),
  description: z.string().nullable(),
  client_name: z.string().nullable(),
  location: z.string().nullable(),
  due_date: z.string().nullable(),
  due_time: z.string().nullable(),
  start_date: z.string().nullable(),
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
  "start_date": null | "YYYY-MM-DD",
  "end_date": null | "YYYY-MM-DD"
}

Type classification rules:
- "rezervacija" if user mentions booking a date range ("rezerviraj", "od X do Y", "blokira termin")
- "deadline" if user mentions a hard deadline ("do petka", "rok je...")
- "note" if it's a personal reminder or idea ("ne pozabi...", "razmisli...", "preveri...")
- "task" otherwise (default: ogled, sestanek, klic, izvedba)

Date parsing (today is {TODAY_ISO}, day-of-week is {TODAY_DOW}):
- "jutri" = tomorrow
- "v sredo" = next Wednesday from today
- "do petka" = upcoming Friday
- If no date mentioned, leave null

Slovenian months: januar, februar, marec, april, maj, junij, julij, avgust, september, oktober, november, december.

If transcript is unclear, set type="task" with the literal text as title.
NEVER include explanation, ONLY the JSON object.`;

export async function POST(req: Request) {
  const { transcript } = await req.json();

  const today = new Date();
  const todayISO = today.toISOString().split('T')[0];
  const todayDOW = ['nedelja','ponedeljek','torek','sreda','četrtek','petek','sobota'][today.getDay()];

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const msg = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 400,
    system: SYSTEM.replace('{TODAY_ISO}', todayISO).replace('{TODAY_DOW}', todayDOW),
    messages: [{ role: 'user', content: transcript }],
  });

  const raw = msg.content[0].type === 'text' ? msg.content[0].text : '';
  const json = raw.replace(/^```(?:json)?\s*|\s*```$/g, '').trim();

  try {
    return NextResponse.json(ResultSchema.parse(JSON.parse(json)));
  } catch {
    return NextResponse.json({
      type: 'task', title: transcript, description: null,
      client_name: null, location: null,
      due_date: null, due_time: null, start_date: null, end_date: null,
    });
  }
}
