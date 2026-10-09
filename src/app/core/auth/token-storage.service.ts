import { Injectable, signal } from '@angular/core';
import { TokenResponse } from './auth.model';

const ACCESS_TOKEN_KEY = 'dongly_access_token';
const REFRESH_TOKEN_KEY = 'dongly_refresh_token';

/**
 * Service quản lý lưu trữ và truy xuất JWT Token an toàn.
 * Đơn nhiệm (Single Responsibility): Chỉ chịu trách nhiệm về Token Storage.
 */
@Injectable({
  providedIn: 'root',
})
export class TokenStorageService {
  private readonly _hasToken = signal<boolean>(this.checkHasToken());
  readonly hasToken = this._hasToken.asReadonly();

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  saveTokens(tokenResponse: TokenResponse): void {
    if (tokenResponse.accessToken) {
      localStorage.setItem(ACCESS_TOKEN_KEY, tokenResponse.accessToken);
    }
    if (tokenResponse.refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, tokenResponse.refreshToken);
    }
    this._hasToken.set(true);
  }

  clearTokens(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    this._hasToken.set(false);
  }

  private checkHasToken(): boolean {
    return !!localStorage.getItem(ACCESS_TOKEN_KEY);
  }
}
