import {
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
 * Functional HTTP Interceptor chuẩn hóa xử lý lỗi từ Spring-BE.
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

        notificationService.error(userMessage);
      }

      return throwError(() => error);
    })
  );
};
