import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { Avatar } from 'primeng/avatar';
import { Menu } from 'primeng/menu';
import { Tooltip } from 'primeng/tooltip';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../../core/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-menu',
  standalone: true,
  imports: [Avatar, Menu, Tooltip],
  templateUrl: './app-user-menu.component.html',
  styleUrl: './app-user-menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppUserMenuComponent {
  readonly collapsed = input<boolean>(false);

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly currentUser = this.authService.currentUser;

  readonly userInitial = () => {
    const user = this.currentUser();
    if (user?.fullName) {
      return user.fullName.trim().charAt(0).toUpperCase();
    }
    return 'A';
  };

  readonly userName = () => {
    return this.currentUser()?.fullName || 'Quản trị viên';
  };

  readonly userRole = () => {
    const roles = this.currentUser()?.roles;
    if (roles && roles.length > 0) {
      return roles.join(', ');
    }
    return 'Quản trị viên';
  };

  readonly menuItems: MenuItem[] = [
    {
      label: 'Hồ sơ cá nhân',
      icon: 'pi pi-user',
      command: () => {
        // Điều hướng hồ sơ khi có module
      },
    },
    {
      label: 'Cài đặt hệ thống',
      icon: 'pi pi-cog',
      command: () => {
        // Điều hướng cài đặt
      },
    },
    {
      separator: true,
    },
    {
      label: 'Đăng xuất',
      icon: 'pi pi-sign-out',
      styleClass: 'text-danger',
      command: () => {
        this.authService.logout().subscribe({
          next: () => {
            this.router.navigate(['/auth/login']);
          },
        });
      },
    },
  ];
}
