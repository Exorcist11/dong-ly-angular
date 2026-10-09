import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';
import { TokenStorageService } from './token-storage.service';
import { ApiResponse } from '../models/api-response.model';
import { TokenResponse, UserProfile } from './auth.model';

describe('AuthService', () => {
  let service: AuthService;
  let httpTesting: HttpTestingController;
  let tokenStorage: TokenStorageService;
  let router: { navigate: any };

  const mockTokenResponse: TokenResponse = {
    accessToken: 'test_access_token',
    refreshToken: 'test_refresh_token',
    tokenType: 'Bearer',
    expiresIn: 3600,
  };

  const mockUserProfile: UserProfile = {
    id: 'user_1',
    username: 'admin',
    email: 'admin@dongly.vn',
    fullName: 'Quản Trị Viên',
    phone: '0987654321',
    status: 'ACTIVE',
    roles: ['ROLE_ADMIN'],
    permissions: ['TRIP_READ', 'USER_MANAGE'],
    createdAt: '2026-01-01T00:00:00Z',
  };

  beforeEach(() => {
    localStorage.clear();
    router = {
      navigate: () => Promise.resolve(true),
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        AuthService,
        TokenStorageService,
        { provide: Router, useValue: router },
      ],
    });

    service = TestBed.inject(AuthService);
    httpTesting = TestBed.inject(HttpTestingController);
    tokenStorage = TestBed.inject(TokenStorageService);
  });

  afterEach(() => {
    httpTesting.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
    expect(service.currentUser()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });

  it('should perform 2-step login: authenticate then fetch profile', () => {
    service.login({ username: 'admin', password: 'password123' }).subscribe((user) => {
      expect(user).toEqual(mockUserProfile);
      expect(service.currentUser()).toEqual(mockUserProfile);
      expect(service.isAuthenticated()).toBe(true);
      expect(service.hasRole('ROLE_ADMIN')).toBe(true);
      expect(service.hasPermission('TRIP_READ')).toBe(true);
      expect(service.hasAnyPermission(['TRIP_READ', 'UNKNOWN'])).toBe(true);
    });

    // Step 1: POST /login
    const loginReq = httpTesting.expectOne((req) => req.url.endsWith('/auth/login'));
    expect(loginReq.request.method).toBe('POST');
    expect(loginReq.request.body).toEqual({ username: 'admin', password: 'password123' });

    loginReq.flush({
      success: true,
      message: 'Đăng nhập thành công',
      data: mockTokenResponse,
      timestamp: new Date().toISOString(),
    } as ApiResponse<TokenResponse>);

    // Tokens should be stored
    expect(tokenStorage.getAccessToken()).toBe('test_access_token');
    expect(tokenStorage.getRefreshToken()).toBe('test_refresh_token');

    // Step 2: GET /me
    const meReq = httpTesting.expectOne((req) => req.url.endsWith('/auth/me'));
    expect(meReq.request.method).toBe('GET');

    meReq.flush({
      success: true,
      message: 'Lấy thông tin thành công',
      data: mockUserProfile,
      timestamp: new Date().toISOString(),
    } as ApiResponse<UserProfile>);
  });

  it('should fail fetchCurrentUser if no access token exists', async () => {
    tokenStorage.clearTokens();

    await expect(firstValueFrom(service.fetchCurrentUser())).rejects.toThrow(
      'Không tìm thấy Access Token'
    );
    expect(service.currentUser()).toBeNull();
  });

  it('should refresh token successfully and update storage', () => {
    tokenStorage.saveTokens(mockTokenResponse);

    const newTokens: TokenResponse = {
      accessToken: 'new_access_token',
      refreshToken: 'new_refresh_token',
      tokenType: 'Bearer',
      expiresIn: 3600,
    };

    service.refreshToken().subscribe((tokens) => {
      expect(tokens).toEqual(newTokens);
      expect(tokenStorage.getAccessToken()).toBe('new_access_token');
    });

    const refreshReq = httpTesting.expectOne((req) => req.url.endsWith('/auth/refresh'));
    expect(refreshReq.request.method).toBe('POST');
    expect(refreshReq.request.body).toEqual({ refreshToken: 'test_refresh_token' });

    refreshReq.flush({
      success: true,
      message: 'Xoay vòng token thành công',
      data: newTokens,
      timestamp: new Date().toISOString(),
    } as ApiResponse<TokenResponse>);
  });

  it('should clear tokens and navigate to login on logout', () => {
    tokenStorage.saveTokens(mockTokenResponse);

    service.logout().subscribe(() => {
      expect(tokenStorage.getAccessToken()).toBeNull();
      expect(tokenStorage.getRefreshToken()).toBeNull();
      expect(service.currentUser()).toBeNull();
      expect(service.isAuthenticated()).toBe(false);
    });

    const logoutReq = httpTesting.expectOne((req) => req.url.endsWith('/auth/logout'));
    expect(logoutReq.request.method).toBe('POST');
    expect(logoutReq.request.body).toEqual({ refreshToken: 'test_refresh_token' });

    logoutReq.flush({
      success: true,
      message: 'Đăng xuất thành công',
      data: undefined,
      timestamp: new Date().toISOString(),
    } as ApiResponse<void>);
  });
});
