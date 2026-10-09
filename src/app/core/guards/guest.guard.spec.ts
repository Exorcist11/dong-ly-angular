import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { guestGuard } from './guest.guard';
import { TokenStorageService } from '../auth/token-storage.service';

describe('guestGuard', () => {
  let tokenStorage: {
    hasToken: () => boolean;
  };
  let router: {
    createUrlTree: (commands: string[]) => UrlTree;
  };

  beforeEach(() => {
    tokenStorage = {
      hasToken: () => false,
    };

    router = {
      createUrlTree: (commands: string[]) => ({ path: commands.join('/') } as unknown as UrlTree),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: TokenStorageService, useValue: tokenStorage },
        { provide: Router, useValue: router },
      ],
    });
  });

  it('should allow access if user has no token', () => {
    tokenStorage.hasToken = () => false;
    const result = TestBed.runInInjectionContext(() => guestGuard({} as any, {} as any));
    expect(result).toBe(true);
  });

  it('should redirect to /dashboard if user already has token', () => {
    tokenStorage.hasToken = () => true;
    const result = TestBed.runInInjectionContext(() => guestGuard({} as any, {} as any));
    expect((result as any).path).toBe('/dashboard');
  });
});
