import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  template: `
    <div [class.overlay]="overlay" class="spinner-container">
      <div class="spinner"></div>
      @if (message) {
        <p class="spinner-text">{{ message }}</p>
      }
    </div>
  `,
  styles: [`
    .spinner-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 32px;
      gap: 12px;
    }
    .spinner-container.overlay {
      position: absolute;
      inset: 0;
      background: rgba(255, 255, 255, 0.75);
      z-index: 50;
      backdrop-filter: blur(2px);
    }
    .spinner {
      width: 36px;
      height: 36px;
      border: 3px solid #e2e8f0;
      border-top-color: #2563eb;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    .spinner-text {
      color: #64748b;
      font-size: 14px;
      margin: 0;
      font-weight: 500;
    }
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingSpinnerComponent {
  @Input() message?: string = 'Đang tải dữ liệu...';
  @Input() overlay = false;
}
