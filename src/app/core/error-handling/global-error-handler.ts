import { ErrorHandler, Injectable, inject, isDevMode } from '@angular/core';
import { NotificationService } from '../services/notification.service';

/**
 * Global Error Handler bắt các lỗi runtime chưa được xử lý của Angular.
 * Ngăn chặn ứng dụng bị crash trắng trang và hiển thị thông báo thân thiện.
 */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly notificationService = inject(NotificationService);

  handleError(error: unknown): void {
    if (isDevMode()) {
      console.error('[Uncaught Application Error]:', error);
    }

    // Không spam thông báo nếu lỗi là HttpError (đã được errorInterceptor xử lý)
    const errorString = String(error);
    if (!errorString.includes('HttpErrorResponse')) {
      this.notificationService.error(
        'Đã phát sinh sự cố giao diện không mong muốn. Vui lòng tải lại trang nếu cần.'
      );
    }
  }
}
