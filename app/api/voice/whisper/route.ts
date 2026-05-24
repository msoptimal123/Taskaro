import OpenAI from 'openai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('audio') as File;
  if (!file) return NextResponse.json({ error: 'No audio file' }, { status: 400 });

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const result = await openai.audio.transcriptions.create({
    file,
    model: 'whisper-1',
    language: 'sl',
  });

  return NextResponse.json({ text: result.text });
}
