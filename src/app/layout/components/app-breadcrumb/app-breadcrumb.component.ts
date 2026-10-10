import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Breadcrumb } from 'primeng/breadcrumb';
import { MenuItem } from 'primeng/api';
import { RouterLink } from '@angular/router';
import { TranslationService } from '../../../core/i18n/translation.service';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [Breadcrumb, RouterLink],
  templateUrl: './app-breadcrumb.component.html',
  styleUrl: './app-breadcrumb.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppBreadcrumbComponent {
  private readonly i18n = inject(TranslationService);

  readonly home = computed<MenuItem>(() => {
    this.i18n.currentLang();
    return {
      icon: 'pi pi-home',
      url: '/dashboard',
      label: this.i18n.translate('navigation.home'),
    };
  });

  readonly items = computed<MenuItem[]>(() => {
    this.i18n.currentLang();
    return [
      {
        label: this.i18n.translate('navigation.items.dashboard'),
        id: 'active',
      },
    ];
  });
}
