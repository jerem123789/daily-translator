'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  buildHistoryEntry,
  getLanguageByCode,
  getThemeByLanguageCode,
  getThemeCountByLanguageCode,
  supportedLanguages,
  type HistoryEntry,
} from '@/lib/languages';
import { buildTtsProxyUrl } from '@/lib/tts';
import { validateTranslationInput, type TranslationRequest, type TranslationResult } from '@/lib/translation';

type TranslatorAppProps = {
  fetcher?: (request: TranslationRequest) => Promise<TranslationResult>;
};

type BrowserSpeechRecognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror?: (() => void) | null;
  onend?: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type DictationMode = 'dictation' | 'dictation_and_translate';

const STORAGE_KEY = 'daily-translator-history';
const THEME_ROTATION_INTERVAL_MS = 9000;

const defaultFetcher = async (request: TranslationRequest) => {
  const response = await fetch('/api/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    throw new Error('Impossible de traduire le texte pour le moment.');
  }

  return response.json() as Promise<TranslationResult>;
};

function loadStoredHistory() {
  if (typeof window === 'undefined') {
    return [] as HistoryEntry[];
  }

  const rawHistory = window.localStorage.getItem(STORAGE_KEY);

  if (!rawHistory) {
    return [] as HistoryEntry[];
  }

  try {
    return JSON.parse(rawHistory) as HistoryEntry[];
  } catch {
    return [] as HistoryEntry[];
  }
}

function getSpeechRecognitionConstructor(): (new () => BrowserSpeechRecognition) | null {
  if (typeof window === 'undefined') return null;
  return (
    (window as unknown as { SpeechRecognition?: new () => BrowserSpeechRecognition }).SpeechRecognition ||
    (window as unknown as { webkitSpeechRecognition?: new () => BrowserSpeechRecognition }).webkitSpeechRecognition ||
    null
  );
}

export function TranslatorApp({ fetcher = defaultFetcher }: TranslatorAppProps) {
  const [sourceLanguage, setSourceLanguage] = useState('fr');
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [sourceText, setSourceText] = useState('');
  const [translationText, setTranslationText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [hasSpeechRecognitionSupport, setHasSpeechRecognitionSupport] = useState(false);
  const [dictationMode, setDictationMode] = useState<DictationMode>('dictation_and_translate');
  const [pronunciation, setPronunciation] = useState('');
  const [activeThemeIndex, setActiveThemeIndex] = useState<Record<string, number>>({});
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);

  const canTranslate = (() => {
    try {
      return validateTranslationInput({ text: sourceText, sourceLanguage, targetLanguage });
    } catch {
      return false;
    }
  })();

  const peutDicter = hasSpeechRecognitionSupport;
  const canSpeak = typeof window !== 'undefined' && typeof window.speechSynthesis !== 'undefined';
  const canPlayAudio = typeof window !== 'undefined' && typeof window.Audio !== 'undefined';
  const activeThemeIndexByLanguage = activeThemeIndex[targetLanguage] ?? 0;
  const targetTheme = useMemo(
    () => getThemeByLanguageCode(targetLanguage, activeThemeIndexByLanguage),
    [targetLanguage, activeThemeIndexByLanguage]
  );
  const targetThemeCount = useMemo(() => getThemeCountByLanguageCode(targetLanguage), [targetLanguage]);

  useEffect(() => {
    setHistory(loadStoredHistory());
  }, []);

  useEffect(() => {
    const refreshSpeechRecognitionSupport = () => {
      setHasSpeechRecognitionSupport(Boolean(getSpeechRecognitionConstructor()));
    };
    refreshSpeechRecognitionSupport();
    window.addEventListener('focus', refreshSpeechRecognitionSupport);
    document.addEventListener('visibilitychange', refreshSpeechRecognitionSupport);

    return () => {
      window.removeEventListener('focus', refreshSpeechRecognitionSupport);
      document.removeEventListener('visibilitychange', refreshSpeechRecognitionSupport);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    if (targetThemeCount < 2) {
      return;
    }
    const timer = window.setInterval(() => {
      setActiveThemeIndex((courant) => ({
        ...courant,
        [targetLanguage]: ((courant[targetLanguage] ?? 0) + 1) % targetThemeCount,
      }));
    }, THEME_ROTATION_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [targetLanguage, targetThemeCount]);

  async function handleTranslate() {
    if (!canTranslate) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetcher({
        text: sourceText,
        sourceLanguage,
        targetLanguage,
      });
      setTranslationText(result.translatedText);
      if (result.pronunciation) {
        setPronunciation(result.pronunciation);
      }
      const entry = buildHistoryEntry({
        sourceText,
        translatedText: result.translatedText,
        sourceCode: sourceLanguage,
        targetCode: targetLanguage,
      });
      setHistory((prev) => [entry, ...prev].slice(0, 10));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIsLoading(false);
    }
  }

  function handleDictation(mode: DictationMode) {
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const SpeechRecognition = getSpeechRecognitionConstructor();
    if (!SpeechRecognition) return;

    setDictationMode(mode);
    setIsListening(true);
    setError(null);

    const recognition = new SpeechRecognition();
    recognition.lang = sourceLanguage;
    // Mobile-friendly settings: single utterance, no interim results
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => Array.from(result).map((r) => r.transcript).join(''))
        .join('');
      setSourceText(transcript);
      if (mode === 'dictation_and_translate') {
        setTimeout(() => {
          setIsLoading(true);
          fetcher({ text: transcript, sourceLanguage, targetLanguage })
            .then((result) => {
              setTranslationText(result.translatedText);
              if (result.pronunciation) setPronunciation(result.pronunciation);
              const entry = buildHistoryEntry({
                sourceText: transcript,
                translatedText: result.translatedText,
                sourceCode: sourceLanguage,
                targetCode: targetLanguage,
              });
              setHistory((prev) => [entry, ...prev].slice(0, 10));
            })
            .catch((err) => setError(err instanceof Error ? err.message : 'Erreur'))
            .finally(() => setIsLoading(false));
        }, 100);
      }
    };
    recognition.onerror = () => setError('Impossible de démarrer la reconnaissance vocale. Vérifiez vos permissions.');
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
  }

  function handleSpeakTranslation() {
    if (!translationText.trim()) return;
    if (canSpeak) {
      const utterance = new SpeechSynthesisUtterance(translationText);
      utterance.lang = targetLanguage;
      window.speechSynthesis.speak(utterance);
    } else if (canPlayAudio) {
      const url = buildTtsProxyUrl(translationText, targetLanguage);
      const audio = new Audio(url);
      audio.play();
    }
  }

  function handleSwapLanguages() {
    const newSource = targetLanguage;
    const newTarget = sourceLanguage;
    setSourceLanguage(newSource);
    setTargetLanguage(newTarget);
    setSourceText(translationText);
    setTranslationText(sourceText);
  }

  const needsReadingHelp = pronunciation.trim() !== '' && pronunciation.trim() !== translationText.trim();

  return (
    <div className="translator-shell">
      <div className="translator-card">
        <p className="app-tag">Daily Translator</p>
        <h1 className="app-title">Traduction vocale instantanée.</h1>
        <p className="app-subtitle">Choisis la langue, appuie sur le micro et parle.</p>

        <div className="controls-grid">
          <label>
            <span className="lang-label">Traduire depuis</span>
            <select
              className="lang-select"
              value={sourceLanguage}
              onChange={(e) => setSourceLanguage(e.target.value)}
              aria-label="Langue source"
            >
              {supportedLanguages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.label}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            className="swap-button"
            onClick={handleSwapLanguages}
            aria-label="Inverser les langues"
            title="Inverser les langues"
          >
            ⇄
          </button>

          <label>
            <span className="lang-label">Traduire vers</span>
            <select
              className="lang-select"
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              aria-label="Langue cible"
            >
              {supportedLanguages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="voice-stage">
          <button
            type="button"
            className={`microphone-button${isListening ? ' is-listening' : ''}`}
            onClick={() => void handleDictation('dictation_and_translate')}
            disabled={isLoading}
            aria-label={isListening ? 'Arrêter la dictée' : 'Appuyer pour parler'}
            aria-pressed={isListening}
          >
            <span className="microphone-icon" aria-hidden="true">{isListening ? '⏹' : '🎤'}</span>
            <span className="microphone-title">
              {isListening && dictationMode === 'dictation_and_translate' ? 'Appuyer pour arrêter' : 'Appuyer pour parler'}
            </span>
            <span className="microphone-subtitle">
              {isListening && dictationMode === 'dictation_and_translate'
                ? 'Parle maintenant, je traduis juste après.'
                : 'La traduction se lance et la voix traduit automatiquement.'}
            </span>
          </button>

          {isLoading ? <p className="voice-status" role="status">Traduction en cours…</p> : null}
          {peutDicter && !isListening && !isLoading ? (
            <p className="voice-status">Si le micro ne se lance pas, autorisez le micro dans votre navigateur.</p>
          ) : null}
          {!peutDicter && !isLoading ? (
            <p className="voice-status voice-status-error">Reconnaissance vocale non supportée sur ce navigateur.</p>
          ) : null}
          {error ? <p className="voice-status voice-status-error" role="alert">{error}</p> : null}
        </div>

        <div className="text-grid">
          <label>
            <span className="lang-label">Ce que tu as dit</span>
            <textarea
              aria-label="Texte à traduire"
              value={sourceText}
              onChange={(event) => setSourceText(event.target.value)}
              placeholder="Ta phrase apparaîtra ici automatiquement"
              rows={5}
              inputMode="text"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="sentences"
              spellCheck={false}
            />
          </label>

          <label>
            <span className="lang-label">Traduction</span>
            <textarea
              aria-label="Traduction"
              value={translationText}
              readOnly
              placeholder="La traduction s'affichera ici"
              rows={5}
              aria-live="polite"
            />
          </label>
        </div>

        {needsReadingHelp ? (
          <div className="history-panel">
            <h2>Comment le lire</h2>
            <p className="history-empty">Prononciation simplifiée pour t'aider à comprendre et répéter.</p>
            <textarea aria-label="Prononciation" value={pronunciation} readOnly rows={3} />
          </div>
        ) : null}

        <div className="actions-row actions-row-secondary">
          <button type="button" className="primary-button" onClick={() => void handleTranslate()} disabled={!canTranslate || isLoading}>
            {isLoading ? 'Traduction...' : 'Traduire le texte'}
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={() => void handleDictation('dictation')}
            disabled={isLoading}
            aria-label="Dicter le texte uniquement"
          >
            Dicter seulement
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={handleSpeakTranslation}
            disabled={!translationText.trim() || (!canSpeak && !canPlayAudio)}
            aria-label="Écouter la traduction"
          >
            Écouter la traduction
          </button>
        </div>

        <div className="history-panel">
          <h2>Historique récent</h2>
          {history.length === 0 ? (
            <p className="history-empty">Tes traductions récentes apparaîtront ici.</p>
          ) : (
            <ul>
              {history.map((entrée) => (
                <li key={`${entrée.createdAt}-${entrée.sourceText}`}>
                  <strong>{entrée.sourceLanguage} → {entrée.targetLanguage}</strong>
                  <span>{entrée.sourceText}</span>
                  <span>{entrée.translatedText}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <footer className="app-footer">
          <span>Créé par Jérémy Gonin</span>
          <a href="https://www.jeremyai.fr" target="_blank" rel="noreferrer">
            jeremyai.fr
          </a>
        </footer>
      </div>
    </div>
  );
}
