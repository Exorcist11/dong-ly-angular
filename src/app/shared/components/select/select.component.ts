import {
  ChangeDetectionStrategy,
  Component,
  Provider,
  computed,
  forwardRef,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Select } from 'primeng/select';
import { SelectOption } from '../../models/select-option.model';

export const SELECT_VALUE_ACCESSOR: Provider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => SelectComponent),
  multi: true,
};

/**
 * Component Select dùng chung (Dropdown Select) Đông Lý Admin.
 * Bọc PrimeNG p-select, hỗ trợ ControlValueAccessor (Reactive Forms/ngModel),
 * tùy biến độ rộng, icon, tìm kiếm và xóa lựa chọn.
 */
@Component({
  selector: 'app-select',
  standalone: true,
  imports: [CommonModule, FormsModule, Select],
  providers: [SELECT_VALUE_ACCESSOR],
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectComponent<T = unknown> implements ControlValueAccessor {
  /** Danh sách tùy chọn */
  readonly options = input.required<SelectOption<T>[]>();

  /** Văn bản gợi ý khi chưa chọn */
  readonly placeholder = input<string>('Chọn...');

  /** Trạng thái vô hiệu hóa từ input component cha */
  readonly disabled = input<boolean>(false);

  /** Cho phép xóa giá trị đã chọn (hiển thị nút x) */
  readonly clearable = input<boolean>(false);

  /** Bật thanh tìm kiếm bên trong dropdown menu */
  readonly filter = input<boolean>(false);

  /** Placeholder cho ô tìm kiếm bên trong dropdown */
  readonly filterPlaceholder = input<string>('Tìm kiếm...');

  /** Chiều rộng ô select (vd: '180px', '100%') */
  readonly width = input<string | undefined>(undefined);

  /** Class CSS tùy biến */
  readonly styleClass = input<string>('');

  /** Nhãn accessibility aria-label */
  readonly ariaLabel = input<string>('Lựa chọn');

  /** Phát sự kiện khi giá trị được chọn thay đổi */
  readonly selectionChange = output<T | null>();

  /** Giá trị nội bộ đang được chọn */
  readonly internalValue = signal<T | null>(null);

  /** Trạng thái vô hiệu hóa từ Reactive Form (ControlValueAccessor) */
  readonly isControlDisabled = signal<boolean>(false);

  /** Trạng thái vô hiệu hóa thực tế */
  readonly effectiveDisabled = computed(() => {
    return this.disabled() || this.isControlDisabled();
  });

  private onChange: (value: T | null) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: T | null): void {
    this.internalValue.set(value);
  }

  registerOnChange(fn: (value: T | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isControlDisabled.set(isDisabled);
  }

  onModelChange(value: T | null): void {
    this.internalValue.set(value);
    this.onChange(value);
    this.selectionChange.emit(value);
  }

  onBlur(): void {
    this.onTouched();
  }
}
