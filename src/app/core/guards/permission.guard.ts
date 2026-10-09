import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { NotificationService } from '../services/notification.service';

/**
 * Route Guard kiểm tra quyền hạn (Role / Permission) đối với từng module quản trị.
 * Dữ liệu yêu cầu được truyền qua route data: { permission: 'USER_READ' } hoặc { role: 'ADMIN' }
 */
export const permissionGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notificationService = inject(NotificationService);

  const requiredPermission = route.data['permission'] as string | undefined;
  const requiredRole = route.data['role'] as string | undefined;

  if (requiredPermission && !authService.hasPermission(requiredPermission)) {
    notificationService.warning('Bạn không có quyền truy cập vào chức năng này.');
    return router.createUrlTree(['/dashboard']);
  }

  if (requiredRole && !authService.hasRole(requiredRole)) {
    notificationService.warning('Yêu cầu vai trò quản trị phù hợp để truy cập.');
    return router.createUrlTree(['/dashboard']);
  }

  return true;
};
