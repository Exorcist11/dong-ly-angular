import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Avatar } from 'primeng/avatar';
import { Menu } from 'primeng/menu';
import { Tooltip } from 'primeng/tooltip';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../../core/auth/auth.service';
import { Router } from '@angular/router';
import { TranslationService } from '../../../core/i18n/translation.service';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';

@Component({
  selector: 'app-user-menu',
  standalone: true,
  imports: [Avatar, Menu, Tooltip, TranslatePipe],
  templateUrl: './app-user-menu.component.html',
  styleUrl: './app-user-menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppUserMenuComponent {
  readonly collapsed = input<boolean>(false);

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly i18n = inject(TranslationService);

  readonly currentUser = this.authService.currentUser;

  readonly userInitial = computed(() => {
    const user = this.currentUser();
    if (user?.fullName) {
      return user.fullName.trim().charAt(0).toUpperCase();
    }
    return 'A';
  });

  readonly userName = computed(() => {
    this.i18n.currentLang();
    return this.currentUser()?.fullName || this.i18n.translate('navigation.userMenu.adminDefault');
  });

  readonly userRole = computed(() => {
    this.i18n.currentLang();
    const roles = this.currentUser()?.roles;
    if (roles && roles.length > 0) {
      return roles.join(', ');
    }
    return this.i18n.translate('navigation.userMenu.adminDefault');
  });

  get menuItems(): MenuItem[] {
    return [
      {
        label: this.i18n.translate('navigation.userMenu.profile'),
        icon: 'pi pi-user',
        command: () => {
          // Điều hướng hồ sơ khi có module
        },
      },
      {
        label: this.i18n.translate('navigation.userMenu.settings'),
        icon: 'pi pi-cog',
        command: () => {
          // Điều hướng cài đặt
        },
      },
      {
        separator: true,
      },
      {
        label: this.i18n.translate('navigation.userMenu.logout'),
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
}
