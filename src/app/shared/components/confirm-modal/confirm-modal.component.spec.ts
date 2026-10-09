import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmModalComponent } from './confirm-modal.component';

describe('ConfirmModalComponent', () => {
  let component: ConfirmModalComponent;
  let fixture: ComponentFixture<ConfirmModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit confirm event when onConfirm is called', () => {
    let emitted = false;
    component.confirm.subscribe(() => {
      emitted = true;
    });

    component.onConfirm();
    expect(emitted).toBe(true);
  });

  it('should emit cancel event when onCancel is called', () => {
    let emitted = false;
    component.cancel.subscribe(() => {
      emitted = true;
    });

    component.onCancel();
    expect(emitted).toBe(true);
  });
});
