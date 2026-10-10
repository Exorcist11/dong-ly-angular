import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { UserListPageComponent } from './user-list-page.component';
import { UserService } from '../../services/user.service';
import { RoleService } from '../../services/role.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { User } from '../../models/user.model';
import { PageResponse } from '../../../../core/models/api-response.model';

import { provideRouter } from '@angular/router';

describe('UserListPageComponent', () => {
  let component: UserListPageComponent;
  let fixture: ComponentFixture<UserListPageComponent>;
  let userService: any;
  let roleService: any;

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

  const mockPageResponse: PageResponse<User> = {
    success: true,
    message: 'Thành công',
    data: {
      items: [mockUser],
      pagination: {
        page: 0,
        size: 10,
        totalElements: 1,
        totalPages: 1,
        isFirst: true,
        isLast: true,
      },
    },
    timestamp: '',
  };

  beforeEach(async () => {
    userService = {
      getUsers: () => of(mockPageResponse),
      createUser: () => of({ success: true }),
      updateUser: () => of({ success: true }),
      updateUserStatus: () => of({ success: true }),
      updateUserRoles: () => of({ success: true }),
    };

    roleService = {
      getActiveRoles: () =>
        of({
          success: true,
          data: {
            items: [
              {
                id: 'r-1',
                code: 'OPERATOR',
                name: 'Điều hành',
                status: 'ACTIVE',
                isSystem: true,
              },
            ],
          },
        }),
    };

    await TestBed.configureTestingModule({
      imports: [UserListPageComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: UserService, useValue: userService },
        { provide: RoleService, useValue: roleService },
        AuthService,
        NotificationService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create user list page component', () => {
    expect(component).toBeTruthy();
  });

  it('should load users and roles on init', () => {
    expect(component.users().length).toBe(1);
    expect(component.totalRecords()).toBe(1);
    expect(component.availableRoles().length).toBe(1);
  });

  it('should filter displayed users by search term', () => {
    component.onSearchChange('nguyen');
    expect(component.displayedUsers().length).toBe(1);

    component.onSearchChange('khong_ton_tai');
    expect(component.displayedUsers().length).toBe(0);
  });

  it('should filter displayed users by status', () => {
    component.onStatusChange('ACTIVE');
    expect(component.displayedUsers().length).toBe(1);

    component.onStatusChange('LOCKED');
    expect(component.displayedUsers().length).toBe(0);
  });

  it('should open and close create dialog', () => {
    component.openCreateDialog();
    expect(component.isFormDialogOpen()).toBe(true);
    expect(component.selectedUser()).toBeNull();

    component.onFormDialogVisibleChange(false);
    expect(component.isFormDialogOpen()).toBe(false);
  });

  it('should open edit dialog with selected user', () => {
    component.openEditDialog(mockUser);
    expect(component.isFormDialogOpen()).toBe(true);
    expect(component.selectedUser()).toEqual(mockUser);
  });

  it('should open role dialog with selected user', () => {
    component.openRoleDialog(mockUser);
    expect(component.isRoleDialogOpen()).toBe(true);
    expect(component.selectedUser()).toEqual(mockUser);
  });

  it('should prepare status confirmation modal when toggling status', () => {
    component.confirmToggleStatus(mockUser);
    expect(component.isConfirmStatusModalOpen()).toBe(true);
    expect(component.statusTargetUser()).toEqual(mockUser);
    expect(component.statusModalConfig().targetStatus).toBe('LOCKED');
  });
});
