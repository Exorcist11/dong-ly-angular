import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, Validators } from '@angular/forms';
import { FormFieldComponent } from './form-field.component';

describe('FormFieldComponent', () => {
  let component: FormFieldComponent;
  let fixture: ComponentFixture<FormFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormFieldComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FormFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('nên khởi tạo thành công', () => {
    expect(component).toBeTruthy();
    expect(component.hasError()).toBe(false);
  });

  it('chưa hiển thị lỗi khi control invalid nhưng pristine và untouched', () => {
    const ctrl = new FormControl('', [Validators.required]);
    fixture.componentRef.setInput('control', ctrl);
    fixture.componentRef.setInput('label', 'Họ và tên');
    fixture.detectChanges();

    expect(component.hasError()).toBe(false);
  });

  it('tự động hiển thị lỗi required tiếng Việt khi control touched', () => {
    const ctrl = new FormControl('', [Validators.required]);
    ctrl.markAsTouched();

    fixture.componentRef.setInput('control', ctrl);
    fixture.componentRef.setInput('label', 'Họ và tên');
    fixture.detectChanges();

    expect(component.hasError()).toBe(true);
    expect(component.activeErrorMessage()).toBe('Họ và tên không được để trống.');
  });

  it('tự động hiển thị lỗi minlength tiếng Việt', () => {
    const ctrl = new FormControl('ab', [Validators.minLength(3)]);
    ctrl.markAsDirty();

    fixture.componentRef.setInput('control', ctrl);
    fixture.componentRef.setInput('label', 'Tên đăng nhập');
    fixture.detectChanges();

    expect(component.hasError()).toBe(true);
    expect(component.activeErrorMessage()).toBe('Tên đăng nhập phải có ít nhất 3 ký tự.');
  });

  it('cho phép ghi đè thông báo lỗi tùy biến qua errorMessage', () => {
    fixture.componentRef.setInput('errorMessage', 'Lỗi kết nối máy chủ');
    fixture.detectChanges();

    expect(component.hasError()).toBe(true);
    expect(component.activeErrorMessage()).toBe('Lỗi kết nối máy chủ');
  });

  it('hiển thị gợi ý hint khi không có lỗi', () => {
    fixture.componentRef.setInput('hint', 'Nhập tối thiểu 8 ký tự');
    fixture.detectChanges();

    expect(component.hint()).toBe('Nhập tối thiểu 8 ký tự');
    expect(component.hasError()).toBe(false);
  });
});
