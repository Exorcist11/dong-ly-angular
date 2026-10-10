import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Password } from 'primeng/password';
import { MultiSelect } from 'primeng/multiselect';
import { FormFieldComponent } from '../../../../shared/components/form-field/form-field.component';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';
import { CreateUserRequest, Role, UpdateUserRequest, User } from '../../models/user.model';

@Component({
  selector: 'app-user-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslatePipe,
    Dialog,
    Button,
    InputText,
    Password,
    MultiSelect,
    FormFieldComponent,
  ],
  templateUrl: './user-form-dialog.component.html',
  styleUrl: './user-form-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserFormDialogComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);

  @Input() visible = false;
  @Input() user: User | null = null;
  @Input() roles: Role[] = [];
  @Input() submitting = false;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() save = new EventEmitter<CreateUserRequest | UpdateUserRequest>();

  readonly userForm: FormGroup = this.initForm();

  get isEditMode(): boolean {
    return !!this.user;
  }

  get roleOptions(): { label: string; value: string }[] {
    return this.roles.map((r) => ({
      label: `${r.name} (${r.code})`,
      value: r.code,
    }));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible) {
      this.populateForm();
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.userForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onVisibleChange(value: boolean): void {
    this.visible = value;
    this.visibleChange.emit(value);
  }

  onCancel(): void {
    this.onVisibleChange(false);
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const formVal = this.userForm.getRawValue();

    if (this.isEditMode) {
      const updatePayload: UpdateUserRequest = {
        fullName: formVal.fullName.trim(),
        email: formVal.email.trim(),
        phone: formVal.phone ? formVal.phone.trim() : null,
        roleCodes: formVal.roleCodes,
      };
      this.save.emit(updatePayload);
    } else {
      const createPayload: CreateUserRequest = {
        username: formVal.username.trim(),
        fullName: formVal.fullName.trim(),
        email: formVal.email.trim(),
        password: formVal.password,
        phone: formVal.phone ? formVal.phone.trim() : null,
        roleCodes: formVal.roleCodes,
      };
      this.save.emit(createPayload);
    }
  }

  private initForm(): FormGroup {
    return this.fb.group({
      username: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
          Validators.pattern(/^[a-zA-Z0-9_.-]+$/),
        ],
      ],
      fullName: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      password: ['', [Validators.minLength(8), Validators.maxLength(64)]],
      phone: ['', [Validators.pattern(/^(0[3|5|7|8|9])+([0-9]{8})$|^$/)]],
      roleCodes: [[] as string[]],
    });
  }

  private populateForm(): void {
    if (this.user) {
      this.userForm.reset({
        username: this.user.username,
        fullName: this.user.fullName,
        email: this.user.email,
        password: '',
        phone: this.user.phone ?? '',
        roleCodes: [...(this.user.roles ?? [])],
      });
      this.userForm.get('username')?.disable();
      this.userForm.get('password')?.clearValidators();
      this.userForm.get('password')?.updateValueAndValidity();
    } else {
      this.userForm.reset({
        username: '',
        fullName: '',
        email: '',
        password: '',
        phone: '',
        roleCodes: [],
      });
      this.userForm.get('username')?.enable();
      this.userForm.get('password')?.setValidators([
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(64),
      ]);
      this.userForm.get('password')?.updateValueAndValidity();
    }
  }
}
