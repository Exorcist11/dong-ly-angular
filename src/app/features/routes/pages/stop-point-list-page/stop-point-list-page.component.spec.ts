import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { signal } from '@angular/core';
import { StopPointListPageComponent } from './stop-point-list-page.component';
import { RouteService } from '../../services/route.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { PageResponse } from '../../../../core/models/api-response.model';
import { LocationItem, StopPoint } from '../../models/route.model';

describe('StopPointListPageComponent', () => {
  let component: StopPointListPageComponent;
  let fixture: ComponentFixture<StopPointListPageComponent>;
  let routeServiceMock: any;
  let notificationMock: any;
  let authServiceMock: any;

  const mockLocations: LocationItem[] = [
    { id: 'loc-1', code: 'HN', name: 'Hà Nội', province: 'Hà Nội', status: 'ACTIVE' },
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
      searchStopPoints: vi.fn().mockReturnValue(of(mockStopPointsPageResponse)),
      createStopPoint: vi.fn().mockReturnValue(of({ success: true, data: mockStopPoints[0] })),
      updateStopPoint: vi.fn().mockReturnValue(of({ success: true, data: mockStopPoints[0] })),
      updateStopPointStatus: vi.fn().mockReturnValue(of({ success: true, data: mockStopPoints[0] })),
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
      imports: [StopPointListPageComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: RouteService, useValue: routeServiceMock },
        { provide: NotificationService, useValue: notificationMock },
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StopPointListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('nên khởi tạo và tải danh sách điểm dừng ban đầu', () => {
    expect(component).toBeTruthy();
    expect(routeServiceMock.getActiveLocations).toHaveBeenCalled();
    expect(routeServiceMock.searchStopPoints).toHaveBeenCalled();
    expect(component.stopPoints().length).toBe(1);
    expect(component.totalStopPoints()).toBe(1);
  });

  it('nên mở dialog tạo mới điểm dừng', () => {
    component.openCreateStopPointDialog();
    expect(component.showStopPointDialog()).toBe(true);
    expect(component.editingStopPoint()).toBeNull();
  });

  it('nên mở dialog chỉnh sửa điểm dừng', () => {
    component.openEditStopPointDialog(mockStopPoints[0]);
    expect(component.showStopPointDialog()).toBe(true);
    expect(component.editingStopPoint()).toEqual(mockStopPoints[0]);
  });

  it('nên mở modal xác nhận khi toggle trạng thái điểm dừng', () => {
    component.confirmToggleStopPointStatus(mockStopPoints[0]);
    expect(component.showConfirmModal()).toBe(true);

    component.confirmModalAction()();
    expect(routeServiceMock.updateStopPointStatus).toHaveBeenCalledWith('sp-1', 'INACTIVE');
  });
});
