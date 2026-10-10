import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { UserService } from './user.service';
import {
  CreateUserRequest,
  Role,
  UpdateUserRequest,
  UpdateUserRolesRequest,
  UpdateUserStatusRequest,
  User,
} from '../models/user.model';
import { ApiResponse, PageResponse } from '../../../core/models/api-response.model';

describe('UserService', () => {
  let service: UserService;
  let httpTesting: HttpTestingController;

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

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), UserService],
    });

    service = TestBed.inject(UserService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch users list with pagination and sort', () => {
    const mockPageResponse: PageResponse<User> = {
      success: true,
      message: 'Lấy danh sách người dùng thành công',
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
      timestamp: new Date().toISOString(),
    };

    service.getUsers(0, 10, 'createdAt,desc').subscribe((res) => {
      expect(res.data.items.length).toBe(1);
      expect(res.data.items[0].username).toBe('nguyenvana');
      expect(res.data.pagination.totalElements).toBe(1);
    });

    const req = httpTesting.expectOne((r) => r.url.endsWith('/users') && r.params.has('page'));
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('page')).toBe('0');
    expect(req.request.params.get('size')).toBe('10');
    expect(req.request.params.get('sort')).toBe('createdAt,desc');

    req.flush(mockPageResponse);
  });

  it('should fetch user details by ID', () => {
    const mockApiResponse: ApiResponse<User> = {
      success: true,
      message: 'Thành công',
      data: mockUser,
      timestamp: new Date().toISOString(),
    };

    service.getUserById('u-1').subscribe((res) => {
      expect(res.data).toEqual(mockUser);
    });

    const req = httpTesting.expectOne((r) => r.url.endsWith('/users/u-1'));
    expect(req.request.method).toBe('GET');
    req.flush(mockApiResponse);
  });

  it('should create new user', () => {
    const payload: CreateUserRequest = {
      username: 'tranb',
      email: 'b@dongly.vn',
      password: 'password123',
      fullName: 'Trần B',
      phone: '0912345678',
      roleCodes: ['STAFF'],
    };

    const mockApiResponse: ApiResponse<User> = {
      success: true,
      message: 'Tạo thành công',
      data: { ...mockUser, id: 'u-2', username: 'tranb' },
      timestamp: new Date().toISOString(),
    };

    service.createUser(payload).subscribe((res) => {
      expect(res.data.username).toBe('tranb');
    });

    const req = httpTesting.expectOne((r) => r.url.endsWith('/users'));
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(mockApiResponse);
  });

  it('should update user information', () => {
    const payload: UpdateUserRequest = {
      fullName: 'Nguyễn Văn A Updated',
      email: 'a.new@dongly.vn',
      phone: '0987654321',
      roleCodes: ['OPERATOR'],
    };

    service.updateUser('u-1', payload).subscribe((res) => {
      expect(res.success).toBe(true);
    });

    const req = httpTesting.expectOne((r) => r.url.endsWith('/users/u-1'));
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);
    req.flush({ success: true, message: 'Updated', data: mockUser, timestamp: '' });
  });

  it('should update user status', () => {
    const payload: UpdateUserStatusRequest = { status: 'LOCKED' };

    service.updateUserStatus('u-1', payload).subscribe((res) => {
      expect(res.success).toBe(true);
    });

    const req = httpTesting.expectOne((r) => r.url.endsWith('/users/u-1/status'));
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(payload);
    req.flush({ success: true, message: 'Status updated', data: mockUser, timestamp: '' });
  });

  it('should update user roles', () => {
    const payload: UpdateUserRolesRequest = { roleCodes: ['ADMIN', 'OPERATOR'] };
    const mockRoles: Role[] = [
      {
        id: 'r-1',
        code: 'ADMIN',
        name: 'Quản trị viên',
        description: null,
        status: 'ACTIVE',
        isSystem: true,
        permissionCount: 10,
        createdAt: '',
      },
    ];

    service.updateUserRoles('u-1', payload).subscribe((res) => {
      expect(res.data.length).toBe(1);
    });

    const req = httpTesting.expectOne((r) => r.url.endsWith('/users/u-1/roles'));
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);
    req.flush({ success: true, message: 'Roles updated', data: mockRoles, timestamp: '' });
  });
});
