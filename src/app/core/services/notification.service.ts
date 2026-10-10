import { Injectable, inject, signal } from '@angular/core';
import { MessageService } from 'primeng/api';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface AppNotification {
  id: string;
  type: NotificationType;
  message: string;
  durationMs?: number;
}

/**
 * Service quản lý thông báo Toast/Notification toàn hệ thống.
 * Sử dụng Angular Signals và tích hợp tự động với PrimeNG MessageService.
 */
@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly messageService = inject(MessageService, { optional: true });

  private readonly _notifications = signal<AppNotification[]>([]);
  readonly notifications = this._notifications.asReadonly();

  // Bộ đệm lưu trữ thông báo gần nhất để chống spam trùng lặp (deduplication)
  private lastNotification: {
    type: NotificationType;
    message: string;
    timestamp: number;
  } | null = null;

  show(type: NotificationType, message: string, durationMs = 4000): void {
    if (!message || !message.trim()) {
      return;
    }

    const trimmedMsg = message.trim();
    const now = Date.now();

    // Ngăn chặn thông báo trùng lặp (cùng type và message) xuất hiện liên tiếp trong 1000ms
    if (
      this.lastNotification &&
      this.lastNotification.type === type &&
      this.lastNotification.message === trimmedMsg &&
      now - this.lastNotification.timestamp < 1000
    ) {
      return;
    }
    this.lastNotification = { type, message: trimmedMsg, timestamp: now };

    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const notification: AppNotification = { id, type, message: trimmedMsg, durationMs };

    this._notifications.update((list) => [...list, notification]);

    // Đồng bộ với PrimeNG Toast nếu MessageService có sẵn trong injector
    this.messageService?.add({
      severity: type,
      summary: this.getSummary(type),
      detail: trimmedMsg,
      life: durationMs > 0 ? durationMs : undefined,
    });

    if (durationMs > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, durationMs);
    }
  }

  success(message: string): void {
    this.show('success', message);
  }

  error(message: string): void {
    this.show('error', message, 6000);
  }

  warning(message: string): void {
    this.show('warning', message);
  }

  info(message: string): void {
    this.show('info', message);
  }

  dismiss(id: string): void {
    this._notifications.update((list) => list.filter((n) => n.id !== id));
  }

  clearAll(): void {
    this._notifications.set([]);
    this.messageService?.clear();
  }

  private getSummary(type: NotificationType): string {
    switch (type) {
      case 'success':
        return 'Thành công';
      case 'error':
        return 'Lỗi';
      case 'warning':
        return 'Cảnh báo';
      case 'info':
        return 'Thông tin';
    }
  }
}
