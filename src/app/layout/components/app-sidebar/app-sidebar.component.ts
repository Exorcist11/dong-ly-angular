import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LayoutService } from '../../layout.service';
import { AppUserMenuComponent } from '../app-user-menu/app-user-menu.component';
import { Tag } from 'primeng/tag';
import { Tooltip } from 'primeng/tooltip';
import { Drawer } from 'primeng/drawer';
import { AuthService } from '../../../core/auth/auth.service';

export interface NavItem {
  label: string;
  route?: string;
  icon: string;
  isUpcoming?: boolean;
  permission?: string;
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
        route: '/users',
        icon: 'pi pi-users',
        permission: 'USER_READ',
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
        label: 'Vai trò & Phân quyền',
        route: '/roles',
        icon: 'pi pi-shield',
        permission: 'ROLE_READ',
      },
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
  templateUrl: './app-sidebar.component.html',
  styleUrl: './app-sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppSidebarComponent {
  readonly layoutService = inject(LayoutService);
  readonly authService = inject(AuthService);

  readonly menuGroups = MENU_CONFIG;

  hasItemAccess(item: NavItem): boolean {
    if (!item.permission) {
      return true;
    }
    return this.authService.hasPermission(item.permission);
  }

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
