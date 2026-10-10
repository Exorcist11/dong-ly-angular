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
  templateUrl: './kpi-card.component.html',
  styleUrl: './kpi-card.component.scss',
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
