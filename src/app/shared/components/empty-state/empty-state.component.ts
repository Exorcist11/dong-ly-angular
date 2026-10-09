import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  template: `
    <div class="empty-state">
      <div class="empty-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </svg>
      </div>
      <h3 class="empty-title">{{ title }}</h3>
      @if (description) {
        <p class="empty-desc">{{ description }}</p>
      }
      <div class="empty-action">
        <ng-content select="[action]"></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
      text-align: center;
      background: #fafafa;
      border: 1px dashed #cbd5e1;
      border-radius: 8px;
    }
    .empty-icon {
      width: 48px;
      height: 48px;
      color: #94a3b8;
      margin-bottom: 12px;
    }
    .empty-title {
      font-size: 16px;
      font-weight: 600;
      color: #334155;
      margin: 0 0 6px 0;
    }
    .empty-desc {
      font-size: 14px;
      color: #64748b;
      margin: 0 0 16px 0;
      max-width: 400px;
    }
    .empty-action {
      margin-top: 8px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent {
  @Input() title = 'Không có dữ liệu';
  @Input() description = 'Hiện tại chưa có bản ghi nào để hiển thị.';
}
