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

import { Button } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { OverlayBadge } from 'primeng/overlaybadge';
import { Dialog } from 'primeng/dialog';
import { Avatar } from 'primeng/avatar';
import { Tooltip } from 'primeng/tooltip';
import { Router } from '@angular/router';

interface SearchItem {
  label: string;
  category: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [
    FormsModule,
    AppBreadcrumbComponent,
    Button,
    IconField,
    InputIcon,
    InputText,
    Select,
    OverlayBadge,
    Dialog,
    Avatar,
    Tooltip,
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

  readonly quickCommands: SearchItem[] = [
    {
      label: 'Bàn làm việc tổng quan',
      category: 'Điều hướng',
      icon: 'pi pi-objects-column',
      route: '/dashboard',
    },
    {
      label: 'Quản lý chuyến xe (Thanh Hóa → Hà Nội)',
      category: 'Vận hành',
      icon: 'pi pi-car',
      route: '/dashboard',
    },
    {
      label: 'Quản lý vé & giữ chỗ hành khách',
      category: 'Bán vé',
      icon: 'pi pi-ticket',
      route: '/dashboard',
    },
    {
      label: 'Tra cứu thông tin khách hàng',
      category: 'Khách hàng',
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
    return `Đổi giao diện (Hiện tại: ${t})`;
  }

  themeTooltip(): string {
    const t = this.layoutService.theme();
    if (t === 'light') return 'Giao diện: Sáng';
    if (t === 'dark') return 'Giao diện: Tối';
    return 'Giao diện: Theo hệ điều hành';
  }

  filteredResults(): SearchItem[] {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return this.quickCommands;
    return this.quickCommands.filter(
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
