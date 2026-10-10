import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { Button } from 'primeng/button';
import { Tooltip } from 'primeng/tooltip';
import { TranslationService } from '../../../core/i18n/translation.service';
import {
  ButtonIconPosition,
  ButtonSize,
  ButtonTooltipPosition,
  ButtonType,
  ButtonVariant,
} from './button.types';

export * from './button.types';

/**
 * Shared Button Component cho Hệ thống Đặt vé & Quản lý vận tải Đông Lý.
 *
 * Đóng gói và chuẩn hóa:
 * 1. Các biến thể thương hiệu và ngữ nghĩa (primary, secondary, danger, success, warn, info, text, outlined).
 * 2. Kích thước (small, medium, large) và chế độ fullWidth.
 * 3. Trạng thái Loading và Disabled tự động ngăn chặn click và double-submit.
 * 4. Tự động dịch nhãn (label), tooltip và accessible name (aria-label) qua TranslationService.
 * 5. Tuân thủ chuẩn A11y (WCAG 2.2 AA, focus-visible, keyboard navigation).
 */
@Component({
  selector: 'app-button',
  standalone: true,
  imports: [Button, Tooltip],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.dl-button-host]': 'true',
    '[class.dl-button-full-width]': 'fullWidth()',
    '[attr.aria-busy]': "loading() ? 'true' : null",
  },
})
export class ButtonComponent {
  private readonly i18n = inject(TranslationService);

  /** Nhãn nút hiển thị hoặc i18n translation key (VD: 'common.actions.save' hoặc 'Lưu') */
  readonly label = input<string>();

  /** Class icon PrimeIcons (VD: 'pi pi-plus', 'pi pi-trash') */
  readonly icon = input<string>();

  /** Vị trí icon so với text: 'left' hoặc 'right' */
  readonly iconPos = input<ButtonIconPosition>('left');

  /** Biến thể màu sắc & ngữ nghĩa */
  readonly variant = input<ButtonVariant>('primary');

  /** Kích thước nút */
  readonly size = input<ButtonSize>('medium');

  /** Native HTML button type: 'button' | 'submit' | 'reset' */
  readonly type = input<ButtonType>('button');

  /** Trạng thái vô hiệu hóa nút */
  readonly disabled = input<boolean>(false);

  /** Trạng thái đang tải (hiển thị spinner, tự động vô hiệu hóa click) */
  readonly loading = input<boolean>(false);

  /** Nút bo tròn hoàn toàn (cho icon button hoặc avatar button) */
  readonly rounded = input<boolean>(false);

  /** Nút chiếm 100% chiều rộng của container */
  readonly fullWidth = input<boolean>(false);

  /** Ghi đè kiểu viền ngoài (outlined) */
  readonly outlined = input<boolean | undefined>(undefined);

  /** Ghi đè kiểu chữ không viền (text) */
  readonly text = input<boolean | undefined>(undefined);

  /** Accessible label cho Screen Readers (bắt buộc cho icon-only buttons) */
  readonly ariaLabel = input<string>();

  /** Chú thích Tooltip khi di chuột */
  readonly tooltip = input<string>();

  /** Vị trí hiển thị Tooltip */
  readonly tooltipPosition = input<ButtonTooltipPosition>('top');

  /** CSS class bổ sung */
  readonly styleClass = input<string>('');

  /** Sự kiện click phát ra khi nút không bị disabled hay loading */
  readonly clicked = output<MouseEvent>();

  /** Nhãn đã được giải quyết (tự động dịch nếu là translation key có dấu chấm) */
  readonly resolvedLabel = computed<string | undefined>(() => {
    const raw = this.label();
    if (!raw) return undefined;
    if (raw.includes('.')) {
      this.i18n.currentLang(); // reactive dependency tracking
      return this.i18n.translate(raw);
    }
    return raw;
  });

  /** Tooltip đã được giải quyết i18n */
  readonly resolvedTooltip = computed<string | undefined>(() => {
    const tip = this.tooltip();
    if (!tip) return undefined;
    if (tip.includes('.')) {
      this.i18n.currentLang();
      return this.i18n.translate(tip);
    }
    return tip;
  });

  /** Accessible name cho Screen Readers */
  readonly resolvedAriaLabel = computed<string | undefined>(() => {
    const aria = this.ariaLabel();
    if (aria) {
      if (aria.includes('.')) {
        this.i18n.currentLang();
        return this.i18n.translate(aria);
      }
      return aria;
    }
    return this.resolvedLabel() ?? this.resolvedTooltip();
  });

  /** Severity tương ứng của PrimeNG Button */
  readonly primeSeverity = computed<
    'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'danger' | undefined
  >(() => {
    const v = this.variant();
    switch (v) {
      case 'primary':
      case 'outlined':
        return 'primary';
      case 'secondary':
        return 'secondary';
      case 'danger':
        return 'danger';
      case 'success':
        return 'success';
      case 'warn':
        return 'warn';
      case 'info':
        return 'info';
      case 'text':
        return undefined;
      default:
        return 'primary';
    }
  });

  /** Tính toán trạng thái Outlined */
  readonly isOutlined = computed<boolean>(() => {
    const override = this.outlined();
    if (override !== undefined) return override;
    return this.variant() === 'secondary' || this.variant() === 'outlined';
  });

  /** Tính toán trạng thái Text (phẳng, không nền/viền) */
  readonly isText = computed<boolean>(() => {
    const override = this.text();
    if (override !== undefined) return override;
    return this.variant() === 'text';
  });

  /** Kích thước chuyển đổi tương ứng cho PrimeNG */
  readonly primeSize = computed<'small' | 'large' | undefined>(() => {
    const s = this.size();
    if (s === 'small') return 'small';
    if (s === 'large') return 'large';
    return undefined; // medium là mặc định
  });

  /** Trạng thái disable thực tế: vô hiệu hóa khi disabled = true HOẶC loading = true */
  readonly isEffectivelyDisabled = computed<boolean>(() => {
    return this.disabled() || this.loading();
  });

  /** Ghép class CSS hoàn chỉnh cho PrimeNG button */
  readonly computedStyleClass = computed<string>(() => {
    const classes = ['dl-button-root', `variant-${this.variant()}`];
    if (this.fullWidth()) classes.push('w-full');
    const extra = this.styleClass();
    if (extra) classes.push(extra);
    return classes.join(' ');
  });

  /** Xử lý click an toàn: ngăn chặn triệt để khi đang loading hoặc disabled */
  handleClick(event: MouseEvent): void {
    if (this.isEffectivelyDisabled()) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    this.clicked.emit(event);
  }
}
