import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [FormsModule, InputText],
  template: `
    <div class="dl-search-box" [class.is-disabled]="disabled()" [class]="styleClass()">
      <i class="pi pi-search search-icon" aria-hidden="true"></i>
      <input
        pInputText
        type="text"
        [ngModel]="internalValue()"
        (ngModelChange)="onInputChange($event)"
        (keydown.escape)="onClear()"
        [placeholder]="placeholder()"
        [disabled]="disabled()"
        [attr.aria-label]="ariaLabel()"
        class="search-input-field"
      />
      @if (hasValue() && !disabled()) {
        <button
          type="button"
          class="clear-button"
          (click)="onClear()"
          [attr.aria-label]="clearAriaLabel()"
        >
          <i class="pi pi-times" aria-hidden="true"></i>
        </button>
      }
    </div>
  `,
  styles: `
    .dl-search-box {
      position: relative;
      display: inline-flex;
      align-items: center;
      width: 100%;
    }

    .search-icon {
      position: absolute;
      left: 0.875rem;
      color: var(--color-text-muted, #8a857d);
      font-size: 0.875rem;
      pointer-events: none;
      z-index: 1;
    }

    .search-input-field {
      width: 100%;
      padding-left: 2.375rem !important;
      padding-right: 2.25rem !important;
      border-radius: var(--radius-input, 10px) !important;
      border: 1px solid var(--color-border, #d9d4cc) !important;
      background-color: var(--color-surface, #ffffff) !important;
      color: var(--color-text-primary, #16161a) !important;
      font-size: 0.875rem !important;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;

      &:focus {
        border-color: var(--color-focus, #f2b632) !important;
        box-shadow: 0 0 0 3px rgba(242, 182, 50, 0.25) !important;
      }
    }

    .clear-button {
      position: absolute;
      right: 0.625rem;
      top: 50%;
      transform: translateY(-50%);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 1.5rem;
      height: 1.5rem;
      border: none;
      border-radius: 50%;
      background: transparent;
      color: var(--color-text-muted, #8a857d);
      cursor: pointer;
      font-size: 0.75rem;
      transition: background-color 0.15s ease, color 0.15s ease;

      &:hover {
        background-color: var(--color-surface-hover, #f8f5f0);
        color: var(--color-text-primary, #16161a);
      }

      &:focus-visible {
        outline: 2px solid var(--color-focus, #f2b632);
        outline-offset: 1px;
      }
    }

    .is-disabled {
      opacity: 0.6;
      pointer-events: none;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchInputComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly searchSubject$ = new Subject<string>();

  /** Placeholder cho input */
  readonly placeholder = input<string>('Tìm kiếm...');

  /** Giá trị ban đầu */
  readonly value = input<string>('');

  /** Thời gian trễ debounce (mili giây), mặc định 300ms */
  readonly debounceMs = input<number>(300);

  /** Trạng thái vô hiệu hóa */
  readonly disabled = input<boolean>(false);

  /** CSS class tùy biến */
  readonly styleClass = input<string>('');

  /** Nhãn accessibility cho ô tìm kiếm */
  readonly ariaLabel = input<string>('Tìm kiếm');

  /** Nhãn accessibility cho nút xóa */
  readonly clearAriaLabel = input<string>('Xóa nội dung tìm kiếm');

  /** Phát ra giá trị tìm kiếm sau khi debounce */
  readonly searchChange = output<string>();

  /** Phát ra sự kiện khi nhấn nút xóa */
  readonly clear = output<void>();

  /** State giá trị input nội bộ */
  readonly internalValue = signal<string>('');

  readonly hasValue = computed(() => {
    return this.internalValue().trim().length > 0;
  });

  constructor() {
    // Đồng bộ input [value] nếu component cha thay đổi
    effect(() => {
      const externalVal = this.value();
      this.internalValue.set(externalVal);
    });

    // Thiết lập stream debounce
    this.searchSubject$
      .pipe(
        debounceTime(this.debounceMs()),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((val) => {
        this.searchChange.emit(val.trim());
      });
  }

  onInputChange(val: string): void {
    this.internalValue.set(val);
    this.searchSubject$.next(val);
  }

  onClear(): void {
    if (this.disabled()) return;
    this.internalValue.set('');
    this.searchSubject$.next('');
    this.clear.emit();
  }
}
