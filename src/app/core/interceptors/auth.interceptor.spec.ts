import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { authInterceptor } from './auth.interceptor';
import { TokenStorageService } from '../auth/token-storage.service';
import { AuthService } from '../auth/auth.service';

describe('authInterceptor', () => {
  let httpClient: HttpClient;
  let httpTesting: HttpTestingController;
  let tokenStorage: TokenStorageService;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        TokenStorageService,
        AuthService,
        { provide: Router, useValue: { navigate: () => Promise.resolve(true) } },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
    tokenStorage = TestBed.inject(TokenStorageService);
  });

  afterEach(() => {
    httpTesting.verify();
    localStorage.clear();
  });

  it('should attach Bearer token to requests when token exists', () => {
    tokenStorage.saveTokens({
      accessToken: 'test_token_123',
      refreshToken: 'test_refresh_123',
      tokenType: 'Bearer',
      expiresIn: 3600,
    });

    httpClient.get('/api/v1/users').subscribe();

    const req = httpTesting.expectOne('/api/v1/users');
    expect(req.request.headers.has('Authorization')).toBe(true);
    expect(req.request.headers.get('Authorization')).toBe('Bearer test_token_123');
    req.flush({});
  });

  it('should not attach Authorization header if no token exists', () => {
    tokenStorage.clearTokens();

    httpClient.get('/api/v1/users').subscribe();

    const req = httpTesting.expectOne('/api/v1/users');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('should not attach Authorization header to public auth endpoints', () => {
    tokenStorage.saveTokens({
      accessToken: 'test_token_123',
      refreshToken: 'test_refresh_123',
      tokenType: 'Bearer',
      expiresIn: 3600,
    });

    httpClient.post('/api/v1/auth/login', { username: 'test' }).subscribe();

    const req = httpTesting.expectOne('/api/v1/auth/login');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });
});
