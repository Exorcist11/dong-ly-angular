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
import { FormFieldComponent } from '../../../../shared/components/form-field/form-field.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { SelectComponent } from '../../../../shared/components/select/select.component';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';
import { SelectOption } from '../../../../shared/models/select-option.model';
import {
  CreateStopPointRequest,
  LocationItem,
  StopPoint,
  UpdateStopPointRequest,
} from '../../models/route.model';

@Component({
  selector: 'app-stop-point-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslatePipe,
    AppDialogComponent,
    FormFieldComponent,
    InputComponent,
    SelectComponent,
  ],
  templateUrl: './stop-point-dialog.component.html',
  styleUrl: './stop-point-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StopPointDialogComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);

  @Input() visible = false;
  @Input() stopPoint: StopPoint | null = null;
  @Input() locations: LocationItem[] = [];
  @Input() submitting = false;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() save = new EventEmitter<CreateStopPointRequest | UpdateStopPointRequest>();

  readonly form: FormGroup = this.initForm();

  get isEditMode(): boolean {
    return !!this.stopPoint;
  }

  get locationOptions(): SelectOption[] {
    return this.locations.map((loc) => ({
      label: `${loc.name} (${loc.province})`,
      value: loc.id,
    }));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['visible'] && this.visible) || (changes['locations'] && this.visible && !this.stopPoint)) {
      this.populateForm();
    }
  }

  private initForm(): FormGroup {
    return this.fb.group({
      code: [
        '',
        [
          Validators.required,
          Validators.maxLength(50),
          Validators.pattern(/^[A-Za-z0-9_-]+$/),
        ],
      ],
      name: ['', [Validators.required, Validators.maxLength(150)]],
      locationId: ['', [Validators.required]],
      address: ['', [Validators.required, Validators.maxLength(255)]],
      contactPhone: ['', [Validators.maxLength(20)]],
      latitude: [null],
      longitude: [null],
    });
  }

  private populateForm(): void {
    if (this.stopPoint) {
      this.form.patchValue({
        code: this.stopPoint.code,
        name: this.stopPoint.name,
        locationId: this.stopPoint.locationId,
        address: this.stopPoint.address,
        contactPhone: this.stopPoint.contactPhone ?? '',
        latitude: this.stopPoint.latitude ?? null,
        longitude: this.stopPoint.longitude ?? null,
      });
    } else {
      this.form.reset({
        code: '',
        name: '',
        locationId: this.locations.length > 0 ? this.locations[0].id : '',
        address: '',
        contactPhone: '',
        latitude: null,
        longitude: null,
      });
    }
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  onSubmit(): void {
    if (this.form.invalid || this.submitting) {
      this.form.markAllAsTouched();
      return;
    }

    const val = this.form.value;
    const payload: CreateStopPointRequest = {
      code: val.code.trim().toUpperCase(),
      name: val.name.trim(),
      locationId: val.locationId,
      address: val.address.trim(),
      contactPhone: val.contactPhone ? val.contactPhone.trim() : null,
      latitude: val.latitude ? Number(val.latitude) : null,
      longitude: val.longitude ? Number(val.longitude) : null,
    };

    this.save.emit(payload);
  }

  onCancel(): void {
    this.visibleChange.emit(false);
  }

  onVisibleChange(val: boolean): void {
    this.visibleChange.emit(val);
  }
}
