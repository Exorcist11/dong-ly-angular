import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimpleChange } from '@angular/core';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  RolePermissionMatrixComponent,
  CORE_ADMIN_PERMISSIONS,
} from './role-permission-matrix.component';
import { RoleService } from '../../services/role.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ApiResponse } from '../../../../core/models/api-response.model';
import {
  Permission,
  PermissionCatalog,
  RoleDetail,
} from '../../models/user.model';
import { AppDialogComponent } from '../../../../shared/components/dialog/dialog.component';

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
    {
      code: 'ROLE_CREATE',
      name: 'Tạo vai trò',
      description: 'Quyền tạo vai trò',
      module: 'ROLE',
    },
    {
      code: 'PERMISSION_READ',
      name: 'Xem danh mục quyền',
      description: 'Quyền xem quyền',
      module: 'PERMISSION',
    },
  ];

  const mockCatalog: PermissionCatalog = {
    totalPermissions: 5,
    permissions: mockPermissions,
    modules: [
      {
        module: 'USER',
        permissions: [mockPermissions[0], mockPermissions[1]],
      },
      {
        module: 'ROLE',
        permissions: [mockPermissions[2], mockPermissions[3]],
      },
      {
        module: 'PERMISSION',
        permissions: [mockPermissions[4]],
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

  it('nên khởi tạo component thành công với trạng thái ban đầu sạch', () => {
    expect(component).toBeTruthy();
    expect(component.selectedCount()).toBe(0);
    expect(component.hasChanges()).toBe(false);
    expect(component.loading()).toBe(false);
    expect(component.saving()).toBe(false);
  });

  describe('Tích hợp với AppDialogComponent', () => {
    it('nên nhúng AppDialogComponent với size="xl", height="88vh" và styleClass chuẩn', () => {
      component.visible = true;
      fixture.detectChanges();

      const dialogDebug = fixture.debugElement.query(By.directive(AppDialogComponent));
      expect(dialogDebug).toBeTruthy();

      const appDialog = dialogDebug.componentInstance as AppDialogComponent;
      expect(appDialog.size()).toBe('xl');
      expect(appDialog.height()).toBe('88vh');
      expect(appDialog.styleClass()).toContain('dl-matrix-dialog');
    });

    it('nên chiếu đúng custom header qua [dialogHeader] và hiển thị thông tin role', () => {
      component.visible = true;
      component.roleName = 'Điều hành viên';
      component.roleCode = 'OPERATOR';
      component.isSystemRole = true;
      fixture.detectChanges();

      const headerTitleName = fixture.debugElement.query(By.css('.role-title-name'));
      expect(headerTitleName.nativeElement.textContent).toContain('Điều hành viên');

      const roleCodeBadge = fixture.debugElement.query(By.css('.role-code-badge'));
      expect(roleCodeBadge.nativeElement.textContent).toContain('OPERATOR');
    });

    it('nên chiếu đúng custom footer qua [dialogFooter] với nút Hủy và nút Lưu', () => {
      component.visible = true;
      fixture.detectChanges();

      const customFooter = fixture.debugElement.query(By.css('.matrix-dialog-footer'));
      expect(customFooter).toBeTruthy();

      const buttons = customFooter.queryAll(By.css('app-button'));
      expect(buttons.length).toBe(2);
    });

    it('nên đóng dialog và phát visibleChange(false) khi cancelled hoặc onClose', () => {
      component.visible = true;
      fixture.detectChanges();

      let emittedVisible: boolean | null = null;
      component.visibleChange.subscribe((v) => (emittedVisible = v));

      component.onClose();

      expect(emittedVisible).toBe(false);
      expect(component.visible).toBe(false);
    });

    it('không được đóng dialog khi đang trong trạng thái saving = true', () => {
      component.visible = true;
      component.saving.set(true);
      fixture.detectChanges();

      let emitted = false;
      component.visibleChange.subscribe(() => (emitted = true));

      component.onClose();
      expect(emitted).toBe(false);

      component.onVisibleChange(false);
      expect(emitted).toBe(false);
    });
  });

  describe('Tải dữ liệu danh mục quyền và Phân quyền vai trò', () => {
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

    it('nên xử lý thông báo lỗi khi API catalog hoặc role permissions thất bại', () => {
      roleService.getPermissionsCatalog.mockReturnValue(throwError(() => ({ error: { message: 'Lỗi nạp' } })));
      roleService.getRolePermissions.mockReturnValue(of({ success: true, data: [] }));

      component.roleId = 'role-err';
      component.visible = true;
      component.ngOnChanges({
        visible: new SimpleChange(false, true, true),
      });

      expect(notificationService.error).toHaveBeenCalledWith('Lỗi nạp');
      expect(component.loading()).toBe(false);
    });
  });

  describe('Cơ chế bảo vệ đặc biệt dành cho vai trò ADMIN', () => {
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

      // Thử toggle quyền cốt lõi của ADMIN -> không được phép thay đổi
      component.togglePermission('ROLE_READ');
      expect(component.isPermissionSelected('ROLE_READ')).toBe(true);
    });

    it('nên giữ nguyên quyền cốt lõi ADMIN khi thực hiện deselectAll', () => {
      component.roleCode = 'ADMIN';
      component.catalog.set(mockCatalog);
      component.selectedCodes.set(new Set(['USER_READ', 'ROLE_READ', 'PERMISSION_READ']));

      component.deselectAll();

      // Quyền non-core bị xóa, quyền core được giữ
      expect(component.isPermissionSelected('USER_READ')).toBe(false);
      CORE_ADMIN_PERMISSIONS.forEach((coreCode) => {
        expect(component.isPermissionSelected(coreCode)).toBe(true);
      });
    });
  });

  describe('Tìm kiếm và Lọc (Search & Filter)', () => {
    beforeEach(() => {
      component.catalog.set(mockCatalog);
    });

    it('nên trả về toàn bộ modules khi từ khóa tìm kiếm rỗng', () => {
      component.searchQuery.set('');
      expect(component.filteredModules().length).toBe(3);
    });

    it('nên lọc đúng module và quyền theo từ khóa tên hoặc mã quyền', () => {
      component.searchQuery.set('USER_CREATE');
      const filtered = component.filteredModules();
      expect(filtered.length).toBe(1);
      expect(filtered[0].module).toBe('USER');
      expect(filtered[0].permissions.length).toBe(1);
      expect(filtered[0].permissions[0].code).toBe('USER_CREATE');
    });

    it('nên trả về rỗng khi từ khóa không khớp với bất kỳ quyền nào', () => {
      component.searchQuery.set('NON_EXISTING_KEYWORD');
      expect(component.filteredModules().length).toBe(0);
    });
  });

  describe('Thao tác chọn nhóm và Đếm Diff', () => {
    beforeEach(() => {
      component.catalog.set(mockCatalog);
      component.initialCodes.set(new Set(['USER_READ']));
      component.selectedCodes.set(new Set(['USER_READ']));
    });

    it('nên cập nhật diff counters khi chọn thêm quyền mới', () => {
      expect(component.hasChanges()).toBe(false);

      component.togglePermission('USER_CREATE');

      expect(component.selectedCount()).toBe(2);
      expect(component.addedCount()).toBe(1);
      expect(component.removedCount()).toBe(0);
      expect(component.hasChanges()).toBe(true);
    });

    it('nên chọn toàn bộ quyền trong module khi toggleModule', () => {
      const userGroup = mockCatalog.modules[0]; // module USER có 2 quyền
      expect(component.isModuleAllSelected(userGroup)).toBe(false);
      expect(component.isModulePartiallySelected(userGroup)).toBe(true);

      component.toggleModule(userGroup);

      expect(component.isModuleAllSelected(userGroup)).toBe(true);
      expect(component.isPermissionSelected('USER_READ')).toBe(true);
      expect(component.isPermissionSelected('USER_CREATE')).toBe(true);
    });

    it('nên chọn tất cả quyền qua selectAll và khôi phục qua resetChanges', () => {
      component.selectAll();
      expect(component.selectedCount()).toBe(5);
      expect(component.hasChanges()).toBe(true);

      component.resetChanges();
      expect(component.selectedCount()).toBe(1);
      expect(component.isPermissionSelected('USER_READ')).toBe(true);
      expect(component.hasChanges()).toBe(false);
    });

    it('nên hiển thị unsaved-hint trong footer khi hasChanges = true', () => {
      component.visible = true;
      fixture.detectChanges();

      let hint = fixture.debugElement.query(By.css('.unsaved-hint'));
      expect(hint).toBeNull();

      component.togglePermission('USER_CREATE');
      fixture.detectChanges();

      hint = fixture.debugElement.query(By.css('.unsaved-hint'));
      expect(hint).toBeTruthy();
    });
  });

  describe('Lưu quyền (Save Permissions) và Xử lý Lỗi', () => {
    it('nên lưu ma trận phân quyền thành công và phát sự kiện permissionsSaved', () => {
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
      expect(component.saving()).toBe(false);
    });

    it('không được phát permissionsSaved nếu API trả về lỗi', () => {
      roleService.assignRolePermissions.mockReturnValue(
        throwError(() => ({ error: { message: 'Lỗi máy chủ' } }))
      );
      const savedEmitSpy = vi.spyOn(component.permissionsSaved, 'emit');

      component.roleId = 'role-123';
      component.initialCodes.set(new Set(['USER_READ']));
      component.selectedCodes.set(new Set(['USER_READ', 'USER_CREATE']));

      component.savePermissions();

      expect(notificationService.error).toHaveBeenCalledWith('Lỗi máy chủ');
      expect(savedEmitSpy).not.toHaveBeenCalled();
      expect(component.saving()).toBe(false);
    });

    it('không được gọi assignRolePermissions nếu roleId là null', () => {
      component.roleId = null;
      component.savePermissions();

      expect(roleService.assignRolePermissions).not.toHaveBeenCalled();
    });

    it('không được gửi trùng khi saving đang là true', () => {
      component.roleId = 'role-123';
      component.saving.set(true);

      component.savePermissions();

      expect(roleService.assignRolePermissions).not.toHaveBeenCalled();
    });
  });
});
