import {
  HttpContext,
  HttpContextToken,
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { ApiErrorResponse } from '../models/api-response.model';
import { NotificationService } from '../services/notification.service';

/**
 * HttpContextToken cho phép request bỏ qua toast thông báo lỗi toàn cục
 * (dành cho các form hoặc component cần xử lý lỗi cục bộ riêng biệt).
 */
export const SKIP_ERROR_NOTIFICATION = new HttpContextToken<boolean>(() => false);

export function skipErrorNotification(): HttpContext {
  return new HttpContext().set(SKIP_ERROR_NOTIFICATION, true);
}

/**
 * Functional HTTP Interceptor chuẩn hóa xử lý lỗi từ Spring-BE / Go REST API.
 * Bắt cấu trúc ApiErrorResponse và hiển thị thông báo thân thiện.
 */
export const errorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        // Bỏ qua lỗi 401 vì authInterceptor đã xử lý refresh hoặc redirect
        if (error.status === 401) {
          return throwError(() => error);
        }

        let userMessage = 'Đã có lỗi xảy ra. Vui lòng thử lại sau.';

        if (error.error && typeof error.error === 'object') {
          const apiError = error.error as Partial<ApiErrorResponse>;
          if (apiError.message) {
            userMessage = apiError.message;
          }
        } else if (error.status === 0) {
          userMessage = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng.';
        } else if (error.status === 403) {
          userMessage = 'Bạn không có quyền thực hiện thao tác này.';
        } else if (error.status === 404) {
          userMessage = 'Không tìm thấy tài nguyên yêu cầu.';
        } else if (error.status >= 500) {
          userMessage = 'Lỗi hệ thống máy chủ (500). Vui lòng liên hệ quản trị viên.';
        }

        const shouldNotify = !req.context.get(SKIP_ERROR_NOTIFICATION);
        if (shouldNotify) {
          notificationService.error(userMessage);
        }

        // Gắn cờ lên đối tượng error để caller có thể kiểm tra nếu cần
        Object.assign(error, {
          handledByInterceptor: shouldNotify,
          userFriendlyMessage: userMessage,
        });
      }

      return throwError(() => error);
    })
  );
};
