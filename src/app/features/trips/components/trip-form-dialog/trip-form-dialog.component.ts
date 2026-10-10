import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AppDialogComponent } from '../../../../shared/components/dialog/dialog.component';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';
import { TranslationService } from '../../../../core/i18n/translation.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { SelectComponent } from '../../../../shared/components/select/select.component';
import { SelectOption } from '../../../../shared/models/select-option.model';
import { NotificationService } from '../../../../core/services/notification.service';
import {
  ConflictCheckRequest,
  CreateTripRequest,
  Trip,
  UpdateTripRequest,
} from '../../models/trip.model';
import { TripService } from '../../services/trip.service';

@Component({
  selector: 'app-trip-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslatePipe,
    AppDialogComponent,
    ButtonComponent,
    InputComponent,
    SelectComponent,
  ],
  templateUrl: './trip-form-dialog.component.html',
  styleUrls: ['./trip-form-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TripFormDialogComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);
  private readonly tripService = inject(TripService);
  private readonly notification = inject(NotificationService);
  private readonly i18n = inject(TranslationService);

  @Input() visible = false;
  @Input() trip: Trip | null = null;
  @Input() submitting = false;

  @Input() routeOptions: SelectOption[] = [];
  @Input() vehicleOptions: SelectOption[] = [];
  @Input() driverOptions: SelectOption[] = [];

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() save = new EventEmitter<CreateTripRequest | UpdateTripRequest>();

  readonly checkingConflict = signal(false);
  readonly conflictWarning = signal<string | null>(null);

  readonly form: FormGroup = this.initForm();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['trip'] && this.trip) {
      this.conflictWarning.set(null);
      this.form.patchValue({
        code: this.trip.code,
        routeId: this.trip.routeId,
        vehicleId: this.trip.vehicleId,
        driverId: this.trip.driverId,
        assistantDriverId: this.trip.assistantDriverId,
        departureTime: this.formatToDateTimeLocal(this.trip.departureTime),
        estimatedArrivalTime: this.formatToDateTimeLocal(this.trip.estimatedArrivalTime),
        basePrice: this.trip.basePrice || 0,
        note: this.trip.note || '',
      });
      this.form.get('routeId')?.disable();
    } else if (changes['visible'] && this.visible && !this.trip) {
      this.conflictWarning.set(null);
      const now = new Date();
      now.setHours(now.getHours() + 2, 0, 0, 0);
      const later = new Date(now.getTime() + 3 * 3600 * 1000);

      this.form.reset({
        code: '',
        routeId: '',
        vehicleId: '',
        driverId: '',
        assistantDriverId: '',
        departureTime: this.formatToDateTimeLocal(now.toISOString()),
        estimatedArrivalTime: this.formatToDateTimeLocal(later.toISOString()),
        basePrice: 250000,
        note: '',
      });
      this.form.get('routeId')?.enable();
    }
  }

  onClose(): void {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  onCheckConflict(): void {
    const val = this.form.getRawValue();
    if (!val.departureTime || !val.estimatedArrivalTime) {
      this.notification.warning(this.i18n.translate('trips.notifications.selectTimesFirst'));
      return;
    }

    if (val.driverId && val.assistantDriverId && val.driverId === val.assistantDriverId) {
      this.conflictWarning.set(this.i18n.translate('trips.tripForm.sameDriverWarning'));
      return;
    }

    const payload: ConflictCheckRequest = {
      tripId: this.trip ? this.trip.id : null,
      vehicleId: val.vehicleId ? val.vehicleId : null,
      driverId: val.driverId ? val.driverId : null,
      assistantDriverId: val.assistantDriverId ? val.assistantDriverId : null,
      departureTime: new Date(val.departureTime).toISOString(),
      estimatedArrivalTime: new Date(val.estimatedArrivalTime).toISOString(),
    };

    this.checkingConflict.set(true);
    this.tripService.checkConflict(payload).subscribe({
      next: (res) => {
        this.checkingConflict.set(false);
        if (res.data.hasConflict) {
          this.conflictWarning.set(res.data.conflictMessages.join('. '));
        } else {
          this.conflictWarning.set(null);
          this.notification.success(this.i18n.translate('trips.notifications.noConflictSuccess'));
        }
      },
      error: () => {
        this.checkingConflict.set(false);
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const val = this.form.getRawValue();
    if (val.driverId === val.assistantDriverId) {
      this.notification.error(this.i18n.translate('trips.notifications.sameDriverError'));
      return;
    }

    const depIso = new Date(val.departureTime).toISOString();
    const arrIso = val.estimatedArrivalTime ? new Date(val.estimatedArrivalTime).toISOString() : undefined;

    if (this.trip) {
      const payload: UpdateTripRequest = {
        vehicleId: val.vehicleId,
        driverId: val.driverId,
        assistantDriverId: val.assistantDriverId,
        departureTime: depIso,
        estimatedArrivalTime: arrIso,
        basePrice: Number(val.basePrice),
        note: val.note,
      };
      this.save.emit(payload);
    } else {
      const payload: CreateTripRequest = {
        code: val.code ? val.code.trim() : undefined,
        routeId: val.routeId,
        vehicleId: val.vehicleId,
        driverId: val.driverId,
        assistantDriverId: val.assistantDriverId,
        departureTime: depIso,
        estimatedArrivalTime: arrIso,
        basePrice: Number(val.basePrice),
        note: val.note,
      };
      this.save.emit(payload);
    }
  }

  private initForm(): FormGroup {
    return this.fb.group({
      code: [''],
      routeId: ['', [Validators.required]],
      vehicleId: ['', [Validators.required]],
      driverId: ['', [Validators.required]],
      assistantDriverId: ['', [Validators.required]],
      departureTime: ['', [Validators.required]],
      estimatedArrivalTime: ['', [Validators.required]],
      basePrice: [250000, [Validators.required, Validators.min(0)]],
      note: [''],
    });
  }

  private formatToDateTimeLocal(isoString: string): string {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      const pad = (n: number) => (n < 10 ? '0' + n : n);
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch {
      return '';
    }
  }
}
