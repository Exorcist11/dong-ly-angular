import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  template: `
    <div class="stat-card" [style.--accent-color]="color || 'var(--color-primary, #D71920)'">
      <div class="stat-content">
        <span class="stat-label">{{ label }}</span>
        <div class="stat-value">{{ value }}</div>
        @if (changeText) {
          <div class="stat-footer" [class.positive]="isPositive" [class.negative]="isNegative">
            <span class="stat-change">{{ changeText }}</span>
          </div>
        }
      </div>
      @if (icon) {
        <div class="stat-icon-wrapper">
          <span class="stat-icon">{{ icon }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .stat-card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 12px;
      padding: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: var(--shadow-sm);
      position: relative;
      overflow: hidden;
      transition: background-color var(--ease), border-color var(--ease);
    }
    .stat-card::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background: var(--accent-color);
    }
    .stat-content {
      display: flex;
      flex-direction: column;
    }
    .stat-label {
      font-size: 13px;
      color: var(--color-text-muted);
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .stat-value {
      font-size: 26px;
      font-weight: 700;
      color: var(--color-text-primary);
      margin: 6px 0;
    }
    .stat-footer {
      font-size: 12px;
      display: flex;
      align-items: center;
      color: var(--color-text-muted);
    }
    .stat-footer.positive {
      color: var(--color-success, #2E9E5B);
      font-weight: 600;
    }
    .stat-footer.negative {
      color: var(--color-danger, #D71920);
      font-weight: 600;
    }
    .stat-icon-wrapper {
      width: 48px;
      height: 48px;
      border-radius: 10px;
      background: var(--color-surface-sunken);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      transition: background-color var(--ease);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatCardComponent {
  @Input({ required: true }) label!: string;
  @Input({ required: true }) value!: string | number;
  @Input() icon?: string;
  @Input() color?: string;
  @Input() changeText?: string;
  @Input() isPositive?: boolean;
  @Input() isNegative?: boolean;
}
