import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../../core/auth/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ApiErrorResponse } from '../../../../core/models/api-response.model';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly showPassword = signal(false);

  readonly loginForm = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false],
  });

  constructor() {
    // Tự động xóa thông báo lỗi khi người dùng thay đổi dữ liệu nhập
    this.loginForm.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (this.errorMessage()) {
          this.errorMessage.set(null);
        }
      });
  }

  get usernameControl() {
    return this.loginForm.controls.username;
  }

  get passwordControl() {
    return this.loginForm.controls.password;
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((val) => !val);
  }

  dismissError(): void {
    this.errorMessage.set(null);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    if (this.isLoading()) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { username, password } = this.loginForm.getRawValue();

    this.authService
      .login({
        username: username.trim(),
        password,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (user) => {
          this.isLoading.set(false);
          this.notificationService.success(
            `Đăng nhập thành công! Chào mừng ${user.fullName || user.username}`
          );

          const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
          const redirectPath =
            returnUrl && returnUrl.startsWith('/') && !returnUrl.startsWith('/auth')
              ? returnUrl
              : '/dashboard';

          void this.router.navigateByUrl(redirectPath);
        },
        error: (error: unknown) => {
          this.isLoading.set(false);
          let message = 'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.';

          if (error instanceof HttpErrorResponse) {
            if (error.status === 401) {
              message =
                (error.error as Partial<ApiErrorResponse>)?.message ||
                'Tên đăng nhập hoặc mật khẩu không chính xác.';
            } else if (error.status === 0) {
              message = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra đường truyền mạng.';
            } else if (error.status >= 500) {
              message = 'Máy chủ đang gặp sự cố. Vui lòng thử lại sau.';
            } else if ((error.error as Partial<ApiErrorResponse>)?.message) {
              message = (error.error as ApiErrorResponse).message;
            }
          }

          this.errorMessage.set(message);
        },
      });
  }
}
