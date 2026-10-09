import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, map, of, switchMap, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { LoginRequest, RefreshTokenRequest, TokenResponse, UserProfile } from './auth.model';
import { TokenStorageService } from './token-storage.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly router = inject(Router);

  private readonly API_BASE = `${environment.apiBaseUrl}/auth`;

  private readonly _currentUser = signal<UserProfile | null>(null);
  readonly currentUser = this._currentUser.asReadonly();

  readonly isAuthenticated = computed(() => !!this._currentUser() && this.tokenStorage.hasToken());
  readonly roles = computed(() => this._currentUser()?.roles ?? []);
  readonly permissions = computed(() => this._currentUser()?.permissions ?? []);

  /**
   * Đăng nhập 2 bước chuẩn:
   * 1. POST /api/v1/auth/login lấy cặp token
   * 2. Lưu token vào Storage
   * 3. Gọi GET /api/v1/auth/me để lấy profile và quyền
   */
  login(credentials: LoginRequest): Observable<UserProfile> {
    return this.http
      .post<ApiResponse<TokenResponse>>(`${this.API_BASE}/login`, credentials)
      .pipe(
        tap((res) => {
          this.tokenStorage.saveTokens(res.data);
        }),
        switchMap(() => this.fetchCurrentUser())
      );
  }

  /**
   * Lấy hồ sơ người dùng hiện tại kèm danh sách roles và permissions.
   */
  fetchCurrentUser(): Observable<UserProfile> {
    const accessToken = this.tokenStorage.getAccessToken();
    if (!accessToken) {
      this._currentUser.set(null);
      return throwError(() => new Error('Không tìm thấy Access Token'));
    }

    return this.http.get<ApiResponse<UserProfile>>(`${this.API_BASE}/me`).pipe(
      map((res) => res.data),
      tap((user) => this._currentUser.set(user)),
      catchError((err) => {
        this._currentUser.set(null);
        return throwError(() => err);
      })
    );
  }

  /**
   * Thực hiện xoay vòng Refresh Token.
   */
  refreshToken(): Observable<TokenResponse> {
    const refreshToken = this.tokenStorage.getRefreshToken();
    if (!refreshToken) {
      this.clearSession();
      return throwError(() => new Error('Không tìm thấy Refresh Token'));
    }

    const payload: RefreshTokenRequest = { refreshToken };
    return this.http
      .post<ApiResponse<TokenResponse>>(`${this.API_BASE}/refresh`, payload)
      .pipe(
        map((res) => res.data),
        tap((newTokens) => {
          this.tokenStorage.saveTokens(newTokens);
        }),
        catchError((err) => {
          this.clearSession();
          return throwError(() => err);
        })
      );
  }

  /**
   * Đăng xuất tài khoản an toàn và dọn dẹp session.
   */
  logout(): Observable<void> {
    const refreshToken = this.tokenStorage.getRefreshToken();
    const cleanup = () => {
      this.clearSession();
      void this.router.navigate(['/auth/login']);
    };

    if (!refreshToken) {
      cleanup();
      return of(undefined);
    }

    return this.http
      .post<ApiResponse<void>>(`${this.API_BASE}/logout`, { refreshToken })
      .pipe(
        map(() => undefined),
        catchError(() => of(undefined)),
        tap(cleanup)
      );
  }

  hasPermission(permission: string): boolean {
    return this.permissions().includes(permission);
  }

  hasAnyPermission(permissions: string[]): boolean {
    const userPermissions = this.permissions();
    return permissions.some((p) => userPermissions.includes(p));
  }

  hasRole(role: string): boolean {
    return this.roles().includes(role);
  }

  private clearSession(): void {
    this.tokenStorage.clearTokens();
    this._currentUser.set(null);
  }
}
