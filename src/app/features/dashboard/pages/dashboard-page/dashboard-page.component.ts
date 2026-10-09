import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { StatCardComponent } from '../../../../shared/components/stat-card/stat-card.component';
import { CurrencyVndPipe } from '../../../../shared/pipes/currency-vnd.pipe';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [PageHeaderComponent, StatCardComponent, CurrencyVndPipe],
  template: `
    <app-page-header
      title="Bàn làm việc quản trị"
      subtitle="Tổng quan hoạt động vận tải và tình hình bán vé nhà xe Đông Lý"
      [breadcrumbs]="[{ label: 'Trang chủ' }, { label: 'Bàn làm việc' }]"
    >
      <div actions>
        <button type="button" class="btn-refresh" (click)="onRefresh()">
          🔄 Làm mới dữ liệu
        </button>
      </div>
    </app-page-header>

    <div class="kpi-grid">
      <app-stat-card
        label="Vé đã bán hôm nay"
        [value]="'128'"
        icon="🎫"
        color="#2563eb"
        changeText="+12% so với hôm qua"
        [isPositive]="true"
      />

      <app-stat-card
        label="Doanh thu ngày"
        [value]="(32500000 | currencyVnd)"
        icon="💰"
        color="#16a34a"
        changeText="+8.5% tăng trưởng"
        [isPositive]="true"
      />

      <app-stat-card
        label="Chuyến xe đang chạy"
        [value]="'16'"
        icon="🚌"
        color="#d97706"
        changeText="Đúng lịch trình 100%"
        [isPositive]="true"
      />

      <app-stat-card
        label="Khách hàng mới"
        [value]="'42'"
        icon="👥"
        color="#7c3aed"
        changeText="+5 so với tuần trước"
        [isPositive]="true"
      />
    </div>

    <div class="dashboard-content">
      <div class="card info-card">
        <h3>Lịch xuất bến gần nhất</h3>
        <p class="card-desc">Danh sách các chuyến xe sắp khởi hành từ các đầu bến Thanh Hóa - Hà Nội - Sài Gòn.</p>
        <div class="status-badge">Hệ thống sẵn sàng vận hành</div>
      </div>
    </div>
  `,
  styles: [`
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 20px;
      margin-bottom: 28px;
    }
    .btn-refresh {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      color: #334155;
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: background 0.15s;
    }
    .btn-refresh:hover {
      background: #f1f5f9;
    }
    .card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 24px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }
    .card h3 {
      margin: 0 0 8px 0;
      font-size: 16px;
      font-weight: 600;
      color: #0f172a;
    }
    .card-desc {
      color: #64748b;
      font-size: 14px;
      margin: 0 0 16px 0;
    }
    .status-badge {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 20px;
      background: #f0fdf4;
      color: #16a34a;
      font-size: 13px;
      font-weight: 600;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent {
  onRefresh(): void {
    // Có thể kết nối trigger làm mới dữ liệu
  }
}
