import { Injectable, signal } from '@angular/core';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface AppNotification {
  id: string;
  type: NotificationType;
  message: string;
  durationMs?: number;
}

/**
 * Service quản lý thông báo Toast/Notification toàn hệ thống.
 * Sử dụng Angular Signals để tối ưu hiệu năng reactivity.
 */
@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly _notifications = signal<AppNotification[]>([]);
  readonly notifications = this._notifications.asReadonly();

  show(type: NotificationType, message: string, durationMs = 4000): void {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const notification: AppNotification = { id, type, message, durationMs };

    this._notifications.update((list) => [...list, notification]);

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
  }
}
