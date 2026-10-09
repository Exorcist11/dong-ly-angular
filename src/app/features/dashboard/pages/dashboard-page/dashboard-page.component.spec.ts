import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { DashboardPageComponent } from './dashboard-page.component';
import { LayoutService } from '../../../../layout/layout.service';

describe('DashboardPageComponent', () => {
  let component: DashboardPageComponent;
  let fixture: ComponentFixture<DashboardPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardPageComponent],
      providers: [provideRouter([]), LayoutService],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create dashboard page component', () => {
    expect(component).toBeTruthy();
  });

  it('should render page title and system health indicator', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const titleEl = compiled.querySelector('.page-title');
    const healthEl = compiled.querySelector('.health-text');

    expect(titleEl?.textContent).toContain('Bàn làm việc quản trị');
    expect(healthEl?.textContent).toContain('Hệ thống hoạt động bình thường');
  });

  it('should initialize 4 KPI cards and mock data', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const kpiCards = compiled.querySelectorAll('app-kpi-card');
    expect(kpiCards.length).toBe(4);
    expect(component.recentTrips().length).toBeGreaterThan(0);
    expect(component.recentActivities().length).toBeGreaterThan(0);
  });

  it('should update time range when filter changed', () => {
    component.onTimeRangeChange('7d');
    expect(component.selectedTimeRange()).toBe('7d');
  });

  it('should update revenue chart filter', () => {
    component.onRevenueFilterChange('month');
    expect(component.revenueFilter()).toBe('month');
    expect(component.lineChartData).toBeTruthy();
  });
});
