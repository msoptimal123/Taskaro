import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('image') as File | null;
  if (!file) return NextResponse.json({ error: 'No image' }, { status: 400 });

  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  const mediaType = (file.type || 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';

  const msg = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 256,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mediaType, data: base64 },
          },
          {
            type: 'text',
            text: `Extract contact information from this image (screenshot of a contact, business card, etc.).
Return ONLY a JSON object with these fields (null if not found):
{
  "name": "Full name",
  "phone": "Phone number",
  "email": "Email address"
}
No explanation, only JSON.`,
          },
        ],
      },
    ],
  });

  const raw = msg.content[0].type === 'text' ? msg.content[0].text : '';
  const json = raw.replace(/^```(?:json)?\s*|\s*```$/g, '').trim();

  try {
    const parsed = JSON.parse(json);
    return NextResponse.json({
      name: parsed.name ?? null,
      phone: parsed.phone ?? null,
      email: parsed.email ?? null,
    });
  } catch {
    return NextResponse.json({ name: null, phone: null, email: null });
  }
}
