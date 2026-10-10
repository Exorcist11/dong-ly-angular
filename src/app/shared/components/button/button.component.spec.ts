import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonComponent } from './button.component';
import { By } from '@angular/platform-browser';

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('nên khởi tạo thành công với cấu hình mặc định', () => {
    expect(component).toBeTruthy();
    expect(component.variant()).toBe('primary');
    expect(component.size()).toBe('medium');
    expect(component.type()).toBe('button');
    expect(component.disabled()).toBe(false);
    expect(component.loading()).toBe(false);
    expect(component.fullWidth()).toBe(false);
    expect(component.iconPos()).toBe('left');
  });

  describe('Biến thể (Variants)', () => {
    it('nên thiết lập đúng cho variant primary', () => {
      fixture.componentRef.setInput('variant', 'primary');
      fixture.detectChanges();

      expect(component.primeSeverity()).toBe('primary');
      expect(component.isOutlined()).toBe(false);
      expect(component.isText()).toBe(false);
      expect(component.computedStyleClass()).toContain('variant-primary');
    });

    it('nên thiết lập đúng cho variant secondary (tự động outlined)', () => {
      fixture.componentRef.setInput('variant', 'secondary');
      fixture.detectChanges();

      expect(component.primeSeverity()).toBe('secondary');
      expect(component.isOutlined()).toBe(true);
      expect(component.isText()).toBe(false);
      expect(component.computedStyleClass()).toContain('variant-secondary');
    });

    it('nên thiết lập đúng cho variant danger (thao tác xóa/khóa)', () => {
      fixture.componentRef.setInput('variant', 'danger');
      fixture.detectChanges();

      expect(component.primeSeverity()).toBe('danger');
      expect(component.isOutlined()).toBe(false);
      expect(component.isText()).toBe(false);
      expect(component.computedStyleClass()).toContain('variant-danger');
    });

    it('nên thiết lập đúng cho variant success, warn, info', () => {
      fixture.componentRef.setInput('variant', 'success');
      fixture.detectChanges();
      expect(component.primeSeverity()).toBe('success');

      fixture.componentRef.setInput('variant', 'warn');
      fixture.detectChanges();
      expect(component.primeSeverity()).toBe('warn');

      fixture.componentRef.setInput('variant', 'info');
      fixture.detectChanges();
      expect(component.primeSeverity()).toBe('info');
    });

    it('nên thiết lập đúng cho variant text (phẳng không viền)', () => {
      fixture.componentRef.setInput('variant', 'text');
      fixture.detectChanges();

      expect(component.isText()).toBe(true);
      expect(component.isOutlined()).toBe(false);
      expect(component.computedStyleClass()).toContain('variant-text');
    });

    it('nên thiết lập đúng cho variant outlined', () => {
      fixture.componentRef.setInput('variant', 'outlined');
      fixture.detectChanges();

      expect(component.primeSeverity()).toBe('primary');
      expect(component.isOutlined()).toBe(true);
      expect(component.isText()).toBe(false);
    });

    it('cho phép ghi đè outlined và text tùy biến', () => {
      fixture.componentRef.setInput('variant', 'danger');
      fixture.componentRef.setInput('text', true);
      fixture.detectChanges();

      expect(component.primeSeverity()).toBe('danger');
      expect(component.isText()).toBe(true);

      fixture.componentRef.setInput('text', undefined);
      fixture.componentRef.setInput('outlined', true);
      fixture.detectChanges();

      expect(component.primeSeverity()).toBe('danger');
      expect(component.isOutlined()).toBe(true);
    });
  });

  describe('Kích thước (Sizes)', () => {
    it('nên map size small sang primeSize small', () => {
      fixture.componentRef.setInput('size', 'small');
      fixture.detectChanges();

      expect(component.primeSize()).toBe('small');
    });

    it('nên map size large sang primeSize large', () => {
      fixture.componentRef.setInput('size', 'large');
      fixture.detectChanges();

      expect(component.primeSize()).toBe('large');
    });

    it('nên để primeSize là undefined cho medium (mặc định của PrimeNG)', () => {
      fixture.componentRef.setInput('size', 'medium');
      fixture.detectChanges();

      expect(component.primeSize()).toBeUndefined();
    });
  });

  describe('HTML Button Type', () => {
    it('nên hỗ trợ các button type: button, submit, reset', () => {
      fixture.componentRef.setInput('type', 'submit');
      fixture.detectChanges();
      expect(component.type()).toBe('submit');

      const nativeBtn = fixture.debugElement.query(By.css('button')).nativeElement as HTMLButtonElement;
      expect(nativeBtn.getAttribute('type')).toBe('submit');

      fixture.componentRef.setInput('type', 'reset');
      fixture.detectChanges();
      expect(component.type()).toBe('reset');
      expect(nativeBtn.getAttribute('type')).toBe('reset');
    });
  });

  describe('Trạng thái Disabled & Loading', () => {
    it('khi disabled = true, nút bị vô hiệu hóa và không emit clicked', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      expect(component.isEffectivelyDisabled()).toBe(true);

      let emitted = false;
      component.clicked.subscribe(() => {
        emitted = true;
      });

      const mockEvent = new MouseEvent('click');
      component.handleClick(mockEvent);

      expect(emitted).toBe(false);
    });

    it('khi loading = true, nút tự động vô hiệu hóa, gắn aria-busy và không emit clicked', () => {
      fixture.componentRef.setInput('loading', true);
      fixture.detectChanges();

      expect(component.isEffectivelyDisabled()).toBe(true);
      expect(fixture.nativeElement.getAttribute('aria-busy')).toBe('true');

      let emitted = false;
      component.clicked.subscribe(() => {
        emitted = true;
      });

      const mockEvent = new MouseEvent('click');
      component.handleClick(mockEvent);

      expect(emitted).toBe(false);
    });

    it('khi nút bình thường, click sẽ emit sự kiện clicked', () => {
      let receivedEvent: MouseEvent | null = null;
      component.clicked.subscribe((e) => {
        receivedEvent = e;
      });

      const mockEvent = new MouseEvent('click');
      component.handleClick(mockEvent);

      expect(receivedEvent).toBe(mockEvent);
    });
  });

  describe('FullWidth & Styling', () => {
    it('khi fullWidth = true, bổ sung class w-full', () => {
      fixture.componentRef.setInput('fullWidth', true);
      fixture.detectChanges();

      expect(component.computedStyleClass()).toContain('w-full');
      expect(fixture.nativeElement.classList).toContain('dl-button-full-width');
    });

    it('hỗ trợ styleClass tùy biến bổ sung', () => {
      fixture.componentRef.setInput('styleClass', 'custom-header-btn');
      fixture.detectChanges();

      expect(component.computedStyleClass()).toContain('custom-header-btn');
    });
  });

  describe('Icon & Icon-only Accessibility', () => {
    it('hỗ trợ icon và iconPos', () => {
      fixture.componentRef.setInput('icon', 'pi pi-plus');
      fixture.componentRef.setInput('iconPos', 'right');
      fixture.detectChanges();

      expect(component.icon()).toBe('pi pi-plus');
      expect(component.iconPos()).toBe('right');
    });

    it('khi là nút icon-only, aria-label được cấu hình để hỗ trợ Screen Readers', () => {
      fixture.componentRef.setInput('icon', 'pi pi-trash');
      fixture.componentRef.setInput('ariaLabel', 'Xóa bản ghi này');
      fixture.detectChanges();

      expect(component.resolvedAriaLabel()).toBe('Xóa bản ghi này');

      const nativeBtn = fixture.debugElement.query(By.css('button')).nativeElement as HTMLButtonElement;
      expect(nativeBtn.getAttribute('aria-label')).toBe('Xóa bản ghi này');
    });

    it('fallback aria-label sang tooltip nếu ariaLabel không được truyền', () => {
      fixture.componentRef.setInput('icon', 'pi pi-pencil');
      fixture.componentRef.setInput('tooltip', 'Chỉnh sửa tài khoản');
      fixture.detectChanges();

      expect(component.resolvedAriaLabel()).toBe('Chỉnh sửa tài khoản');
    });
  });

  describe('Tự động giải quyết i18n Translation', () => {
    it('tự động dịch label khi truyền translation key', () => {
      fixture.componentRef.setInput('label', 'common.actions.save');
      fixture.detectChanges();

      expect(component.resolvedLabel()).toBe('Lưu thay đổi');
    });

    it('giữ nguyên chuỗi thô khi truyền text không phải key', () => {
      fixture.componentRef.setInput('label', 'Lưu ngay');
      fixture.detectChanges();

      expect(component.resolvedLabel()).toBe('Lưu ngay');
    });

    it('tự động dịch tooltip và ariaLabel khi truyền translation key', () => {
      fixture.componentRef.setInput('tooltip', 'common.actions.cancel');
      fixture.componentRef.setInput('ariaLabel', 'common.actions.close');
      fixture.detectChanges();

      expect(component.resolvedTooltip()).toBe('Hủy bỏ');
      expect(component.resolvedAriaLabel()).toBe('Đóng');
    });
  });
});
