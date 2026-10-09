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
});
