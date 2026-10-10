import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-form-field',
  standalone: true,
  template: `
    <div class="dl-form-field" [class]="styleClass()">
      @if (label()) {
        <div class="field-header">
          <label [attr.for]="forId()" class="field-label">
            {{ label() }}
            @if (required()) {
              <span class="required-mark" aria-hidden="true">*</span>
            }
          </label>
          <ng-content select="[labelSuffix]" />
        </div>
      }

      <div class="control-wrapper">
        <ng-content />
      </div>

      @if (hint() && !hasError()) {
        <small class="field-hint">{{ hint() }}</small>
      }

      @if (hasError()) {
        <small class="error-message" role="alert">
          {{ activeErrorMessage() }}
        </small>
      }
    </div>
  `,
  styles: `
    .dl-form-field {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
      margin-bottom: 1rem;
      width: 100%;
    }

    .field-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
    }

    .field-label {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--color-text-primary, #16161a);
      user-select: none;
    }

    .required-mark {
      color: var(--color-danger, #dc2626);
      font-weight: bold;
      margin-left: 0.125rem;
    }

    .control-wrapper {
      position: relative;
      width: 100%;
    }

    .field-hint {
      font-size: 0.75rem;
      color: var(--color-text-muted, #8a857d);
      line-height: 1.4;
    }

    .error-message {
      font-size: 0.75rem;
      color: var(--color-danger, #dc2626);
      font-weight: 500;
      line-height: 1.4;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormFieldComponent {
  /** Nhãn hiển thị của trường nhập */
  readonly label = input<string>();

  /** ID của input tương ứng (cho label for="...") */
  readonly forId = input<string>();

  /** Đánh dấu trường bắt buộc (hiển thị dấu *) */
  readonly required = input<boolean>(false);

  /** Chú thích gợi ý dưới input khi chưa có lỗi */
  readonly hint = input<string>();

  /** FormControl hoặc AbstractControl để tự động đọc lỗi */
  readonly control = input<AbstractControl | null>(null);

  /** Thông báo lỗi tùy biến (ghi đè tự động nếu có) */
  readonly errorMessage = input<string>();

  /** Bảng ánh xạ lỗi tùy biến riêng { [errorKey: string]: string } */
  readonly errorMessages = input<Record<string, string>>({});

  /** CSS class bổ sung */
  readonly styleClass = input<string>('');

  readonly isControlInvalid = computed(() => {
    const ctrl = this.control();
    if (!ctrl) return false;
    return ctrl.invalid && (ctrl.dirty || ctrl.touched);
  });

  readonly hasError = computed(() => {
    return !!this.errorMessage() || this.isControlInvalid();
  });

  readonly activeErrorMessage = computed(() => {
    // 1. Ưu tiên thông báo lỗi truyền trực tiếp
    const manualMsg = this.errorMessage();
    if (manualMsg) return manualMsg;

    const ctrl = this.control();
    if (!ctrl || !ctrl.errors) return '';

    const errors = ctrl.errors;
    const customMap = this.errorMessages();
    const fieldName = this.label() || 'Trường này';

    // 2. Kiểm tra bảng lỗi tùy biến trước
    for (const key of Object.keys(errors)) {
      if (customMap[key]) {
        return customMap[key];
      }
    }

    // 3. Chuẩn hóa lỗi mặc định bằng tiếng Việt
    if (errors['required']) {
      return `${fieldName} không được để trống.`;
    }
    if (errors['minlength']) {
      const min = errors['minlength'].requiredLength;
      return `${fieldName} phải có ít nhất ${min} ký tự.`;
    }
    if (errors['maxlength']) {
      const max = errors['maxlength'].requiredLength;
      return `${fieldName} không được vượt quá ${max} ký tự.`;
    }
    if (errors['email']) {
      return `Email không đúng định dạng.`;
    }
    if (errors['pattern']) {
      return `${fieldName} không đúng định dạng quy định.`;
    }

    // 4. Fallback: Nếu có lỗi khác dạng string
    const firstKey = Object.keys(errors)[0];
    const firstError = errors[firstKey];
    if (typeof firstError === 'string') {
      return firstError;
    }

    return `${fieldName} không hợp lệ.`;
  });
}
