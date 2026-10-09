import { TestBed } from '@angular/core/testing';
import { LayoutService, THEME_STORAGE_KEY, SIDEBAR_STORAGE_KEY } from './layout.service';

describe('LayoutService', () => {
  let service: LayoutService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [LayoutService],
    });
    service = TestBed.inject(LayoutService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created and have default states', () => {
    expect(service).toBeTruthy();
    expect(service.mobileMenuOpen()).toBe(false);
  });

  it('should toggle sidebar and persist state', () => {
    const initial = service.sidebarCollapsed();
    service.toggleSidebar();
    expect(service.sidebarCollapsed()).toBe(!initial);
    expect(localStorage.getItem(SIDEBAR_STORAGE_KEY)).toBe(String(!initial));
  });

  it('should cycle theme: light -> dark -> system -> light', () => {
    service.setTheme('light');
    expect(service.theme()).toBe('light');

    service.cycleTheme();
    expect(service.theme()).toBe('dark');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');

    service.cycleTheme();
    expect(service.theme()).toBe('system');

    service.cycleTheme();
    expect(service.theme()).toBe('light');
  });

  it('should toggle and close mobile menu', () => {
    service.toggleMobileMenu();
    expect(service.mobileMenuOpen()).toBe(true);
    service.closeMobileMenu();
    expect(service.mobileMenuOpen()).toBe(false);
  });
});
