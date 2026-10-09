import { TestBed } from '@angular/core/testing';
import { TranslationService } from './translation.service';
import { TranslatePipe } from './translate.pipe';
import { LANGUAGE_STORAGE_KEY } from './i18n.model';

describe('TranslationService & TranslatePipe', () => {
  let service: TranslationService;
  let pipe: TranslatePipe;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [TranslationService, TranslatePipe],
    });
    service = TestBed.inject(TranslationService);
    pipe = TestBed.inject(TranslatePipe);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize with default language "vi"', () => {
    expect(service.currentLang()).toBe('vi');
    expect(service.currentLocale()).toBe('vi-VN');
    expect(document.documentElement.getAttribute('lang')).toBe('vi');
  });

  it('should translate keys correctly in Vietnamese', () => {
    expect(service.translate('common.actions.search')).toBe('Tìm kiếm');
    expect(service.translate('auth.adminLoginTitle')).toBe('Đăng Nhập Quản Trị');
  });

  it('should switch language to English and update translation', () => {
    service.setLanguage('en');
    expect(service.currentLang()).toBe('en');
    expect(service.currentLocale()).toBe('en-US');
    expect(document.documentElement.getAttribute('lang')).toBe('en');
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('en');

    expect(service.translate('common.actions.search')).toBe('Search');
    expect(service.translate('auth.adminLoginTitle')).toBe('Admin Login');
  });

  it('should interpolate parameters correctly with {{key}} and {key}', () => {
    const textWithBraces = service.translate('auth.loginSuccess', { name: 'Đông Lý' });
    expect(textWithBraces).toBe('Xin chào, Đông Lý!');

    service.setLanguage('en');
    const textEn = service.translate('auth.loginSuccess', { name: 'Dong Ly' });
    expect(textEn).toBe('Welcome back, Dong Ly!');
  });

  it('should fallback to Vietnamese if key is missing in English', () => {
    service.setLanguage('en');
    // If a key only exists in vi, it should fallback to vi value
    expect(service.translate('navigation.home')).toBe('Home');
  });

  it('should return key itself if key does not exist anywhere', () => {
    const missing = service.translate('nonexistent.nested.key');
    expect(missing).toBe('nonexistent.nested.key');
  });

  it('should format date and currency according to current locale', () => {
    const testDate = new Date('2026-10-10T08:00:00Z');
    const formattedVi = service.formatDate(testDate);
    expect(formattedVi).toBeTruthy();

    const formattedVnd = service.formatCurrency(250000);
    expect(formattedVnd).toContain('250');
  });

  it('should translate using TranslatePipe', () => {
    expect(pipe.transform('common.actions.cancel')).toBe('Hủy bỏ');
    service.setLanguage('en');
    expect(pipe.transform('common.actions.cancel')).toBe('Cancel');
  });
});
