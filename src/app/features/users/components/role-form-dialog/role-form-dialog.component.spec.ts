import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RoleFormDialogComponent } from './role-form-dialog.component';
import { Role } from '../../models/user.model';
import { SimpleChange } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('RoleFormDialogComponent', () => {
  let component: RoleFormDialogComponent;
  let fixture: ComponentFixture<RoleFormDialogComponent>;

  const mockRole: Role = {
    id: 'role-1',
    code: 'CUSTOM_ROLE',
    name: 'Nhân viên bán vé',
    description: 'Chỉ được bán vé và xem chuyến',
    status: 'ACTIVE',
    isSystem: false,
    permissionCount: 5,
    createdAt: '2026-03-01T08:00:00Z',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoleFormDialogComponent, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(RoleFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('nên khởi tạo component thành công', () => {
    expect(component).toBeTruthy();
    expect(component.roleForm).toBeDefined();
    expect(component.isEditMode).toBe(false);
  });

  it('nên reset form khi ở chế độ tạo mới', () => {
    component.role = null;
    component.visible = true;
    component.ngOnChanges({
      visible: new SimpleChange(false, true, true),
    });

    expect(component.isEditMode).toBe(false);
    expect(component.roleForm.get('code')?.enabled).toBe(true);
    expect(component.roleForm.get('code')?.value).toBe('');
  });

  it('nên điền dữ liệu và disable trường mã khi ở chế độ chỉnh sửa', () => {
    component.role = mockRole;
    component.visible = true;
    component.ngOnChanges({
      visible: new SimpleChange(false, true, true),
    });

    expect(component.isEditMode).toBe(true);
    expect(component.roleForm.get('code')?.value).toBe('CUSTOM_ROLE');
    expect(component.roleForm.get('code')?.disabled).toBe(true);
    expect(component.roleForm.get('name')?.value).toBe('Nhân viên bán vé');
    expect(component.roleForm.get('description')?.value).toBe('Chỉ được bán vé và xem chuyến');
  });

  it('nên emit sự kiện save khi form tạo mới hợp lệ', () => {
    component.role = null;
    component.visible = true;
    component.ngOnChanges({ visible: new SimpleChange(false, true, true) });

    const emitSpy = vi.spyOn(component.save, 'emit');

    component.roleForm.patchValue({
      code: 'DISPATCHER',
      name: 'Điều hành viên',
      description: 'Điều phối lịch xe',
    });

    component.onSubmit();

    expect(emitSpy).toHaveBeenCalledWith({
      code: 'DISPATCHER',
      name: 'Điều hành viên',
      description: 'Điều phối lịch xe',
    });
  });

  it('nên emit sự kiện save khi form cập nhật hợp lệ (không chứa code)', () => {
    component.role = mockRole;
    component.visible = true;
    component.ngOnChanges({ visible: new SimpleChange(false, true, true) });

    const emitSpy = vi.spyOn(component.save, 'emit');

    component.roleForm.patchValue({
      name: 'Nhân viên bán vé cập nhật',
      description: 'Mô tả mới',
    });

    component.onSubmit();

    expect(emitSpy).toHaveBeenCalledWith({
      name: 'Nhân viên bán vé cập nhật',
      description: 'Mô tả mới',
    });
  });

  it('không nên emit sự kiện save khi form không hợp lệ', () => {
    component.role = null;
    component.visible = true;
    component.ngOnChanges({ visible: new SimpleChange(false, true, true) });

    const emitSpy = vi.spyOn(component.save, 'emit');

    component.roleForm.patchValue({
      code: '',
      name: '',
    });

    component.onSubmit();

    expect(emitSpy).not.toHaveBeenCalled();
    expect(component.roleForm.touched).toBe(true);
  });

  it('không nên emit sự kiện save khi đang submitting = true', () => {
    component.role = null;
    component.visible = true;
    component.submitting = true;
    component.ngOnChanges({ visible: new SimpleChange(false, true, true) });

    const emitSpy = vi.spyOn(component.save, 'emit');

    component.roleForm.patchValue({
      code: 'DISPATCHER',
      name: 'Điều hành viên',
    });

    component.onSubmit();

    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('nên phát visibleChange(false) khi gọi onClose()', () => {
    const emitSpy = vi.spyOn(component.visibleChange, 'emit');
    component.onClose();
    expect(emitSpy).toHaveBeenCalledWith(false);
  });

  it('nên chuẩn hóa mã vai trò thành in hoa khi nhập onCodeInput', () => {
    component.role = null;
    const inputMock = { value: 'role manager test' } as unknown as HTMLInputElement;
    const eventMock = { target: inputMock } as unknown as Event;

    component.onCodeInput(eventMock);

    expect(component.roleForm.get('code')?.value).toBe('ROLE_MANAGER_TEST');
  });
});
