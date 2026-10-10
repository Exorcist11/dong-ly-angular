import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { InputComponent } from './input.component';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, InputComponent],
  template: `
    <form [formGroup]="form">
      <app-input
        id="test-username"
        formControlName="username"
        label="Tên đăng nhập"
        [required]="true"
        [placeholder]="'Nhập tên'"
        [errorMessages]="{ pattern: 'Tên không chứa ký tự đặc biệt' }"
      />
      <app-input
        id="test-password"
        formControlName="password"
        label="Mật khẩu"
        type="password"
        [required]="true"
        [toggleMask]="true"
        [feedback]="true"
        promptLabel="Nhập mật khẩu"
        weakLabel="Yếu"
        mediumLabel="TB"
        strongLabel="Mạnh"
      />
      <app-input
        id="test-note"
        formControlName="note"
        label="Ghi chú"
        type="textarea"
        [rows]="4"
        [placeholder]="'Nhập ghi chú'"
      />
      <app-textarea
        id="test-remark"
        formControlName="remark"
        label="Nhận xét"
        [rows]="5"
      />
    </form>
  `,
})
class TestHostComponent {
  form = new FormGroup({
    username: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      Validators.pattern(/^[a-zA-Z0-9]+$/),
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
    ]),
    note: new FormControl(''),
    remark: new FormControl(''),
  });
}

describe('InputComponent', () => {
  let component: InputComponent;
  let fixture: ComponentFixture<InputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('nên khởi tạo thành công với trạng thái không có lỗi', () => {
    expect(component).toBeTruthy();
    expect(component.hasError()).toBe(false);
  });

  it('nên hiển thị label, required mark và liên kết id/for đúng', () => {
    fixture.componentRef.setInput('id', 'custom-id');
    fixture.componentRef.setInput('label', 'Họ và tên');
    fixture.componentRef.setInput('required', true);
    fixture.detectChanges();

    const labelEl = fixture.debugElement.query(By.css('.field-label'));
    expect(labelEl).toBeTruthy();
    expect(labelEl.nativeElement.textContent).toContain('Họ và tên');
    expect(labelEl.attributes['for']).toBe('custom-id');

    const markEl = fixture.debugElement.query(By.css('.required-mark'));
    expect(markEl).toBeTruthy();
    expect(markEl.nativeElement.textContent).toBe('*');
  });

  it('chưa hiển thị lỗi khi control invalid nhưng pristine và untouched', () => {
    const ctrl = new FormControl('', [Validators.required]);
    fixture.componentRef.setInput('control', ctrl);
    fixture.componentRef.setInput('label', 'Họ và tên');
    fixture.detectChanges();

    expect(component.hasError()).toBe(false);
    expect(fixture.debugElement.query(By.css('.error-message'))).toBeNull();
  });

  it('tự động hiển thị lỗi required tiếng Việt khi control touched', () => {
    const ctrl = new FormControl('', [Validators.required]);
    ctrl.markAsTouched();

    fixture.componentRef.setInput('control', ctrl);
    fixture.componentRef.setInput('label', 'Họ và tên');
    fixture.detectChanges();

    expect(component.hasError()).toBe(true);
    expect(component.activeErrorMessage()).toBe('Họ và tên không được để trống.');

    const errorEl = fixture.debugElement.query(By.css('.error-message'));
    expect(errorEl).toBeTruthy();
    expect(errorEl.attributes['role']).toBe('alert');
    expect(errorEl.nativeElement.textContent.trim()).toBe('Họ và tên không được để trống.');
  });

  it('tự động hiển thị lỗi minlength tiếng Việt khi control dirty', () => {
    const ctrl = new FormControl('ab', [Validators.minLength(3)]);
    ctrl.markAsDirty();

    fixture.componentRef.setInput('control', ctrl);
    fixture.componentRef.setInput('label', 'Tên tài khoản');
    fixture.detectChanges();

    expect(component.hasError()).toBe(true);
    expect(component.activeErrorMessage()).toBe('Tên tài khoản phải có ít nhất 3 ký tự.');
  });

  it('hiển thị lỗi tùy biến thông qua errorMessages map', () => {
    const ctrl = new FormControl('abc@#', [Validators.pattern(/^[a-z]+$/)]);
    ctrl.markAsTouched();

    fixture.componentRef.setInput('control', ctrl);
    fixture.componentRef.setInput('errorMessages', { pattern: 'Chỉ được chứa chữ thường không dấu' });
    fixture.detectChanges();

    expect(component.hasError()).toBe(true);
    expect(component.activeErrorMessage()).toBe('Chỉ được chứa chữ thường không dấu');
  });

  it('cho phép ghi đè thông báo lỗi trực tiếp qua errorMessage', () => {
    fixture.componentRef.setInput('errorMessage', 'Lỗi không xác định từ máy chủ');
    fixture.detectChanges();

    expect(component.hasError()).toBe(true);
    expect(component.activeErrorMessage()).toBe('Lỗi không xác định từ máy chủ');
  });

  it('hiển thị gợi ý hint khi không có lỗi và ẩn hint khi có lỗi', () => {
    const ctrl = new FormControl('valid_value', [Validators.required]);
    fixture.componentRef.setInput('control', ctrl);
    fixture.componentRef.setInput('hint', 'Nhập tối thiểu 3 ký tự');
    fixture.detectChanges();

    expect(component.hint()).toBe('Nhập tối thiểu 3 ký tự');
    expect(component.hasError()).toBe(false);
    expect(fixture.debugElement.query(By.css('.field-hint'))).toBeTruthy();

    // Làm control invalid và touched -> hint ẩn, error hiển thị
    ctrl.setValue('');
    ctrl.markAsTouched();
    fixture.detectChanges();

    expect(component.hasError()).toBe(true);
    expect(fixture.debugElement.query(By.css('.field-hint'))).toBeNull();
    expect(fixture.debugElement.query(By.css('.error-message'))).toBeTruthy();
  });

  it('hoạt động chuẩn xác với ControlValueAccessor (writeValue, setDisabledState)', () => {
    component.writeValue('Giá trị ban đầu');
    expect(component.internalValue()).toBe('Giá trị ban đầu');

    component.setDisabledState(true);
    expect(component.isControlDisabled()).toBe(true);
    expect(component.effectiveDisabled()).toBe(true);

    component.setDisabledState(false);
    expect(component.isControlDisabled()).toBe(false);
    expect(component.effectiveDisabled()).toBe(false);
  });

  it('hỗ trợ cấu hình accessibility: aria-invalid và aria-describedby', () => {
    fixture.componentRef.setInput('id', 'input-acc');
    const ctrl = new FormControl('', [Validators.required]);
    ctrl.markAsTouched();
    fixture.componentRef.setInput('control', ctrl);
    fixture.detectChanges();

    expect(component.ariaDescribedBy()).toBe('input-acc-error');
    const inputEl = fixture.debugElement.query(By.css('input'));
    expect(inputEl.attributes['aria-invalid']).toBe('true');
    expect(inputEl.attributes['aria-describedby']).toBe('input-acc-error');
  });

  it('render thẻ textarea khi type="textarea" hoặc multiline=true', () => {
    fixture.componentRef.setInput('type', 'textarea');
    fixture.componentRef.setInput('rows', 5);
    fixture.componentRef.setInput('placeholder', 'Nhập mô tả chi tiết');
    fixture.detectChanges();

    const textareaEl = fixture.debugElement.query(By.css('textarea'));
    expect(textareaEl).toBeTruthy();
    expect(textareaEl.nativeElement.rows).toBe(5);
    expect(textareaEl.nativeElement.placeholder).toBe('Nhập mô tả chi tiết');
    expect(fixture.debugElement.query(By.css('input'))).toBeNull();
  });

  it('render thẻ textarea khi multiline=true dù type là text', () => {
    fixture.componentRef.setInput('type', 'text');
    fixture.componentRef.setInput('multiline', true);
    fixture.detectChanges();

    const textareaEl = fixture.debugElement.query(By.css('textarea'));
    expect(textareaEl).toBeTruthy();
  });
});

describe('InputComponent trong Reactive Forms', () => {
  let hostFixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    hostFixture = TestBed.createComponent(TestHostComponent);
    hostComponent = hostFixture.componentInstance;
    hostFixture.detectChanges();
  });

  it('đồng bộ giá trị hai chiều giữa host FormGroup và app-input', () => {
    const usernameCtrl = hostComponent.form.get('username')!;
    usernameCtrl.setValue('nguyenvana');
    hostFixture.detectChanges();

    const inputDebug = hostFixture.debugElement.query(By.css('#test-username input'));
    expect(inputDebug.nativeElement.value).toBe('nguyenvana');
  });

  it('hiển thị lỗi khi form submit gọi markAllAsTouched()', () => {
    hostComponent.form.markAllAsTouched();
    hostFixture.detectChanges();

    const errorEls = hostFixture.debugElement.queryAll(By.css('.error-message'));
    expect(errorEls.length).toBe(2);
    expect(errorEls[0].nativeElement.textContent).toContain('Tên đăng nhập không được để trống.');
    expect(errorEls[1].nativeElement.textContent).toContain('Mật khẩu không được để trống.');
  });

  it('render p-password khi type="password"', () => {
    const passwordDebug = hostFixture.debugElement.query(By.css('#test-password p-password'));
    expect(passwordDebug).toBeTruthy();
  });

  it('render textarea với rows="4" khi type="textarea" trong reactive forms', () => {
    const textareaEl = hostFixture.debugElement.query(By.css('#test-note textarea'));
    expect(textareaEl).toBeTruthy();
    expect(textareaEl.nativeElement.rows).toBe(4);
    expect(textareaEl.nativeElement.placeholder).toBe('Nhập ghi chú');

    // Đồng bộ model -> UI
    hostComponent.form.get('note')?.setValue('Nội dung ghi chú nhiều dòng');
    hostFixture.detectChanges();
    expect(textareaEl.nativeElement.value).toBe('Nội dung ghi chú nhiều dòng');

    // Đồng bộ UI -> model
    textareaEl.nativeElement.value = 'Cập nhật từ người dùng';
    textareaEl.nativeElement.dispatchEvent(new Event('input'));
    hostFixture.detectChanges();
    expect(hostComponent.form.get('note')?.value).toBe('Cập nhật từ người dùng');
  });

  it('render textarea và hỗ trợ tag <app-textarea>', () => {
    const remarkEl = hostFixture.debugElement.query(By.css('#test-remark textarea'));
    expect(remarkEl).toBeTruthy();
    expect(remarkEl.nativeElement.rows).toBe(5);

    hostComponent.form.get('remark')?.setValue('Nhận xét đặc biệt');
    hostFixture.detectChanges();
    expect(remarkEl.nativeElement.value).toBe('Nhận xét đặc biệt');
  });
});
