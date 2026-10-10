import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { TranslationService } from '../../../core/i18n/translation.service';

@Component({
  selector: 'app-form-field',
  standalone: true,
  templateUrl: './form-field.component.html',
  styleUrl: './form-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormFieldComponent {
  private readonly i18n = inject(TranslationService);

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

    this.i18n.currentLang();

    const errors = ctrl.errors;
    const customMap = this.errorMessages();
    const fieldName = this.label() || this.i18n.translate('validation.thisField');

    // 2. Kiểm tra bảng lỗi tùy biến trước
    for (const key of Object.keys(errors)) {
      if (customMap[key]) {
        return customMap[key];
      }
    }

    // 3. Chuẩn hóa lỗi theo ngôn ngữ hiện tại
    if (errors['required']) {
      return this.i18n.translate('validation.fieldRequired', { field: fieldName });
    }
    if (errors['minlength']) {
      const min = errors['minlength'].requiredLength;
      return this.i18n.translate('validation.fieldMinLength', { field: fieldName, min });
    }
    if (errors['maxlength']) {
      const max = errors['maxlength'].requiredLength;
      return this.i18n.translate('validation.fieldMaxLength', { field: fieldName, max });
    }
    if (errors['email']) {
      return this.i18n.translate('validation.invalidEmail');
    }
    if (errors['pattern']) {
      return this.i18n.translate('validation.fieldPattern', { field: fieldName });
    }

    // 4. Fallback: Nếu có lỗi khác dạng string
    const firstKey = Object.keys(errors)[0];
    const firstError = errors[firstKey];
    if (typeof firstError === 'string') {
      return firstError;
    }

    return this.i18n.translate('validation.fieldInvalid', { field: fieldName });
  });
}
