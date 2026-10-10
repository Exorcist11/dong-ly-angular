import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { By } from '@angular/platform-browser';
import { SelectComponent } from './select.component';
import { SelectOption } from '../../models/select-option.model';

@Component({
  standalone: true,
  imports: [SelectComponent, ReactiveFormsModule],
  template: `
    <app-select
      [label]="label()"
      [required]="required()"
      [options]="options"
      [formControl]="control"
      [placeholder]="placeholder()"
      [hint]="hint()"
      [disabled]="disabled()"
      [clearable]="clearable()"
      [width]="width()"
      [errorMessage]="errorMessage()"
      (selectionChange)="onSelectionChange($event)"
    />
  `,
})
class TestHostComponent {
  readonly options: SelectOption<string>[] = [
    { label: 'Tất cả', value: 'ALL' },
    { label: 'Hoạt động', value: 'ACTIVE', icon: 'pi pi-check' },
    { label: 'Tạm khóa', value: 'LOCKED', disabled: true },
  ];

  readonly label = signal<string | undefined>('Trạng thái');
  readonly required = signal<boolean>(true);
  readonly control = new FormControl<string | null>('ALL', Validators.required);
  readonly placeholder = signal<string>('Chọn trạng thái...');
  readonly hint = signal<string | undefined>(undefined);
  readonly disabled = signal<boolean>(false);
  readonly clearable = signal<boolean>(true);
  readonly width = signal<string>('200px');
  readonly errorMessage = signal<string | undefined>(undefined);

  selectedVal: string | null = null;

  onSelectionChange(val: string | null): void {
    this.selectedVal = val;
  }
}

@Component({
  standalone: true,
  imports: [SelectComponent, ReactiveFormsModule],
  template: `
    <form [formGroup]="form">
      <app-select
        formControlName="role"
        [label]="'Vai trò'"
        [required]="true"
        [options]="roleOptions"
      />
    </form>
  `,
})
class TestFormGroupHostComponent {
  readonly roleOptions: SelectOption<string>[] = [
    { label: 'Quản trị viên', value: 'ADMIN' },
    { label: 'Điều hành', value: 'DISPATCHER' },
  ];

  readonly form = new FormGroup({
    role: new FormControl<string | null>(null, Validators.required),
  });
}

@Component({
  standalone: true,
  imports: [SelectComponent],
  template: `
    <app-select
      [options]="options"
      [placeholder]="'Bộ lọc nhanh'"
    />
  `,
})
class TestStandaloneHostComponent {
  readonly options: SelectOption<string>[] = [
    { label: 'Tùy chọn 1', value: '1' },
    { label: 'Tùy chọn 2', value: '2' },
  ];
}

describe('SelectComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TestHostComponent,
        TestFormGroupHostComponent,
        TestStandaloneHostComponent,
        SelectComponent,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('nên khởi tạo thành công với giá trị ban đầu từ FormControl', () => {
    const selectDebug = fixture.debugElement.query(By.directive(SelectComponent));
    expect(selectDebug).toBeTruthy();
    const selectInstance = selectDebug.componentInstance as SelectComponent<string>;
    expect(selectInstance.internalValue()).toBe('ALL');
  });

  it('nên cập nhật FormControl khi người dùng thay đổi lựa chọn', () => {
    const selectDebug = fixture.debugElement.query(By.directive(SelectComponent));
    const selectInstance = selectDebug.componentInstance as SelectComponent<string>;

    selectInstance.onModelChange('ACTIVE');
    fixture.detectChanges();

    expect(host.control.value).toBe('ACTIVE');
    expect(host.selectedVal).toBe('ACTIVE');
  });

  it('nên cập nhật internalValue khi FormControl thay đổi giá trị từ code (writeValue)', () => {
    const selectDebug = fixture.debugElement.query(By.directive(SelectComponent));
    const selectInstance = selectDebug.componentInstance as SelectComponent<string>;

    host.control.setValue('LOCKED');
    fixture.detectChanges();

    expect(selectInstance.internalValue()).toBe('LOCKED');
  });

  it('nên phản hồi trạng thái disabled từ FormControl (setDisabledState)', () => {
    const selectDebug = fixture.debugElement.query(By.directive(SelectComponent));
    const selectInstance = selectDebug.componentInstance as SelectComponent<string>;

    host.control.disable();
    fixture.detectChanges();

    expect(selectInstance.effectiveDisabled()).toBe(true);

    host.control.enable();
    fixture.detectChanges();

    expect(selectInstance.effectiveDisabled()).toBe(false);
  });

  it('nên phản hồi trạng thái disabled từ @Input() disabled', () => {
    const selectDebug = fixture.debugElement.query(By.directive(SelectComponent));
    const selectInstance = selectDebug.componentInstance as SelectComponent<string>;

    host.disabled.set(true);
    fixture.detectChanges();

    expect(selectInstance.effectiveDisabled()).toBe(true);
  });

  it('nên hiển thị nhãn label và dấu required khi được cấu hình', () => {
    const labelEl = fixture.debugElement.query(By.css('.dl-select-label'));
    expect(labelEl).toBeTruthy();
    expect(labelEl.nativeElement.textContent).toContain('Trạng thái');

    const requiredEl = fixture.debugElement.query(By.css('.dl-select-required'));
    expect(requiredEl).toBeTruthy();
    expect(requiredEl.nativeElement.textContent).toContain('*');
  });

  it('nên hiển thị hint khi được cấu hình và không có lỗi', () => {
    host.hint.set('Gợi ý chọn trạng thái phù hợp');
    fixture.detectChanges();

    const hintEl = fixture.debugElement.query(By.css('.field-hint'));
    expect(hintEl).toBeTruthy();
    expect(hintEl.nativeElement.textContent).toContain('Gợi ý chọn trạng thái phù hợp');
  });

  it('nên tự động hiển thị lỗi validation khi control invalid và touched', () => {
    host.control.setValue(null);
    host.control.markAsTouched();
    fixture.detectChanges();

    const selectDebug = fixture.debugElement.query(By.directive(SelectComponent));
    const selectInstance = selectDebug.componentInstance as SelectComponent<string>;

    expect(selectInstance.hasError()).toBe(true);
    const errorEl = fixture.debugElement.query(By.css('.error-message'));
    expect(errorEl).toBeTruthy();
    expect(errorEl.nativeElement.textContent).toContain('Trạng thái không được để trống');
  });

  it('nên ưu tiên hiển thị errorMessage thủ công khi được truyền vào', () => {
    host.errorMessage.set('Lỗi tùy biến bắt buộc');
    fixture.detectChanges();

    const selectDebug = fixture.debugElement.query(By.directive(SelectComponent));
    const selectInstance = selectDebug.componentInstance as SelectComponent<string>;

    expect(selectInstance.hasError()).toBe(true);
    const errorEl = fixture.debugElement.query(By.css('.error-message'));
    expect(errorEl).toBeTruthy();
    expect(errorEl.nativeElement.textContent).toContain('Lỗi tùy biến bắt buộc');
  });

  it('nên hoạt động chính xác khi dùng formControlName trong FormGroup', () => {
    const formFixture = TestBed.createComponent(TestFormGroupHostComponent);
    const formHost = formFixture.componentInstance;
    formFixture.detectChanges();

    const selectDebug = formFixture.debugElement.query(By.directive(SelectComponent));
    expect(selectDebug).toBeTruthy();
    const selectInstance = selectDebug.componentInstance as SelectComponent<string>;

    expect(selectInstance.internalValue()).toBeNull();

    // Chọn giá trị
    selectInstance.onModelChange('ADMIN');
    formFixture.detectChanges();

    expect(formHost.form.get('role')?.value).toBe('ADMIN');
    expect(formHost.form.valid).toBe(true);

    // Xóa giá trị và touch -> hiển thị lỗi
    selectInstance.onModelChange(null);
    formHost.form.get('role')?.markAsTouched();
    formFixture.detectChanges();

    expect(selectInstance.hasError()).toBe(true);
    const errorEl = formFixture.debugElement.query(By.css('.error-message'));
    expect(errorEl).toBeTruthy();
    expect(errorEl.nativeElement.textContent).toContain('Vai trò không được để trống');
  });

  it('nên hỗ trợ sử dụng độc lập (standalone) không label, không hint mà không sinh ra lỗi', () => {
    const standaloneFixture = TestBed.createComponent(TestStandaloneHostComponent);
    standaloneFixture.detectChanges();

    const selectDebug = standaloneFixture.debugElement.query(By.directive(SelectComponent));
    expect(selectDebug).toBeTruthy();

    const labelEl = standaloneFixture.debugElement.query(By.css('.field-label'));
    expect(labelEl).toBeNull();

    const selectInstance = selectDebug.componentInstance as SelectComponent<string>;
    expect(selectInstance.isStandalone()).toBe(true);
  });
});
