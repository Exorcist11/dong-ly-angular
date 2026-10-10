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
  CreateVehicleRequest,
  UpdateVehicleRequest,
  VehicleSummary,
  VehicleType,
} from '../../models/fleet.model';

@Component({
  selector: 'app-vehicle-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AppDialogComponent,
    InputComponent,
    SelectComponent,
    TranslatePipe,
  ],
  templateUrl: './vehicle-form-dialog.component.html',
  styleUrls: ['./vehicle-form-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VehicleFormDialogComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);

  @Input() visible = false;
  @Input() vehicle: VehicleSummary | null = null;
  @Input() submitting = false;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() save = new EventEmitter<CreateVehicleRequest | UpdateVehicleRequest>();

  readonly vehicleTypeOptions: SelectOption[] = [
    { label: 'Xe Giường nằm (SLEEPER)', value: 'SLEEPER' },
    { label: 'Xe Limousine VIP (LIMOUSINE)', value: 'LIMOUSINE' },
    { label: 'Xe Ghế ngồi (SEATER)', value: 'SEATER' },
  ];

  readonly floorOptions: SelectOption[] = [
    { label: '1 Tầng', value: '1' },
    { label: '2 Tầng', value: '2' },
  ];

  readonly form: FormGroup = this.initForm();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['vehicle'] && this.vehicle) {
      this.form.patchValue({
        plateNumber: this.vehicle.plateNumber,
        vehicleType: this.vehicle.vehicleType,
        brand: this.vehicle.brand,
        model: this.vehicle.model || '',
        manufactureYear: this.vehicle.manufactureYear || null,
        totalFloors: this.vehicle.totalFloors || 1,
        totalRows: this.vehicle.totalRows || 6,
        totalColumns: this.vehicle.totalColumns || 3,
        description: this.vehicle.description || '',
      });
    } else if (changes['visible'] && this.visible && !this.vehicle) {
      this.form.reset({
        plateNumber: '',
        vehicleType: 'LIMOUSINE',
        brand: 'Thaco Mobihome',
        model: '',
        manufactureYear: new Date().getFullYear(),
        totalFloors: 2,
        totalRows: 6,
        totalColumns: 3,
        description: '',
      });
    }
  }

  private initForm(): FormGroup {
    return this.fb.group({
      plateNumber: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[0-9]{2}[A-Za-z]-[0-9]{3,5}(\.[0-9]{2})?$/),
        ],
      ],
      vehicleType: ['LIMOUSINE', [Validators.required]],
      brand: ['', [Validators.required, Validators.maxLength(100)]],
      model: ['', [Validators.maxLength(100)]],
      manufactureYear: [
        new Date().getFullYear(),
        [Validators.min(1990), Validators.max(2100)],
      ],
      totalFloors: [2, [Validators.required, Validators.min(1), Validators.max(2)]],
      totalRows: [6, [Validators.required, Validators.min(1), Validators.max(20)]],
      totalColumns: [3, [Validators.required, Validators.min(1), Validators.max(10)]],
      description: [''],
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
    const payload: CreateVehicleRequest = {
      plateNumber: val.plateNumber.trim().toUpperCase(),
      vehicleType: val.vehicleType,
      brand: val.brand.trim(),
      model: val.model?.trim() || undefined,
      manufactureYear: val.manufactureYear ? Number(val.manufactureYear) : undefined,
      totalFloors: Number(val.totalFloors),
      totalRows: Number(val.totalRows),
      totalColumns: Number(val.totalColumns),
      description: val.description?.trim() || undefined,
    };

    this.save.emit(payload);
  }
}
