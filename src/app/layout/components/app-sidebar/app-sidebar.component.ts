import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LayoutService } from '../../layout.service';
import { AppUserMenuComponent } from '../app-user-menu/app-user-menu.component';
import { Tag } from 'primeng/tag';
import { Tooltip } from 'primeng/tooltip';
import { Drawer } from 'primeng/drawer';
import { AuthService } from '../../../core/auth/auth.service';

import { TranslatePipe } from '../../../core/i18n/translate.pipe';

export interface NavItem {
  labelKey: string;
  route?: string;
  icon: string;
  isUpcoming?: boolean;
  permission?: string;
}

export interface NavGroup {
  titleKey: string;
  items: NavItem[];
}

export const MENU_CONFIG: NavGroup[] = [
  {
    titleKey: 'navigation.groups.overview',
    items: [
      {
        labelKey: 'navigation.items.dashboard',
        route: '/dashboard',
        icon: 'pi pi-objects-column',
      },
    ],
  },
  {
    titleKey: 'navigation.groups.operations',
    items: [
      {
        labelKey: 'navigation.items.users',
        route: '/users',
        icon: 'pi pi-users',
        permission: 'USER_READ',
      },
      {
        labelKey: 'navigation.items.tripsAndRoutes',
        route: '/routes',
        icon: 'pi pi-map',
        permission: 'ROUTE_READ',
      },
      {
        labelKey: 'navigation.items.bookings',
        icon: 'pi pi-ticket',
        isUpcoming: true,
      },
    ],
  },
  {
    titleKey: 'navigation.groups.system',
    items: [
      {
        labelKey: 'navigation.items.rolesAndPermissions',
        route: '/roles',
        icon: 'pi pi-shield',
        permission: 'ROLE_READ',
      },
      {
        labelKey: 'navigation.items.settings',
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
    TranslatePipe,
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
