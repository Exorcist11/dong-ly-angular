import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  DoCheck,
  OnInit,
  Provider,
  computed,
  forwardRef,
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
  NG_VALUE_ACCESSOR,
  NgControl,
  ReactiveFormsModule,
} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Select } from 'primeng/select';
import { SelectOption } from '../../models/select-option.model';
import { TranslationService } from '../../../core/i18n/translation.service';

let nextSelectUniqueId = 0;

export const SELECT_VALUE_ACCESSOR: Provider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => SelectComponent),
  multi: true,
};

/**
 * Component Select dùng chung (Dropdown Select) Đông Lý Admin.
 * Tự đảm nhiệm toàn bộ giao diện: label, required mark, hint, validation error và accessibility.
 * Tương thích trực tiếp với Reactive Forms qua ControlValueAccessor mà không cần bọc app-form-field.
 */
@Component({
  selector: 'app-select',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, Select],
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.width]': 'effectiveHostWidth()',
    '[style.max-width]': "'100%'",
    '[style.min-width]': "'0'",
    '[style.display]': 'effectiveHostDisplay()',
  },
})
export class SelectComponent<T = unknown>
  implements ControlValueAccessor, OnInit, DoCheck
{
  private readonly i18n = inject(TranslationService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  /** Inject NgControl nếu được sử dụng cùng Reactive Forms (formControlName / formControl / ngModel) */
  public readonly ngControl = inject(NgControl, { optional: true, self: true });

  private readonly autoId = `dl-select-${++nextSelectUniqueId}`;

  // --- Props dữ liệu ---
  readonly options = input.required<SelectOption<T>[]>();

  // --- Props cơ bản ---
  readonly id = input<string | undefined>(undefined);
  readonly name = input<string | undefined>(undefined);
  readonly label = input<string | undefined>(undefined);
  readonly labelPosition = input<'top' | 'left'>('top');
  readonly required = input<boolean>(false);
  readonly placeholder = input<string | undefined>(undefined);
  readonly hint = input<string | undefined>(undefined);
  readonly disabled = input<boolean>(false);
  readonly clearable = input<boolean>(false);
  readonly filter = input<boolean>(false);
  readonly filterPlaceholder = input<string | undefined>(undefined);
  readonly width = input<string | undefined>(undefined);
  readonly styleClass = input<string>('');
  readonly selectStyleClass = input<string>('');
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly marginBottom = input<boolean | undefined>(undefined);

  // --- Props Validation ---
  readonly control = input<AbstractControl | null>(null);
  readonly errorMessage = input<string | undefined>(undefined);
  readonly errorMessages = input<Record<string, string>>({});

  // --- Events ---
  readonly selectionChange = output<T | null>();
  readonly valueChange = output<T | null>();
  readonly blur = output<void>();
  readonly focus = output<Event | undefined>();

  // --- State nội bộ ---
  readonly internalValue = signal<T | null>(null);
  readonly isControlDisabled = signal<boolean>(false);
  private readonly stateVersion = signal<number>(0);

  private subscribedControl: AbstractControl | null = null;
  private statusSub?: { unsubscribe: () => void };
  private onChange: (value: T | null) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  get effectiveControl(): AbstractControl | null {
    return (
      this.control() ?? (this.ngControl?.control as AbstractControl | null)
    );
  }

  readonly effectiveId = computed(() => this.id() || this.autoId);
  readonly errorId = computed(() => `${this.effectiveId()}-error`);
  readonly hintId = computed(() => `${this.effectiveId()}-hint`);

  readonly effectiveDisabled = computed(() => {
    return this.disabled() || this.isControlDisabled();
  });

  readonly hasError = computed(() => {
    this.stateVersion();
    if (this.errorMessage()) return true;
    const ctrl = this.effectiveControl;
    if (!ctrl) return false;
    return !!(ctrl.invalid && (ctrl.dirty || ctrl.touched));
  });

  readonly isStandalone = computed(() => {
    return !this.label() && !this.hint() && !this.hasError();
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

  readonly effectivePlaceholder = computed(() => {
    this.i18n.currentLang();
    return this.placeholder() ?? this.i18n.translate('common.actions.select');
  });

  readonly effectiveFilterPlaceholder = computed(() => {
    this.i18n.currentLang();
    return (
      this.filterPlaceholder() ??
      this.i18n.translate('common.actions.search') + '...'
    );
  });

  readonly effectiveAriaLabel = computed(() => {
    this.i18n.currentLang();
    return (
      this.ariaLabel() ??
      (this.label() || this.i18n.translate('common.actions.select'))
    );
  });

  readonly effectiveHostWidth = computed(() => {
    if (this.width()) return this.width()!;
    return '100%';
  });

  readonly effectiveHostDisplay = computed(() => {
    if (this.width() && this.width() !== '100%') {
      return 'inline-block';
    }
    return 'block';
  });

  readonly computedSelectStyleClass = computed(() => {
    const parts: string[] = ['dl-select'];
    if (this.hasError()) {
      parts.push('ng-invalid');
    }
    const custom = this.selectStyleClass();
    if (custom) {
      parts.push(custom);
    }
    return parts.join(' ').trim();
  });

  readonly activeErrorMessage = computed(() => {
    this.stateVersion();
    const manualMsg = this.errorMessage();
    if (manualMsg) return manualMsg;

    if (!this.hasError()) return '';

    const ctrl = this.effectiveControl;
    if (!ctrl || !ctrl.errors) return '';

    this.i18n.currentLang();

    const errors = ctrl.errors;
    const customMap = this.errorMessages();
    const fieldName =
      this.label() || this.i18n.translate('validation.thisField');

    // 1. Kiểm tra bảng lỗi tùy biến trước
    for (const key of Object.keys(errors)) {
      if (customMap[key]) {
        return customMap[key];
      }
    }

    // 2. Chuẩn hóa lỗi theo ngôn ngữ hiện tại
    if (errors['required']) {
      return this.i18n.translate('validation.fieldRequired', {
        field: fieldName,
      });
    }

    // 3. Fallback: Nếu có lỗi khác dạng string
    const firstKey = Object.keys(errors)[0];
    const firstError = errors[firstKey];
    if (typeof firstError === 'string') {
      return firstError;
    }

    return this.i18n.translate('validation.fieldInvalid', { field: fieldName });
  });

  ngOnInit(): void {
    this.checkControlSubscription();
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
    this.cdr.markForCheck();
  }

  // --- Handlers ---
  onModelChange(value: T | null): void {
    this.internalValue.set(value);
    this.onChange(value);
    this.selectionChange.emit(value);
    this.valueChange.emit(value);
    this.updateControlState();
  }

  onBlur(): void {
    this.onTouched();
    this.updateControlState();
    this.blur.emit();
  }

  onFocus(event?: Event): void {
    this.focus.emit(event);
  }

  private updateControlState(): void {
    this.stateVersion.update((v) => v + 1);
    this.cdr.markForCheck();
  }
}
