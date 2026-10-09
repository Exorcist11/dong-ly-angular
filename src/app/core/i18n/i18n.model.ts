export type SupportedLanguage = 'vi' | 'en';

export type TranslationParams = Record<string, string | number>;

export interface LanguageOption {
  code: SupportedLanguage;
  label: string;
  nativeLabel: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'vi', label: 'Tiếng Việt', nativeLabel: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en', label: 'English', nativeLabel: 'English', flag: '🇬🇧' },
];

export const DEFAULT_LANGUAGE: SupportedLanguage = 'vi';
export const LANGUAGE_STORAGE_KEY = 'dongly_lang';
