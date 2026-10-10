import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Tag } from 'primeng/tag';
import { TranslationService } from '../../../core/i18n/translation.service';

export type StatusTagSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast';

interface StatusConfig {
  key: string;
  severity: StatusTagSeverity;
  icon?: string;
}

const DEFAULT_STATUS_MAP: Record<string, StatusConfig> = {
  ACTIVE: { key: 'common.status.active', severity: 'success' },
  INACTIVE: { key: 'common.status.inactive', severity: 'danger' },
  LOCKED: { key: 'common.status.locked', severity: 'danger' },
  PENDING: { key: 'common.status.pending', severity: 'warn' },
  PROCESSING: { key: 'common.status.processing', severity: 'info' },
  COMPLETED: { key: 'common.status.completed', severity: 'success' },
  CANCELLED: { key: 'common.status.cancelled', severity: 'secondary' },
  SYSTEM: { key: 'common.status.system', severity: 'contrast' },
  CUSTOM: { key: 'common.status.custom', severity: 'secondary' },
  DRAFT: { key: 'common.status.draft', severity: 'secondary' },
  EXPIRED: { key: 'common.status.expired', severity: 'warn' },
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
  private readonly i18n = inject(TranslationService);

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

  private readonly config = computed<StatusConfig | null>(() => {
    const norm = this.normalizedStatus();
    return DEFAULT_STATUS_MAP[norm] ?? null;
  });

  readonly displayLabel = computed(() => {
    this.i18n.currentLang();
    if (this.label() !== undefined) {
      return this.label();
    }
    const conf = this.config();
    if (conf) {
      return this.i18n.translate(conf.key);
    }
    return this.status() || this.i18n.translate('common.status.unknown');
  });

  readonly displaySeverity = computed<StatusTagSeverity>(() => {
    if (this.severity() !== undefined) {
      return this.severity()!;
    }
    return this.config()?.severity ?? 'secondary';
  });

  readonly displayIcon = computed(() => {
    return this.icon() ?? this.config()?.icon;
  });

  readonly badgeStyleClass = computed(() => {
    const base = 'dl-status-badge';
    const extra = this.styleClass();
    return extra ? `${base} ${extra}` : base;
  });
}
