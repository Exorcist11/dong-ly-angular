import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { signal } from '@angular/core';
import { DriverListPageComponent } from './driver-list-page.component';
import { FleetService } from '../../services/fleet.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { PageResponse } from '../../../../core/models/api-response.model';
import { Driver } from '../../models/fleet.model';

describe('DriverListPageComponent', () => {
  let component: DriverListPageComponent;
  let fixture: ComponentFixture<DriverListPageComponent>;
  let fleetServiceMock: any;
  let notificationMock: any;
  let authServiceMock: any;

  const mockDrivers: Driver[] = [
    {
      id: 'd-1',
      code: 'TX-001',
      fullName: 'Nguyễn Văn Tài',
      phone: '0987654321',
      licenseNumber: 'B2-998877',
      licenseClass: 'E',
      licenseExpiryDate: '2030-01-01',
      status: 'ACTIVE',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
  ];

  const mockDriversPageResponse: PageResponse<Driver> = {
    success: true,
    message: 'OK',
    data: {
      items: mockDrivers,
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
    fleetServiceMock = {
      searchDrivers: vi.fn().mockReturnValue(of(mockDriversPageResponse)),
      createDriver: vi.fn().mockReturnValue(of({ success: true, data: mockDrivers[0] })),
      updateDriver: vi.fn().mockReturnValue(of({ success: true, data: mockDrivers[0] })),
      deleteDriver: vi.fn().mockReturnValue(of({ success: true, data: null })),
    };

    notificationMock = {
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      warning: vi.fn(),
    };

    authServiceMock = {
      hasPermission: vi.fn().mockReturnValue(true),
      permissions: signal(['FLEET_MANAGE', 'FLEET_READ']),
      currentUser: signal({
        id: 'u-1',
        username: 'admin',
        roles: ['ADMIN'],
        permissions: ['FLEET_MANAGE', 'FLEET_READ'],
      }),
    };

    await TestBed.configureTestingModule({
      imports: [DriverListPageComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: FleetService, useValue: fleetServiceMock },
        { provide: NotificationService, useValue: notificationMock },
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DriverListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('nên khởi tạo và tải danh sách tài xế ban đầu', () => {
    expect(component).toBeTruthy();
    expect(fleetServiceMock.searchDrivers).toHaveBeenCalled();
    expect(component.drivers().length).toBe(1);
    expect(component.totalDrivers()).toBe(1);
  });

  it('nên mở dialog tạo mới tài xế khi gọi openCreateDriverDialog()', () => {
    component.openCreateDriverDialog();
    expect(component.showDriverDialog()).toBe(true);
    expect(component.editingDriver()).toBeNull();
  });

  it('nên mở dialog chỉnh sửa tài xế khi gọi openEditDriverDialog()', () => {
    component.openEditDriverDialog(mockDrivers[0]);
    expect(component.showDriverDialog()).toBe(true);
    expect(component.editingDriver()).toEqual(mockDrivers[0]);
  });

  it('nên mở modal xác nhận xóa và thực hiện xóa tài xế', () => {
    component.confirmDeleteDriver(mockDrivers[0]);
    expect(component.showDeleteConfirm()).toBe(true);
    expect(component.deletingName()).toContain('TX-001');

    component.executeDelete();
    expect(fleetServiceMock.deleteDriver).toHaveBeenCalledWith('d-1');
  });
});
