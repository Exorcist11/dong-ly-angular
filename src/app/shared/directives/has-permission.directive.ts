import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  effect,
  inject,
} from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';

/**
 * Structural Directive ẩn/hiện element theo quyền hạn người dùng.
 * Cú pháp:
 *   <button *appHasPermission="'USER_CREATE'">Thêm mới</button>
 *   <div *appHasPermission="['USER_UPDATE', 'USER_DELETE']">Thao tác nâng cao</div>
 */
@Directive({
  selector: '[appHasPermission]',
  standalone: true,
})
export class HasPermissionDirective {
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly authService = inject(AuthService);

  private requiredPermissions: string[] = [];
  private hasView = false;

  constructor() {
    // Tự động phản ứng lại khi permissions Signal của AuthService thay đổi
    effect(() => {
      // Đọc Signal để đăng ký dependency
      const userPermissions = this.authService.permissions();
      this.updateView(userPermissions);
    });
  }

  @Input()
  set appHasPermission(val: string | string[]) {
    this.requiredPermissions = Array.isArray(val) ? val : [val];
    this.updateView(this.authService.permissions());
  }

  private updateView(userPermissions: string[]): void {
    if (this.requiredPermissions.length === 0) {
      this.showView();
      return;
    }

    const hasPermission = this.requiredPermissions.some((p) =>
      userPermissions.includes(p)
    );

    if (hasPermission && !this.hasView) {
      this.showView();
    } else if (!hasPermission && this.hasView) {
      this.hideView();
    }
  }

  private showView(): void {
    this.viewContainer.createEmbeddedView(this.templateRef);
    this.hasView = true;
  }

  private hideView(): void {
    this.viewContainer.clear();
    this.hasView = false;
  }
}
