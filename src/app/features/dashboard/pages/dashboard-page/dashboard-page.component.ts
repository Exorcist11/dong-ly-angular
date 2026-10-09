import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LayoutService } from '../../../../layout/layout.service';
import { KpiCardComponent } from '../../components/kpi-card/kpi-card.component';

import { Card } from 'primeng/card';
import { Button } from 'primeng/button';
import { SelectButton } from 'primeng/selectbutton';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { ProgressBar } from 'primeng/progressbar';
import { Timeline } from 'primeng/timeline';
import { UIChart } from 'primeng/chart';
import { Message } from 'primeng/message';

export interface TripSchedule {
  id: string;
  departureTime: string;
  route: string;
  plateNumber: string;
  vehicleType: string;
  occupied: number;
  total: number;
  occupiedPercent: number;
  status: 'departing_soon' | 'on_route' | 'delayed';
  statusLabel: string;
  statusSeverity: 'info' | 'success' | 'warn';
}

export interface RecentActivity {
  id: string;
  title: string;
  time: string;
  icon: string;
  color: 'red' | 'success' | 'gold' | 'info';
}

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    KpiCardComponent,
    Card,
    Button,
    SelectButton,
    TableModule,
    Tag,
    ProgressBar,
    Timeline,
    UIChart,
    Message,
  ],
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent {
  private readonly layoutService = inject(LayoutService);

  readonly isLoading = signal<boolean>(false);
  readonly isRefreshing = signal<boolean>(false);
  readonly hasError = signal<boolean>(false);
  readonly lastUpdatedTime = signal<string>(this.getCurrentTimeString());

  readonly selectedTimeRange = signal<string>('today');
  readonly timeRangeOptions = [
    { label: 'Hôm nay', value: 'today' },
    { label: '7 ngày', value: '7d' },
    { label: '30 ngày', value: '30d' },
  ];

  readonly revenueFilter = signal<string>('week');
  readonly chartFilterOptions = [
    { label: 'Ngày', value: 'day' },
    { label: 'Tuần', value: 'week' },
    { label: 'Tháng', value: 'month' },
  ];

  // LINE CHART CONFIG
  lineChartData: Record<string, unknown> | null = null;
  lineChartOptions: Record<string, unknown> | null = null;

  // DOUGHNUT CHART CONFIG
  doughnutChartData: Record<string, unknown> | null = null;
  doughnutChartOptions: Record<string, unknown> | null = null;
  doughnutPlugins: Array<{
    id: string;
    beforeDraw: (chart: { width: number; height: number; ctx: CanvasRenderingContext2D }) => void;
  }> = [];

  // MOCK TRIPS DATA
  readonly recentTrips = signal<TripSchedule[]>([
    {
      id: 'TRIP-01',
      departureTime: '14:30',
      route: 'Thanh Hóa → Hà Nội',
      plateNumber: '36B-028.68',
      vehicleType: 'Limousine 9 chỗ',
      occupied: 9,
      total: 9,
      occupiedPercent: 100,
      status: 'departing_soon',
      statusLabel: 'Sắp chạy',
      statusSeverity: 'info',
    },
    {
      id: 'TRIP-02',
      departureTime: '15:00',
      route: 'Hà Nội → Thanh Hóa',
      plateNumber: '36B-031.12',
      vehicleType: 'Limousine 11 chỗ',
      occupied: 10,
      total: 11,
      occupiedPercent: 91,
      status: 'departing_soon',
      statusLabel: 'Sắp chạy',
      statusSeverity: 'info',
    },
    {
      id: 'TRIP-03',
      departureTime: '13:00',
      route: 'Thanh Hóa → Hà Nội',
      plateNumber: '36B-019.45',
      vehicleType: 'Limousine 9 chỗ',
      occupied: 8,
      total: 9,
      occupiedPercent: 89,
      status: 'on_route',
      statusLabel: 'Đang chạy',
      statusSeverity: 'success',
    },
    {
      id: 'TRIP-04',
      departureTime: '13:30',
      route: 'Hà Nội → Thanh Hóa',
      plateNumber: '36B-022.90',
      vehicleType: 'Giường nằm 34 phòng',
      occupied: 32,
      total: 34,
      occupiedPercent: 94,
      status: 'on_route',
      statusLabel: 'Đang chạy',
      statusSeverity: 'success',
    },
    {
      id: 'TRIP-05',
      departureTime: '14:00',
      route: 'Thanh Hóa → Hà Nội',
      plateNumber: '36B-015.77',
      vehicleType: 'Limousine 9 chỗ',
      occupied: 5,
      total: 9,
      occupiedPercent: 55,
      status: 'delayed',
      statusLabel: 'Hoãn 15p',
      statusSeverity: 'warn',
    },
  ]);

  // MOCK ACTIVITIES TIMELINE
  readonly recentActivities = signal<RecentActivity[]>([
    {
      id: 'ACT-01',
      title: 'Vé #DL-8829 vừa thanh toán thành công qua VietQR (250.000 ₫)',
      time: '2 phút trước',
      icon: 'pi pi-check-circle',
      color: 'success',
    },
    {
      id: 'ACT-02',
      title: 'Chuyến xe 36B-028.68 đã xuất bến đúng giờ tại Bến xe Phía Bắc',
      time: '15 phút trước',
      icon: 'pi pi-car',
      color: 'info',
    },
    {
      id: 'ACT-03',
      title: 'Tài xế Nguyễn Văn Hùng xác nhận kiểm tra an toàn xe trước giờ chạy',
      time: '42 phút trước',
      icon: 'pi pi-shield',
      color: 'gold',
    },
    {
      id: 'ACT-04',
      title: 'Hành khách Trần Thị Mai hủy vé #DL-8812 (hoàn tiền theo chính sách)',
      time: '1 giờ trước',
      icon: 'pi pi-arrow-left',
      color: 'red',
    },
  ]);

  constructor() {
    this.initCenterTextPlugin();

    // Effect rebuilds charts when theme changes
    effect(() => {
      this.layoutService.resolvedTheme();
      this.initCharts();
    });
  }

  refreshData(): void {
    this.isRefreshing.set(true);
    setTimeout(() => {
      this.isRefreshing.set(false);
      this.lastUpdatedTime.set(this.getCurrentTimeString());
    }, 600);
  }

  onAddTrip(): void {
    // Thao tác thêm chuyến
  }

  onTimeRangeChange(range: string): void {
    this.selectedTimeRange.set(range);
    this.refreshData();
  }

  onRevenueFilterChange(filter: string): void {
    this.revenueFilter.set(filter);
    this.initRevenueChart();
  }

  private initCharts(): void {
    this.initRevenueChart();
    this.initOccupancyChart();
  }

  private initRevenueChart(): void {
    const isDark = this.layoutService.resolvedTheme() === 'dark';
    const textColor = isDark ? '#A09B93' : '#6B665F';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)';

    this.lineChartData = {
      labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
      datasets: [
        {
          label: 'Doanh thu (triệu ₫)',
          data: [22.5, 26.0, 24.2, 28.5, 31.0, 38.5, 32.5],
          fill: true,
          borderColor: '#D71920',
          backgroundColor: isDark
            ? 'rgba(215, 25, 32, 0.12)'
            : 'rgba(215, 25, 32, 0.06)',
          tension: 0.35,
          borderWidth: 2.5,
          pointBackgroundColor: '#D71920',
          pointRadius: 3,
          pointHoverRadius: 6,
        },
        {
          label: 'Vé đã đặt',
          data: [88, 102, 95, 110, 122, 150, 128],
          fill: false,
          borderColor: '#F2B632',
          borderDash: [5, 5],
          tension: 0.35,
          borderWidth: 2,
          pointBackgroundColor: '#F2B632',
          pointRadius: 3,
          pointHoverRadius: 6,
          yAxisID: 'y1',
        },
      ],
    };

    this.lineChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          position: 'top',
          align: 'end',
          labels: {
            color: textColor,
            font: { family: 'Be Vietnam Pro', size: 12, weight: '500' },
            usePointStyle: true,
            boxWidth: 8,
          },
        },
        tooltip: {
          backgroundColor: isDark ? '#1F1F24' : '#FFFFFF',
          titleColor: isDark ? '#FFFFFF' : '#16161A',
          bodyColor: isDark ? '#D9D4CC' : '#3A3733',
          borderColor: isDark ? '#2E2E36' : '#D9D4CC',
          borderWidth: 1,
          padding: 10,
          boxPadding: 4,
          usePointStyle: true,
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: textColor, font: { family: 'Be Vietnam Pro', size: 12 } },
        },
        y: {
          position: 'left',
          grid: { color: gridColor },
          ticks: {
            color: textColor,
            font: { family: 'Be Vietnam Pro', size: 11 },
            callback: (v: number) => v + 'M',
          },
        },
        y1: {
          position: 'right',
          grid: { display: false },
          ticks: {
            color: textColor,
            font: { family: 'Be Vietnam Pro', size: 11 },
          },
        },
      },
    };
  }

  private initOccupancyChart(): void {
    const isDark = this.layoutService.resolvedTheme() === 'dark';
    const textColor = isDark ? '#D9D4CC' : '#3A3733';
    const emptyColor = isDark ? '#26262D' : '#E8E4DD';

    this.doughnutChartData = {
      labels: ['Limousine 9-11 chỗ', 'Giường nằm VIP', 'Ghế trống'],
      datasets: [
        {
          data: [65, 20, 15],
          backgroundColor: ['#D71920', '#F2B632', emptyColor],
          hoverBackgroundColor: ['#A50F16', '#D69E1F', emptyColor],
          borderWidth: 0,
        },
      ],
    };

    this.doughnutChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '76%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: textColor,
            font: { family: 'Be Vietnam Pro', size: 12, weight: '500' },
            usePointStyle: true,
            padding: 16,
          },
        },
        tooltip: {
          backgroundColor: isDark ? '#1F1F24' : '#FFFFFF',
          titleColor: isDark ? '#FFFFFF' : '#16161A',
          bodyColor: isDark ? '#D9D4CC' : '#3A3733',
          borderColor: isDark ? '#2E2E36' : '#D9D4CC',
          borderWidth: 1,
          padding: 10,
        },
      },
    };
  }

  private initCenterTextPlugin(): void {
    this.doughnutPlugins = [
      {
        id: 'centerText',
        beforeDraw: (chart: { width: number; height: number; ctx: CanvasRenderingContext2D }) => {
          const { width, height, ctx } = chart;
          ctx.save();
          const isDark = this.layoutService.resolvedTheme() === 'dark';

          ctx.font = 'bold 28px "Be Vietnam Pro", sans-serif';
          ctx.fillStyle = isDark ? '#F4F1EC' : '#16161A';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('85%', width / 2, height / 2 - 10);

          ctx.font = '500 12px "Be Vietnam Pro", sans-serif';
          ctx.fillStyle = '#8A857D';
          ctx.fillText('Lấp đầy', width / 2, height / 2 + 14);
          ctx.restore();
        },
      },
    ];
  }

  private getCurrentTimeString(): string {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }
}
