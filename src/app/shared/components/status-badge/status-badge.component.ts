import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Tag } from 'primeng/tag';

export type StatusTagSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast';

interface StatusConfig {
  label: string;
  severity: StatusTagSeverity;
  icon?: string;
}

const DEFAULT_STATUS_MAP: Record<string, StatusConfig> = {
  ACTIVE: { label: 'Hoạt động', severity: 'success' },
  INACTIVE: { label: 'Tạm khóa', severity: 'danger' },
  LOCKED: { label: 'Đã khóa', severity: 'danger' },
  PENDING: { label: 'Chờ xử lý', severity: 'warn' },
  PROCESSING: { label: 'Đang xử lý', severity: 'info' },
  COMPLETED: { label: 'Hoàn thành', severity: 'success' },
  CANCELLED: { label: 'Đã hủy', severity: 'secondary' },
  SYSTEM: { label: 'Hệ thống', severity: 'contrast' },
  CUSTOM: { label: 'Tùy chỉnh', severity: 'secondary' },
  DRAFT: { label: 'Bản nháp', severity: 'secondary' },
  EXPIRED: { label: 'Hết hạn', severity: 'warn' },
};

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [Tag],
  templateUrl: './status-badge.component.html',
  styleUrl: './status-badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusBadgeComponent {
  /** Giá trị trạng thái thô (VD: 'ACTIVE', 'INACTIVE', 'LOCKED'...) */
  readonly status = input<string | null | undefined>();

  /** Nhãn tùy biến (ghi đè nhãn tự động nếu có) */
  readonly label = input<string>();

  /** Severity tùy biến (ghi đè severity tự động nếu có) */
  readonly severity = input<StatusTagSeverity>();

  /** Icon tùy biến (VD: 'pi pi-check') */
  readonly icon = input<string>();

  /** CSS class bổ sung cho p-tag */
  readonly styleClass = input<string>('');

  private readonly normalizedStatus = computed(() => {
    const val = this.status();
    return val ? val.trim().toUpperCase() : '';
  });

  private readonly config = computed<StatusConfig>(() => {
    const norm = this.normalizedStatus();
    return DEFAULT_STATUS_MAP[norm] ?? {
      label: this.status() || 'Chưa xác định',
      severity: 'secondary',
    };
  });

  readonly displayLabel = computed(() => {
    return this.label() ?? this.config().label;
  });

  readonly displaySeverity = computed<StatusTagSeverity>(() => {
    return this.severity() ?? this.config().severity;
  });

  readonly displayIcon = computed(() => {
    return this.icon() ?? this.config().icon;
  });

  readonly badgeStyleClass = computed(() => {
    const base = 'dl-status-badge';
    const extra = this.styleClass();
    return extra ? `${base} ${extra}` : base;
  });
}
