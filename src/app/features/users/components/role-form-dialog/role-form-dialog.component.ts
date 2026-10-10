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
import { Textarea } from 'primeng/textarea';
import { Tag } from 'primeng/tag';
import { FormFieldComponent } from '../../../../shared/components/form-field/form-field.component';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import {
  CreateRoleRequest,
  Role,
  RoleDetail,
  UpdateRoleRequest,
} from '../../models/user.model';

@Component({
  selector: 'app-role-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslatePipe,
    Dialog,
    Button,
    InputText,
    Textarea,
    FormFieldComponent,
  ],
  templateUrl: './role-form-dialog.component.html',
  styleUrl: './role-form-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoleFormDialogComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);

  @Input() visible = false;
  @Input() role: Role | RoleDetail | null = null;
  @Input() submitting = false;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() save = new EventEmitter<CreateRoleRequest | UpdateRoleRequest>();

  readonly roleForm: FormGroup = this.initForm();

  get isEditMode(): boolean {
    return !!this.role;
  }

  get isSystemRole(): boolean {
    return !!this.role?.isSystem;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible) {
      this.populateForm();
    }
  }

  private initForm(): FormGroup {
    return this.fb.group({
      code: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
          Validators.pattern(/^[A-Za-z0-9_]+$/),
        ],
      ],
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(255)]],
    });
  }

  private populateForm(): void {
    if (this.role) {
      this.roleForm.patchValue({
        code: this.role.code,
        name: this.role.name,
        description: this.role.description || '',
      });
      // Khi sửa, mã vai trò không được phép thay đổi
      this.roleForm.get('code')?.disable();
    } else {
      this.roleForm.reset({
        code: '',
        name: '',
        description: '',
      });
      this.roleForm.get('code')?.enable();
    }
    this.roleForm.markAsPristine();
    this.roleForm.markAsUntouched();
  }

  onCodeInput(event: Event): void {
    if (!this.isEditMode) {
      const input = event.target as HTMLInputElement;
      if (input?.value) {
        // Tự động chuẩn hóa thành chữ in hoa và gạch dưới
        const formatted = input.value.toUpperCase().replace(/\s+/g, '_');
        this.roleForm.get('code')?.setValue(formatted, { emitEvent: false });
      }
    }
  }

  onSubmit(): void {
    if (this.roleForm.invalid) {
      this.roleForm.markAllAsTouched();
      return;
    }

    const formRaw = this.roleForm.getRawValue();

    if (this.isEditMode) {
      const updatePayload: UpdateRoleRequest = {
        name: formRaw.name.trim(),
        description: formRaw.description ? formRaw.description.trim() : null,
      };
      this.save.emit(updatePayload);
    } else {
      const createPayload: CreateRoleRequest = {
        code: formRaw.code.trim().toUpperCase(),
        name: formRaw.name.trim(),
        description: formRaw.description ? formRaw.description.trim() : null,
      };
      this.save.emit(createPayload);
    }
  }

  onClose(): void {
    this.visibleChange.emit(false);
  }
}
