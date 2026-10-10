import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  computed,
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
import { TranslationService } from '../../../../core/i18n/translation.service';
import { SelectOption } from '../../../../shared/models/select-option.model';
import {
  CreateTripRunRequest,
  TripRun,
  UpdateTripRunRequest,
} from '../../models/trip-run.model';

@Component({
  selector: 'app-trip-run-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslatePipe,
    AppDialogComponent,
    InputComponent,
    SelectComponent,
  ],
  templateUrl: './trip-run-form-dialog.component.html',
  styleUrls: ['./trip-run-form-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TripRunFormDialogComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);
  private readonly i18n = inject(TranslationService);

  @Input() visible = false;
  @Input() tripRun: TripRun | null = null;
  @Input() submitting = false;

  @Input() routeOptions: SelectOption[] = [];
  @Input() vehicleOptions: SelectOption[] = [];
  @Input() driverOptions: SelectOption[] = [];

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() save = new EventEmitter<CreateTripRunRequest | UpdateTripRunRequest>();

  readonly daysOfWeekList = computed(() => {
    this.i18n.currentLang();
    return [
      { value: 1, label: this.i18n.translate('trips.days.d1') },
      { value: 2, label: this.i18n.translate('trips.days.d2') },
      { value: 3, label: this.i18n.translate('trips.days.d3') },
      { value: 4, label: this.i18n.translate('trips.days.d4') },
      { value: 5, label: this.i18n.translate('trips.days.d5') },
      { value: 6, label: this.i18n.translate('trips.days.d6') },
      { value: 7, label: this.i18n.translate('trips.days.d7') },
    ];
  });

  selectedDays: number[] = [1, 2, 3, 4, 5, 6, 7];

  readonly form: FormGroup = this.initForm();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tripRun'] && this.tripRun) {
      const depTime = this.tripRun.departureTime ? this.tripRun.departureTime.substring(0, 5) : '07:00';
      this.selectedDays = this.parseDays(this.tripRun.daysOfWeek);

      this.form.patchValue({
        code: this.tripRun.code,
        name: this.tripRun.name,
        routeId: this.tripRun.routeId,
        departureTime: depTime,
        startDate: this.tripRun.startDate,
        endDate: this.tripRun.endDate || '',
        defaultVehicleId: this.tripRun.defaultVehicleId || '',
        defaultDriverId: this.tripRun.defaultDriverId || '',
        defaultAssistantDriverId: this.tripRun.defaultAssistantDriverId || '',
        basePrice: this.tripRun.basePrice || 0,
        note: this.tripRun.note || '',
      });
      this.form.get('code')?.disable();
    } else if (changes['visible'] && this.visible && !this.tripRun) {
      this.selectedDays = [1, 2, 3, 4, 5, 6, 7];
      this.form.reset({
        code: '',
        name: '',
        routeId: '',
        departureTime: '07:00',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        defaultVehicleId: '',
        defaultDriverId: '',
        defaultAssistantDriverId: '',
        basePrice: 250000,
        note: '',
      });
      this.form.get('code')?.enable();
    }
  }

  isDaySelected(day: number): boolean {
    return this.selectedDays.includes(day);
  }

  toggleDay(day: number): void {
    if (this.selectedDays.includes(day)) {
      if (this.selectedDays.length > 1) {
        this.selectedDays = this.selectedDays.filter((d) => d !== day);
      }
    } else {
      this.selectedDays = [...this.selectedDays, day].sort();
    }
  }

  onClose(): void {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const val = this.form.getRawValue();
    const daysCsv = this.selectedDays.join(',');
    const depTimeFormatted = val.departureTime.length === 5 ? val.departureTime + ':00' : val.departureTime;

    if (this.tripRun) {
      const payload: UpdateTripRunRequest = {
        name: val.name,
        routeId: val.routeId,
        departureTime: depTimeFormatted,
        daysOfWeek: daysCsv,
        startDate: val.startDate,
        endDate: val.endDate ? val.endDate : null,
        defaultVehicleId: val.defaultVehicleId ? val.defaultVehicleId : null,
        defaultDriverId: val.defaultDriverId ? val.defaultDriverId : null,
        defaultAssistantDriverId: val.defaultAssistantDriverId ? val.defaultAssistantDriverId : null,
        basePrice: Number(val.basePrice),
        note: val.note,
      };
      this.save.emit(payload);
    } else {
      const payload: CreateTripRunRequest = {
        code: val.code,
        name: val.name,
        routeId: val.routeId,
        departureTime: depTimeFormatted,
        daysOfWeek: daysCsv,
        startDate: val.startDate,
        endDate: val.endDate ? val.endDate : null,
        defaultVehicleId: val.defaultVehicleId ? val.defaultVehicleId : null,
        defaultDriverId: val.defaultDriverId ? val.defaultDriverId : null,
        defaultAssistantDriverId: val.defaultAssistantDriverId ? val.defaultAssistantDriverId : null,
        basePrice: Number(val.basePrice),
        note: val.note,
      };
      this.save.emit(payload);
    }
  }

  private initForm(): FormGroup {
    return this.fb.group({
      code: ['', [Validators.required, Validators.maxLength(50)]],
      name: ['', [Validators.required, Validators.maxLength(150)]],
      routeId: ['', [Validators.required]],
      departureTime: ['07:00', [Validators.required]],
      startDate: ['', [Validators.required]],
      endDate: [''],
      defaultVehicleId: [''],
      defaultDriverId: [''],
      defaultAssistantDriverId: [''],
      basePrice: [250000, [Validators.required, Validators.min(0)]],
      note: [''],
    });
  }

  private parseDays(csv: string): number[] {
    if (!csv) return [1, 2, 3, 4, 5, 6, 7];
    return csv
      .split(',')
      .map((s) => Number(s.trim()))
      .filter((n) => !isNaN(n) && n >= 1 && n <= 7);
  }
}
