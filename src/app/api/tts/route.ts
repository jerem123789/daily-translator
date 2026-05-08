import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get('text') ?? '';
  const lang = searchParams.get('lang') ?? 'fr';

  if (!text.trim()) {
    return NextResponse.json({ error: 'Text is required' }, { status: 400 });
  }

  const ttsUrl = `https://translate.googleapis.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang}&client=gtx`;

  try {
    const response = await fetch(ttsUrl, {
      headers: { 'User-Agent': 'DailyTranslator/1.0' }
    });
    
    if (!response.ok) {
      return NextResponse.json({ error: 'TTS service unavailable' }, { status: 502 });
    }
    
    const audioBuffer = await response.arrayBuffer();
    
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=3600',
      }
    });
  } catch {
    return NextResponse.json({ error: 'Failed to generate audio' }, { status: 500 });
  }
}
