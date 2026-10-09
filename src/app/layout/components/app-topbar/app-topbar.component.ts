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
  template: `
    <header class="app-topbar" role="banner">
      <!-- LEFT SECTION -->
      <div class="topbar-left">
        <!-- Collapse / Hamburger Button -->
        <p-button
          [text]="true"
          [rounded]="true"
          icon="pi pi-bars"
          styleClass="topbar-icon-btn"
          aria-label="Thu gọn hoặc mở rộng thanh điều hướng"
          (onClick)="onToggleSidebar()"
        />

        <!-- Breadcrumb -->
        <app-breadcrumb />
      </div>

      <!-- CENTER SEARCH WITH CTRL+K -->
      <div class="topbar-center">
        <div class="search-trigger" (click)="openCommandPalette()">
          <p-iconfield>
            <p-inputicon styleClass="pi pi-search" />
            <input
              pInputText
              type="text"
              readonly
              placeholder="Tìm chuyến xe, vé, khách hàng..."
              class="topbar-search-input"
            />
          </p-iconfield>
          <kbd class="shortcut-hint">Ctrl K</kbd>
        </div>
      </div>

      <!-- RIGHT SECTION -->
      <div class="topbar-right">
        <!-- Language Select (Compact VI / EN) -->
        <div class="lang-select-wrapper">
          <p-select
            [options]="languageOptions"
            [(ngModel)]="selectedLanguage"
            (onChange)="onLanguageChange($event.value)"
            optionLabel="label"
            optionValue="code"
            styleClass="compact-lang-select"
            panelStyleClass="lang-select-panel"
            aria-label="Lựa chọn ngôn ngữ"
          >
            <ng-template #selectedItem>
              <div class="selected-lang-box">
                <i class="pi pi-globe lang-icon" aria-hidden="true"></i>
                <span class="lang-code-text">{{ currentLangCode() }}</span>
              </div>
            </ng-template>
            <ng-template #item let-opt>
              <div class="lang-dropdown-row">
                <span class="lang-name">{{ opt.label }}</span>
                <span class="lang-badge">{{ opt.shortLabel }}</span>
              </div>
            </ng-template>
          </p-select>
        </div>

        <!-- ONE Theme Button cycling Light -> Dark -> System -->
        <p-button
          [text]="true"
          [rounded]="true"
          [icon]="themeIcon()"
          [attr.aria-label]="themeAriaLabel()"
          [pTooltip]="themeTooltip()"
          tooltipPosition="bottom"
          styleClass="topbar-icon-btn"
          (onClick)="layoutService.cycleTheme()"
        />

        <!-- Notification Bell with OverlayBadge -->
        <p-button
          [text]="true"
          [rounded]="true"
          pTooltip="Thông báo hệ thống (1 thông báo mới)"
          tooltipPosition="bottom"
          styleClass="topbar-icon-btn"
          aria-label="Thông báo"
        >
          <ng-template #icon>
            <p-overlaybadge severity="danger" styleClass="badge-dot">
              <i class="pi pi-bell text-lg"></i>
            </p-overlaybadge>
          </ng-template>
        </p-button>

        <!-- Avatar Quick Link -->
        <p-avatar
          label="ĐL"
          shape="circle"
          styleClass="topbar-avatar"
          pTooltip="Nhà xe Đông Lý Admin"
          tooltipPosition="bottom"
        />
      </div>
    </header>

    <!-- COMMAND PALETTE DIALOG -->
    <p-dialog
      [(visible)]="commandPaletteVisible"
      [modal]="true"
      [dismissableMask]="true"
      [header]="'Tìm kiếm nhanh (Command Palette)'"
      styleClass="command-palette-dialog"
      [style]="{ width: '540px' }"
    >
      <div class="palette-content">
        <p-iconfield styleClass="palette-search-field">
          <p-inputicon styleClass="pi pi-search" />
          <input
            pInputText
            [(ngModel)]="searchQuery"
            placeholder="Gõ từ khóa tìm kiếm (bàn làm việc, chuyến xe, vé...)"
            autofocus
            class="w-full"
          />
        </p-iconfield>

        <div class="quick-results-list">
          <div class="palette-group-title">LỐI TẮT HỆ THỐNG</div>
          @for (item of filteredResults(); track item.label) {
            <div class="quick-result-item" (click)="onSelectQuickItem(item)">
              <i [class]="item.icon + ' item-icon'"></i>
              <div class="item-text">
                <span class="item-name">{{ item.label }}</span>
                <span class="item-cat">{{ item.category }}</span>
              </div>
              <i class="pi pi-arrow-right item-arrow"></i>
            </div>
          }
          @if (filteredResults().length === 0) {
            <div class="empty-search-state">
              <i class="pi pi-search text-xl text-muted"></i>
              <p>Không tìm thấy kết quả phù hợp cho "{{ searchQuery }}"</p>
            </div>
          }
        </div>
      </div>
    </p-dialog>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .app-topbar {
      height: 64px;
      position: sticky;
      top: 0;
      z-index: 90;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      background: rgba(var(--color-surface), 0.85);
      background-color: var(--color-surface, #FFFFFF);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--color-border, #D9D4CC);
      transition: background-color var(--ease, 200ms ease), border-color var(--ease, 200ms ease);
    }

    .topbar-left {
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 0;
    }

    .topbar-center {
      display: flex;
      align-items: center;
      justify-content: center;
      flex: 1;
      max-width: 420px;
      margin: 0 16px;
    }

    .search-trigger {
      width: 100%;
      position: relative;
      cursor: pointer;

      .topbar-search-input {
        width: 100%;
        height: 38px;
        background: var(--color-surface-sunken, #F4F1EC);
        border: 1px solid var(--color-border, #D9D4CC);
        border-radius: 10px;
        font-size: 13px;
        padding-right: 64px;
        color: var(--color-text-primary);
        cursor: pointer;
        transition: all var(--ease, 200ms ease);

        &:hover {
          border-color: var(--primary, #D71920);
        }
      }

      .shortcut-hint {
        position: absolute;
        right: 8px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 11px;
        font-weight: 600;
        background: var(--color-surface, #FFFFFF);
        color: var(--color-text-muted, #8A857D);
        border: 1px solid var(--color-border, #D9D4CC);
        padding: 2px 6px;
        border-radius: 4px;
        pointer-events: none;
      }
    }

    .topbar-right {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .lang-select-wrapper {
      display: flex;
      align-items: center;
    }

    :host ::ng-deep .compact-lang-select {
      height: 36px;
      display: inline-flex;
      align-items: center;
      border-radius: 999px !important;
      border: 1px solid var(--p-content-border-color, #E8E4DD) !important;
      background: var(--p-surface-50, #F7F5F1) !important;
      font-size: 12px !important;
      font-weight: 600 !important;
      transition: all 0.2s ease;

      &:hover {
        border-color: var(--p-primary-color, #D71920) !important;
      }

      .p-select-label {
        padding: 0 4px 0 10px !important;
        display: flex;
        align-items: center;
      }

      .p-select-dropdown {
        width: 24px !important;
        padding-right: 6px !important;
        color: var(--p-text-muted-color, #8A857D);
      }
    }

    .selected-lang-box {
      display: inline-flex;
      align-items: center;
      gap: 6px;

      .lang-icon {
        font-size: 13px;
        color: var(--p-text-muted-color, #8A857D);
      }

      .lang-code-text {
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.05em;
        color: var(--p-text-color, #16161A);
      }
    }

    .lang-dropdown-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      width: 100%;
      padding: 2px 0;

      .lang-name {
        font-size: 13px;
        font-weight: 500;
        color: var(--p-text-color, #16161A);
      }

      .lang-badge {
        font-size: 10px;
        font-weight: 700;
        padding: 2px 6px;
        border-radius: 4px;
        background: var(--p-surface-200, #E8E4DD);
        color: var(--p-text-muted-color, #8A857D);
      }
    }

    /* Command Palette Styles */
    .palette-content {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .palette-group-title {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.08em;
      color: var(--color-text-muted);
      margin-bottom: 8px;
    }

    .quick-results-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
      max-height: 280px;
      overflow-y: auto;
    }

    .quick-result-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      border-radius: 8px;
      cursor: pointer;
      transition: background-color var(--ease);

      &:hover {
        background-color: var(--color-surface-hover, #F8F5F0);

        .item-icon, .item-arrow {
          color: var(--primary, #D71920);
        }
      }

      .item-icon {
        font-size: 16px;
        color: var(--color-text-muted);
      }

      .item-text {
        flex: 1;
        display: flex;
        flex-direction: column;

        .item-name {
          font-size: 13.5px;
          font-weight: 500;
          color: var(--color-text-primary);
        }

        .item-cat {
          font-size: 11px;
          color: var(--color-text-muted);
        }
      }

      .item-arrow {
        font-size: 12px;
        color: var(--color-text-muted);
      }
    }

    .empty-search-state {
      padding: 32px 16px;
      text-align: center;
      color: var(--color-text-muted);
    }

    @media (max-width: 767px) {
      .topbar-center {
        display: none;
      }
      .app-topbar {
        padding: 0 12px;
      }
    }
  `],
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
