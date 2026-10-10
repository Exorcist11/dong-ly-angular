import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Breadcrumb } from 'primeng/breadcrumb';
import { MenuItem } from 'primeng/api';
import { Router, RouterLink } from '@angular/router';

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
