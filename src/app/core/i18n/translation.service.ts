import { Injectable, computed, inject, isDevMode, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  SUPPORTED_LANGUAGES,
  SupportedLanguage,
  TranslationParams,
} from './i18n.model';
import { VI_TRANSLATIONS } from './translations/vi';
import { EN_TRANSLATIONS } from './translations/en';

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  private readonly document = inject(DOCUMENT);

  private readonly dictionaries: Record<SupportedLanguage, Record<string, any>> = {
    vi: VI_TRANSLATIONS,
    en: EN_TRANSLATIONS,
  };

  readonly currentLang = signal<SupportedLanguage>(this.getInitialLanguage());

  readonly currentLocale = computed<string>(() => {
    return this.currentLang() === 'vi' ? 'vi-VN' : 'en-US';
  });

  readonly supportedLanguages = SUPPORTED_LANGUAGES;

  constructor() {
    this.applyHtmlLang(this.currentLang());
  }

  setLanguage(lang: SupportedLanguage): void {
    if (this.currentLang() === lang) {
      return;
    }
    this.currentLang.set(lang);
    this.saveLanguage(lang);
    this.applyHtmlLang(lang);
  }

  getLanguage(): SupportedLanguage {
    return this.currentLang();
  }

  translate(key: string, params?: TranslationParams): string {
    if (!key) {
      return '';
    }

    const lang = this.currentLang();
    let value = this.resolveKey(this.dictionaries[lang], key);

    // Fallback to Vietnamese if missing in other language
    if (value === undefined && lang !== 'vi') {
      value = this.resolveKey(this.dictionaries['vi'], key);
    }

    // Fallback to key itself if missing completely
    if (value === undefined) {
      if (isDevMode()) {
        console.warn(`[i18n] Missing translation key: "${key}" for language "${lang}"`);
      }
      return key;
    }

    if (typeof value !== 'string') {
      return key;
    }

    return this.interpolate(value, params);
  }

  instant(key: string, params?: TranslationParams): string {
    return this.translate(key, params);
  }

  formatDate(date: Date | string | number, options?: Intl.DateTimeFormatOptions): string {
    const d = new Date(date);
    if (isNaN(d.getTime())) {
      return '';
    }

    const defaultOptions: Intl.DateTimeFormatOptions = options || {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    };

    return new Intl.DateTimeFormat(this.currentLocale(), defaultOptions).format(d);
  }

  formatDateTime(date: Date | string | number): string {
    return this.formatDate(date, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat(this.currentLocale(), {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(amount);
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat(this.currentLocale()).format(value);
  }

  private resolveKey(obj: Record<string, any>, path: string): string | undefined {
    if (!obj || !path) {
      return undefined;
    }
    const parts = path.split('.');
    let current: any = obj;

    for (const part of parts) {
      if (current === null || current === undefined || typeof current !== 'object') {
        return undefined;
      }
      current = current[part];
    }

    return typeof current === 'string' ? current : undefined;
  }

  private interpolate(template: string, params?: TranslationParams): string {
    if (!params) {
      return template;
    }

    let result = template;
    for (const [paramKey, paramVal] of Object.entries(params)) {
      const valStr = String(paramVal);
      // Support both {{param}} and {param}
      result = result
        .replace(new RegExp(`{{\\s*${paramKey}\\s*}}`, 'g'), valStr)
        .replace(new RegExp(`{\\s*${paramKey}\\s*}`, 'g'), valStr);
    }
    return result;
  }

  private getInitialLanguage(): SupportedLanguage {
    try {
      const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (stored === 'vi' || stored === 'en') {
        return stored;
      }
    } catch {
      // In restricted environments
    }
    return DEFAULT_LANGUAGE;
  }

  private saveLanguage(lang: SupportedLanguage): void {
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch {
      // Ignore
    }
  }

  private applyHtmlLang(lang: SupportedLanguage): void {
    if (this.document && this.document.documentElement) {
      this.document.documentElement.setAttribute('lang', lang);
    }
  }
}
