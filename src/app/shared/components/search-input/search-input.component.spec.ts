import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchInputComponent } from './search-input.component';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('SearchInputComponent', () => {
  let component: SearchInputComponent;
  let fixture: ComponentFixture<SearchInputComponent>;

  beforeEach(async () => {
    vi.useFakeTimers();

    await TestBed.configureTestingModule({
      imports: [SearchInputComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('nên khởi tạo thành công với giá trị rỗng', () => {
    expect(component).toBeTruthy();
    expect(component.internalValue()).toBe('');
    expect(component.hasValue()).toBe(false);
  });

  it('nên phát ra searchChange sau thời gian debounce', () => {
    let emittedSearch = '';
    component.searchChange.subscribe((val) => {
      emittedSearch = val;
    });

    component.onInputChange('Nguyễn Văn A');
    expect(emittedSearch).toBe(''); // Chưa emit ngay khi đang trong debounce

    vi.advanceTimersByTime(300); // Vượt qua thời gian debounce
    expect(emittedSearch).toBe('Nguyễn Văn A');
  });

  it('nên xóa giá trị và phát ra searchChange rỗng khi nhấn onClear()', () => {
    let emittedSearch = 'initial';
    let clearTriggered = false;

    component.searchChange.subscribe((val) => {
      emittedSearch = val;
    });
    component.clear.subscribe(() => {
      clearTriggered = true;
    });

    component.onInputChange('hello');
    vi.advanceTimersByTime(300);
    expect(emittedSearch).toBe('hello');

    component.onClear();
    vi.advanceTimersByTime(300);

    expect(component.internalValue()).toBe('');
    expect(emittedSearch).toBe('');
    expect(clearTriggered).toBe(true);
  });

  it('nên cập nhật internalValue khi input [value] thay đổi từ bên ngoài', () => {
    fixture.componentRef.setInput('value', 'Hà Nội');
    fixture.detectChanges();

    expect(component.internalValue()).toBe('Hà Nội');
    expect(component.hasValue()).toBe(true);
  });
});
