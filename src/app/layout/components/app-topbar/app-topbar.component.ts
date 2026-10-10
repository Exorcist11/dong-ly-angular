import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LayoutService } from '../../layout.service';
import { AppBreadcrumbComponent } from '../app-breadcrumb/app-breadcrumb.component';
import { TranslationService } from '../../../core/i18n/translation.service';
import { SupportedLanguage } from '../../../core/i18n/i18n.model';

import { ButtonComponent } from '../../../shared/components/button/button.component';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { OverlayBadge } from 'primeng/overlaybadge';
import { Dialog } from 'primeng/dialog';
import { Avatar } from 'primeng/avatar';
import { Tooltip } from 'primeng/tooltip';
import { Router } from '@angular/router';

import { TranslatePipe } from '../../../core/i18n/translate.pipe';

interface SearchItem {
  label: string;
  category: string;
  icon: string;
  route: string;
}

interface RawSearchItem {
  labelKey: string;
  categoryKey: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [
    FormsModule,
    AppBreadcrumbComponent,
    ButtonComponent,
    IconField,
    InputIcon,
    InputText,
    Select,
    OverlayBadge,
    Dialog,
    Avatar,
    Tooltip,
    TranslatePipe,
  ],
  templateUrl: './app-topbar.component.html',
  styleUrl: './app-topbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppTopbarComponent {
  readonly layoutService = inject(LayoutService);
  private readonly i18n = inject(TranslationService);
  private readonly router = inject(Router);

  commandPaletteVisible = false;
  searchQuery = '';

  selectedLanguage: SupportedLanguage = this.i18n.currentLang();

  readonly languageOptions = [
    { code: 'vi' as SupportedLanguage, label: 'Tiếng Việt', shortLabel: 'VI' },
    { code: 'en' as SupportedLanguage, label: 'English', shortLabel: 'EN' },
  ];

  currentLangCode(): string {
    return (this.selectedLanguage || this.i18n.currentLang() || 'vi').toUpperCase();
  }

  readonly rawQuickCommands: RawSearchItem[] = [
    {
      labelKey: 'navigation.topbar.quickOverview',
      categoryKey: 'navigation.topbar.quickNavigation',
      icon: 'pi pi-objects-column',
      route: '/dashboard',
    },
    {
      labelKey: 'navigation.topbar.quickTrips',
      categoryKey: 'navigation.topbar.quickOperations',
      icon: 'pi pi-car',
      route: '/dashboard',
    },
    {
      labelKey: 'navigation.topbar.quickBookings',
      categoryKey: 'navigation.topbar.quickTicketing',
      icon: 'pi pi-ticket',
      route: '/dashboard',
    },
    {
      labelKey: 'navigation.topbar.quickCustomers',
      categoryKey: 'navigation.topbar.quickCustomerCategory',
      icon: 'pi pi-users',
      route: '/dashboard',
    },
  ];

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.openCommandPalette();
    }
  }

  onToggleSidebar(): void {
    if (window.innerWidth < 768) {
      this.layoutService.toggleMobileMenu();
    } else {
      this.layoutService.toggleSidebar();
    }
  }

  openCommandPalette(): void {
    this.commandPaletteVisible = true;
    this.searchQuery = '';
  }

  onLanguageChange(lang: SupportedLanguage): void {
    this.selectedLanguage = lang;
    this.i18n.setLanguage(lang);
  }

  themeIcon(): string {
    const t = this.layoutService.theme();
    if (t === 'light') return 'pi pi-sun';
    if (t === 'dark') return 'pi pi-moon';
    return 'pi pi-desktop';
  }

  themeAriaLabel(): string {
    const t = this.layoutService.theme();
    return this.i18n.translate('navigation.topbar.themeCurrent', { theme: t });
  }

  themeTooltip(): string {
    const t = this.layoutService.theme();
    if (t === 'light') return this.i18n.translate('navigation.topbar.themeLight');
    if (t === 'dark') return this.i18n.translate('navigation.topbar.themeDark');
    return this.i18n.translate('navigation.topbar.themeSystem');
  }

  filteredResults(): SearchItem[] {
    this.i18n.currentLang();
    const translatedCommands: SearchItem[] = this.rawQuickCommands.map((item) => ({
      label: this.i18n.translate(item.labelKey),
      category: this.i18n.translate(item.categoryKey),
      icon: item.icon,
      route: item.route,
    }));

    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return translatedCommands;
    return translatedCommands.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }

  onSelectQuickItem(item: SearchItem): void {
    this.commandPaletteVisible = false;
    this.router.navigateByUrl(item.route);
  }
}
