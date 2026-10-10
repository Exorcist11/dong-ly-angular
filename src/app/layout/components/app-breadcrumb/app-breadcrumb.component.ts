import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { Breadcrumb } from 'primeng/breadcrumb';
import { MenuItem } from 'primeng/api';
import { filter } from 'rxjs';
import { TranslationService } from '../../../core/i18n/translation.service';

interface BreadcrumbRouteConfig {
  groupKey?: string;
  labelKey: string;
}

const ROUTE_BREADCRUMBS: Record<string, BreadcrumbRouteConfig> = {
  '/dashboard': {
    labelKey: 'navigation.items.dashboard',
  },
  '/users': {
    groupKey: 'navigation.groups.operations',
    labelKey: 'navigation.items.users',
  },
  '/roles': {
    groupKey: 'navigation.groups.system',
    labelKey: 'navigation.items.rolesAndPermissions',
  },
  '/routes': {
    groupKey: 'navigation.groups.operations',
    labelKey: 'navigation.items.routesList',
  },
  '/stops': {
    groupKey: 'navigation.groups.operations',
    labelKey: 'navigation.items.stopPoints',
  },
  '/trips': {
    groupKey: 'navigation.groups.operations',
    labelKey: 'navigation.items.tripList',
  },
  '/trip-runs': {
    groupKey: 'navigation.groups.operations',
    labelKey: 'navigation.items.tripRuns',
  },
  '/vehicles': {
    groupKey: 'navigation.groups.operations',
    labelKey: 'navigation.items.vehicleList',
  },
  '/drivers': {
    groupKey: 'navigation.groups.operations',
    labelKey: 'navigation.items.driverList',
  },
};

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [Breadcrumb, RouterLink],
  templateUrl: './app-breadcrumb.component.html',
  styleUrl: './app-breadcrumb.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppBreadcrumbComponent {
  private readonly router = inject(Router);
  private readonly i18n = inject(TranslationService);

  readonly currentUrl = signal(this.router.url);

  constructor() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.currentUrl.set(event.urlAfterRedirects || event.url);
      });
  }

  readonly home = computed<MenuItem>(() => {
    this.i18n.currentLang();
    return {
      icon: 'pi pi-home',
      routerLink: '/dashboard',
      label: this.i18n.translate('navigation.home'),
    };
  });

  readonly items = computed<MenuItem[]>(() => {
    this.i18n.currentLang();
    const url = (this.currentUrl() || this.router.url || '').split('?')[0].split('#')[0];

    if (!url || url === '/' || url === '/dashboard') {
      return [
        {
          label: this.i18n.translate('navigation.items.dashboard'),
          id: 'active',
        },
      ];
    }

    const config =
      ROUTE_BREADCRUMBS[url] ||
      Object.entries(ROUTE_BREADCRUMBS).find(([route]) => url.startsWith(route))?.[1];

    if (config) {
      const result: MenuItem[] = [];
      if (config.groupKey) {
        result.push({
          label: this.i18n.translate(config.groupKey),
        });
      }
      result.push({
        label: this.i18n.translate(config.labelKey),
        id: 'active',
      });
      return result;
    }

    const segment = url.split('/').filter(Boolean).pop() || '';
    return [
      {
        label: segment.charAt(0).toUpperCase() + segment.slice(1),
        id: 'active',
      },
    ];
  });
}
