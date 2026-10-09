import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KpiCardComponent } from './kpi-card.component';

describe('KpiCardComponent', () => {
  let component: KpiCardComponent;
  let fixture: ComponentFixture<KpiCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KpiCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(KpiCardComponent);
    component = fixture.componentInstance;
  });

  it('should create and render label and value', () => {
    fixture.componentRef.setInput('label', 'Vé đã đặt');
    fixture.componentRef.setInput('value', '128');
    fixture.componentRef.setInput('icon', 'pi pi-ticket');
    fixture.detectChanges();

    expect(component).toBeTruthy();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.kpi-label')?.textContent).toContain('Vé đã đặt');
    expect(compiled.querySelector('.kpi-value')?.textContent).toContain('128');
  });

  it('should render skeleton when loading is true', () => {
    fixture.componentRef.setInput('label', 'Vé đã đặt');
    fixture.componentRef.setInput('value', '128');
    fixture.componentRef.setInput('icon', 'pi pi-ticket');
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.kpi-skeleton-box')).toBeTruthy();
  });
});
