import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { NotificationService } from '../../core/services/notification.service';

interface NavSection {
  title: string;
  items: {
    label: string;
    path?: string;
    icon: string;
    status?: 'active' | 'upcoming';
  }[];
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="admin-container">
      <!-- SIDEBAR NAVIGATION -->
      <aside class="sidebar">
        <div class="sidebar-brand">
          <div class="brand-logo">ĐL</div>
          <div class="brand-text">
            <h2>ĐÔNG LÝ</h2>
            <span>Admin Portal</span>
          </div>
        </div>

        <nav class="sidebar-nav">
          <div class="nav-section">Tổng quan</div>
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-link">
            <span class="nav-icon">📊</span>
            <span>Bàn làm việc</span>
          </a>

          <div class="nav-section">Lộ trình tính năng (Roadmap)</div>
          <div class="nav-link disabled" title="Tính năng sẽ được triển khai trong task tiếp theo">
            <span class="nav-icon">👥</span>
            <span>Quản lý người dùng</span>
            <span class="badge-roadmap">FE-001</span>
          </div>
          <div class="nav-link disabled" title="Tính năng sẽ được triển khai theo kế hoạch">
            <span class="nav-icon">🚌</span>
            <span>Chuyến xe & Tuyến</span>
            <span class="badge-roadmap">Kế hoạch</span>
          </div>
          <div class="nav-link disabled" title="Tính năng sẽ được triển khai theo kế hoạch">
            <span class="nav-icon">🎫</span>
            <span>Vé & Giữ chỗ</span>
            <span class="badge-roadmap">Kế hoạch</span>
          </div>
        </nav>
      </aside>

      <!-- MAIN AREA -->
      <div class="main-wrapper">
        <!-- TOPBAR -->
        <header class="topbar">
          <div class="topbar-left">
            <span class="portal-badge">Hệ thống quản lý vận tải & bán vé</span>
          </div>

          <div class="topbar-right">
            @if (currentUser(); as user) {
              <div class="user-info">
                <div class="avatar">{{ user.fullName.slice(0, 1).toUpperCase() }}</div>
                <div class="meta">
                  <span class="name">{{ user.fullName }}</span>
                  <span class="role">{{ user.roles.join(', ') || 'Quản trị viên' }}</span>
                </div>
              </div>
            } @else {
              <div class="user-info">
                <div class="avatar">A</div>
                <div class="meta">
                  <span class="name">Quản trị viên</span>
                  <span class="role">Admin Console</span>
                </div>
              </div>
            }

            <button type="button" class="btn-logout" (click)="onLogout()" title="Đăng xuất">
              Đăng xuất
            </button>
          </div>
        </header>

        <!-- MAIN CONTENT ROUTER OUTLET -->
        <main class="main-content">
          <router-outlet></router-outlet>
        </main>

        <!-- FOOTER -->
        <footer class="admin-footer">
          <p>© 2026 Nhà xe Đông Lý. Hệ thống quản trị nội bộ.</p>
        </footer>
      </div>

      <!-- TOAST CONTAINER -->
      <div class="toast-container" aria-live="polite">
        @for (n of notifications(); track n.id) {
          <div class="toast" [class]="'toast-' + n.type">
            <span>{{ n.message }}</span>
            <button type="button" class="toast-close" (click)="dismissNotification(n.id)">&times;</button>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .admin-container {
      display: flex;
      min-height: 100vh;
      background: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }
    .sidebar {
      width: 250px;
      background: #0f172a;
      color: #f8fafc;
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      border-right: 1px solid #1e293b;
    }
    .sidebar-brand {
      padding: 18px 20px;
      display: flex;
      align-items: center;
      gap: 12px;
      border-bottom: 1px solid #1e293b;
    }
    .brand-logo {
      width: 36px;
      height: 36px;
      background: #2563eb;
      color: #ffffff;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 16px;
    }
    .brand-text h2 {
      margin: 0;
      font-size: 15px;
      font-weight: 700;
      color: #ffffff;
    }
    .brand-text span {
      font-size: 11px;
      color: #94a3b8;
    }
    .sidebar-nav {
      padding: 16px 10px;
      flex: 1;
      overflow-y: auto;
    }
    .nav-section {
      font-size: 11px;
      text-transform: uppercase;
      color: #64748b;
      font-weight: 600;
      letter-spacing: 0.8px;
      padding: 10px 10px 6px 10px;
    }
    .nav-link {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 9px 12px;
      color: #cbd5e1;
      text-decoration: none;
      border-radius: 6px;
      font-size: 13.5px;
      font-weight: 500;
      transition: all 0.15s ease-in-out;
      margin-bottom: 2px;
    }
    .nav-link:hover:not(.disabled) {
      background: #1e293b;
      color: #ffffff;
    }
    .nav-link.active {
      background: #2563eb;
      color: #ffffff;
      font-weight: 600;
    }
    .nav-link.disabled {
      color: #64748b;
      cursor: not-allowed;
      opacity: 0.8;
    }
    .badge-roadmap {
      margin-left: auto;
      font-size: 10px;
      background: #1e293b;
      color: #94a3b8;
      padding: 2px 6px;
      border-radius: 10px;
    }
    .nav-icon {
      font-size: 15px;
    }
    .main-wrapper {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    .topbar {
      height: 60px;
      background: #ffffff;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
    }
    .portal-badge {
      font-size: 13px;
      color: #64748b;
      font-weight: 500;
    }
    .topbar-right {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .user-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #2563eb;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 13px;
    }
    .meta {
      display: flex;
      flex-direction: column;
    }
    .name {
      font-size: 13px;
      font-weight: 600;
      color: #0f172a;
    }
    .role {
      font-size: 11px;
      color: #64748b;
    }
    .btn-logout {
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 13px;
      color: #475569;
      cursor: pointer;
      font-weight: 500;
    }
    .btn-logout:hover {
      background: #fee2e2;
      color: #dc2626;
      border-color: #fca5a5;
    }
    .main-content {
      flex: 1;
      padding: 24px;
    }
    .admin-footer {
      padding: 14px 24px;
      border-top: 1px solid #e2e8f0;
      background: #ffffff;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
    }
    .admin-footer p { margin: 0; }
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 2000;
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-width: 360px;
    }
    .toast {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 14px;
      border-radius: 6px;
      color: #ffffff;
      font-size: 13px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .toast-success { background: #16a34a; }
    .toast-error { background: #dc2626; }
    .toast-warning { background: #d97706; }
    .toast-info { background: #2563eb; }
    .toast-close {
      background: none;
      border: none;
      color: #ffffff;
      font-size: 16px;
      cursor: pointer;
      margin-left: 10px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLayoutComponent {
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);

  readonly currentUser = this.authService.currentUser;
  readonly notifications = this.notificationService.notifications;

  onLogout(): void {
    this.authService.logout().subscribe();
  }

  dismissNotification(id: string): void {
    this.notificationService.dismiss(id);
  }
}
