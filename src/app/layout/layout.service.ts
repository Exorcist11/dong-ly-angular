import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';

export type AppTheme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'dongly_theme';
export const SIDEBAR_STORAGE_KEY = 'dongly_sidebar_collapsed';

@Injectable({
  providedIn: 'root',
})
export class LayoutService {
  private readonly document = inject(DOCUMENT);

  readonly sidebarCollapsed = signal<boolean>(this.getInitialSidebarCollapsed());
  readonly mobileMenuOpen = signal<boolean>(false);
  readonly theme = signal<AppTheme>(this.getInitialTheme());
  readonly systemIsDark = signal<boolean>(this.detectSystemDark());

  readonly resolvedTheme = computed<ResolvedTheme>(() => {
    const current = this.theme();
    if (current === 'system') {
      return this.systemIsDark() ? 'dark' : 'light';
    }
    return current;
  });

  readonly isDark = computed<boolean>(() => this.resolvedTheme() === 'dark');

  constructor() {
    this.initSystemListener();

    // Effect toggling 'app-dark' on document.documentElement
    effect(() => {
      const isDark = this.isDark();
      const root = this.document?.documentElement;
      if (!root) return;

      root.setAttribute('data-theme', isDark ? 'dark' : 'light');
      if (isDark) {
        root.classList.add('app-dark', 'dark');
      } else {
        root.classList.remove('app-dark', 'dark');
      }
    });
  }

  toggleSidebar(): void {
    const next = !this.sidebarCollapsed();
    this.sidebarCollapsed.set(next);
    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
    } catch {}
  }

  setSidebarCollapsed(collapsed: boolean): void {
    this.sidebarCollapsed.set(collapsed);
    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(collapsed));
    } catch {}
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((v) => !v);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  setTheme(theme: AppTheme): void {
    this.theme.set(theme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {}
  }

  cycleTheme(): void {
    const current = this.theme();
    let next: AppTheme = 'dark';
    if (current === 'light') next = 'dark';
    else if (current === 'dark') next = 'system';
    else next = 'light';
    this.setTheme(next);
  }

  private getInitialTheme(): AppTheme {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        return stored;
      }
    } catch {}
    return 'system';
  }

  private getInitialSidebarCollapsed(): boolean {
    try {
      const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
      return stored === 'true';
    } catch {}
    return false;
  }

  private detectSystemDark(): boolean {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  }

  private initSystemListener(): void {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      this.systemIsDark.set(e.matches);
    };
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handler);
    }
  }
}
