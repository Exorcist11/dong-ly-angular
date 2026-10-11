import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { DateInputComponent } from './date-input.component';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, DateInputComponent],
  template: `
    <form [formGroup]="form">
      <app-date-input
        id="test-departure-date"
        formControlName="departureDate"
        label="Ngày khởi hành"
        [required]="true"
        [min]="'2026-01-01'"
        [max]="'2026-12-31'"
        [clearable]="true"
      />
      <app-date-input
        id="test-return-date"
        [value]="standaloneDate()"
        (valueChange)="standaloneDate.set($event)"
        label="Ngày về"
        [disabled]="isReturnDisabled()"
      />
    </form>
  `,
})
class TestHostComponent {
  form = new FormGroup({
    departureDate: new FormControl('2026-10-15', [Validators.required]),
  });

  standaloneDate = signal<string>('2026-10-20');
  isReturnDisabled = signal<boolean>(false);
}

describe('DateInputComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent, DateInputComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('phải render nhãn và dấu bắt buộc * khi required=true', () => {
    const labelEl = fixture.debugElement.query(By.css('label[for="test-departure-date"]'));
    expect(labelEl).toBeTruthy();
    expect(labelEl.nativeElement.textContent).toContain('Ngày khởi hành');

    const requiredMark = labelEl.query(By.css('.required-mark'));
    expect(requiredMark).toBeTruthy();
    expect(requiredMark.nativeElement.textContent).toContain('*');
  });

  it('phải gán đúng thuộc tính min, max và id trên input', () => {
    const inputEl = fixture.debugElement.query(By.css('input#test-departure-date'));
    expect(inputEl).toBeTruthy();
    expect(inputEl.nativeElement.getAttribute('type')).toBe('date');
    expect(inputEl.nativeElement.getAttribute('min')).toBe('2026-01-01');
    expect(inputEl.nativeElement.getAttribute('max')).toBe('2026-12-31');
    expect(inputEl.nativeElement.getAttribute('aria-required')).toBe('true');
  });

  it('phải khởi tạo giá trị từ Reactive Form FormControl', () => {
    const inputEl = fixture.debugElement.query(By.css('input#test-departure-date'));
    expect(inputEl.nativeElement.value).toBe('2026-10-15');
  });

  it('phải cập nhật FormControl khi người dùng thay đổi ngày trên input', () => {
    const inputEl = fixture.debugElement.query(By.css('input#test-departure-date'));
    inputEl.nativeElement.value = '2026-11-01';
    inputEl.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(hostComponent.form.controls.departureDate.value).toBe('2026-11-01');
  });

  it('phải hỗ trợ two-way binding / signal [value] và (valueChange)', () => {
    const inputEl = fixture.debugElement.query(By.css('input#test-return-date'));
    expect(inputEl.nativeElement.value).toBe('2026-10-20');

    inputEl.nativeElement.value = '2026-10-25';
    inputEl.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(hostComponent.standaloneDate()).toBe('2026-10-25');
  });

  it('phải vô hiệu hóa input khi disabled=true', () => {
    hostComponent.isReturnDisabled.set(true);
    fixture.detectChanges();

    const inputEl = fixture.debugElement.query(By.css('input#test-return-date'));
    expect(inputEl.nativeElement.disabled).toBe(true);
  });

  it('phải hiển thị lỗi validation khi FormControl invalid và touched', () => {
    const ctrl = hostComponent.form.controls.departureDate;
    ctrl.setValue('');
    ctrl.markAsTouched();
    fixture.detectChanges();

    const errorEl = fixture.debugElement.query(By.css('.error-message'));
    expect(errorEl).toBeTruthy();
    expect(errorEl.nativeElement.textContent).toBeTruthy();
  });

  it('phải cho phép xóa ngày qua nút clear khi clearable=true', () => {
    const clearBtn = fixture.debugElement.query(By.css('.date-clear-btn'));
    expect(clearBtn).toBeTruthy();

    clearBtn.nativeElement.click();
    fixture.detectChanges();

    expect(hostComponent.form.controls.departureDate.value).toBe('');
    const inputEl = fixture.debugElement.query(By.css('input#test-departure-date'));
    expect(inputEl.nativeElement.value).toBe('');
  });
});
