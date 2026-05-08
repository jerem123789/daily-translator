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
  return !!(request.text?.trim() && request.sourceLanguage && request.targetLanguage);
}
