import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimpleChange } from '@angular/core';
import { of } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  RolePermissionMatrixComponent,
} from './role-permission-matrix.component';
import { RoleService } from '../../services/role.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ApiResponse } from '../../../../core/models/api-response.model';
import {
  Permission,
  PermissionCatalog,
  RoleDetail,
} from '../../models/user.model';

describe('RolePermissionMatrixComponent', () => {
  let component: RolePermissionMatrixComponent;
  let fixture: ComponentFixture<RolePermissionMatrixComponent>;
  let roleService: any;
  let notificationService: any;

  const mockPermissions: Permission[] = [
    {
      code: 'USER_READ',
      name: 'Xem danh sách người dùng',
      description: 'Quyền xem danh sách',
      module: 'USER',
    },
    {
      code: 'USER_CREATE',
      name: 'Tạo người dùng',
      description: 'Quyền tạo mới',
      module: 'USER',
    },
    {
      code: 'ROLE_READ',
      name: 'Xem vai trò',
      description: 'Quyền xem vai trò',
      module: 'ROLE',
    },
  ];

  const mockCatalog: PermissionCatalog = {
    totalPermissions: 3,
    permissions: mockPermissions,
    modules: [
      {
        module: 'USER',
        permissions: [mockPermissions[0], mockPermissions[1]],
      },
      {
        module: 'ROLE',
        permissions: [mockPermissions[2]],
      },
    ],
  };

  beforeEach(async () => {
    roleService = {
      getPermissionsCatalog: vi.fn(),
      getRolePermissions: vi.fn(),
      assignRolePermissions: vi.fn(),
    };
    notificationService = {
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [RolePermissionMatrixComponent],
      providers: [
        { provide: RoleService, useValue: roleService },
        { provide: NotificationService, useValue: notificationService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RolePermissionMatrixComponent);
    component = fixture.componentInstance;
  });

  it('nên khởi tạo component thành công', () => {
    expect(component).toBeTruthy();
    expect(component.selectedCount()).toBe(0);
    expect(component.hasChanges()).toBe(false);
  });

  it('nên tải catalog và danh sách quyền của role khi mở dialog', () => {
    const catalogRes: ApiResponse<PermissionCatalog> = {
      success: true,
      message: 'OK',
      data: mockCatalog,
      timestamp: '2026-03-01T00:00:00Z',
    };
    const rolePermsRes: ApiResponse<Permission[]> = {
      success: true,
      message: 'OK',
      data: [mockPermissions[0]], // Có quyền USER_READ
      timestamp: '2026-03-01T00:00:00Z',
    };

    roleService.getPermissionsCatalog.mockReturnValue(of(catalogRes));
    roleService.getRolePermissions.mockReturnValue(of(rolePermsRes));

    component.roleId = 'role-123';
    component.roleName = 'Điều hành';
    component.roleCode = 'OPERATOR';
    component.visible = true;

    component.ngOnChanges({
      visible: new SimpleChange(false, true, true),
    });

    expect(roleService.getPermissionsCatalog).toHaveBeenCalled();
    expect(roleService.getRolePermissions).toHaveBeenCalledWith('role-123');
    expect(component.catalog()).toEqual(mockCatalog);
    expect(component.selectedCount()).toBe(1);
    expect(component.isPermissionSelected('USER_READ')).toBe(true);
    expect(component.isPermissionSelected('USER_CREATE')).toBe(false);
  });

  it('nên tự động khóa và bảo vệ 5 quyền cốt lõi nếu là vai trò ADMIN', () => {
    const catalogRes: ApiResponse<PermissionCatalog> = {
      success: true,
      message: 'OK',
      data: mockCatalog,
      timestamp: '2026-03-01T00:00:00Z',
    };
    const rolePermsRes: ApiResponse<Permission[]> = {
      success: true,
      message: 'OK',
      data: [],
      timestamp: '2026-03-01T00:00:00Z',
    };

    roleService.getPermissionsCatalog.mockReturnValue(of(catalogRes));
    roleService.getRolePermissions.mockReturnValue(of(rolePermsRes));

    component.roleId = 'admin-id';
    component.roleName = 'Quản trị viên';
    component.roleCode = 'ADMIN';
    component.visible = true;

    component.ngOnChanges({
      visible: new SimpleChange(false, true, true),
    });

    expect(component.isAdminRole()).toBe(true);
    // Quyền ROLE_READ thuộc CORE_ADMIN_PERMISSIONS
    expect(component.isCoreAdminPermission('ROLE_READ')).toBe(true);
    expect(component.isPermissionSelected('ROLE_READ')).toBe(true);

    // Thử toggle quyền cốt lõi của ADMIN -> không được thay đổi
    component.togglePermission('ROLE_READ');
    expect(component.isPermissionSelected('ROLE_READ')).toBe(true);
  });

  it('nên cập nhật diff counters khi chọn thêm quyền mới', () => {
    component.catalog.set(mockCatalog);
    component.initialCodes.set(new Set(['USER_READ']));
    component.selectedCodes.set(new Set(['USER_READ']));

    expect(component.hasChanges()).toBe(false);

    component.togglePermission('USER_CREATE');

    expect(component.selectedCount()).toBe(2);
    expect(component.addedCount()).toBe(1);
    expect(component.removedCount()).toBe(0);
    expect(component.hasChanges()).toBe(true);
  });

  it('nên lưu ma trận phân quyền thành công và emit permissionsSaved', () => {
    const assignRes: ApiResponse<RoleDetail> = {
      success: true,
      message: 'Cập nhật thành công',
      data: {} as RoleDetail,
      timestamp: '2026-03-01T00:00:00Z',
    };

    roleService.assignRolePermissions.mockReturnValue(of(assignRes));
    const savedEmitSpy = vi.spyOn(component.permissionsSaved, 'emit');

    component.roleId = 'role-123';
    component.roleName = 'Điều hành';
    component.roleCode = 'OPERATOR';
    component.initialCodes.set(new Set(['USER_READ']));
    component.selectedCodes.set(new Set(['USER_READ', 'USER_CREATE']));

    component.savePermissions();

    expect(roleService.assignRolePermissions).toHaveBeenCalledWith('role-123', {
      permissionCodes: expect.arrayContaining(['USER_READ', 'USER_CREATE']),
    });
    expect(notificationService.success).toHaveBeenCalled();
    expect(savedEmitSpy).toHaveBeenCalled();
  });
});
