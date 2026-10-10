import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { signal } from '@angular/core';
import { RouteListPageComponent } from './route-list-page.component';
import { RouteService } from '../../services/route.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { PageResponse, ApiResponse } from '../../../../core/models/api-response.model';
import { RouteSummary, StopPoint, LocationItem, RouteDetail } from '../../models/route.model';

describe('RouteListPageComponent', () => {
  let component: RouteListPageComponent;
  let fixture: ComponentFixture<RouteListPageComponent>;
  let routeServiceMock: any;
  let notificationMock: any;
  let authServiceMock: any;

  const mockLocations: LocationItem[] = [
    { id: 'loc-1', code: 'HN', name: 'Hà Nội', province: 'Hà Nội', status: 'ACTIVE' },
    { id: 'loc-2', code: 'TH', name: 'Thanh Hóa', province: 'Thanh Hóa', status: 'ACTIVE' },
  ];

  const mockRoutes: RouteSummary[] = [
    {
      id: 'route-1',
      code: 'HN-TH',
      name: 'Hà Nội - Thanh Hóa',
      originLocation: mockLocations[0],
      destinationLocation: mockLocations[1],
      distanceKm: 160,
      estimatedDurationMinutes: 180,
      totalStops: 4,
      status: 'ACTIVE',
      createdAt: '2026-01-01T00:00:00Z',
    },
  ];

  const mockStopPoints: StopPoint[] = [
    {
      id: 'sp-1',
      code: 'BX_NUOC_NGAM',
      name: 'Bến xe Nước Ngầm',
      locationId: 'loc-1',
      locationName: 'Hà Nội',
      address: 'Km8 Đường Giải Phóng, Hoàng Mai, Hà Nội',
      status: 'ACTIVE',
      createdAt: '2026-01-01T00:00:00Z',
    },
  ];

  const mockRouteDetail: RouteDetail = {
    ...mockRoutes[0],
    description: 'Tuyến chính cao tốc Pháp Vân',
    stops: [],
  };

  const mockRoutesPageResponse: PageResponse<RouteSummary> = {
    success: true,
    message: 'OK',
    data: {
      items: mockRoutes,
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

  const mockStopPointsPageResponse: PageResponse<StopPoint> = {
    success: true,
    message: 'OK',
    data: {
      items: mockStopPoints,
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
    routeServiceMock = {
      getActiveLocations: vi.fn().mockReturnValue(of({ success: true, data: mockLocations })),
      searchRoutes: vi.fn().mockReturnValue(of(mockRoutesPageResponse)),
      searchStopPoints: vi.fn().mockReturnValue(of(mockStopPointsPageResponse)),
      getRouteById: vi.fn().mockReturnValue(of({ success: true, data: mockRouteDetail })),
      createRoute: vi.fn().mockReturnValue(of({ success: true, data: mockRouteDetail })),
      updateRoute: vi.fn().mockReturnValue(of({ success: true, data: mockRouteDetail })),
      updateRouteStatus: vi.fn().mockReturnValue(of({ success: true, data: mockRouteDetail })),
      createStopPoint: vi.fn().mockReturnValue(of({ success: true, data: mockStopPoints[0] })),
      updateStopPoint: vi.fn().mockReturnValue(of({ success: true, data: mockStopPoints[0] })),
      updateStopPointStatus: vi.fn().mockReturnValue(of({ success: true, data: mockStopPoints[0] })),
      updateRouteStops: vi.fn().mockReturnValue(of({ success: true, data: mockRouteDetail })),
    };

    notificationMock = {
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      warning: vi.fn(),
    };

    authServiceMock = {
      hasPermission: vi.fn().mockReturnValue(true),
      permissions: signal(['ROUTE_MANAGE', 'ROUTE_READ']),
      currentUser: signal({
        id: 'u-1',
        username: 'admin',
        roles: ['ADMIN'],
        permissions: ['ROUTE_MANAGE', 'ROUTE_READ'],
      }),
    };

    await TestBed.configureTestingModule({
      imports: [RouteListPageComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: RouteService, useValue: routeServiceMock },
        { provide: NotificationService, useValue: notificationMock },
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RouteListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('nên khởi tạo và tải danh sách tuyến đường và điểm dừng ban đầu', () => {
    expect(component).toBeTruthy();
    expect(routeServiceMock.getActiveLocations).toHaveBeenCalled();
    expect(routeServiceMock.searchRoutes).toHaveBeenCalled();
    expect(routeServiceMock.searchStopPoints).toHaveBeenCalled();
    expect(component.routes().length).toBe(1);
    expect(component.totalRoutes()).toBe(1);
  });

  it('nên mở dialog tạo mới tuyến đường khi gọi openCreateRouteDialog()', () => {
    component.openCreateRouteDialog();
    expect(component.showRouteDialog()).toBe(true);
    expect(component.editingRoute()).toBeNull();
  });

  it('nên mở dialog chỉnh sửa tuyến đường khi gọi openEditRouteDialog()', () => {
    component.openEditRouteDialog(mockRoutes[0]);
    expect(component.showRouteDialog()).toBe(true);
    expect(component.editingRoute()).toEqual(mockRoutes[0]);
  });

  it('nên chuyển đổi tab sang stopPoints và mở dialog thêm điểm dừng', () => {
    component.activeMainTab.set('stopPoints');
    expect(component.activeMainTab()).toBe('stopPoints');

    component.openCreateStopPointDialog();
    expect(component.showStopPointDialog()).toBe(true);
    expect(component.editingStopPoint()).toBeNull();
  });

  it('nên lưu tạo mới tuyến đường thành công và đóng dialog', () => {
    component.openCreateRouteDialog();
    component.saveRoute({
      code: 'TH-HN',
      name: 'Thanh Hóa - Hà Nội',
      originLocationId: 'loc-2',
      destinationLocationId: 'loc-1',
    });

    expect(routeServiceMock.createRoute).toHaveBeenCalled();
    expect(component.showRouteDialog()).toBe(false);
    expect(notificationMock.success).toHaveBeenCalled();
  });

  it('nên mở dialog cấu hình điểm dừng khi gọi openStopsConfigDialog()', () => {
    component.openStopsConfigDialog(mockRoutes[0]);
    expect(routeServiceMock.getRouteById).toHaveBeenCalledWith('route-1');
    expect(component.showStopsConfigDialog()).toBe(true);
    expect(component.configuringRoute()).toEqual(mockRouteDetail);
  });

  it('nên mở modal xác nhận khi toggle trạng thái tuyến đường', () => {
    component.confirmToggleRouteStatus(mockRoutes[0]);
    expect(component.showConfirmModal()).toBe(true);
    expect(component.confirmModalTitle()).toContain('Ngừng hoạt động');

    // Chạy action xác nhận
    component.confirmModalAction()();
    expect(routeServiceMock.updateRouteStatus).toHaveBeenCalledWith('route-1', 'INACTIVE');
    expect(component.showConfirmModal()).toBe(false);
    expect(notificationMock.success).toHaveBeenCalled();
  });
});
