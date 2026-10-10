import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatusBadgeComponent } from './status-badge.component';

describe('StatusBadgeComponent', () => {
  let component: StatusBadgeComponent;
  let fixture: ComponentFixture<StatusBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusBadgeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StatusBadgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('nên khởi tạo thành công', () => {
    expect(component).toBeTruthy();
  });

  it('nên map trạng thái ACTIVE thành Hoạt động với severity success', () => {
    fixture.componentRef.setInput('status', 'ACTIVE');
    fixture.detectChanges();

    expect(component.displayLabel()).toBe('Hoạt động');
    expect(component.displaySeverity()).toBe('success');
  });

  it('nên map trạng thái INACTIVE thành Tạm khóa với severity danger', () => {
    fixture.componentRef.setInput('status', 'INACTIVE');
    fixture.detectChanges();

    expect(component.displayLabel()).toBe('Tạm khóa');
    expect(component.displaySeverity()).toBe('danger');
  });

  it('nên map trạng thái SYSTEM thành Hệ thống với severity contrast', () => {
    fixture.componentRef.setInput('status', 'SYSTEM');
    fixture.detectChanges();

    expect(component.displayLabel()).toBe('Hệ thống');
    expect(component.displaySeverity()).toBe('contrast');
  });

  it('cho phép ghi đè label và severity tùy biến', () => {
    fixture.componentRef.setInput('status', 'ACTIVE');
    fixture.componentRef.setInput('label', 'Đang vận hành');
    fixture.componentRef.setInput('severity', 'info');
    fixture.detectChanges();

    expect(component.displayLabel()).toBe('Đang vận hành');
    expect(component.displaySeverity()).toBe('info');
  });
});
