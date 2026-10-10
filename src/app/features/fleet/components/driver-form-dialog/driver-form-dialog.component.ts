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
import { AppDialogComponent } from '../../../../shared/components/dialog/dialog.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { SelectComponent } from '../../../../shared/components/select/select.component';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';
import { SelectOption } from '../../../../shared/models/select-option.model';
import {
  CreateDriverRequest,
  Driver,
  UpdateDriverRequest,
} from '../../models/fleet.model';

@Component({
  selector: 'app-driver-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AppDialogComponent,
    InputComponent,
    SelectComponent,
    TranslatePipe,
  ],
  templateUrl: './driver-form-dialog.component.html',
  styleUrls: ['./driver-form-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DriverFormDialogComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);

  @Input() visible = false;
  @Input() driver: Driver | null = null;
  @Input() submitting = false;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() save = new EventEmitter<CreateDriverRequest | UpdateDriverRequest>();

  readonly licenseClassOptions: SelectOption[] = [
    { label: 'Hạng E (Xe trên 30 chỗ)', value: 'E' },
    { label: 'Hạng D (Xe từ 10 - 30 chỗ)', value: 'D' },
    { label: 'Hạng FC (Xe đầu kéo / kéo rơ moóc)', value: 'FC' },
  ];

  readonly form: FormGroup = this.initForm();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['driver'] && this.driver) {
      this.form.patchValue({
        code: this.driver.code,
        fullName: this.driver.fullName,
        phone: this.driver.phone,
        licenseNumber: this.driver.licenseNumber,
        licenseClass: this.driver.licenseClass,
        licenseExpiryDate: this.driver.licenseExpiryDate || '',
        dateOfBirth: this.driver.dateOfBirth || '',
        note: this.driver.note || '',
      });
    } else if (changes['visible'] && this.visible && !this.driver) {
      this.form.reset({
        code: '',
        fullName: '',
        phone: '',
        licenseNumber: '',
        licenseClass: 'E',
        licenseExpiryDate: '',
        dateOfBirth: '',
        note: '',
      });
    }
  }

  private initForm(): FormGroup {
    return this.fb.group({
      code: ['', [Validators.required, Validators.maxLength(30)]],
      fullName: ['', [Validators.required, Validators.maxLength(100)]],
      phone: [
        '',
        [
          Validators.required,
          Validators.pattern(/^(0[3|5|7|8|9])+([0-9]{8})$/),
        ],
      ],
      licenseNumber: ['', [Validators.required, Validators.maxLength(30)]],
      licenseClass: ['E', [Validators.required]],
      licenseExpiryDate: [''],
      dateOfBirth: [''],
      note: [''],
    });
  }

  onClose(): void {
    this.visibleChange.emit(false);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const val = this.form.value;
    const payload: CreateDriverRequest = {
      code: val.code.trim().toUpperCase(),
      fullName: val.fullName.trim(),
      phone: val.phone.trim(),
      licenseNumber: val.licenseNumber.trim(),
      licenseClass: val.licenseClass,
      licenseExpiryDate: val.licenseExpiryDate || undefined,
      dateOfBirth: val.dateOfBirth || undefined,
      note: val.note?.trim() || undefined,
    };

    this.save.emit(payload);
  }
}
