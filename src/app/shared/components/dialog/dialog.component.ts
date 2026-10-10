import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  TemplateRef,
  computed,
  contentChild,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Dialog } from 'primeng/dialog';
import { ButtonComponent } from '../button/button.component';
import { ButtonVariant } from '../button/button.types';
import { TranslationService } from '../../../core/i18n/translation.service';
import { DIALOG_SIZE_CONFIG, DialogSize } from './dialog.types';
import { DialogFooterDirective, DialogHeaderDirective } from './dialog.directives';

export * from './dialog.types';
export * from './dialog.directives';

/**
 * Shared AppDialogComponent (`<app-dialog>`)
 *
 * Tiêu chuẩn Modal/Dialog dùng chung toàn hệ thống Quản trị Đông Lý.
 * - Sử dụng PrimeNG Dialog làm primitive nền tảng.
 * - Hỗ trợ chuẩn hóa kích thước (sm, md, lg, xl, full).
 * - Content Projection: header tùy biến (`[dialogHeader]`), body, footer tùy biến (`[dialogFooter]`).
 * - Tự động khóa đóng/hủy khi đang submit loading.
 * - Tự động đồng bộ hóa i18n và Design Tokens.
 */
@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [CommonModule, Dialog, ButtonComponent],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppDialogComponent {
  private readonly i18n = inject(TranslationService);

  // ===================== INPUTS: TRẠNG THÁI & HIỂN THỊ =====================
  /** Trạng thái hiển thị dialog (bắt buộc) */
  readonly visible = input.required<boolean>();

  /** Tiêu đề mặc định (văn bản thuần hoặc i18n translation key) */
  readonly header = input<string>('');

  /** Kích thước chuẩn: 'sm' | 'md' | 'lg' | 'xl' | 'full' (mặc định 'md' ~540px) */
  readonly size = input<DialogSize>('md');

  /** Chiều cao tùy chọn (VD: '88vh', '600px') */
  readonly height = input<string | undefined>(undefined);

  /** Chế độ modal chặn tương tác nền (mặc định true) */
  readonly modal = input<boolean>(true);

  /** Cho phép kéo thả dialog (mặc định false) */
  readonly draggable = input<boolean>(false);

  /** Cho phép thay đổi kích thước dialog (mặc định false) */
  readonly resizable = input<boolean>(false);

  /** Hiển thị nút đóng X ở góc trên phải (mặc định true) */
  readonly closable = input<boolean>(true);

  /** Cho phép đóng khi click ra ngoài backdrop (mặc định true) */
  readonly dismissableMask = input<boolean>(true);

  /** Cho phép đóng khi nhấn phím ESC (mặc định true) */
  readonly closeOnEscape = input<boolean>(true);

  /** StyleClass bổ sung cho container dialog */
  readonly styleClass = input<string>('');

  /** Tùy biến contentStyle */
  readonly contentStyle = input<Record<string, string> | undefined>(undefined);

  // ===================== INPUTS: FOOTER & ACTIONS =====================
  /** Hiển thị khu vực footer mặc định (mặc định true) */
  readonly showFooter = input<boolean>(true);

  /** Nhãn nút Xác nhận/Lưu (mặc định 'common.actions.save') */
  readonly submitLabel = input<string>('');

  /** Icon nút Xác nhận/Lưu */
  readonly submitIcon = input<string>('pi pi-check');

  /** Biến thể màu sắc nút Xác nhận ('primary', 'danger', 'warn', ...) */
  readonly submitVariant = input<ButtonVariant>('primary');

  /** Trạng thái loading của nút Xác nhận (đồng thời khóa các thao tác đóng) */
  readonly submitLoading = input<boolean>(false);

  /** Trạng thái disabled của nút Xác nhận */
  readonly submitDisabled = input<boolean>(false);

  /** Hiển thị nút Hủy trong footer mặc định (mặc định true) */
  readonly showCancel = input<boolean>(true);

  /** Nhãn nút Hủy (mặc định 'common.actions.cancel') */
  readonly cancelLabel = input<string>('');

  /** Icon nút Hủy (tùy chọn) */
  readonly cancelIcon = input<string | undefined>(undefined);

  // ===================== OUTPUTS =====================
  /** Phát ra khi trạng thái visible thay đổi (hỗ trợ hai chiều [(visible)]) */
  readonly visibleChange = output<boolean>();

  /** Phát ra khi nhấn nút Xác nhận/Lưu (LƯU Ý: Không tự đóng dialog) */
  readonly submitted = output<void>();

  /** Phát ra khi dialog bị đóng qua nút Hủy, nút X, ESC hoặc backdrop click */
  readonly cancelled = output<void>();

  // ===================== CONTENT PROJECTION QUERIES =====================
  readonly customHeaderDirective = contentChild(DialogHeaderDirective);
  readonly customHeaderRef = contentChild<TemplateRef<unknown> | ElementRef>('dialogHeader');

  readonly customFooterDirective = contentChild(DialogFooterDirective);
  readonly customFooterRef = contentChild<TemplateRef<unknown> | ElementRef>('dialogFooter');

  private isExplicitlyClosing = false;

  // ===================== COMPUTED PROPERTIES =====================
  readonly hasCustomHeader = computed<boolean>(() => {
    return !!this.customHeaderDirective() || !!this.customHeaderRef();
  });

  readonly hasCustomFooter = computed<boolean>(() => {
    return !!this.customFooterDirective() || !!this.customFooterRef();
  });

  readonly shouldRenderFooter = computed<boolean>(() => {
    return this.showFooter() || this.hasCustomFooter();
  });

  /** Kích thước và styling hộp thoại theo cấu hình chuẩn */
  readonly computedDimensions = computed<Record<string, string>>(() => {
    const cfg = DIALOG_SIZE_CONFIG[this.size()] ?? DIALOG_SIZE_CONFIG.md;
    const styles: Record<string, string> = {
      width: cfg.width,
      maxWidth: cfg.maxWidth,
    };
    const customHeight = this.height();
    if (customHeight) {
      styles['height'] = customHeight;
    } else if (cfg.height) {
      styles['height'] = cfg.height;
    }
    return styles;
  });

  readonly computedStyleClass = computed<string>(() => {
    const classes = ['dl-dialog', `dl-dialog-${this.size()}`];
    if (this.height()) {
      classes.push('dl-dialog-has-height');
    }
    const extra = this.styleClass();
    if (extra) {
      classes.push(extra);
    }
    return classes.join(' ');
  });

  /** Khóa an toàn các hành vi đóng khi đang submit loading */
  readonly effectiveClosable = computed<boolean>(() => {
    return this.closable() && !this.submitLoading();
  });

  readonly effectiveDismissableMask = computed<boolean>(() => {
    return this.dismissableMask() && !this.submitLoading();
  });

  readonly effectiveCloseOnEscape = computed<boolean>(() => {
    return this.closeOnEscape() && this.closable() && !this.submitLoading();
  });

  // ===================== I18N RESOLUTION =====================
  readonly resolvedHeader = computed<string>(() => {
    const raw = this.header();
    if (!raw) return '';
    if (raw.includes('.')) {
      this.i18n.currentLang();
      return this.i18n.translate(raw);
    }
    return raw;
  });

  readonly resolvedSubmitLabel = computed<string>(() => {
    const raw = this.submitLabel();
    if (raw) {
      if (raw.includes('.')) {
        this.i18n.currentLang();
        return this.i18n.translate(raw);
      }
      return raw;
    }
    this.i18n.currentLang();
    return this.i18n.translate('common.actions.save');
  });

  readonly resolvedCancelLabel = computed<string>(() => {
    const raw = this.cancelLabel();
    if (raw) {
      if (raw.includes('.')) {
        this.i18n.currentLang();
        return this.i18n.translate(raw);
      }
      return raw;
    }
    this.i18n.currentLang();
    return this.i18n.translate('common.actions.cancel');
  });

  // ===================== ACTION HANDLERS =====================
  onCancel(): void {
    if (this.submitLoading()) return;
    this.isExplicitlyClosing = true;
    this.cancelled.emit();
    this.visibleChange.emit(false);
    queueMicrotask(() => {
      this.isExplicitlyClosing = false;
    });
  }

  onSubmit(): void {
    if (this.submitLoading() || this.submitDisabled()) return;
    this.submitted.emit();
  }

  onDialogVisibleChange(visible: boolean): void {
    if (!visible) {
      if (!this.isExplicitlyClosing) {
        this.cancelled.emit();
      }
      this.visibleChange.emit(false);
    } else {
      this.visibleChange.emit(true);
    }
  }
}
