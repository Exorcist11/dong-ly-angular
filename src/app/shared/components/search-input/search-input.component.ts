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

import { TranslationService } from '../../../core/i18n/translation.service';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [FormsModule, InputText],
  templateUrl: './search-input.component.html',
  styleUrl: './search-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchInputComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly i18n = inject(TranslationService);
  private readonly searchSubject$ = new Subject<string>();

  /** Nhãn hiển thị phía trên ô tìm kiếm */
  readonly label = input<string | undefined>(undefined);

  /** Placeholder cho input */
  readonly placeholder = input<string | undefined>(undefined);

  /** Giá trị ban đầu */
  readonly value = input<string>('');

  /** Thời gian trễ debounce (mili giây), mặc định 300ms */
  readonly debounceMs = input<number>(300);

  /** Trạng thái vô hiệu hóa */
  readonly disabled = input<boolean>(false);

  /** CSS class tùy biến */
  readonly styleClass = input<string>('');

  /** Nhãn accessibility cho ô tìm kiếm */
  readonly ariaLabel = input<string | undefined>(undefined);

  /** Nhãn accessibility cho nút xóa */
  readonly clearAriaLabel = input<string | undefined>(undefined);

  readonly resolvedLabel = computed(() => {
    const raw = this.label();
    if (!raw) return undefined;
    if (raw.includes('.')) {
      this.i18n.currentLang();
      return this.i18n.translate(raw);
    }
    return raw;
  });

  readonly effectivePlaceholder = computed(() => {
    this.i18n.currentLang();
    return this.placeholder() ?? (this.i18n.translate('common.actions.search') + '...');
  });

  readonly effectiveAriaLabel = computed(() => {
    this.i18n.currentLang();
    return this.ariaLabel() ?? this.i18n.translate('common.actions.search');
  });

  readonly effectiveClearAriaLabel = computed(() => {
    this.i18n.currentLang();
    return this.clearAriaLabel() ?? this.i18n.translate('common.actions.clearSearch');
  });

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
