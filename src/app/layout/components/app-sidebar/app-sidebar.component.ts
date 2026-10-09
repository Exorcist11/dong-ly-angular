import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LayoutService } from '../../layout.service';
import { AppUserMenuComponent } from '../app-user-menu/app-user-menu.component';
import { Tag } from 'primeng/tag';
import { Tooltip } from 'primeng/tooltip';
import { Drawer } from 'primeng/drawer';

export interface NavItem {
  label: string;
  route?: string;
  icon: string;
  isUpcoming?: boolean;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const MENU_CONFIG: NavGroup[] = [
  {
    title: 'TỔNG QUAN',
    items: [
      {
        label: 'Bàn làm việc',
        route: '/dashboard',
        icon: 'pi pi-objects-column',
      },
    ],
  },
  {
    title: 'VẬN HÀNH',
    items: [
      {
        label: 'Quản lý người dùng',
        icon: 'pi pi-users',
        isUpcoming: true,
      },
      {
        label: 'Chuyến xe & Tuyến',
        icon: 'pi pi-car',
        isUpcoming: true,
      },
      {
        label: 'Vé & Giữ chỗ',
        icon: 'pi pi-ticket',
        isUpcoming: true,
      },
    ],
  },
  {
    title: 'HỆ THỐNG',
    items: [
      {
        label: 'Cài đặt hệ thống',
        icon: 'pi pi-cog',
        isUpcoming: true,
      },
    ],
  },
];

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    NgTemplateOutlet,
    RouterLink,
    RouterLinkActive,
    AppUserMenuComponent,
    Tag,
    Tooltip,
    Drawer,
  ],
  template: `
    <!-- DESKTOP SIDEBAR -->
    <aside
      class="app-sidebar-desktop"
      [class.collapsed]="layoutService.sidebarCollapsed()"
      aria-label="Thanh điều hướng chính"
    >
      <ng-container *ngTemplateOutlet="sidebarContent"></ng-container>
    </aside>

    <!-- MOBILE DRAWER -->
    <p-drawer
      [visible]="layoutService.mobileMenuOpen()"
      (visibleChange)="onMobileDrawerChange($event)"
      position="left"
      styleClass="app-sidebar-drawer"
    >
      <div class="drawer-inner">
        <ng-container *ngTemplateOutlet="sidebarContent"></ng-container>
      </div>
    </p-drawer>

    <!-- REUSABLE SIDEBAR CONTENT TEMPLATE -->
    <ng-template #sidebarContent>
      <div class="sidebar-container">
        <!-- BRAND BLOCK -->
        <div class="brand-block">
          <div class="brand-logo-square">
            <span class="logo-text">ĐL</span>
          </div>
          @if (!layoutService.sidebarCollapsed() || layoutService.mobileMenuOpen()) {
            <div class="brand-info">
              <span class="brand-name">ĐÔNG LÝ</span>
              <span class="brand-portal">Admin Portal</span>
            </div>
          }
        </div>

        <!-- NAVIGATION GROUPS -->
        <nav class="sidebar-nav" role="navigation">
          @for (group of menuGroups; track group.title) {
            <div class="nav-group">
              @if (!layoutService.sidebarCollapsed() || layoutService.mobileMenuOpen()) {
                <div class="group-title">{{ group.title }}</div>
              }

              <div class="group-items">
                @for (item of group.items; track item.label) {
                  @if (item.isUpcoming) {
                    <!-- Upcoming Item -->
                    <div
                      class="nav-item upcoming-item"
                      [pTooltip]="layoutService.sidebarCollapsed() ? (item.label + ' (Tính năng đang phát triển)') : 'Tính năng đang phát triển'"
                      tooltipPosition="right"
                    >
                      <i [class]="item.icon + ' item-icon'"></i>
                      @if (!layoutService.sidebarCollapsed() || layoutService.mobileMenuOpen()) {
                        <span class="item-label">{{ item.label }}</span>
                        <p-tag
                          value="Sắp ra mắt"
                          styleClass="upcoming-tag"
                        />
                      }
                    </div>
                  } @else {
                    <!-- Active Link Item -->
                    <a
                      [routerLink]="item.route"
                      routerLinkActive="active-link"
                      [routerLinkActiveOptions]="{ exact: false }"
                      class="nav-item link-item"
                      [pTooltip]="layoutService.sidebarCollapsed() ? item.label : ''"
                      tooltipPosition="right"
                      (click)="onNavigate()"
                    >
                      <i [class]="item.icon + ' item-icon'"></i>
                      @if (!layoutService.sidebarCollapsed() || layoutService.mobileMenuOpen()) {
                        <span class="item-label">{{ item.label }}</span>
                      }
                    </a>
                  }
                }
              </div>
            </div>
          }
        </nav>

        <!-- USER CARD AT BOTTOM -->
        <div class="sidebar-bottom">
          <app-user-menu [collapsed]="layoutService.sidebarCollapsed() && !layoutService.mobileMenuOpen()" />
        </div>
      </div>
    </ng-template>
  `,
  styles: [`
    :host {
      display: block;
    }

    .app-sidebar-desktop {
      width: 264px;
      height: 100vh;
      position: sticky;
      top: 0;
      background-color: var(--dl-sidebar-bg, #121216);
      border-right: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      transition: width var(--ease, 200ms ease);
      z-index: 99;

      &.collapsed {
        width: 72px;

        .brand-block {
          justify-content: center;
          padding: 16px 8px;
        }

        .nav-item {
          justify-content: center;
          padding: 0;
          width: 44px;
          margin: 0 auto 4px auto;
        }

        .sidebar-bottom {
          padding: 12px 8px;
        }
      }
    }

    .sidebar-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
    }

    .brand-block {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 18px 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      height: 64px;
      flex-shrink: 0;
    }

    .brand-logo-square {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, var(--primary, #D71920) 0%, var(--primary-dark, #A50F16) 100%);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 14px rgba(215, 25, 32, 0.35);
      flex-shrink: 0;

      .logo-text {
        color: #FFFFFF;
        font-weight: 800;
        font-size: 16px;
        letter-spacing: -0.02em;
      }
    }

    .brand-info {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .brand-name {
      font-size: 15px;
      font-weight: 700;
      letter-spacing: 0.02em;
      color: #FFFFFF;
      line-height: 1.2;
    }

    .brand-portal {
      font-size: 11px;
      color: rgba(255, 255, 255, 0.55);
      line-height: 1.3;
    }

    .sidebar-nav {
      flex: 1;
      padding: 16px 12px;
      overflow-y: auto;
      overflow-x: hidden;
    }

    .nav-group {
      margin-bottom: 20px;
    }

    .group-title {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: rgba(255, 255, 255, 0.5);
      padding: 4px 10px 8px 10px;
    }

    .group-items {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      height: 44px;
      padding: 0 12px;
      border-radius: 10px;
      color: rgba(255, 255, 255, 0.72);
      text-decoration: none;
      font-size: 13.5px;
      font-weight: 500;
      position: relative;
      cursor: pointer;
      transition: background-color var(--ease, 200ms ease), color var(--ease, 200ms ease);

      .item-icon {
        font-size: 18px;
        flex-shrink: 0;
      }

      .item-label {
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      &:hover:not(.upcoming-item) {
        background-color: rgba(255, 255, 255, 0.06);
        color: #FFFFFF;
      }

      &.active-link {
        background-color: rgba(215, 25, 32, 0.16);
        color: #FFFFFF;
        font-weight: 600;

        .item-icon {
          color: var(--primary, #D71920);
        }

        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 8px;
          bottom: 8px;
          width: 3px;
          background-color: var(--primary, #D71920);
          border-radius: 0 3px 3px 0;
        }
      }

      &.upcoming-item {
        opacity: 0.6;
        cursor: not-allowed;

        &:hover {
          opacity: 0.8;
          background-color: rgba(255, 255, 255, 0.03);
        }
      }
    }

    :host ::ng-deep .upcoming-tag {
      background: var(--dl-gold-soft, #FFF3D1) !important;
      color: var(--dl-gold-text, #8A6100) !important;
      font-size: 11px !important;
      font-weight: 600 !important;
      padding: 2px 8px !important;
      border-radius: 999px !important;
      border: none !important;
    }

    .sidebar-bottom {
      padding: 14px 12px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      flex-shrink: 0;
    }

    :host ::ng-deep .app-sidebar-drawer {
      background: var(--dl-sidebar-bg, #121216) !important;
      color: #FFFFFF !important;
      width: 280px !important;

      .p-drawer-content {
        padding: 0 !important;
        background: transparent !important;
      }
    }

    .drawer-inner {
      height: 100%;
      background: var(--dl-sidebar-bg, #121216);
    }

    @media (max-width: 767px) {
      .app-sidebar-desktop {
        display: none;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppSidebarComponent {
  readonly layoutService = inject(LayoutService);

  readonly menuGroups = MENU_CONFIG;

  onMobileDrawerChange(visible: boolean): void {
    if (!visible) {
      this.layoutService.closeMobileMenu();
    }
  }

  onNavigate(): void {
    if (this.layoutService.mobileMenuOpen()) {
      this.layoutService.closeMobileMenu();
    }
  }
}
