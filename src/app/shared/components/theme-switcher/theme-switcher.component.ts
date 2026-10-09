import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppTheme, ThemeService } from '../../../core/theme/theme.service';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';

@Component({
  selector: 'app-theme-switcher',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="theme-switcher-wrapper" role="radiogroup" aria-label="Lựa chọn giao diện">
      <button
        type="button"
        role="radio"
        class="theme-btn"
        [class.active]="themeService.theme() === 'light'"
        [attr.aria-checked]="themeService.theme() === 'light'"
        [attr.aria-label]="'common.theme.light' | translate"
        (click)="setTheme('light')"
        title="Giao diện sáng (Light)"
      >
        <!-- Sun Icon -->
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="theme-icon">
          <circle cx="12" cy="12" r="4"></circle>
          <path d="M12 2v2"></path>
          <path d="M12 20v2"></path>
          <path d="m4.93 4.93 1.41 1.41"></path>
          <path d="m17.66 17.66 1.41 1.41"></path>
          <path d="M2 12h2"></path>
          <path d="M20 12h2"></path>
          <path d="m6.34 17.66-1.41 1.41"></path>
          <path d="m19.07 4.93-1.41 1.41"></path>
        </svg>
      </button>

      <button
        type="button"
        role="radio"
        class="theme-btn"
        [class.active]="themeService.theme() === 'dark'"
        [attr.aria-checked]="themeService.theme() === 'dark'"
        [attr.aria-label]="'common.theme.dark' | translate"
        (click)="setTheme('dark')"
        title="Giao diện tối (Dark)"
      >
        <!-- Moon Icon -->
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="theme-icon">
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
        </svg>
      </button>

      <button
        type="button"
        role="radio"
        class="theme-btn"
        [class.active]="themeService.theme() === 'system'"
        [attr.aria-checked]="themeService.theme() === 'system'"
        [attr.aria-label]="'common.theme.system' | translate"
        (click)="setTheme('system')"
        title="Theo hệ điều hành (System)"
      >
        <!-- Monitor/System Icon -->
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="theme-icon">
          <rect width="20" height="14" x="2" y="3" rx="2"></rect>
          <line x1="8" x2="16" y1="21" y2="21"></line>
          <line x1="12" x2="12" y1="17" y2="21"></line>
        </svg>
      </button>
    </div>
  `,
  styles: [`
    :host {
      display: inline-flex;
    }

    .theme-switcher-wrapper {
      display: inline-flex;
      align-items: center;
      background-color: var(--color-surface-sunken, #F4F1EC);
      border: 1px solid var(--color-border, #D9D4CC);
      border-radius: 9999px;
      padding: 3px;
      gap: 2px;
      transition: background-color var(--ease), border-color var(--ease);
    }

    .theme-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      height: 30px;
      border: none;
      border-radius: 9999px;
      background: transparent;
      color: var(--color-text-muted, #8A857D);
      cursor: pointer;
      padding: 0;
      transition: background-color var(--ease), color var(--ease), transform var(--ease);

      &:hover {
        color: var(--color-text-primary, #16161A);
      }

      &:focus-visible {
        outline: 2px solid var(--color-focus, #F2B632);
        outline-offset: 1px;
      }

      &.active {
        background-color: var(--color-surface, #FFFFFF);
        color: var(--color-primary, #D71920);
        box-shadow: var(--shadow-sm);
      }

      .theme-icon {
        width: 16px;
        height: 16px;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeSwitcherComponent {
  readonly themeService = inject(ThemeService);

  setTheme(theme: AppTheme): void {
    this.themeService.setTheme(theme);
  }
}
