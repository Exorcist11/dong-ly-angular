import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  template: `
    @if (isOpen) {
      <div class="modal-backdrop" (click)="onCancel()">
        <div class="modal-dialog" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 class="modal-title">{{ title }}</h3>
            <button type="button" class="btn-close" (click)="onCancel()" aria-label="Đóng">
              &times;
            </button>
          </div>

          <div class="modal-body">
            <p>{{ message }}</p>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="onCancel()">
              {{ cancelText }}
            </button>
            <button
              type="button"
              class="btn"
              [class.btn-danger]="danger"
              [class.btn-primary]="!danger"
              (click)="onConfirm()"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.65);
      backdrop-filter: blur(2px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.15s ease-out;
    }
    .modal-dialog {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 12px;
      width: 90%;
      max-width: 460px;
      box-shadow: var(--shadow-lg);
      overflow: hidden;
      animation: scaleUp 0.15s ease-out;
      transition: background-color var(--ease), border-color var(--ease);
    }
    .modal-header {
      padding: 18px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--color-border);
    }
    .modal-title {
      font-size: 17px;
      font-weight: 600;
      color: var(--color-text-primary);
      margin: 0;
    }
    .btn-close {
      background: none;
      border: none;
      font-size: 24px;
      color: var(--color-text-muted);
      cursor: pointer;
      line-height: 1;
      padding: 0;
      transition: color var(--ease);
    }
    .btn-close:hover {
      color: var(--color-text-primary);
    }
    .modal-body {
      padding: 20px 24px;
      color: var(--color-text-secondary);
      font-size: 14px;
      line-height: 1.5;
    }
    .modal-body p {
      margin: 0;
    }
    .modal-footer {
      padding: 14px 24px;
      background: var(--color-surface-sunken);
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      border-top: 1px solid var(--color-border);
    }
    .btn {
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      border: 1px solid transparent;
      transition: all var(--ease);
    }
    .btn-secondary {
      background: var(--color-surface);
      border-color: var(--color-border);
      color: var(--color-text-primary);
    }
    .btn-secondary:hover {
      background: var(--color-surface-hover);
    }
    .btn-primary {
      background: var(--color-primary, #D71920);
      color: #ffffff;
    }
    .btn-primary:hover {
      background: var(--color-primary-hover, #A50F16);
    }
    .btn-danger {
      background: var(--color-danger, #D71920);
      color: #ffffff;
    }
    .btn-danger:hover {
      background: var(--primary-dark, #A50F16);
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes scaleUp {
      from { transform: scale(0.95); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmModalComponent {
  @Input() isOpen = false;
  @Input() title = 'Xác nhận hành động';
  @Input() message = 'Bạn có chắc chắn muốn thực hiện hành động này?';
  @Input() confirmText = 'Xác nhận';
  @Input() cancelText = 'Hủy bỏ';
  @Input() danger = false;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
