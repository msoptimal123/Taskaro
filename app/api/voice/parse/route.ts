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

const IntentSchema = z.object({
  type: z.enum(['task', 'deadline', 'rezervacija', 'note', 'ponudba']),
  title: z.string(),
  description: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  due_date: z.string().nullable().optional(),
  due_time: z.string().nullable().optional(),
  start_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),
  client_name: z.string().nullable().optional(),
  ponudba_postavke: z.array(PonudbaPostavkaSchema).optional(),
});

const ResponseSchema = z.object({
  intents: z.array(IntentSchema),
});

const SYSTEM = `Si asistent za slovenskega obrtnika. Iz govora razčleni VSE namere (intente) — en glasovni vnos lahko vsebuje več stvari hkrati.

Vrni JSON:
{
  "intents": [
    {
      "type": "task|deadline|rezervacija|note|ponudba",
      "title": "kratek naslov",
      "client_name": "ime stranke ali null",
      "due_date": "YYYY-MM-DD ali null",
      "due_time": "HH:MM ali null",
      "start_date": "YYYY-MM-DD ali null",
      "end_date": "YYYY-MM-DD ali null",
      "location": "lokacija ali null",
      "description": "opis ali null",
      "ponudba_postavke": [{"naziv":"...", "enota":"m²", "kolicina":18, "cena_na_enoto":25}]
    }
  ]
}

Pravila:
- type="task": navadno opravilo
- type="deadline": rok, datum je kritičen
- type="rezervacija": rezervacija termina za stranko (ima start_date in end_date)
- type="note": kratka opomba brez konteksta
- type="ponudba": ponudba s postavkami in cenami
- Datumi: danes={TODAY}, format YYYY-MM-DD
- Čas: format HH:MM (24h)
- Če govori o eni stranki v več intentih, ponovi client_name pri vsakem
- SAMO JSON, brez razlage`;

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
    const parsed = ResponseSchema.parse(JSON.parse(json));
    return NextResponse.json({ intents: parsed.intents, transcript });
  } catch {
    // Fallback: single task intent from transcript
    return NextResponse.json({
      intents: [
        {
          type: 'task',
          title: transcript,
          description: null,
          client_name: null,
          location: null,
          due_date: null,
          due_time: null,
          start_date: null,
          end_date: null,
        },
      ],
      transcript,
    });
  }
}
