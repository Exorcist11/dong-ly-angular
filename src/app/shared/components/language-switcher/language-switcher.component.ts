import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../../core/i18n/translation.service';
import { SupportedLanguage } from '../../../core/i18n/i18n.model';

import { TranslatePipe } from '../../../core/i18n/translate.pipe';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './language-switcher.component.html',
  styleUrl: './language-switcher.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LanguageSwitcherComponent {
  readonly translationService = inject(TranslationService);

  setLanguage(code: SupportedLanguage): void {
    this.translationService.setLanguage(code);
  }
}
