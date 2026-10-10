import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConfirmModalComponent } from './confirm-modal.component';
import { AppDialogComponent } from '../dialog/dialog.component';
import { TranslationService } from '../../../core/i18n/translation.service';

// Mock Host mô phỏng các caller thực tế (UserListPageComponent & RoleListPageComponent)
@Component({
  standalone: true,
  imports: [ConfirmModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-confirm-modal
      [isOpen]="isOpen()"
      [title]="title()"
      [message]="message()"
      [confirmText]="confirmText()"
      [cancelText]="cancelText()"
      [danger]="danger()"
      [loading]="loading()"
      (confirm)="onConfirm()"
      (cancel)="onCancel()"
    />
  `,
})
class TestHostComponent {
  readonly isOpen = signal<boolean>(true);
  readonly title = signal<string | undefined>(undefined);
  readonly message = signal<string | undefined>(undefined);
  readonly confirmText = signal<string | undefined>(undefined);
  readonly cancelText = signal<string | undefined>(undefined);
  readonly danger = signal<boolean>(false);
  readonly loading = signal<boolean>(false);

  readonly onConfirm = vi.fn();
  readonly onCancel = vi.fn();
}

describe('ConfirmModalComponent (Refactored)', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let confirmModal: ConfirmModalComponent;
  let translationService: TranslationService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    translationService = TestBed.inject(TranslationService);
    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();

    const modalDebugEl = fixture.debugElement.query(By.directive(ConfirmModalComponent));
    confirmModal = modalDebugEl.componentInstance;
  });

  it('nên khởi tạo thành công ConfirmModalComponent tích hợp AppDialogComponent', () => {
    expect(confirmModal).toBeTruthy();

    const dialogDebugEl = fixture.debugElement.query(By.directive(AppDialogComponent));
    expect(dialogDebugEl).toBeTruthy();
  });

  describe('Hiển thị và Nội dung (Rendering & Content)', () => {
    it('nên hiển thị dialog khi isOpen = true và ẩn khi isOpen = false', () => {
      expect(fixture.debugElement.query(By.css('.p-dialog'))).toBeTruthy();

      host.isOpen.set(false);
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.css('.p-dialog'))).toBeFalsy();
    });

    it('nên sử dụng các giá trị i18n mặc định khi không truyền title, message, confirmText, cancelText', () => {
      expect(confirmModal.resolvedTitle).toBe('common.dialogs.confirmTitle');
      expect(confirmModal.resolvedConfirmText).toBe('common.actions.confirm');
      expect(confirmModal.resolvedCancelText).toBe('common.actions.cancel');

      const messageEl = fixture.debugElement.query(By.css('.confirm-message'));
      expect(messageEl.nativeElement.textContent.trim()).toBe(
        translationService.translate('common.dialogs.confirmMessage')
      );
    });

    it('nên hiển thị đúng title, message, confirmText, cancelText tùy biến', () => {
      host.title.set('Xác nhận hoàn tiền vé');
      host.message.set('Bạn có chắc chắn muốn hoàn tiền cho giao dịch #DL-9999?');
      host.confirmText.set('Hoàn tiền ngay');
      host.cancelText.set('Bỏ qua');
      fixture.detectChanges();

      expect(confirmModal.resolvedTitle).toBe('Xác nhận hoàn tiền vé');
      expect(confirmModal.resolvedConfirmText).toBe('Hoàn tiền ngay');
      expect(confirmModal.resolvedCancelText).toBe('Bỏ qua');

      const messageEl = fixture.debugElement.query(By.css('.confirm-message'));
      expect(messageEl.nativeElement.textContent).toContain('Bạn có chắc chắn muốn hoàn tiền cho giao dịch #DL-9999?');
    });
  });

  describe('Cờ Cảnh báo Nguy hiểm (danger mode)', () => {
    it('nên truyền submitVariant="primary" cho app-dialog khi danger = false', () => {
      host.danger.set(false);
      fixture.detectChanges();

      const appDialog = fixture.debugElement.query(By.directive(AppDialogComponent)).componentInstance as AppDialogComponent;
      expect(appDialog.submitVariant()).toBe('primary');
    });

    it('nên truyền submitVariant="danger" cho app-dialog khi danger = true', () => {
      host.danger.set(true);
      fixture.detectChanges();

      const appDialog = fixture.debugElement.query(By.directive(AppDialogComponent)).componentInstance as AppDialogComponent;
      expect(appDialog.submitVariant()).toBe('danger');
    });
  });

  describe('Tương tác Thao tác (Confirm & Cancel Actions)', () => {
    it('nên phát sự kiện confirm khi người dùng xác nhận', () => {
      confirmModal.onConfirm();
      expect(host.onConfirm).toHaveBeenCalledTimes(1);
      expect(host.onCancel).not.toHaveBeenCalled();
    });

    it('nên phát sự kiện cancel khi người dùng hủy', () => {
      confirmModal.onCancel();
      expect(host.onCancel).toHaveBeenCalledTimes(1);
      expect(host.onConfirm).not.toHaveBeenCalled();
    });

    it('không phát confirm khi modal bị đóng qua thao tác cancel hoặc phím ESC', () => {
      confirmModal.onCancel();
      expect(host.onConfirm).not.toHaveBeenCalled();
    });
  });

  describe('Trạng thái Đang xử lý (loading state)', () => {
    beforeEach(() => {
      host.loading.set(true);
      fixture.detectChanges();
    });

    it('nên truyền submitLoading=true xuống AppDialogComponent', () => {
      const appDialog = fixture.debugElement.query(By.directive(AppDialogComponent)).componentInstance as AppDialogComponent;
      expect(appDialog.submitLoading()).toBe(true);
    });

    it('không được phát confirm khi đang loading = true', () => {
      confirmModal.onConfirm();
      expect(host.onConfirm).not.toHaveBeenCalled();
    });

    it('không được phát cancel khi đang loading = true', () => {
      confirmModal.onCancel();
      expect(host.onCancel).not.toHaveBeenCalled();
    });
  });

  describe('Kiểm thử Hồi quy với 3 Luồng Nghiệp vụ Caller Thực tế', () => {
    it('Luồng 1: Khóa / Kích hoạt người dùng (user-list-page)', () => {
      // Mô phỏng cấu hình của user-list-page
      host.title.set('Tạm khóa tài khoản');
      host.message.set('Bạn có chắc chắn muốn tạm khóa tài khoản Nguyễn Văn A (@nguyenvana)?');
      host.confirmText.set('Tạm khóa');
      host.danger.set(true);
      fixture.detectChanges();

      expect(confirmModal.resolvedTitle).toBe('Tạm khóa tài khoản');
      expect(confirmModal.danger).toBe(true);

      confirmModal.onConfirm();
      expect(host.onConfirm).toHaveBeenCalledTimes(1);
    });

    it('Luồng 2: Đổi trạng thái vai trò (role-list-page)', () => {
      // Mô phỏng cấu hình đổi trạng thái vai trò của role-list-page
      host.title.set(translationService.translate('roles.statusModal.lockTitle'));
      host.message.set('Bạn có chắc chắn muốn khóa vai trò Điều hành viên?');
      host.confirmText.set(translationService.translate('roles.statusModal.confirmLock'));
      host.danger.set(true);
      fixture.detectChanges();

      expect(confirmModal.danger).toBe(true);

      confirmModal.onCancel();
      expect(host.onCancel).toHaveBeenCalledTimes(1);
    });

    it('Luồng 3: Xóa vai trò tùy chỉnh (role-list-page)', () => {
      // Mô phỏng cấu hình xóa vai trò của role-list-page
      host.title.set('Xóa vai trò');
      host.message.set('Bạn có chắc chắn muốn xóa vai trò Kiểm soát viên vé?');
      host.confirmText.set('Xóa vĩnh viễn');
      host.danger.set(true);
      fixture.detectChanges();

      const appDialog = fixture.debugElement.query(By.directive(AppDialogComponent)).componentInstance as AppDialogComponent;
      expect(appDialog.submitVariant()).toBe('danger');
      expect(confirmModal.resolvedConfirmText).toBe('Xóa vĩnh viễn');

      confirmModal.onConfirm();
      expect(host.onConfirm).toHaveBeenCalledTimes(1);
    });
  });
});
