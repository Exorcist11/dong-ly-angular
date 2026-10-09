import { TestBed } from '@angular/core/testing';
import { Router, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { firstValueFrom, of, throwError } from 'rxjs';
import { authGuard } from './auth.guard';
import { AuthService } from '../auth/auth.service';
import { TokenStorageService } from '../auth/token-storage.service';
import { UserProfile } from '../auth/auth.model';

describe('authGuard', () => {
  let tokenStorage: {
    getAccessToken: () => string | null;
    clearTokens: () => void;
  };
  let authService: {
    currentUser: () => UserProfile | null;
    fetchCurrentUser: () => any;
  };
  let router: {
    createUrlTree: (commands: string[], extras?: any) => any;
  };

  const dummyRoute = {} as ActivatedRouteSnapshot;
  const dummyState = { url: '/dashboard' } as RouterStateSnapshot;

  beforeEach(() => {
    tokenStorage = {
      getAccessToken: () => null,
      clearTokens: () => {},
    };

    authService = {
      currentUser: () => null,
      fetchCurrentUser: () => of({} as UserProfile),
    };

    router = {
      createUrlTree: (commands: string[], extras?: any) => ({
        commands,
        extras,
      }),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: TokenStorageService, useValue: tokenStorage },
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
      ],
    });
  });

  it('should redirect to /auth/login with returnUrl if no access token exists', () => {
    tokenStorage.getAccessToken = () => null;

    const result = TestBed.runInInjectionContext(() => authGuard(dummyRoute, dummyState));
    expect((result as any).commands).toEqual(['/auth/login']);
    expect((result as any).extras).toEqual({ queryParams: { returnUrl: '/dashboard' } });
  });

  it('should allow access immediately if user profile is already in memory', () => {
    tokenStorage.getAccessToken = () => 'valid_token';
    authService.currentUser = () => ({
      id: '1',
      username: 'admin',
      fullName: 'Admin',
      email: 'admin@dongly.com',
      phone: '0901234567',
      status: 'ACTIVE',
      roles: ['ADMIN'],
      permissions: ['ALL'],
      createdAt: '2026-01-01',
    });

    const result = TestBed.runInInjectionContext(() => authGuard(dummyRoute, dummyState));
    expect(result).toBe(true);
  });

  it('should fetch user profile if token exists but no user in memory, and return true on success', async () => {
    tokenStorage.getAccessToken = () => 'valid_token';
    authService.currentUser = () => null;
    authService.fetchCurrentUser = () =>
      of({
        id: '1',
        username: 'admin',
        fullName: 'Admin',
      } as UserProfile);

    const result$ = TestBed.runInInjectionContext(() => authGuard(dummyRoute, dummyState)) as any;
    const val = await firstValueFrom(result$);
    expect(val).toBe(true);
  });

  it('should clear tokens and redirect to /auth/login if fetching user profile fails', async () => {
    let clearTokensCalled = false;
    tokenStorage.getAccessToken = () => 'invalid_token';
    tokenStorage.clearTokens = () => {
      clearTokensCalled = true;
    };
    authService.currentUser = () => null;
    authService.fetchCurrentUser = () => throwError(() => new Error('Invalid token'));

    const result$ = TestBed.runInInjectionContext(() => authGuard(dummyRoute, dummyState)) as any;
    const tree = await firstValueFrom(result$);
    expect(clearTokensCalled).toBe(true);
    expect((tree as any).commands).toEqual(['/auth/login']);
  });
});
