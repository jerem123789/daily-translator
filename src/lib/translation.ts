export type TranslationRequest = {
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
};

export type TranslationResult = {
  translatedText: string;
  pronunciation?: string;
};

/**
 * Validates the translation input and returns true if valid, false otherwise.
 * Throws an Error with a user-facing message if input is invalid,
 * so callers can wrap in try/catch for boolean checks.
 */
export function validateTranslationInput(request: TranslationRequest): boolean {
  if (!request.text?.trim()) {
    throw new Error('Le texte à traduire est requis.');
  }
  if (request.sourceLanguage === request.targetLanguage) {
    throw new Error('Choisis deux langues différentes.');
  }
  return true;
}
