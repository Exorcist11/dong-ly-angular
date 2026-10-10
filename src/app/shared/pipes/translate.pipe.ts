import { inject, Pipe, PipeTransform } from '@angular/core';
import { TranslationService } from '../../core/i18n/translation.service';
import { TranslationParams } from '../../core/i18n/i18n.model';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false,
})
export class TranslatePipe implements PipeTransform {
  private readonly translationService = inject(TranslationService);

  transform(key: string, params?: TranslationParams): string {
    // Đọc signal để kích hoạt tracking reactive khi đổi ngôn ngữ
    this.translationService.currentLang();
    return this.translationService.translate(key, params);
  }
}
