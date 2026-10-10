import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { AppDialogComponent } from '../dialog/dialog.component';

/**
 * Shared ConfirmModalComponent (`<app-confirm-modal>`)
 *
 * Hộp thoại xác nhận thao tác nghiệp vụ nhạy cảm hoặc nguy hiểm (khóa, xóa, đổi trạng thái).
 * Được tái cấu trúc trên nền tảng `AppDialogComponent` (`<app-dialog>`),
 * bảo toàn 100% hợp đồng API đầu vào/đầu ra cũ cho các caller hiện hành.
 */
@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule, TranslatePipe, AppDialogComponent],
  templateUrl: './confirm-modal.component.html',
  styleUrl: './confirm-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmModalComponent {
  /** Trạng thái mở/đóng modal */
  @Input() isOpen = false;

  /** Tiêu đề modal (văn bản thuần hoặc i18n key; mặc định 'common.dialogs.confirmTitle') */
  @Input() title?: string;

  /** Thông điệp xác nhận (văn bản thuần hoặc i18n key; mặc định 'common.dialogs.confirmMessage') */
  @Input() message?: string;

  /** Nhãn nút Xác nhận (mặc định 'common.actions.confirm') */
  @Input() confirmText?: string;

  /** Nhãn nút Hủy (mặc định 'common.actions.cancel') */
  @Input() cancelText?: string;

  /** Cờ đánh dấu thao tác nguy hiểm (nút Xác nhận hiển thị variant 'danger') */
  @Input() danger = false;

  /** Trạng thái đang xử lý async (spinner trên nút xác nhận, khóa thao tác đóng) */
  @Input() loading = false;

  /** Phát ra khi người dùng xác nhận hành động */
  @Output() confirm = new EventEmitter<void>();

  /** Phát ra khi người dùng hủy bỏ hành động hoặc đóng modal */
  @Output() cancel = new EventEmitter<void>();

  /** Hỗ trợ two-way binding [(isOpen)] nếu caller có nhu cầu */
  @Output() isOpenChange = new EventEmitter<boolean>();

  get resolvedTitle(): string {
    return this.title || 'common.dialogs.confirmTitle';
  }

  get resolvedConfirmText(): string {
    return this.confirmText || 'common.actions.confirm';
  }

  get resolvedCancelText(): string {
    return this.cancelText || 'common.actions.cancel';
  }

  onConfirm(): void {
    if (this.loading) {
      return;
    }
    this.confirm.emit();
  }

  onCancel(): void {
    if (this.loading) {
      return;
    }
    this.cancel.emit();
    this.isOpenChange.emit(false);
  }
}
