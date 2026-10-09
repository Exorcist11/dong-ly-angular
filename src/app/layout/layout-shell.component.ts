import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppSidebarComponent } from './components/app-sidebar/app-sidebar.component';
import { AppTopbarComponent } from './components/app-topbar/app-topbar.component';
import { Toast } from 'primeng/toast';

@Component({
  selector: 'app-layout-shell',
  standalone: true,
  imports: [RouterOutlet, AppSidebarComponent, AppTopbarComponent, Toast],
  template: `
    <div class="app-layout-root">
      <!-- GLOBAL TOAST NOTIFICATIONS -->
      <p-toast position="top-right" />

      <!-- SIDEBAR (DESKTOP & DRAWER) -->
      <app-sidebar />

      <!-- MAIN WRAPPER -->
      <div class="layout-main-wrapper">
        <!-- TOPBAR -->
        <app-topbar />

        <!-- ROUTER OUTLET CONTAINER -->
        <main class="layout-page-content" role="main">
          <router-outlet />
        </main>

        <!-- SLIM FOOTER -->
        <footer class="layout-slim-footer" role="contentinfo">
          <p>© 2026 Nhà xe Đông Lý. Bảo lưu mọi quyền. (v1.0.0)</p>
        </footer>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
    }

    .app-layout-root {
      display: flex;
      min-height: 100vh;
      background-color: var(--color-bg, #FFFBF5);
      color: var(--color-text-primary, #16161A);
      transition: background-color var(--ease, 200ms ease), color var(--ease, 200ms ease);
    }

    .layout-main-wrapper {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
      position: relative;
    }

    .layout-page-content {
      flex: 1;
      padding: 24px 32px;
      width: 100%;
      max-width: 1600px;
      margin: 0 auto;
    }

    .layout-slim-footer {
      padding: 16px 24px;
      border-top: 1px solid var(--color-border, #D9D4CC);
      background: var(--color-surface, #FFFFFF);
      text-align: center;
      font-size: 12px;
      color: var(--color-text-muted, #8A857D);
      transition: background-color var(--ease, 200ms ease), border-color var(--ease, 200ms ease);

      p {
        margin: 0;
      }
    }

    @media (max-width: 767px) {
      .layout-page-content {
        padding: 16px;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutShellComponent {}
