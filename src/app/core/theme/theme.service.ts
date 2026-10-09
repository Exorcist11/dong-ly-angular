import { Injectable, computed, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';

export type AppTheme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'dongly_theme';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private mediaQueryListener?: (e: MediaQueryListEvent) => void;

  readonly theme = signal<AppTheme>(this.getInitialTheme());
  readonly systemTheme = signal<ResolvedTheme>(this.detectSystemTheme());

  readonly resolvedTheme = computed<ResolvedTheme>(() => {
    const current = this.theme();
    return current === 'system' ? this.systemTheme() : current;
  });

  readonly isDark = computed<boolean>(() => this.resolvedTheme() === 'dark');

  constructor() {
    this.initSystemListener();
    this.applyTheme(this.resolvedTheme());
  }

  setTheme(theme: AppTheme): void {
    this.theme.set(theme);
    this.saveTheme(theme);
    this.applyTheme(this.resolvedTheme());
  }

  toggleTheme(): void {
    const next = this.resolvedTheme() === 'dark' ? 'light' : 'dark';
    this.setTheme(next);
  }

  private getInitialTheme(): AppTheme {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        return stored;
      }
    } catch {
      // Fallback if localStorage is inaccessible
    }
    return 'system';
  }

  private detectSystemTheme(): ResolvedTheme {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  }

  private initSystemListener(): void {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.mediaQueryListener = (e: MediaQueryListEvent) => {
      this.systemTheme.set(e.matches ? 'dark' : 'light');
      if (this.theme() === 'system') {
        this.applyTheme(this.resolvedTheme());
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', this.mediaQueryListener);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(this.mediaQueryListener);
    }
  }

  private saveTheme(theme: AppTheme): void {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore in restricted environments
    }
  }

  private applyTheme(theme: ResolvedTheme): void {
    if (!this.document || !this.document.documentElement) {
      return;
    }
    const root = this.document.documentElement;
    root.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      root.classList.add('dark', 'app-dark');
    } else {
      root.classList.remove('dark', 'app-dark');
    }
  }
}
