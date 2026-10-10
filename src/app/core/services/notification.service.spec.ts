import { TestBed } from '@angular/core/testing';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationService);
    service.clearAll();
  });

  it('should add notifications correctly', () => {
    service.success('Thao tác thành công');

    const notifications = service.notifications();
    expect(notifications.length).toBe(1);
    expect(notifications[0].type).toBe('success');
    expect(notifications[0].message).toBe('Thao tác thành công');
  });

  it('should dismiss notification by id', () => {
    service.show('error', 'Có lỗi xảy ra', 0);
    const notifications = service.notifications();
    expect(notifications.length).toBe(1);

    service.dismiss(notifications[0].id);
    expect(service.notifications().length).toBe(0);
  });

  it('should ignore duplicate notifications within 1000ms', () => {
    service.error('Lỗi kết nối máy chủ');
    service.error('Lỗi kết nối máy chủ');

    const notifications = service.notifications();
    expect(notifications.length).toBe(1);
    expect(notifications[0].message).toBe('Lỗi kết nối máy chủ');
  });

  it('should allow different messages or different types within same timeframe', () => {
    service.error('Lỗi thứ nhất');
    service.error('Lỗi thứ hai');
    service.info('Lỗi thứ nhất');

    expect(service.notifications().length).toBe(3);
  });

  it('should ignore empty or whitespace-only messages', () => {
    service.show('error', '   ');
    expect(service.notifications().length).toBe(0);
  });
});
