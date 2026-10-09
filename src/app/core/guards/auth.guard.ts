import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { TokenStorageService } from '../auth/token-storage.service';

/**
 * Route Guard bảo vệ các tuyến quản trị yêu cầu đăng nhập.
 * Hỗ trợ khôi phục session khi người dùng tải lại trang (F5).
 */
export const authGuard: CanActivateFn = (route, state) => {
  const tokenStorage = inject(TokenStorageService);
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = tokenStorage.getAccessToken();

  if (!token) {
    return router.createUrlTree(['/auth/login'], {
      queryParams: { returnUrl: state.url },
    });
  }

  // Nếu đã có thông tin user trong memory
  if (authService.currentUser()) {
    return true;
  }

  // Khôi phục profile người dùng từ token lưu trữ
  return authService.fetchCurrentUser().pipe(
    map(() => true),
    catchError(() => {
      tokenStorage.clearTokens();
      return of(
        router.createUrlTree(['/auth/login'], {
          queryParams: { returnUrl: state.url },
        })
      );
    })
  );
};
