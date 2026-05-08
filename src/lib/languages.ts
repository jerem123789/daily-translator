export type Language = {
  code: string;
  label: string;
  flag: string;
};

export type LanguageTheme = {
  country: string;
  city: string;
  landmark: string;
  gradient: string;
  imageUrl: string;
  monuments?: LanguageTheme[];
};

type HistoryEntryInput = {
  sourceText: string;
  translatedText: string;
  sourceCode: string;
  targetCode: string;
};

export type HistoryEntry = {
  sourceText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  createdAt: string;
};

function createMonumentTheme(country: string, city: string, landmark: string, gradient: string, imageUrl: string): LanguageTheme {
  return { country, city, landmark, gradient, imageUrl };
}

export const supportedLanguages: Language[] = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', label: 'Português', flag: '🇵🇹' },
  { code: 'zh-CN', label: '中文', flag: '🇨🇳' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'nl', label: 'Nederlands', flag: '🇳🇱' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
  { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
  { code: 'pl', label: 'Polski', flag: '🇵🇱' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
];

export const languageThemes: Record<string, LanguageTheme[]> = {
  fr: [
    createMonumentTheme('France', 'Paris', 'Tour Eiffel', 'linear-gradient(135deg, rgba(37, 99, 235, 0.84), rgba(239, 68, 68, 0.72))', 'https://upload.wikimedia.org/wikipedia/commons/a/a7/Camponotus_flavomarginatus_ant.jpg'),
    createMonumentTheme('France', 'Paris', 'Louvre', 'linear-gradient(135deg, rgba(120, 53, 15, 0.84), rgba(251, 191, 36, 0.72))', 'https://upload.wikimedia.org/wikipedia/commons/6/66/VanGogh-starry_night_ballance1.jpg'),
  ],
  en: [
    createMonumentTheme('USA', 'New York', 'Statue of Liberty', 'linear-gradient(135deg, rgba(0, 86, 179, 0.84), rgba(198, 12, 48, 0.72))', 'https://upload.wikimedia.org/wikipedia/commons/a/a1/24701-nature-natural-beauty.jpg'),
    createMonumentTheme('UK', 'London', 'Big Ben', 'linear-gradient(135deg, rgba(0, 36, 125, 0.84), rgba(207, 20, 43, 0.72))', 'https://upload.wikimedia.org/wikipedia/commons/b/b9/Above_Gotham.jpg'),
  ],
  es: [
    createMonumentTheme('Espagne', 'Madrid', 'Palais royal', 'linear-gradient(135deg, rgba(198, 11, 30, 0.84), rgba(241, 191, 0, 0.72))', 'https://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png'),
    createMonumentTheme('Espagne', 'Barcelone', 'Sagrada Familia', 'linear-gradient(135deg, rgba(198, 11, 30, 0.84), rgba(255, 165, 0, 0.72))', 'https://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png'),
  ],
  de: [
    createMonumentTheme('Allemagne', 'Berlin', 'Porte de Brandebourg', 'linear-gradient(135deg, rgba(0, 0, 0, 0.84), rgba(255, 0, 0, 0.72))', 'https://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png'),
  ],
  it: [
    createMonumentTheme('Italie', 'Rome', 'Colisée', 'linear-gradient(135deg, rgba(0, 146, 70, 0.84), rgba(206, 43, 55, 0.72))', 'https://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png'),
  ],
  pt: [
    createMonumentTheme('Portugal', 'Lisbonne', 'Tour de Belem', 'linear-gradient(135deg, rgba(0, 102, 0, 0.84), rgba(255, 0, 0, 0.72))', 'https://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png'),
  ],
  ja: [
    createMonumentTheme('Japon', 'Tokyo', 'Mont Fuji', 'linear-gradient(135deg, rgba(188, 0, 45, 0.84), rgba(255, 255, 255, 0.72))', 'https://upload.wikimedia.org/wikipedia/commons/0/0e/Torii_path_with_lantern_at_Fushimi_Inari_Taisha_Shrine%2C_Kyoto%2C_Japan.jpg'),
  ],
  'zh-CN': [
    createMonumentTheme('Chine', 'Pékin', 'Cité interdite', 'linear-gradient(135deg, rgba(153, 27, 27, 0.84), rgba(180, 83, 9, 0.72))', 'https://upload.wikimedia.org/wikipedia/commons/e/ef/The_Forbidden_City_-_View_from_Coal_Hill.jpg'),
    createMonumentTheme('Chine', 'Shanghai', 'The Bund', 'linear-gradient(135deg, rgba(55, 65, 81, 0.84), rgba(14, 165, 233, 0.72))', 'https://upload.wikimedia.org/wikipedia/commons/6/64/Shanghai_skyline_from_the_bund.jpg'),
  ],
  nl: [
    createMonumentTheme('Pays-Bas', 'Amsterdam', 'Rijksmuseum', 'linear-gradient(135deg, rgba(30, 41, 59, 0.84), rgba(249, 115, 22, 0.68))', 'https://upload.wikimedia.org/wikipedia/commons/0/0b/South_facade_of_the_Rijksmuseum_Amsterdam_%28DSCF0528%29.jpg'),
  ],
  ru: [
    createMonumentTheme('Russie', 'Moscou', 'Cathédrale Saint-Basile', 'linear-gradient(135deg, rgba(127, 29, 29, 0.84), rgba(217, 119, 6, 0.72))', 'https://upload.wikimedia.org/wikipedia/commons/b/bb/Saint_Basil%27s_Cathedral_and_the_Red_Square.jpg'),
  ],
  ko: [
    createMonumentTheme('Corée du Sud', 'Séoul', 'Palais Gyeongbokgung', 'linear-gradient(135deg, rgba(30, 64, 175, 0.84), rgba(5, 150, 105, 0.72))', 'https://upload.wikimedia.org/wikipedia/commons/4/48/Gyeongbokgung_Geunjeongjeon.jpg'),
  ],
  hi: [
    createMonumentTheme('Inde', 'Agra', 'Taj Mahal', 'linear-gradient(135deg, rgba(180, 83, 9, 0.84), rgba(251, 191, 36, 0.72))', 'https://upload.wikimedia.org/wikipedia/commons/d/da/Taj-Mahal.jpg'),
  ],
  tr: [
    createMonumentTheme('Turquie', 'Istanbul', 'Sainte-Sophie', 'linear-gradient(135deg, rgba(120, 53, 15, 0.84), rgba(234, 88, 12, 0.72))', 'https://upload.wikimedia.org/wikipedia/commons/d/d7/Hagia_Sophia_Mars_2013.jpg'),
  ],
  pl: [
    createMonumentTheme('Pologne', 'Cracovie', 'Château du Wawel', 'linear-gradient(135deg, rgba(127, 29, 29, 0.84), rgba(234, 179, 8, 0.7))', 'https://upload.wikimedia.org/wikipedia/commons/b/b6/Wawel_Castle_Towers%2C_Krak%C3%B3w.jpg'),
  ],
  ar: [
    createMonumentTheme('Arabie Saoudite', 'Riyad', 'Masmak', 'linear-gradient(135deg, rgba(0, 100, 0, 0.84), rgba(255, 255, 255, 0.72))', 'https://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png'),
  ],
};

export function getLanguageByCode(code: string) {
  return supportedLanguages.find((language) => language.code === code);
}

export function getThemeByLanguageCode(code: string, index: number = 0): LanguageTheme {
  const monuments = languageThemes[code] ?? languageThemes.en;
  const activeMonument = monuments[index % monuments.length] ?? monuments[0];
  return {
    ...activeMonument,
    monuments,
  };
}

export function getThemeCountByLanguageCode(code: string) {
  return languageThemes[code] ?? languageThemes.en ? languageThemes[code]?.length || languageThemes.en.length : languageThemes.en.length;
}

export function swapLanguages(source: string, target: string) {
  return { source: target, target: source };
}

export function buildHistoryEntry({
  sourceText,
  translatedText,
  sourceCode,
  targetCode,
}: HistoryEntryInput): HistoryEntry {
  return {
    sourceText,
    translatedText,
    sourceLanguage: getLanguageByCode(sourceCode)?.label ?? sourceCode,
    targetLanguage: getLanguageByCode(targetCode)?.label ?? targetCode,
    createdAt: new Date().toISOString(),
  };
}
