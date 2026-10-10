import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AppDialogComponent } from './dialog.component';
import { DialogHeaderDirective, DialogFooterDirective } from './dialog.directives';
import { DialogSize } from './dialog.types';
import { ButtonVariant } from '../button/button.types';
import { TranslationService } from '../../../core/i18n/translation.service';

// Mock Host Component cho các kịch bản test
@Component({
  standalone: true,
  imports: [AppDialogComponent, DialogHeaderDirective, DialogFooterDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-dialog
      [visible]="visible()"
      [header]="header()"
      [size]="size()"
      [height]="height()"
      [closable]="closable()"
      [dismissableMask]="dismissableMask()"
      [closeOnEscape]="closeOnEscape()"
      [modal]="modal()"
      [draggable]="draggable()"
      [resizable]="resizable()"
      [showFooter]="showFooter()"
      [submitLabel]="submitLabel()"
      [submitIcon]="submitIcon()"
      [submitVariant]="submitVariant()"
      [submitLoading]="submitLoading()"
      [submitDisabled]="submitDisabled()"
      [showCancel]="showCancel()"
      [cancelLabel]="cancelLabel()"
      [cancelIcon]="cancelIcon()"
      [styleClass]="styleClass()"
      (visibleChange)="onVisibleChange($event)"
      (submitted)="onSubmitted()"
      (cancelled)="onCancelled()"
    >
      @if (useCustomHeader()) {
        <div dialogHeader class="test-custom-header">
          <i class="pi pi-shield"></i>
          <span>Custom Header Title</span>
        </div>
      }

      <div class="test-dialog-body-content">
        <p>Main body content for test</p>
      </div>

      @if (useCustomFooter()) {
        <div dialogFooter class="test-custom-footer">
          <button type="button" class="custom-action-btn">Custom Button</button>
        </div>
      }
    </app-dialog>
  `,
})
class TestHostComponent {
  readonly visible = signal<boolean>(true);
  readonly header = signal<string>('Test Header Title');
  readonly size = signal<DialogSize>('md');
  readonly height = signal<string | undefined>(undefined);
  readonly closable = signal<boolean>(true);
  readonly dismissableMask = signal<boolean>(true);
  readonly closeOnEscape = signal<boolean>(true);
  readonly modal = signal<boolean>(true);
  readonly draggable = signal<boolean>(false);
  readonly resizable = signal<boolean>(false);
  readonly showFooter = signal<boolean>(true);
  readonly submitLabel = signal<string>('');
  readonly submitIcon = signal<string>('pi pi-check');
  readonly submitVariant = signal<ButtonVariant>('primary');
  readonly submitLoading = signal<boolean>(false);
  readonly submitDisabled = signal<boolean>(false);
  readonly showCancel = signal<boolean>(true);
  readonly cancelLabel = signal<string>('');
  readonly cancelIcon = signal<string | undefined>(undefined);
  readonly styleClass = signal<string>('');

  readonly useCustomHeader = signal<boolean>(false);
  readonly useCustomFooter = signal<boolean>(false);

  readonly onVisibleChange = vi.fn();
  readonly onSubmitted = vi.fn();
  readonly onCancelled = vi.fn();
}

describe('AppDialogComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let dialogComponent: AppDialogComponent;
  let translationService: TranslationService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    translationService = TestBed.inject(TranslationService);
    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();

    const dialogDebugEl = fixture.debugElement.query(By.directive(AppDialogComponent));
    dialogComponent = dialogDebugEl.componentInstance;
  });

  it('nên khởi tạo thành công component', () => {
    expect(dialogComponent).toBeTruthy();
  });

  describe('Hiển thị và Kích thước (Display & Sizes)', () => {
    it('nên render dialog khi visible = true và ẩn khi visible = false', () => {
      expect(fixture.debugElement.query(By.css('.p-dialog'))).toBeTruthy();

      host.visible.set(false);
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.css('.p-dialog'))).toBeFalsy();
    });

    it('nên áp dụng kích thước mặc định "md" (540px)', () => {
      const pDialog = fixture.debugElement.query(By.css('.p-dialog'));
      expect(pDialog.nativeElement.style.width).toBe('540px');
      expect(dialogComponent.computedStyleClass()).toContain('dl-dialog-md');
    });

    it('nên áp dụng kích thước "sm" (480px)', () => {
      host.size.set('sm');
      fixture.detectChanges();

      const pDialog = fixture.debugElement.query(By.css('.p-dialog'));
      expect(pDialog.nativeElement.style.width).toBe('480px');
      expect(dialogComponent.computedStyleClass()).toContain('dl-dialog-sm');
    });

    it('nên áp dụng kích thước "lg" (640px)', () => {
      host.size.set('lg');
      fixture.detectChanges();

      const pDialog = fixture.debugElement.query(By.css('.p-dialog'));
      expect(pDialog.nativeElement.style.width).toBe('640px');
      expect(dialogComponent.computedStyleClass()).toContain('dl-dialog-lg');
    });

    it('nên áp dụng kích thước "xl" (860px)', () => {
      host.size.set('xl');
      fixture.detectChanges();

      const pDialog = fixture.debugElement.query(By.css('.p-dialog'));
      expect(pDialog.nativeElement.style.width).toBe('860px');
      expect(dialogComponent.computedStyleClass()).toContain('dl-dialog-xl');
    });

    it('nên áp dụng kích thước "full" (96vw, 92vh)', () => {
      host.size.set('full');
      fixture.detectChanges();

      const pDialog = fixture.debugElement.query(By.css('.p-dialog'));
      expect(pDialog.nativeElement.style.width).toBe('96vw');
      expect(pDialog.nativeElement.style.height).toBe('92vh');
      expect(dialogComponent.computedStyleClass()).toContain('dl-dialog-full');
    });

    it('nên hỗ trợ height tùy biến ghi đè chiều cao cấu hình', () => {
      host.height.set('500px');
      fixture.detectChanges();

      expect(dialogComponent.computedDimensions()['height']).toBe('500px');
      expect(dialogComponent.computedStyleClass()).toContain('dl-dialog-has-height');
    });

    it('nên ghép thêm styleClass do người dùng cung cấp', () => {
      host.styleClass.set('custom-test-dialog-class');
      fixture.detectChanges();

      expect(dialogComponent.computedStyleClass()).toContain('custom-test-dialog-class');
    });
  });

  describe('Header và Tiêu đề', () => {
    it('nên hiển thị header mặc định từ string thông thường', () => {
      const titleEl = fixture.debugElement.query(By.css('.p-dialog-title'));
      expect(titleEl).toBeTruthy();
      expect(titleEl.nativeElement.textContent).toContain('Test Header Title');
    });

    it('nên tự động giải quyết translation key khi header có dấu chấm', () => {
      host.header.set('common.dialogs.confirmTitle');
      fixture.detectChanges();

      const titleEl = fixture.debugElement.query(By.css('.p-dialog-title'));
      expect(titleEl.nativeElement.textContent.trim()).toBe(
        translationService.translate('common.dialogs.confirmTitle')
      );
    });

    it('nên hiển thị custom header qua ng-content [dialogHeader] và ẩn default title', () => {
      host.useCustomHeader.set(true);
      fixture.detectChanges();

      const customHeaderEl = fixture.debugElement.query(By.css('.test-custom-header'));
      expect(customHeaderEl).toBeTruthy();
      expect(customHeaderEl.nativeElement.textContent).toContain('Custom Header Title');

      const defaultTitleEl = fixture.debugElement.query(By.css('.p-dialog-title'));
      expect(defaultTitleEl).toBeFalsy();
    });
  });

  describe('Nội dung chính (Body content)', () => {
    it('nên chiếu đúng nội dung vào body dialog', () => {
      const bodyEl = fixture.debugElement.query(By.css('.test-dialog-body-content'));
      expect(bodyEl).toBeTruthy();
      expect(bodyEl.nativeElement.textContent).toContain('Main body content for test');
    });
  });

  describe('Footer và Nút bấm Thao tác', () => {
    it('nên render footer mặc định gồm nút Hủy và nút Lưu', () => {
      const footerEl = fixture.debugElement.query(By.css('.dl-dialog-footer'));
      expect(footerEl).toBeTruthy();

      const buttons = fixture.debugElement.queryAll(By.css('app-button'));
      expect(buttons.length).toBe(2); // 1 Cancel, 1 Submit
    });

    it('không nên render container footer khi showFooter = false và không có custom footer', () => {
      host.showFooter.set(false);
      fixture.detectChanges();

      const pFooter = fixture.debugElement.query(By.css('.p-dialog-footer'));
      expect(pFooter).toBeFalsy();
    });

    it('nên hiển thị custom footer qua ng-content [dialogFooter] và ẩn nút mặc định', () => {
      host.useCustomFooter.set(true);
      fixture.detectChanges();

      const customFooterEl = fixture.debugElement.query(By.css('.test-custom-footer'));
      expect(customFooterEl).toBeTruthy();
      expect(customFooterEl.nativeElement.textContent).toContain('Custom Button');

      const defaultActions = fixture.debugElement.query(By.css('.dl-dialog-default-actions'));
      expect(defaultActions).toBeFalsy();
    });

    it('nên ẩn nút Hủy khi showCancel = false', () => {
      host.showCancel.set(false);
      fixture.detectChanges();

      const buttons = fixture.debugElement.queryAll(By.css('app-button'));
      expect(buttons.length).toBe(1); // Chỉ còn Submit
    });

    it('nên tùy biến được submitLabel, submitIcon, cancelLabel', () => {
      host.submitLabel.set('Xác nhận đặt vé');
      host.submitIcon.set('pi pi-ticket');
      host.cancelLabel.set('Đóng hộp thoại');
      fixture.detectChanges();

      expect(dialogComponent.resolvedSubmitLabel()).toBe('Xác nhận đặt vé');
      expect(dialogComponent.resolvedCancelLabel()).toBe('Đóng hộp thoại');
    });

    it('nên tự động giải quyết translation keys cho submitLabel và cancelLabel', () => {
      host.submitLabel.set('common.actions.continue');
      host.cancelLabel.set('common.actions.back');
      fixture.detectChanges();

      expect(dialogComponent.resolvedSubmitLabel()).toBe(
        translationService.translate('common.actions.continue')
      );
      expect(dialogComponent.resolvedCancelLabel()).toBe(
        translationService.translate('common.actions.back')
      );
    });

    it('nên phát sự kiện submitted khi nhấn nút submit', () => {
      dialogComponent.onSubmit();
      expect(host.onSubmitted).toHaveBeenCalledTimes(1);
    });

    it('không phát sự kiện submitted khi submitDisabled = true', () => {
      host.submitDisabled.set(true);
      fixture.detectChanges();

      dialogComponent.onSubmit();
      expect(host.onSubmitted).not.toHaveBeenCalled();
    });

    it('nên phát sự kiện cancelled và visibleChange(false) khi nhấn nút Hủy', () => {
      dialogComponent.onCancel();

      expect(host.onCancelled).toHaveBeenCalledTimes(1);
      expect(host.onVisibleChange).toHaveBeenCalledWith(false);
    });
  });

  describe('Trạng thái Đang xử lý (submitLoading Safety)', () => {
    beforeEach(() => {
      host.submitLoading.set(true);
      fixture.detectChanges();
    });

    it('nên khóa effectiveClosable khi submitLoading = true', () => {
      expect(dialogComponent.effectiveClosable()).toBe(false);
    });

    it('nên khóa effectiveDismissableMask khi submitLoading = true', () => {
      expect(dialogComponent.effectiveDismissableMask()).toBe(false);
    });

    it('nên khóa effectiveCloseOnEscape khi submitLoading = true', () => {
      expect(dialogComponent.effectiveCloseOnEscape()).toBe(false);
    });

    it('không cho phép submit khi submitLoading = true', () => {
      dialogComponent.onSubmit();
      expect(host.onSubmitted).not.toHaveBeenCalled();
    });

    it('không cho phép cancel khi submitLoading = true', () => {
      dialogComponent.onCancel();
      expect(host.onCancelled).not.toHaveBeenCalled();
      expect(host.onVisibleChange).not.toHaveBeenCalled();
    });
  });

  describe('Đóng Dialog từ bên ngoài (PrimeNG visibleChange handler)', () => {
    it('nên phát sự kiện cancelled khi PrimeNG dialog phát visibleChange(false)', () => {
      dialogComponent.onDialogVisibleChange(false);

      expect(host.onCancelled).toHaveBeenCalledTimes(1);
      expect(host.onVisibleChange).toHaveBeenCalledWith(false);
    });

    it('nên phát sự kiện visibleChange(true) khi mở dialog', () => {
      dialogComponent.onDialogVisibleChange(true);
      expect(host.onVisibleChange).toHaveBeenCalledWith(true);
    });
  });
});
