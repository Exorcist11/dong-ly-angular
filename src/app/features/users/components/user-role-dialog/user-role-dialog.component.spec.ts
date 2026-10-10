import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimpleChange } from '@angular/core';
import { By } from '@angular/platform-browser';
import { describe, it, expect, beforeEach } from 'vitest';
import { UserRoleDialogComponent } from './user-role-dialog.component';
import { Role, User } from '../../models/user.model';
import { AppDialogComponent } from '../../../../shared/components/dialog/dialog.component';

describe('UserRoleDialogComponent', () => {
  let component: UserRoleDialogComponent;
  let fixture: ComponentFixture<UserRoleDialogComponent>;

  const mockUser: User = {
    id: 'u-1',
    username: 'nguyenvana',
    email: 'a@dongly.vn',
    fullName: 'Nguyễn Văn A',
    phone: '0987654321',
    status: 'ACTIVE',
    roles: ['OPERATOR'],
    createdAt: '2026-01-01T00:00:00Z',
  };

  const mockAvailableRoles: Role[] = [
    {
      id: 'r-1',
      code: 'ADMIN',
      name: 'Quản trị viên',
      description: 'Quản trị toàn quyền',
      status: 'ACTIVE',
      isSystem: true,
      permissionCount: 15,
      createdAt: '',
    },
    {
      id: 'r-2',
      code: 'OPERATOR',
      name: 'Điều hành',
      description: 'Điều phối vận tải',
      status: 'ACTIVE',
      isSystem: true,
      permissionCount: 8,
      createdAt: '',
    },
    {
      id: 'r-3',
      code: 'STAFF',
      name: 'Nhân viên bán vé',
      description: 'Bán vé bến xe',
      status: 'ACTIVE',
      isSystem: false,
      permissionCount: 4,
      createdAt: '',
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserRoleDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UserRoleDialogComponent);
    component = fixture.componentInstance;
    component.user = mockUser;
    component.availableRoles = mockAvailableRoles;
    fixture.detectChanges();
  });

  it('should create user role dialog component', () => {
    expect(component).toBeTruthy();
  });

  describe('Integration with AppDialogComponent', () => {
    it('should embed AppDialogComponent with size="lg"', () => {
      component.visible = true;
      fixture.detectChanges();

      const dialogDebug = fixture.debugElement.query(By.directive(AppDialogComponent));
      expect(dialogDebug).toBeTruthy();
      const appDialog = dialogDebug.componentInstance as AppDialogComponent;
      expect(appDialog.size()).toBe('lg');
      expect(appDialog.styleClass()).toContain('dl-user-role-dialog');
    });

    it('should sync visible input and handle cancelled event', () => {
      component.visible = true;
      fixture.detectChanges();

      const dialogDebug = fixture.debugElement.query(By.directive(AppDialogComponent));
      const appDialog = dialogDebug.componentInstance as AppDialogComponent;

      let emittedVisible: boolean | null = null;
      component.visibleChange.subscribe((v) => (emittedVisible = v));

      appDialog.cancelled.emit();

      expect(emittedVisible).toBe(false);
      expect(component.visible).toBe(false);
    });

    it('should trigger onSave when submitted event is emitted by dialog', () => {
      component.visible = true;
      component.ngOnChanges({
        visible: new SimpleChange(false, true, true),
      });
      component.toggleRole('STAFF');
      fixture.detectChanges();

      let emittedData: { userId: string; roleCodes: string[] } | null = null;
      component.saveRoles.subscribe((d) => (emittedData = d));

      const dialogDebug = fixture.debugElement.query(By.directive(AppDialogComponent));
      const appDialog = dialogDebug.componentInstance as AppDialogComponent;

      appDialog.submitted.emit();

      expect(emittedData).toBeTruthy();
      expect(emittedData!.userId).toBe('u-1');
      expect(emittedData!.roleCodes).toContain('STAFF');
      expect(emittedData!.roleCodes).toContain('OPERATOR');
    });
  });

  describe('User and Role Display', () => {
    it('should display user info and role tags correctly', () => {
      component.visible = true;
      fixture.detectChanges();

      const fullNameEl = fixture.debugElement.query(By.css('.user-fullname'));
      expect(fullNameEl.nativeElement.textContent).toContain('Nguyễn Văn A');

      const usernameEl = fixture.debugElement.query(By.css('.user-username'));
      expect(usernameEl.nativeElement.textContent).toContain('@nguyenvana');

      const emailEl = fixture.debugElement.query(By.css('.user-email'));
      expect(emailEl.nativeElement.textContent).toContain('a@dongly.vn');

      const avatarEl = fixture.debugElement.query(By.css('.avatar-circle'));
      expect(avatarEl.nativeElement.textContent.trim()).toBe('N');
    });

    it('should fallback avatar initial to "U" when fullName is missing', () => {
      component.user = { ...mockUser, fullName: '' };
      component.visible = true;
      fixture.detectChanges();

      const avatarEl = fixture.debugElement.query(By.css('.avatar-circle'));
      expect(avatarEl.nativeElement.textContent.trim()).toBe('U');
    });

    it('should populate initial user roles when opened', () => {
      component.visible = true;
      component.ngOnChanges({
        visible: new SimpleChange(false, true, true),
      });

      expect(component.isRoleSelected('OPERATOR')).toBe(true);
      expect(component.isRoleSelected('ADMIN')).toBe(false);
      expect(component.isRoleSelected('STAFF')).toBe(false);
      expect(component.hasChanges).toBe(false);
    });
  });

  describe('Role Toggle and Diff Calculation', () => {
    beforeEach(() => {
      component.visible = true;
      component.ngOnChanges({
        visible: new SimpleChange(false, true, true),
      });
      fixture.detectChanges();
    });

    it('should compute added and removed roles diff correctly', () => {
      // Thêm vai trò STAFF
      component.toggleRole('STAFF');
      expect(component.addedRoles).toEqual(['STAFF']);
      expect(component.removedRoles).toEqual([]);
      expect(component.hasChanges).toBe(true);

      // Thêm tiếp vai trò ADMIN
      component.toggleRole('ADMIN');
      expect(component.addedRoles).toContain('STAFF');
      expect(component.addedRoles).toContain('ADMIN');

      // Gỡ bỏ vai trò ban đầu OPERATOR
      component.toggleRole('OPERATOR');
      expect(component.removedRoles).toEqual(['OPERATOR']);
      expect(component.hasChanges).toBe(true);

      // Hoàn tác: Gỡ STAFF, ADMIN và chọn lại OPERATOR -> không còn thay đổi
      component.toggleRole('STAFF');
      component.toggleRole('ADMIN');
      component.toggleRole('OPERATOR');
      expect(component.addedRoles).toEqual([]);
      expect(component.removedRoles).toEqual([]);
      expect(component.hasChanges).toBe(false);
    });

    it('should display token warning box only when hasChanges is true', () => {
      // Ban đầu: hasChanges = false -> không có token-warning-box
      let warningBox = fixture.debugElement.query(By.css('.token-warning-box'));
      expect(warningBox).toBeNull();

      // Thêm role -> hasChanges = true -> token-warning-box xuất hiện
      component.toggleRole('STAFF');
      fixture.detectChanges();

      warningBox = fixture.debugElement.query(By.css('.token-warning-box'));
      expect(warningBox).toBeTruthy();

      // Bỏ role -> khôi phục về trạng thái ban đầu -> token-warning-box biến mất
      component.toggleRole('STAFF');
      fixture.detectChanges();

      warningBox = fixture.debugElement.query(By.css('.token-warning-box'));
      expect(warningBox).toBeNull();
    });
  });

  describe('Submission, Guarding and Event Emission', () => {
    beforeEach(() => {
      component.visible = true;
      component.ngOnChanges({
        visible: new SimpleChange(false, true, true),
      });
      fixture.detectChanges();
    });

    it('should NOT emit saveRoles when there are no changes', () => {
      let emitted = false;
      component.saveRoles.subscribe(() => (emitted = true));

      component.onSave();

      expect(emitted).toBe(false);
    });

    it('should NOT emit saveRoles when submitting is true', () => {
      component.toggleRole('STAFF');
      component.submitting = true;

      let emitted = false;
      component.saveRoles.subscribe(() => (emitted = true));

      component.onSave();

      expect(emitted).toBe(false);
    });

    it('should NOT close dialog when submitting is true', () => {
      component.submitting = true;

      let emittedVisible: boolean | null = null;
      component.visibleChange.subscribe((v) => (emittedVisible = v));

      component.onCancel();
      expect(emittedVisible).toBeNull();

      component.onVisibleChange(false);
      expect(emittedVisible).toBeNull();
      expect(component.visible).toBe(true);
    });

    it('should emit saveRoles event with updated roles list upon valid save', () => {
      component.toggleRole('ADMIN');

      let emittedData: { userId: string; roleCodes: string[] } | null = null;
      component.saveRoles.subscribe((data) => {
        emittedData = data;
      });

      component.onSave();

      expect(emittedData).toBeTruthy();
      expect(emittedData!.userId).toBe('u-1');
      expect(emittedData!.roleCodes).toContain('ADMIN');
      expect(emittedData!.roleCodes).toContain('OPERATOR');
      expect(emittedData!.roleCodes.length).toBe(2);
    });

    it('should safely do nothing on save if user is null', () => {
      component.user = null;
      component.toggleRole('ADMIN');

      let emitted = false;
      component.saveRoles.subscribe(() => (emitted = true));

      component.onSave();

      expect(emitted).toBe(false);
    });
  });

  describe('Edge Cases and Large Role Sets', () => {
    it('should handle user with undefined/empty roles gracefully', () => {
      const userWithoutRoles: User = {
        ...mockUser,
        roles: [],
      };
      component.user = userWithoutRoles;
      component.visible = true;
      component.ngOnChanges({
        visible: new SimpleChange(false, true, true),
      });

      expect(component.selectedRoleCodes.size).toBe(0);
      expect(component.hasChanges).toBe(false);

      component.toggleRole('ADMIN');
      expect(component.addedRoles).toEqual(['ADMIN']);
      expect(component.removedRoles).toEqual([]);
      expect(component.hasChanges).toBe(true);
    });

    it('should handle toggling roles via clicking role-item container', () => {
      component.visible = true;
      component.ngOnChanges({
        visible: new SimpleChange(false, true, true),
      });
      fixture.detectChanges();

      const roleItems = fixture.debugElement.queryAll(By.css('.role-item'));
      expect(roleItems.length).toBe(3);

      // Click role ADMIN (index 0)
      roleItems[0].nativeElement.click();
      fixture.detectChanges();

      expect(component.isRoleSelected('ADMIN')).toBe(true);
      expect(component.hasChanges).toBe(true);
    });
  });
});
