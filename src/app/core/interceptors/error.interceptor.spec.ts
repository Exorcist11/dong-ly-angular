import { TestBed } from '@angular/core/testing';
import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
  HttpContext,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import {
  errorInterceptor,
  SKIP_ERROR_NOTIFICATION,
} from './error.interceptor';
import { NotificationService } from '../services/notification.service';

describe('errorInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let notificationService: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        NotificationService,
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    notificationService = TestBed.inject(NotificationService);
    vi.spyOn(notificationService, 'error');
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should display error toast with backend message on HTTP 400', () => {
    const errorMsg = 'Tài xế chính và phụ xe mặc định không được là cùng một người';

    http.get('/api/v1/test').subscribe({
      next: () => expect.fail('Should not succeed'),
      error: (err) => {
        expect(err.status).toBe(400);
        expect(err.handledByInterceptor).toBe(true);
        expect(err.userFriendlyMessage).toBe(errorMsg);
      },
    });

    const req = httpMock.expectOne('/api/v1/test');
    req.flush({ message: errorMsg }, { status: 400, statusText: 'Bad Request' });

    expect(notificationService.error).toHaveBeenCalledWith(errorMsg);
  });

  it('should NOT display error toast when SKIP_ERROR_NOTIFICATION is set to true', () => {
    http.get('/api/v1/test', {
      context: new HttpContext().set(SKIP_ERROR_NOTIFICATION, true),
    }).subscribe({
      next: () => expect.fail('Should not succeed'),
      error: (err) => {
        expect(err.handledByInterceptor).toBe(false);
      },
    });

    const req = httpMock.expectOne('/api/v1/test');
    req.flush({ message: 'Custom error' }, { status: 400, statusText: 'Bad Request' });

    expect(notificationService.error).not.toHaveBeenCalled();
  });

  it('should bypass 401 error without displaying toast (handled by authInterceptor)', () => {
    http.get('/api/v1/test').subscribe({
      next: () => expect.fail('Should not succeed'),
      error: (err) => {
        expect(err.status).toBe(401);
      },
    });

    const req = httpMock.expectOne('/api/v1/test');
    req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    expect(notificationService.error).not.toHaveBeenCalled();
  });
});
