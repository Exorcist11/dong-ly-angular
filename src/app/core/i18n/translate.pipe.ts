import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslationService } from './translation.service';
import { TranslationParams } from './i18n.model';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false,
})
export class TranslatePipe implements PipeTransform {
  private readonly translationService = inject(TranslationService);

  transform(key: string, params?: TranslationParams): string {
    // Read signal to track dependency in reactive contexts
    this.translationService.currentLang();
    return this.translationService.translate(key, params);
  }
}
