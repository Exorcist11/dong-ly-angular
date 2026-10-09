import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Breadcrumb } from 'primeng/breadcrumb';
import { MenuItem } from 'primeng/api';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [Breadcrumb, RouterLink],
  template: `
    <nav class="app-breadcrumb-nav" aria-label="Breadcrumb">
      <p-breadcrumb
        [model]="items"
        [home]="home"
        styleClass="custom-breadcrumb"
      >
        <ng-template #item let-item>
          <a
            [routerLink]="item.url"
            class="breadcrumb-link"
            [class.active-item]="item.id === 'active'"
          >
            @if (item.icon) {
              <span [class]="item.icon"></span>
            }
            <span class="breadcrumb-label">{{ item.label }}</span>
          </a>
        </ng-template>
        <ng-template #separator>
          <span class="pi pi-chevron-right breadcrumb-separator" aria-hidden="true"></span>
        </ng-template>
      </p-breadcrumb>
    </nav>
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
    }

    .app-breadcrumb-nav {
      display: inline-flex;
      align-items: center;
    }

    :host ::ng-deep .custom-breadcrumb {
      background: transparent !important;
      padding: 0 !important;
      border: none !important;

      .p-breadcrumb-list {
        display: flex;
        align-items: center;
        gap: 6px;
        margin: 0;
        padding: 0;
        list-style: none;
      }
    }

    .breadcrumb-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: var(--color-text-muted, #8A857D);
      text-decoration: none;
      font-size: 13.5px;
      font-weight: 500;
      transition: color var(--ease, 200ms ease);

      &:hover {
        color: var(--color-text-primary, #16161A);
      }

      &.active-item {
        color: var(--color-text-primary, #16161A);
        font-weight: 600;
        pointer-events: none;
      }
    }

    .breadcrumb-separator {
      font-size: 11px;
      color: var(--color-text-muted, #8A857D);
      margin: 0 8px;
      display: inline-flex;
      align-items: center;
      opacity: 0.8;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppBreadcrumbComponent {
  private readonly router = inject(Router);

  readonly home: MenuItem = {
    icon: 'pi pi-home',
    url: '/dashboard',
    label: 'Trang chủ',
  };

  readonly items: MenuItem[] = [
    {
      label: 'Bàn làm việc',
      id: 'active',
    },
  ];
}
