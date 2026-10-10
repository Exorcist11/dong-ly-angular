import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { signal } from '@angular/core';
import { RoleListPageComponent } from './role-list-page.component';
import { RoleService } from '../../services/role.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { PageResponse, ApiResponse } from '../../../../core/models/api-response.model';
import { Role } from '../../models/user.model';

describe('RoleListPageComponent', () => {
  let component: RoleListPageComponent;
  let fixture: ComponentFixture<RoleListPageComponent>;
  let roleService: any;
  let notificationService: any;
  let authService: any;

  const mockRoles: Role[] = [
    {
      id: 'role-admin',
      code: 'ADMIN',
      name: 'Quản trị viên',
      description: 'Toàn quyền quản trị hệ thống',
      status: 'ACTIVE',
      isSystem: true,
      permissionCount: 35,
      createdAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'role-custom',
      code: 'TICKET_AGENT',
      name: 'Nhân viên bán vé',
      description: 'Bán và hủy vé tại quầy',
      status: 'ACTIVE',
      isSystem: false,
      permissionCount: 8,
      createdAt: '2026-02-01T00:00:00Z',
    },
  ];

  const mockPageResponse: PageResponse<Role> = {
    success: true,
    message: 'OK',
    data: {
      items: mockRoles,
      pagination: {
        page: 0,
        size: 10,
        totalElements: 2,
        totalPages: 1,
        isFirst: true,
        isLast: true,
      },
    },
    timestamp: '2026-03-01T00:00:00Z',
  };

  beforeEach(async () => {
    roleService = {
      getRoles: vi.fn().mockReturnValue(of(mockPageResponse)),
      createRole: vi.fn(),
      updateRole: vi.fn(),
      updateRoleStatus: vi.fn(),
      deleteRole: vi.fn(),
    };
    notificationService = {
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
    };
    authService = {
      permissions: signal([
        'ROLE_READ',
        'ROLE_CREATE',
        'ROLE_UPDATE',
        'ROLE_DELETE',
        'ROLE_ASSIGN',
      ]),
      hasPermission: vi.fn().mockReturnValue(true),
      currentUser: vi.fn().mockReturnValue({ username: 'admin' }),
    };

    await TestBed.configureTestingModule({
      imports: [RoleListPageComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: RoleService, useValue: roleService },
        { provide: NotificationService, useValue: notificationService },
        { provide: AuthService, useValue: authService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RoleListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('nên khởi tạo và tải danh sách vai trò khi mở trang', () => {
    expect(component).toBeTruthy();
    expect(roleService.getRoles).toHaveBeenCalled();
    expect(component.roles().length).toBe(2);
    expect(component.totalRecords()).toBe(2);
  });

  it('nên mở dialog tạo mới vai trò', () => {
    component.openCreateDialog();
    expect(component.selectedRoleForEdit()).toBeNull();
    expect(component.roleFormVisible()).toBe(true);
  });

  it('nên mở dialog chỉnh sửa vai trò với dữ liệu được chọn', () => {
    const role = mockRoles[1];
    component.openEditDialog(role);
    expect(component.selectedRoleForEdit()).toEqual(role);
    expect(component.roleFormVisible()).toBe(true);
  });

  it('nên mở dialog ma trận phân quyền', () => {
    const role = mockRoles[0];
    component.openMatrixDialog(role);
    expect(component.selectedRoleForMatrix()).toEqual(role);
    expect(component.matrixVisible()).toBe(true);
  });

  it('không cho phép khóa vai trò hệ thống', () => {
    const systemRole = mockRoles[0]; // isSystem: true
    component.confirmStatusChange(systemRole);

    expect(notificationService.info).toHaveBeenCalled();
    expect(component.statusConfirmVisible()).toBe(false);
  });

  it('cho phép mở modal xác nhận đổi trạng thái cho vai trò tùy chỉnh', () => {
    const customRole = mockRoles[1]; // isSystem: false, status: ACTIVE
    component.confirmStatusChange(customRole);

    expect(component.roleForStatusChange()).toEqual(customRole);
    expect(component.pendingStatus()).toBe('INACTIVE');
    expect(component.statusConfirmVisible()).toBe(true);
  });

  it('không cho phép xóa vai trò hệ thống', () => {
    const systemRole = mockRoles[0]; // isSystem: true
    component.confirmDeleteRole(systemRole);

    expect(notificationService.error).toHaveBeenCalled();
    expect(component.deleteConfirmVisible()).toBe(false);
  });

  it('cho phép mở modal xác nhận xóa vai trò tùy chỉnh', () => {
    const customRole = mockRoles[1]; // isSystem: false
    component.confirmDeleteRole(customRole);

    expect(component.roleForDelete()).toEqual(customRole);
    expect(component.deleteConfirmVisible()).toBe(true);
  });

  it('nên thực hiện xóa vai trò tùy chỉnh thành công', () => {
    const deleteRes: ApiResponse<void> = {
      success: true,
      message: 'Xóa thành công',
      data: undefined as unknown as void,
      timestamp: '2026-03-01T00:00:00Z',
    };
    roleService.deleteRole.mockReturnValue(of(deleteRes));

    component.roleForDelete.set(mockRoles[1]);
    component.onExecuteDeleteRole();

    expect(roleService.deleteRole).toHaveBeenCalledWith(mockRoles[1].id);
    expect(notificationService.success).toHaveBeenCalled();
    expect(component.deleteConfirmVisible()).toBe(false);
  });
});
