export type TranslationRequest = {
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
};

export type TranslationResult = {
  translatedText: string;
  pronunciation?: string;
};

export function validateTranslationInput(request: TranslationRequest): boolean {
  if (!request.text?.trim()) {
    throw new Error('Le texte à traduire est requis.');
  }
  if (request.sourceLanguage === request.targetLanguage) {
    throw new Error('Choisis deux langues différentes.');
  }
  return true;
}
