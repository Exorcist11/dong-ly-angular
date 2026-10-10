import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { signal } from '@angular/core';
import { TripRunListPageComponent } from './trip-run-list-page.component';
import { TripRunService } from '../../services/trip-run.service';
import { RouteService } from '../../../routes/services/route.service';
import { FleetService } from '../../../fleet/services/fleet.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { PageResponse } from '../../../../core/models/api-response.model';
import { TripRun } from '../../models/trip-run.model';

describe('TripRunListPageComponent', () => {
  let component: TripRunListPageComponent;
  let fixture: ComponentFixture<TripRunListPageComponent>;
  let tripRunServiceMock: any;
  let routeServiceMock: any;
  let fleetServiceMock: any;
  let notificationMock: any;
  let authServiceMock: any;

  const mockTripRuns: TripRun[] = [
    {
      id: 'tr-1',
      code: 'RUN-01',
      name: 'Vòng chạy Sáng HN-TH',
      routeId: 'r-1',
      routeName: 'Hà Nội - Thanh Hóa',
      departureTime: '06:00',
      daysOfWeek: '1,2,3,4,5,6,7',
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      basePrice: 150000,
      status: 'ACTIVE',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
  ];

  const mockTripRunsPageResponse: PageResponse<TripRun> = {
    success: true,
    message: 'OK',
    data: {
      items: mockTripRuns,
      pagination: {
        page: 0,
        size: 10,
        totalElements: 1,
        totalPages: 1,
        isFirst: true,
        isLast: true,
      },
    },
    timestamp: '2026-03-01T00:00:00Z',
  };

  beforeEach(async () => {
    tripRunServiceMock = {
      searchTripRuns: vi.fn().mockReturnValue(of(mockTripRunsPageResponse)),
      createTripRun: vi.fn().mockReturnValue(of({ success: true, data: mockTripRuns[0] })),
      updateTripRun: vi.fn().mockReturnValue(of({ success: true, data: mockTripRuns[0] })),
      updateStatus: vi.fn().mockReturnValue(of({ success: true, data: mockTripRuns[0] })),
      deleteTripRun: vi.fn().mockReturnValue(of({ success: true, data: null })),
    };

    routeServiceMock = {
      searchRoutes: vi.fn().mockReturnValue(
        of({
          success: true,
          data: {
            items: [{ id: 'r-1', code: 'HN-TH', name: 'Hà Nội - Thanh Hóa' }],
          },
        })
      ),
    };

    fleetServiceMock = {
      searchVehicles: vi.fn().mockReturnValue(
        of({
          success: true,
          data: {
            items: [{ id: 'v-1', plateNumber: '29B-12345', brand: 'Hyundai' }],
          },
        })
      ),
      searchDrivers: vi.fn().mockReturnValue(
        of({
          success: true,
          data: {
            items: [{ id: 'd-1', code: 'DRV-01', fullName: 'Nguyễn Văn A' }],
          },
        })
      ),
    };

    notificationMock = {
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      warning: vi.fn(),
    };

    authServiceMock = {
      hasPermission: vi.fn().mockReturnValue(true),
      permissions: signal(['TRIP_MANAGE', 'TRIP_READ']),
      currentUser: signal({
        id: 'u-1',
        username: 'admin',
        roles: ['ADMIN'],
        permissions: ['TRIP_MANAGE', 'TRIP_READ'],
      }),
    };

    await TestBed.configureTestingModule({
      imports: [TripRunListPageComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: TripRunService, useValue: tripRunServiceMock },
        { provide: RouteService, useValue: routeServiceMock },
        { provide: FleetService, useValue: fleetServiceMock },
        { provide: NotificationService, useValue: notificationMock },
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TripRunListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('nên khởi tạo và tải danh sách lịch vòng chạy ban đầu', () => {
    expect(component).toBeTruthy();
    expect(tripRunServiceMock.searchTripRuns).toHaveBeenCalled();
    expect(component.tripRunsList().length).toBe(1);
    expect(component.tripRunsTotal()).toBe(1);
  });

  it('nên nạp danh sách routeOptions, vehicleOptions và driverOptions khi khởi tạo', () => {
    expect(routeServiceMock.searchRoutes).toHaveBeenCalledWith(0, 100);
    expect(fleetServiceMock.searchVehicles).toHaveBeenCalledWith(0, 100);
    expect(fleetServiceMock.searchDrivers).toHaveBeenCalledWith(0, 100);

    expect(component.routeOptions()).toEqual([
      { label: 'HN-TH - Hà Nội - Thanh Hóa', value: 'r-1' },
    ]);
    expect(component.vehicleOptions()).toEqual([
      { label: '29B-12345 (Hyundai)', value: 'v-1' },
    ]);
    expect(component.driverOptions()).toEqual([
      { label: 'DRV-01 - Nguyễn Văn A', value: 'd-1' },
    ]);
  });

  it('nên mở dialog tạo mới lịch vòng chạy khi gọi openCreateTripRunDialog()', () => {
    component.openCreateTripRunDialog();
    expect(component.showTripRunDialog()).toBe(true);
    expect(component.selectedTripRun()).toBeNull();
  });

  it('nên mở dialog sinh chuyến tự động khi gọi openGenerateDialog()', () => {
    component.openGenerateDialog(mockTripRuns[0]);
    expect(component.showGenerateDialog()).toBe(true);
    expect(component.generateTargetTripRun()).toEqual(mockTripRuns[0]);
  });

  it('nên chuyển đổi trạng thái lịch vòng chạy khi gọi toggleTripRunStatus()', () => {
    component.toggleTripRunStatus(mockTripRuns[0]);
    expect(tripRunServiceMock.updateStatus).toHaveBeenCalledWith('tr-1', 'INACTIVE');
  });
});
