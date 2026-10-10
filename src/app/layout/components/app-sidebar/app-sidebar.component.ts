import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { LayoutService } from '../../layout.service';
import { AppUserMenuComponent } from '../app-user-menu/app-user-menu.component';
import { Tag } from 'primeng/tag';
import { Tooltip } from 'primeng/tooltip';
import { Drawer } from 'primeng/drawer';
import { AuthService } from '../../../core/auth/auth.service';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { filter } from 'rxjs';

export interface NavItem {
  labelKey: string;
  route?: string;
  icon: string;
  isUpcoming?: boolean;
  permission?: string;
  children?: NavItem[];
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
        labelKey: 'navigation.items.routesGroup',
        icon: 'pi pi-map',
        permission: 'ROUTE_READ',
        children: [
          {
            labelKey: 'navigation.items.routesList',
            route: '/routes',
            icon: 'pi pi-compass',
            permission: 'ROUTE_READ',
          },
          {
            labelKey: 'navigation.items.stopPoints',
            route: '/stops',
            icon: 'pi pi-map-marker',
            permission: 'ROUTE_READ',
          },
        ],
      },
      {
        labelKey: 'navigation.items.tripsGroup',
        icon: 'pi pi-compass',
        permission: 'TRIP_READ',
        children: [
          {
            labelKey: 'navigation.items.tripList',
            route: '/trips',
            icon: 'pi pi-send',
            permission: 'TRIP_READ',
          },
          {
            labelKey: 'navigation.items.tripRuns',
            route: '/trip-runs',
            icon: 'pi pi-calendar',
            permission: 'TRIP_READ',
          },
        ],
      },
      {
        labelKey: 'navigation.items.vehiclesGroup',
        icon: 'pi pi-truck',
        permission: 'FLEET_READ',
        children: [
          {
            labelKey: 'navigation.items.vehicleList',
            route: '/vehicles',
            icon: 'pi pi-car',
            permission: 'FLEET_READ',
          },
          {
            labelKey: 'navigation.items.driverList',
            route: '/drivers',
            icon: 'pi pi-id-card',
            permission: 'FLEET_READ',
          },
        ],
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

import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    NgTemplateOutlet,
    RouterLink,
    RouterLinkActive,
    AppUserMenuComponent,
    ButtonComponent,
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
  readonly router = inject(Router);

  readonly menuGroups = MENU_CONFIG;
  readonly expandedMenus = signal<Record<string, boolean>>({});

  constructor() {
    this.syncExpandedState(this.router.url);

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.syncExpandedState(event.urlAfterRedirects || event.url);
      });
  }

  private syncExpandedState(currentUrl: string): void {
    const nextState = { ...this.expandedMenus() };
    for (const group of this.menuGroups) {
      for (const item of group.items) {
        if (item.children && item.children.length > 0) {
          const isChildActive = item.children.some(
            (child) => child.route && (currentUrl === child.route || currentUrl.startsWith(child.route + '/'))
          );
          if (isChildActive) {
            nextState[item.labelKey] = true;
          }
        }
      }
    }
    this.expandedMenus.set(nextState);
  }

  toggleSubmenu(item: NavItem): void {
    if (this.layoutService.sidebarCollapsed()) {
      // Khi đang thu nhỏ sidebar, nhấn vào mở rộng sidebar và mở submenu
      this.layoutService.sidebarCollapsed.set(false);
      this.expandedMenus.update((prev) => ({
        ...prev,
        [item.labelKey]: true,
      }));
      return;
    }

    this.expandedMenus.update((prev) => ({
      ...prev,
      [item.labelKey]: !prev[item.labelKey],
    }));
  }

  isExpanded(item: NavItem): boolean {
    return !!this.expandedMenus()[item.labelKey];
  }

  isParentActive(item: NavItem): boolean {
    if (!item.children || item.children.length === 0) {
      return false;
    }
    const currentUrl = this.router.url;
    return item.children.some(
      (child) => child.route && (currentUrl === child.route || currentUrl.startsWith(child.route + '/'))
    );
  }

  hasItemAccess(item: NavItem): boolean {
    if (item.children && item.children.length > 0) {
      return item.children.some((child) => this.hasItemAccess(child));
    }
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
