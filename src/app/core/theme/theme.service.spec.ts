import { TestBed } from '@angular/core/testing';
import { ThemeService, THEME_STORAGE_KEY } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [ThemeService]
    });
    service = TestBed.inject(ThemeService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created and default to system or stored theme', () => {
    expect(service).toBeTruthy();
    expect(['light', 'dark', 'system']).toContain(service.theme());
  });

  it('should set light theme, update resolvedTheme, and persist in localStorage', () => {
    service.setTheme('light');
    expect(service.theme()).toBe('light');
    expect(service.resolvedTheme()).toBe('light');
    expect(service.isDark()).toBe(false);
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('should set dark theme, update resolvedTheme, and persist in localStorage', () => {
    service.setTheme('dark');
    expect(service.theme()).toBe('dark');
    expect(service.resolvedTheme()).toBe('dark');
    expect(service.isDark()).toBe(true);
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('should toggle theme between light and dark', () => {
    service.setTheme('light');
    service.toggleTheme();
    expect(service.resolvedTheme()).toBe('dark');
    service.toggleTheme();
    expect(service.resolvedTheme()).toBe('light');
  });
});
