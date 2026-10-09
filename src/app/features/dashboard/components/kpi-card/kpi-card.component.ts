import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { Card } from 'primeng/card';
import { Tag } from 'primeng/tag';
import { Skeleton } from 'primeng/skeleton';
import { UIChart } from 'primeng/chart';

export type KpiThemeColor = 'red' | 'success' | 'gold' | 'info';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [Card, Tag, Skeleton, UIChart],
  template: `
    <p-card styleClass="saas-kpi-card">
      @if (loading()) {
        <div class="kpi-skeleton-box">
          <div class="skeleton-header">
            <p-skeleton width="60%" height="16px" />
            <p-skeleton shape="circle" size="40px" />
          </div>
          <p-skeleton width="80%" height="36px" styleClass="my-3" />
          <p-skeleton width="50%" height="16px" />
        </div>
      } @else {
        <div class="kpi-container">
          <!-- TOP ROW: LABEL + TINTED ICON SQUARE -->
          <div class="kpi-top-row">
            <span class="kpi-label">{{ label() }}</span>
            <div class="kpi-icon-square" [class]="'tint-' + color()">
              <i [class]="icon()"></i>
            </div>
          </div>

          <!-- BIG VALUE -->
          <div class="kpi-value-row">
            <span class="kpi-value">{{ value() }}</span>
          </div>

          <!-- BOTTOM ROW: TREND TAG + COMPARISON TEXT + SPARKLINE -->
          <div class="kpi-bottom-row">
            <div class="trend-group">
              @if (trend()) {
                <p-tag
                  [severity]="trendDirection() === 'up' ? 'success' : 'danger'"
                  [icon]="trendDirection() === 'up' ? 'pi pi-arrow-up-right' : 'pi pi-arrow-down-right'"
                  [value]="trend()"
                  styleClass="kpi-trend-tag"
                />
              }
              <span class="trend-text">{{ trendText() }}</span>
            </div>

            @if (sparklineData() && sparklineData()!.length > 0) {
              <div class="sparkline-wrapper">
                <p-chart
                  type="line"
                  [data]="chartData()"
                  [options]="chartOptions"
                  width="80px"
                  height="28px"
                />
              </div>
            }
          </div>
        </div>
      }
    </p-card>
  `,
  styles: [`
    :host {
      display: block;
    }

    :host ::ng-deep .saas-kpi-card {
      border: 1px solid var(--color-border, #D9D4CC) !important;
      border-radius: 16px !important;
      background: var(--color-surface, #FFFFFF) !important;
      box-shadow: 0 1px 2px rgba(22, 22, 26, 0.04) !important;
      transition: transform var(--ease, 200ms ease), box-shadow var(--ease, 200ms ease), border-color var(--ease, 200ms ease);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(22, 22, 26, 0.08) !important;
        border-color: rgba(215, 25, 32, 0.3) !important;
      }

      .p-card-body {
        padding: 20px !important;
      }
    }

    .kpi-container {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .kpi-top-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .kpi-label {
      font-size: 13.5px;
      font-weight: 500;
      color: var(--color-text-muted, #8A857D);
      letter-spacing: -0.01em;
    }

    .kpi-icon-square {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      flex-shrink: 0;

      &.tint-red {
        background-color: var(--dl-red-soft, rgba(215, 25, 32, 0.14));
        color: var(--primary, #D71920);
      }

      &.tint-success {
        background-color: var(--dl-success-soft, rgba(46, 158, 91, 0.14));
        color: var(--dl-success, #2E9E5B);
      }

      &.tint-gold {
        background-color: var(--dl-warning-soft, rgba(232, 137, 12, 0.14));
        color: var(--dl-warning, #E8890C);
      }

      &.tint-info {
        background-color: var(--dl-info-soft, rgba(62, 157, 160, 0.14));
        color: var(--dl-info, #3E9DA0);
      }
    }

    .kpi-value-row {
      display: flex;
      align-items: baseline;
    }

    .kpi-value {
      font-size: 30px;
      font-weight: 700;
      color: var(--color-text-primary, #16161A);
      font-variant-numeric: tabular-nums;
      letter-spacing: -0.02em;
      line-height: 1.1;
    }

    .kpi-bottom-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding-top: 4px;
    }

    .trend-group {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
    }

    :host ::ng-deep .kpi-trend-tag {
      font-size: 11px !important;
      font-weight: 600 !important;
      padding: 2px 6px !important;
      border-radius: 999px !important;
    }

    .trend-text {
      font-size: 12px;
      color: var(--color-text-muted, #8A857D);
    }

    .sparkline-wrapper {
      width: 80px;
      height: 28px;
      flex-shrink: 0;
    }

    .kpi-skeleton-box {
      display: flex;
      flex-direction: column;

      .skeleton-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KpiCardComponent {
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly icon = input.required<string>();
  readonly color = input<KpiThemeColor>('red');
  readonly trend = input<string>('');
  readonly trendDirection = input<'up' | 'down'>('up');
  readonly trendText = input<string>('so với hôm qua');
  readonly sparklineData = input<number[]>([]);
  readonly loading = input<boolean>(false);

  readonly chartData = computed(() => {
    const data = this.sparklineData();
    const c = this.color();
    let borderColor = '#D71920';
    if (c === 'success') borderColor = '#2E9E5B';
    if (c === 'gold') borderColor = '#E8890C';
    if (c === 'info') borderColor = '#3E9DA0';

    return {
      labels: data.map((_, i) => String(i)),
      datasets: [
        {
          data,
          borderColor,
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.35,
          fill: false,
        },
      ],
    };
  });

  readonly chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    scales: {
      x: { display: false },
      y: { display: false },
    },
  };
}
