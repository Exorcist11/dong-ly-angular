import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  DoCheck,
  OnInit,
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
import { Password } from 'primeng/password';
import { TranslationService } from '../../../core/i18n/translation.service';
import { InputType } from './input.types';

let nextUniqueId = 0;

/**
 * Shared Input Component độc lập của Đông Lý Admin.
 * Tự đảm nhiệm toàn bộ giao diện: label, required mark, input/password, accessibility và validation message.
 * Tương thích trực tiếp với Reactive Forms qua ControlValueAccessor.
 */
@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, InputText, Password],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputComponent implements ControlValueAccessor, OnInit, DoCheck {
  private readonly i18n = inject(TranslationService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  /** Inject NgControl nếu được sử dụng cùng Reactive Forms (formControlName / formControl) */
  public readonly ngControl = inject(NgControl, { optional: true, self: true });

  private readonly autoId = `dl-input-${++nextUniqueId}`;

  // --- Props cơ bản ---
  readonly id = input<string>();
  readonly name = input<string>();
  readonly type = input<InputType>('text');
  readonly label = input<string>();
  readonly required = input<boolean>(false);
  readonly placeholder = input<string>();
  readonly disabled = input<boolean>(false);
  readonly readonly = input<boolean>(false);
  readonly autocomplete = input<string>();
  readonly maxlength = input<number>();
  readonly minlength = input<number>();
  readonly min = input<number>();
  readonly max = input<number>();
  readonly step = input<number>();
  readonly hint = input<string>();

  // --- Props Validation ---
  readonly control = input<AbstractControl | null>(null);
  readonly errorMessage = input<string>();
  readonly errorMessages = input<Record<string, string>>({});

  // --- Props Password PrimeNG ---
  readonly toggleMask = input<boolean>(true);
  readonly feedback = input<boolean>(false);
  readonly promptLabel = input<string>();
  readonly weakLabel = input<string>();
  readonly mediumLabel = input<string>();
  readonly strongLabel = input<string>();

  // --- Props Styling ---
  readonly styleClass = input<string>('');
  readonly inputStyleClass = input<string>('');

  // --- Events ---
  readonly valueChange = output<any>();
  readonly input = output<Event>();
  readonly inputBlur = output<Event>();
  readonly inputFocus = output<Event>();

  // --- State nội bộ ---
  readonly internalValue = signal<any>('');
  readonly isControlDisabled = signal<boolean>(false);
  private readonly stateVersion = signal<number>(0);

  private subscribedControl: AbstractControl | null = null;
  private statusSub?: { unsubscribe: () => void };
  private onChange: (val: any) => void = () => {};
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

  readonly ariaDescribedBy = computed(() => {
    const parts: string[] = [];
    if (this.hasError()) {
      parts.push(this.errorId());
    } else if (this.hint()) {
      parts.push(this.hintId());
    }
    return parts.length > 0 ? parts.join(' ') : null;
  });

  readonly passwordInputClass = computed(() => {
    const custom = this.inputStyleClass();
    const invalidClass = this.hasError() ? 'ng-invalid' : '';
    return `w-full dl-input ${invalidClass} ${custom}`.trim();
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
    const fieldName = this.label() || this.i18n.translate('validation.thisField');

    // 1. Kiểm tra bảng lỗi tùy biến trước
    for (const key of Object.keys(errors)) {
      if (customMap[key]) {
        return customMap[key];
      }
    }

    // 2. Chuẩn hóa lỗi theo ngôn ngữ hiện tại
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
        const sub = ctrl.statusChanges?.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
          this.updateControlState();
        });
        this.statusSub = sub;
      }
    }
  }

  // --- ControlValueAccessor Implementation ---
  writeValue(value: any): void {
    this.internalValue.set(value ?? '');
  }

  registerOnChange(fn: (val: any) => void): void {
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
    const val =
      this.type() === 'number' && target.value !== ''
        ? target.valueAsNumber
        : target.value;
    this.internalValue.set(val);
    this.onChange(val);
    this.valueChange.emit(val);
    this.input.emit(event);
    this.updateControlState();
  }

  onPasswordModelChange(val: string): void {
    this.internalValue.set(val);
    this.onChange(val);
    this.valueChange.emit(val);
    this.updateControlState();
  }

  onInputBlur(event?: Event): void {
    this.onTouched();
    this.updateControlState();
    if (event) {
      this.inputBlur.emit(event);
    }
  }

  onInputFocus(event?: Event): void {
    if (event) {
      this.inputFocus.emit(event);
    }
  }

  private updateControlState(): void {
    this.stateVersion.update((v) => v + 1);
    this.cdr.markForCheck();
  }
}
