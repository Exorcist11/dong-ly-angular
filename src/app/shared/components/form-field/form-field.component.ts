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
  templateUrl: './form-field.component.html',
  styleUrl: './form-field.component.scss',
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
