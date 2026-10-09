import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { LoginPageComponent } from './login-page.component';
import { AuthService } from '../../../../core/auth/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { UserProfile } from '../../../../core/auth/auth.model';

describe('LoginPageComponent', () => {
  let component: LoginPageComponent;
  let fixture: ComponentFixture<LoginPageComponent>;
  let authService: {
    login: any;
  };
  let router: {
    navigateByUrl: any;
  };
  let route: {
    snapshot: {
      queryParamMap: {
        get: (param: string) => string | null;
      };
    };
  };
  let notificationService: {
    success: any;
  };

  const mockUser: UserProfile = {
    id: 'u-1',
    username: 'admin',
    email: 'admin@dongly.vn',
    fullName: 'Quản Trị Viên Đông Lý',
    phone: '0901234567',
    status: 'ACTIVE',
    roles: ['ROLE_ADMIN'],
    permissions: ['ALL'],
    createdAt: '2026-01-01',
  };

  beforeEach(async () => {
    authService = {
      login: vi.fn().mockReturnValue(of(mockUser)),
    };

    router = {
      navigateByUrl: vi.fn().mockResolvedValue(true),
    };

    route = {
      snapshot: {
        queryParamMap: {
          get: (param: string) => null,
        },
      },
    };

    notificationService = {
      success: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [LoginPageComponent],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: route },
        { provide: NotificationService, useValue: notificationService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should initialize form with default values and invalid status', () => {
    expect(component).toBeTruthy();
    expect(component.loginForm.valid).toBe(false);
    expect(component.usernameControl.value).toBe('');
    expect(component.passwordControl.value).toBe('');
    expect(component.isLoading()).toBe(false);
    expect(component.errorMessage()).toBeNull();
    expect(component.showPassword()).toBe(false);
  });

  it('should validate username required and minlength 3', () => {
    const usernameCtrl = component.usernameControl;
    expect(usernameCtrl.hasError('required')).toBe(true);

    usernameCtrl.setValue('ab');
    expect(usernameCtrl.hasError('minlength')).toBe(true);

    usernameCtrl.setValue('abc');
    expect(usernameCtrl.valid).toBe(true);
  });

  it('should validate password required and minlength 6', () => {
    const passwordCtrl = component.passwordControl;
    expect(passwordCtrl.hasError('required')).toBe(true);

    passwordCtrl.setValue('12345');
    expect(passwordCtrl.hasError('minlength')).toBe(true);

    passwordCtrl.setValue('123456');
    expect(passwordCtrl.valid).toBe(true);
  });

  it('should toggle password visibility correctly', () => {
    expect(component.showPassword()).toBe(false);
    component.togglePasswordVisibility();
    expect(component.showPassword()).toBe(true);
    component.togglePasswordVisibility();
    expect(component.showPassword()).toBe(false);
  });

  it('should mark all fields as touched and not call login if form is invalid on submit', () => {
    component.onSubmit();

    expect(component.usernameControl.touched).toBe(true);
    expect(component.passwordControl.touched).toBe(true);
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('should prevent duplicate submission when already loading', () => {
    component.loginForm.setValue({
      username: 'admin',
      password: 'password123',
      rememberMe: false,
    });

    component.isLoading.set(true);
    component.onSubmit();

    expect(authService.login).not.toHaveBeenCalled();
  });

  it('should handle successful login and redirect to /dashboard', () => {
    component.loginForm.setValue({
      username: 'admin',
      password: 'password123',
      rememberMe: true,
    });

    component.onSubmit();

    expect(authService.login).toHaveBeenCalledWith({
      username: 'admin',
      password: 'password123',
    });
    expect(component.isLoading()).toBe(false);
    expect(notificationService.success).toHaveBeenCalledWith(
      'Đăng nhập thành công! Chào mừng Quản Trị Viên Đông Lý'
    );
    expect(router.navigateByUrl).toHaveBeenCalledWith('/dashboard');
  });

  it('should redirect to returnUrl when returnUrl query param is present and safe', () => {
    route.snapshot.queryParamMap.get = (param: string) =>
      param === 'returnUrl' ? '/trips/create' : null;

    component.loginForm.setValue({
      username: 'admin',
      password: 'password123',
      rememberMe: false,
    });

    component.onSubmit();

    expect(router.navigateByUrl).toHaveBeenCalledWith('/trips/create');
  });

  it('should handle 401 login failure with friendly Vietnamese error message', () => {
    const error401 = new HttpErrorResponse({
      status: 401,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Tên đăng nhập hoặc mật khẩu không chính xác',
      },
    });

    authService.login = vi.fn().mockReturnValue(throwError(() => error401));

    component.loginForm.setValue({
      username: 'admin',
      password: 'wrongpassword',
      rememberMe: false,
    });

    component.onSubmit();

    expect(component.isLoading()).toBe(false);
    expect(component.errorMessage()).toBe('Tên đăng nhập hoặc mật khẩu không chính xác');
  });

  it('should handle network connection error (status 0)', () => {
    const errorNetwork = new HttpErrorResponse({
      status: 0,
      statusText: 'Unknown Error',
    });

    authService.login = vi.fn().mockReturnValue(throwError(() => errorNetwork));

    component.loginForm.setValue({
      username: 'admin',
      password: 'password123',
      rememberMe: false,
    });

    component.onSubmit();

    expect(component.errorMessage()).toBe(
      'Không thể kết nối đến máy chủ. Vui lòng kiểm tra đường truyền mạng.'
    );
  });

  it('should clear errorMessage when user types in the form', () => {
    component.errorMessage.set('Lỗi đăng nhập');
    component.loginForm.controls.username.setValue('newuser');

    expect(component.errorMessage()).toBeNull();
  });
});
