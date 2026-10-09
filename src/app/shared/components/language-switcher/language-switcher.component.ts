import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../../core/i18n/translation.service';
import { SupportedLanguage } from '../../../core/i18n/i18n.model';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="lang-switcher-wrapper" role="group" aria-label="Lựa chọn ngôn ngữ">
      @for (lang of translationService.supportedLanguages; track lang.code) {
        <button
          type="button"
          class="lang-btn"
          [class.active]="translationService.currentLang() === lang.code"
          [attr.aria-pressed]="translationService.currentLang() === lang.code"
          [attr.aria-label]="lang.nativeLabel"
          (click)="setLanguage(lang.code)"
          [title]="lang.label"
        >
          <span class="lang-code">{{ lang.code.toUpperCase() }}</span>
        </button>
      }
    </div>
  `,
  styles: [`
    :host {
      display: inline-flex;
    }

    .lang-switcher-wrapper {
      display: inline-flex;
      align-items: center;
      background-color: var(--color-surface-sunken, #F4F1EC);
      border: 1px solid var(--color-border, #D9D4CC);
      border-radius: 9999px;
      padding: 3px;
      gap: 2px;
      transition: background-color var(--ease), border-color var(--ease);
    }

    .lang-btn {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      height: 30px;
      padding: 0 8px;
      border: none;
      border-radius: 9999px;
      background: transparent;
      color: var(--color-text-muted, #8A857D);
      font-size: 12px;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      transition: background-color var(--ease), color var(--ease);

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

      .lang-flag {
        font-size: 13px;
        line-height: 1;
      }

      .lang-code {
        letter-spacing: 0.5px;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LanguageSwitcherComponent {
  readonly translationService = inject(TranslationService);

  setLanguage(code: SupportedLanguage): void {
    this.translationService.setLanguage(code);
  }
}
