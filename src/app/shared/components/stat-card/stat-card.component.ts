import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  template: `
    <div class="stat-card" [style.--accent-color]="color || '#2563eb'">
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
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      position: relative;
      overflow: hidden;
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
      color: #64748b;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .stat-value {
      font-size: 26px;
      font-weight: 700;
      color: #0f172a;
      margin: 6px 0;
    }
    .stat-footer {
      font-size: 12px;
      display: flex;
      align-items: center;
      color: #64748b;
    }
    .stat-footer.positive {
      color: #16a34a;
      font-weight: 600;
    }
    .stat-footer.negative {
      color: #dc2626;
      font-weight: 600;
    }
    .stat-icon-wrapper {
      width: 48px;
      height: 48px;
      border-radius: 8px;
      background: #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
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
