import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { NextResponse } from 'next/server';
import { pickModel } from '@/lib/ai/models';

const PonudbaPostavkaSchema = z.object({
  naziv: z.string(),
  enota: z.string().optional(),
  kolicina: z.number().optional(),
  cena_na_enoto: z.number().optional(),
});

const PonudbaSchema = z.object({
  detected: z.literal(true),
  title: z.string().nullable(),
  postavke: z.array(PonudbaPostavkaSchema),
});

const FormSchema = z.object({
  type: z.enum(['task', 'project']),
  title: z.string(),
  date: z.string().nullable(),
  date_end: z.string().nullable(),
  time: z.string().nullable(),
  client_name: z.string().nullable(),
  project_name: z.string().nullable(),
  location: z.string().nullable(),
  description: z.string().nullable(),
  ponudba: PonudbaSchema.nullable(),
});

const SYSTEM = `Si asistent za slovenskega obrtnika. Iz govora izlušči ENO primarno nalogo ali projekt.

Vrni JSON:
{
  "type": "task" ali "project",
  "title": "kratek naslov (max 60 znakov)",
  "date": "YYYY-MM-DD ali null",
  "date_end": "YYYY-MM-DD ali null",
  "time": "HH:MM ali null",
  "client_name": "ime stranke ali null",
  "project_name": "ime projekta ali null",
  "location": "lokacija ali null",
  "description": "kratki opis ali null",
  "ponudba": {"detected": true, "title": "naslov ponudbe ali null", "postavke": [...]} ali null
}

Pravila:
- type="task": naloga, aktivnost, ogled, sestanek, klicati, naročilo, montaža, popravilo
- type="project": gradbišče, projekt, objekt, prenova, večje dela za stranko
- date: rok ali datum izvedbe (danes={TODAY})
- date_end: samo če je časovni obseg (od-do)
- Če omeni "ponudba", "cena", "€", "popust" → ponudba.detected=true
- SAMO JSON brez razlage`;

export async function POST(req: Request) {
  const { transcript } = await req.json();

  const today = new Date().toISOString().split('T')[0];

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const msg = await client.messages.create({
    model: pickModel('classifier'),
    max_tokens: 800,
    system: SYSTEM.replace('{TODAY}', today),
    messages: [{ role: 'user', content: transcript }],
  });

  const raw = msg.content[0].type === 'text' ? msg.content[0].text : '';
  const json = raw.replace(/^```(?:json)?\s*|\s*```$/g, '').trim();

  try {
    const form = FormSchema.parse(JSON.parse(json));
    return NextResponse.json({ form, transcript });
  } catch {
    // Fallback: minimal task form from transcript
    const form = {
      type: 'task' as const,
      title: transcript,
      date: null,
      date_end: null,
      time: null,
      client_name: null,
      project_name: null,
      location: null,
      description: null,
      ponudba: null,
    };
    return NextResponse.json({ form, transcript });
  }
}
