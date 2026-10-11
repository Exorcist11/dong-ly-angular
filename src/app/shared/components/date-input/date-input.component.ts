import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  DoCheck,
  OnChanges,
  OnInit,
  SimpleChanges,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  ControlValueAccessor,
  FormsModule,
  NgControl,
  ReactiveFormsModule,
} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InputText } from 'primeng/inputtext';
import { TranslationService } from '../../../core/i18n/translation.service';

let nextDateInputUniqueId = 0;

/**
 * Shared Date Input Component dùng chung cho toàn hệ thống Đông Lý Admin.
 *
 * Tính năng chính:
 * - Hỗ trợ binding trực tiếp qua Signals/Property: [value]="date()" (valueChange)="date.set($event)"
 * - Tương thích 100% với Reactive Forms (formControlName / formControl) và template-driven forms ([(ngModel)]) qua ControlValueAccessor
 * - Tự động đồng bộ chuẩn định dạng ISO YYYY-MM-DD
 * - Quản lý độc lập: label, required mark, hint, validation error message đa ngôn ngữ và A11y (ARIA)
 * - Tùy chọn xóa nhanh ngày qua thuộc tính [clearable]="true"
 * - Không phụ thuộc vào bất kỳ style đặc thù nào của CRM, tuân thủ Design System PrimeNG Aura tùy biến
 */
@Component({
  selector: 'app-date-input',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, InputText],
  templateUrl: './date-input.component.html',
  styleUrl: './date-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.width]': 'effectiveHostWidth()',
    '[style.max-width]': "'100%'",
    '[style.min-width]': "'0'",
    '[style.display]': 'effectiveHostDisplay()',
  },
})
export class DateInputComponent
  implements ControlValueAccessor, OnInit, DoCheck, OnChanges
{
  private readonly i18n = inject(TranslationService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  /** Inject NgControl nếu được gắn cùng Reactive Forms hoặc ngModel */
  public readonly ngControl = inject(NgControl, { optional: true, self: true });

  private readonly autoId = `dl-date-${++nextDateInputUniqueId}`;

  // --- Props cơ bản ---
  readonly id = input<string | undefined>(undefined);
  readonly name = input<string | undefined>(undefined);
  readonly label = input<string | undefined>(undefined);
  readonly placeholder = input<string | undefined>(undefined);
  readonly required = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly readonly = input<boolean>(false);
  readonly hint = input<string | undefined>(undefined);
  readonly min = input<string | Date | null | undefined>(undefined);
  readonly max = input<string | Date | null | undefined>(undefined);
  readonly value = input<string | Date | null | undefined>(undefined);
  readonly clearable = input<boolean>(false);

  // --- Props Layout & Styling ---
  readonly width = input<string | undefined>(undefined);
  readonly marginBottom = input<boolean | undefined>(undefined);
  readonly styleClass = input<string>('');
  readonly inputStyleClass = input<string>('');

  // --- Props Validation ---
  readonly error = input<string | undefined>(undefined);
  readonly errorMessage = input<string | undefined>(undefined);
  readonly errorMessages = input<Record<string, string>>({});
  readonly control = input<AbstractControl | null>(null);

  // --- Outputs ---
  readonly valueChange = output<string>();
  readonly dateChange = output<string>();
  readonly input = output<Event>();
  readonly inputBlur = output<Event>();
  readonly inputFocus = output<Event>();

  // --- State nội bộ ---
  readonly internalValue = signal<string>('');
  readonly isControlDisabled = signal<boolean>(false);
  private readonly stateVersion = signal<number>(0);

  private subscribedControl: AbstractControl | null = null;
  private statusSub?: { unsubscribe: () => void };
  private onChange: (val: string) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  get effectiveControl(): AbstractControl | null {
    return this.control() ?? (this.ngControl?.control as AbstractControl | null);
  }

  readonly effectiveId = computed(() => this.id() || this.autoId);
  readonly errorId = computed(() => `${this.effectiveId()}-error`);
  readonly hintId = computed(() => `${this.effectiveId()}-hint`);

  readonly effectiveMin = computed(() => this.normalizeDate(this.min()) || null);
  readonly effectiveMax = computed(() => this.normalizeDate(this.max()) || null);

  readonly effectiveDisabled = computed(() => {
    return this.disabled() || this.isControlDisabled();
  });

  readonly isStandalone = computed(() => {
    return !this.label() && !this.hint() && !this.hasError();
  });

  readonly effectiveHostWidth = computed(() => {
    return this.width() || '100%';
  });

  readonly effectiveHostDisplay = computed(() => {
    return this.width() && this.width() !== '100%' ? 'inline-block' : 'block';
  });

  readonly clearAriaLabel = computed(() => {
    this.i18n.currentLang();
    return this.i18n.translate('common.actions.clearDate') || 'Xóa ngày';
  });

  readonly hasError = computed(() => {
    this.stateVersion();
    if (this.error() || this.errorMessage()) return true;
    const ctrl = this.effectiveControl;
    if (!ctrl) return false;
    return !!(ctrl.invalid && (ctrl.dirty || ctrl.touched));
  });

  readonly ariaDescribedBy = computed(() => {
    const parts: string[] = [];
    if (this.hasError()) {
      parts.push(this.errorId());
    } else if (this.hint()) {
      parts.push(this.hintId());
    }
    return parts.length > 0 ? parts.join(' ') : null;
  });

  readonly activeErrorMessage = computed(() => {
    this.stateVersion();
    const manualMsg = this.error() ?? this.errorMessage();
    if (manualMsg) return manualMsg;

    if (!this.hasError()) return '';

    const ctrl = this.effectiveControl;
    if (!ctrl || !ctrl.errors) return '';

    this.i18n.currentLang();

    const errors = ctrl.errors;
    const customMsgs = this.errorMessages();

    // 1. Kiểm tra custom messages truyền vào từ cha
    for (const key of Object.keys(customMsgs)) {
      if (errors[key]) {
        return customMsgs[key];
      }
    }

    // 2. Chuẩn hóa thông báo lỗi từ TranslationService
    const fieldName = this.label() || this.placeholder() || this.i18n.translate('validation.thisField') || 'Trường này';

    if (errors['required']) {
      return this.i18n.translate('validation.fieldRequired', { field: fieldName });
    }
    if (errors['min'] || errors['minDate']) {
      const minVal = this.effectiveMin() || errors['min']?.min;
      return `${fieldName} không được nhỏ hơn ${minVal}`;
    }
    if (errors['max'] || errors['maxDate']) {
      const maxVal = this.effectiveMax() || errors['max']?.max;
      return `${fieldName} không được lớn hơn ${maxVal}`;
    }

    // 3. Fallback nếu có lỗi dạng string
    const firstKey = Object.keys(errors)[0];
    const firstError = errors[firstKey];
    if (typeof firstError === 'string') {
      return firstError;
    }

    return this.i18n.translate('validation.fieldInvalid', { field: fieldName });
  });

  ngOnInit(): void {
    this.checkControlSubscription();
    // Đồng bộ giá trị khởi tạo từ [value] nếu có
    if (this.value() !== undefined) {
      this.internalValue.set(this.normalizeDate(this.value()));
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value'] && this.value() !== undefined) {
      const normalized = this.normalizeDate(this.value());
      if (this.internalValue() !== normalized) {
        this.internalValue.set(normalized);
      }
    }
  }

  ngDoCheck(): void {
    this.checkControlSubscription();
    this.updateControlState();
  }

  private checkControlSubscription(): void {
    const ctrl = this.effectiveControl;
    if (ctrl !== this.subscribedControl) {
      if (this.statusSub) {
        this.statusSub.unsubscribe();
        this.statusSub = undefined;
      }
      this.subscribedControl = ctrl;
      if (ctrl) {
        const sub = ctrl.statusChanges
          ?.pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => {
            this.updateControlState();
          });
        this.statusSub = sub;
      }
    }
  }

  // --- ControlValueAccessor Implementation ---
  writeValue(val: unknown): void {
    this.internalValue.set(this.normalizeDate(val));
  }

  registerOnChange(fn: (val: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isControlDisabled.set(isDisabled);
    this.cdr.markForCheck();
  }

  // --- Handlers ---
  onNativeInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const val = target.value;
    this.internalValue.set(val);
    this.onChange(val);
    this.valueChange.emit(val);
    this.dateChange.emit(val);
    this.input.emit(event);
    this.updateControlState();
  }

  onNativeBlur(event: Event): void {
    this.onTouched();
    this.updateControlState();
    this.inputBlur.emit(event);
  }

  onNativeFocus(event: Event): void {
    this.inputFocus.emit(event);
  }

  onClear(event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();
    if (this.effectiveDisabled() || this.readonly()) return;

    this.internalValue.set('');
    this.onChange('');
    this.valueChange.emit('');
    this.dateChange.emit('');
    this.updateControlState();
  }

  private updateControlState(): void {
    this.stateVersion.update((v) => v + 1);
    this.cdr.markForCheck();
  }

  /**
   * Chuyển đổi Date / string bất kỳ về định dạng chuẩn YYYY-MM-DD
   */
  private normalizeDate(val: unknown): string {
    if (!val) return '';
    if (val instanceof Date) {
      if (isNaN(val.getTime())) return '';
      const year = val.getFullYear();
      const month = String(val.getMonth() + 1).padStart(2, '0');
      const day = String(val.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    if (typeof val === 'string') {
      const trimmed = val.trim();
      if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
        return trimmed.substring(0, 10);
      }
      return trimmed;
    }
    return '';
  }
}
