import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { SelectComponent } from './select.component';
import { SelectOption } from '../../models/select-option.model';

@Component({
  standalone: true,
  imports: [SelectComponent, ReactiveFormsModule],
  template: `
    <app-select
      [options]="options"
      [formControl]="control"
      [placeholder]="placeholder()"
      [disabled]="disabled()"
      [clearable]="clearable()"
      [width]="width()"
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

  readonly control = new FormControl<string>('ALL');
  readonly placeholder = signal<string>('Chọn trạng thái...');
  readonly disabled = signal<boolean>(false);
  readonly clearable = signal<boolean>(true);
  readonly width = signal<string>('200px');

  selectedVal: string | null = null;

  onSelectionChange(val: string | null): void {
    this.selectedVal = val;
  }
}

describe('SelectComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent, SelectComponent],
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
});
