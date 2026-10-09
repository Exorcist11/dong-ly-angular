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
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(2px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.15s ease-out;
    }
    .modal-dialog {
      background: #ffffff;
      border-radius: 12px;
      width: 90%;
      max-width: 460px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      overflow: hidden;
      animation: scaleUp 0.15s ease-out;
    }
    .modal-header {
      padding: 18px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #f1f5f9;
    }
    .modal-title {
      font-size: 17px;
      font-weight: 600;
      color: #0f172a;
      margin: 0;
    }
    .btn-close {
      background: none;
      border: none;
      font-size: 24px;
      color: #94a3b8;
      cursor: pointer;
      line-height: 1;
      padding: 0;
    }
    .btn-close:hover {
      color: #475569;
    }
    .modal-body {
      padding: 20px 24px;
      color: #475569;
      font-size: 14px;
      line-height: 1.5;
    }
    .modal-body p {
      margin: 0;
    }
    .modal-footer {
      padding: 14px 24px;
      background: #f8fafc;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      border-top: 1px solid #f1f5f9;
    }
    .btn {
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      border: 1px solid transparent;
      transition: all 0.2s;
    }
    .btn-secondary {
      background: #ffffff;
      border-color: #cbd5e1;
      color: #334155;
    }
    .btn-secondary:hover {
      background: #f1f5f9;
    }
    .btn-primary {
      background: #2563eb;
      color: #ffffff;
    }
    .btn-primary:hover {
      background: #1d4ed8;
    }
    .btn-danger {
      background: #dc2626;
      color: #ffffff;
    }
    .btn-danger:hover {
      background: #b91c1c;
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
