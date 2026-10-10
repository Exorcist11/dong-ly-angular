import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserFormDialogComponent } from './user-form-dialog.component';
import { User } from '../../models/user.model';

describe('UserFormDialogComponent', () => {
  let component: UserFormDialogComponent;
  let fixture: ComponentFixture<UserFormDialogComponent>;

  const mockUser: User = {
    id: 'u-1',
    username: 'nguyenvana',
    email: 'a@dongly.vn',
    fullName: 'Nguyễn Văn A',
    phone: '0987654321',
    status: 'ACTIVE',
    roles: ['OPERATOR'],
    createdAt: '2026-01-01T00:00:00Z',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserFormDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UserFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create user form dialog component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize empty form in create mode', () => {
    component.user = null;
    component.visible = true;
    component.ngOnChanges({
      visible: {
        currentValue: true,
        previousValue: false,
        firstChange: true,
        isFirstChange: () => true,
      },
    });

    expect(component.isEditMode).toBe(false);
    expect(component.userForm.get('username')?.enabled).toBe(true);
    expect(component.userForm.get('password')?.validator).toBeTruthy();
  });

  it('should populate form and disable username in edit mode', () => {
    component.user = mockUser;
    component.visible = true;
    component.ngOnChanges({
      visible: {
        currentValue: true,
        previousValue: false,
        firstChange: true,
        isFirstChange: () => true,
      },
    });

    expect(component.isEditMode).toBe(true);
    expect(component.userForm.get('username')?.value).toBe('nguyenvana');
    expect(component.userForm.get('username')?.disabled).toBe(true);
    expect(component.userForm.get('fullName')?.value).toBe('Nguyễn Văn A');
  });

  it('should emit save event with valid form submission in create mode', () => {
    component.user = null;
    component.visible = true;
    component.ngOnChanges({
      visible: {
        currentValue: true,
        previousValue: false,
        firstChange: true,
        isFirstChange: () => true,
      },
    });

    component.userForm.patchValue({
      username: 'tranb',
      fullName: 'Trần B',
      email: 'b@dongly.vn',
      password: 'validPassword123',
      phone: '0912345678',
      roleCodes: ['STAFF'],
    });

    let emittedPayload: any = null;
    component.save.subscribe((payload) => {
      emittedPayload = payload;
    });

    component.onSubmit();

    expect(emittedPayload).toBeTruthy();
    expect(emittedPayload.username).toBe('tranb');
    expect(emittedPayload.email).toBe('b@dongly.vn');
  });
});
