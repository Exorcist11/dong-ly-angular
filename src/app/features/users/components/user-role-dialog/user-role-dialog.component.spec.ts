import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserRoleDialogComponent } from './user-role-dialog.component';
import { Role, User } from '../../models/user.model';

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
      isSystem: true,
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

  it('should populate initial user roles when opened', () => {
    component.visible = true;
    component.ngOnChanges({
      visible: {
        currentValue: true,
        previousValue: false,
        firstChange: true,
        isFirstChange: () => true,
      },
    });

    expect(component.isRoleSelected('OPERATOR')).toBe(true);
    expect(component.isRoleSelected('ADMIN')).toBe(false);
    expect(component.hasChanges).toBe(false);
  });

  it('should compute added and removed roles diff correctly', () => {
    component.visible = true;
    component.ngOnChanges({
      visible: {
        currentValue: true,
        previousValue: false,
        firstChange: true,
        isFirstChange: () => true,
      },
    });

    // Thêm vai trò STAFF
    component.toggleRole('STAFF');
    expect(component.addedRoles).toContain('STAFF');
    expect(component.hasChanges).toBe(true);

    // Bỏ vai trò OPERATOR
    component.toggleRole('OPERATOR');
    expect(component.removedRoles).toContain('OPERATOR');
    expect(component.hasChanges).toBe(true);
  });

  it('should emit saveRoles event with updated roles list', () => {
    component.visible = true;
    component.ngOnChanges({
      visible: {
        currentValue: true,
        previousValue: false,
        firstChange: true,
        isFirstChange: () => true,
      },
    });

    component.toggleRole('ADMIN');

    let emittedData: any = null;
    component.saveRoles.subscribe((data) => {
      emittedData = data;
    });

    component.onSave();

    expect(emittedData).toBeTruthy();
    expect(emittedData.userId).toBe('u-1');
    expect(emittedData.roleCodes).toContain('ADMIN');
    expect(emittedData.roleCodes).toContain('OPERATOR');
  });
});
