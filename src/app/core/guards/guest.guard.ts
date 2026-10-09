import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenStorageService } from '../auth/token-storage.service';

/**
 * Route Guard ngăn người dùng đã đăng nhập truy cập lại trang Login (/auth/login).
 * Tự động điều hướng vào /dashboard nếu đã có Token hợp lệ.
 */
export const guestGuard: CanActivateFn = () => {
  const tokenStorage = inject(TokenStorageService);
  const router = inject(Router);

  if (tokenStorage.hasToken()) {
    return router.createUrlTree(['/dashboard']);
  }

  return true;
};
