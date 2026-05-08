import { NextResponse } from 'next/server';
import { validateTranslationInput } from '@/lib/translation';

export const runtime = 'nodejs';

type ProviderResponse = string[][][];

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      text?: string;
      sourceLanguage?: string;
      targetLanguage?: string;
    };

    const text = payload.text ?? '';
    const sourceLanguage = payload.sourceLanguage ?? '';
    const targetLanguage = payload.targetLanguage ?? '';

    validateTranslationInput({ text, sourceLanguage, targetLanguage });

    const endpoint = new URL('https://translate.googleapis.com/translate_a/single');
    endpoint.searchParams.set('client', 'gtx');
    endpoint.searchParams.set('sl', sourceLanguage);
    endpoint.searchParams.set('tl', targetLanguage);
    endpoint.searchParams.append('dt', 't');
    endpoint.searchParams.append('dt', 'rm');
    endpoint.searchParams.set('q', text);

    const response = await fetch(endpoint, {
      headers: {
        'User-Agent': 'DailyTranslator/1.0'
      },
      next: { revalidate: 0 }
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Le service de traduction externe ne répond pas correctement.' },
        { status: 502 }
      );
    }

    const raw = (await response.json()) as ProviderResponse;
    const result = parseTranslationResponse(raw);

    if (!result.translatedText) {
      return NextResponse.json(
        { error: "Impossible d'interpréter la traduction renvoyée." },
        { status: 502 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Une erreur inattendue est survenue.';
    const status = message === 'Le texte à traduire est requis.' || message === 'Choisis deux langues différentes.' ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

function parseTranslationResponse(raw: ProviderResponse) {
  const translatedText = raw[0]
    ?.map((chunk) => chunk[0])
    .filter(Boolean)
    .join('') ?? '';

  const pronunciation = raw[0]
    ?.map((chunk) => chunk[2])
    .filter(Boolean)
    .join('') ?? '';

  return { translatedText, pronunciation };
}
