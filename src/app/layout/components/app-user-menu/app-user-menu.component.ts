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
  template: `
    <div class="user-menu-wrapper">
      <button
        type="button"
        class="user-card-btn"
        [class.collapsed]="collapsed()"
        [pTooltip]="collapsed() ? userName() : ''"
        tooltipPosition="right"
        (click)="menu.toggle($event)"
        aria-haspopup="true"
        aria-expanded="false"
        aria-label="Menu tài khoản người dùng"
      >
        <p-avatar
          [label]="userInitial()"
          shape="circle"
          styleClass="custom-avatar"
        />

        @if (!collapsed()) {
          <div class="user-meta">
            <span class="user-name">{{ userName() }}</span>
            <span class="user-role">{{ userRole() }}</span>
          </div>
          <span class="pi pi-ellipsis-v menu-indicator" aria-hidden="true"></span>
        }
      </button>

      <p-menu
        #menu
        [model]="menuItems"
        [popup]="true"
        [appendTo]="'body'"
        styleClass="custom-user-popup"
      />
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .user-menu-wrapper {
      width: 100%;
      position: relative;
    }

    .user-card-btn {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 10px;
      cursor: pointer;
      text-align: left;
      color: #FFFFFF;
      transition: all var(--ease, 200ms ease);

      &:hover {
        background: rgba(255, 255, 255, 0.06);
        border-color: rgba(255, 255, 255, 0.15);
      }

      &.collapsed {
        justify-content: center;
        padding: 8px;
        border: none;
      }
    }

    :host ::ng-deep .custom-avatar {
      background: linear-gradient(135deg, var(--primary, #D71920), var(--primary-dark, #A50F16)) !important;
      color: #FFFFFF !important;
      font-weight: 700 !important;
      font-size: 14px !important;
      width: 36px !important;
      height: 36px !important;
      flex-shrink: 0;
    }

    .user-meta {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      min-width: 0;
    }

    .user-name {
      font-size: 13.5px;
      font-weight: 600;
      color: #FFFFFF;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-role {
      font-size: 11px;
      color: rgba(255, 255, 255, 0.55);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .menu-indicator {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.45);
      margin-left: auto;
    }
  `],
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
