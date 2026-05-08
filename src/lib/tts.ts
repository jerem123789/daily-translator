export function buildTtsProxyUrl(text: string, lang: string): string {
  const params = new URLSearchParams({ text, lang });
  return `/api/tts?${params.toString()}`;
}
