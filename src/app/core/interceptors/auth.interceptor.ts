import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { TokenStorageService } from '../auth/token-storage.service';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

/**
 * Functional HTTP Interceptor quản lý xác thực:
 * 1. Gắn Bearer Token vào Header cho các request cần xác thực.
 * 2. Xử lý lỗi 401 với cơ chế Mutex / Subject Queue chống race-condition khi token hết hạn.
 */
export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const tokenStorage = inject(TokenStorageService);
  const authService = inject(AuthService);

  // Bỏ qua các endpoint auth không cần xử lý refresh hoặc gắn token lặp
  const isAuthEndpoint =
    req.url.includes('/api/v1/auth/login') ||
    req.url.includes('/api/v1/auth/refresh') ||
    req.url.includes('/api/v1/auth/logout');
  const token = tokenStorage.getAccessToken();

  let authReq = req;
  if (token && !isAuthEndpoint) {
    authReq = addTokenHeader(req, token);
  }

  return next(authReq).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401 && !isAuthEndpoint) {
        return handle401Error(authReq, next, authService, tokenStorage);
      }
      return throwError(() => error);
    })
  );
};

function addTokenHeader(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
}

function handle401Error(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService,
  tokenStorage: TokenStorageService
): Observable<HttpEvent<unknown>> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refreshToken().pipe(
      switchMap((tokenResponse) => {
        isRefreshing = false;
        refreshTokenSubject.next(tokenResponse.accessToken);
        return next(addTokenHeader(req, tokenResponse.accessToken));
      }),
      catchError((err: unknown) => {
        isRefreshing = false;
        authService.logout().subscribe();
        return throwError(() => err);
      })
    );
  }

  // Đang có tiến trình refresh token chạy -> đưa request vào queue đợi
  return refreshTokenSubject.pipe(
    filter((token): token is string => token !== null),
    take(1),
    switchMap((token) => next(addTokenHeader(req, token)))
  );
}
