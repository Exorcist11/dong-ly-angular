import { TestBed } from '@angular/core/testing';
import { TokenStorageService } from './token-storage.service';
import { TokenResponse } from './auth.model';

describe('TokenStorageService', () => {
  let service: TokenStorageService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(TokenStorageService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should save and retrieve tokens correctly', () => {
    const mockToken: TokenResponse = {
      accessToken: 'access_123',
      refreshToken: 'refresh_456',
      tokenType: 'Bearer',
      expiresIn: 1800,
    };

    service.saveTokens(mockToken);

    expect(service.getAccessToken()).toBe('access_123');
    expect(service.getRefreshToken()).toBe('refresh_456');
    expect(service.hasToken()).toBe(true);
  });

  it('should clear tokens correctly', () => {
    const mockToken: TokenResponse = {
      accessToken: 'access_123',
      refreshToken: 'refresh_456',
      tokenType: 'Bearer',
      expiresIn: 1800,
    };

    service.saveTokens(mockToken);
    service.clearTokens();

    expect(service.getAccessToken()).toBeNull();
    expect(service.getRefreshToken()).toBeNull();
    expect(service.hasToken()).toBe(false);
  });
});
