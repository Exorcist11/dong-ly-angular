import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="not-found-container">
      <div class="not-found-card">
        <div class="error-code">404</div>
        <h1 class="error-title">Trang không tồn tại</h1>
        <p class="error-message">
          Đường dẫn bạn yêu cầu không tồn tại hoặc đã được di chuyển trên hệ thống quản trị Đông Lý.
        </p>
        <div class="error-actions">
          <a routerLink="/dashboard" class="btn btn-primary">
            🏠 Trở về Bàn làm việc
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .not-found-container {
      min-height: 80vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .not-found-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 48px;
      text-align: center;
      max-width: 480px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .error-code {
      font-size: 72px;
      font-weight: 800;
      color: #2563eb;
      line-height: 1;
      margin-bottom: 12px;
    }
    .error-title {
      font-size: 22px;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 12px 0;
    }
    .error-message {
      font-size: 14px;
      color: #64748b;
      line-height: 1.6;
      margin: 0 0 24px 0;
    }
    .btn {
      display: inline-block;
      padding: 10px 20px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      text-decoration: none;
      transition: background 0.15s;
    }
    .btn-primary {
      background: #2563eb;
      color: #ffffff;
    }
    .btn-primary:hover {
      background: #1d4ed8;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundComponent {}
