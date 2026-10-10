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
import { TranslationService } from '../../../../core/i18n/translation.service';
import { SelectOption } from '../../../../shared/models/select-option.model';
import { Trip, TripStatus, UpdateTripStatusRequest } from '../../models/trip.model';

@Component({
  selector: 'app-trip-status-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslatePipe,
    AppDialogComponent,
    InputComponent,
    SelectComponent,
  ],
  templateUrl: './trip-status-dialog.component.html',
  styleUrls: ['./trip-status-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TripStatusDialogComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);
  private readonly i18n = inject(TranslationService);

  @Input() visible = false;
  @Input() trip: Trip | null = null;
  @Input() submitting = false;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() save = new EventEmitter<UpdateTripStatusRequest>();

  statusOptions: SelectOption<TripStatus>[] = [];
  readonly form: FormGroup = this.initForm();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['trip'] && this.trip) {
      this.statusOptions = this.getValidTransitions(this.trip.status);
      this.form.reset({
        status: this.statusOptions.length > 0 ? this.statusOptions[0].value : this.trip.status,
        note: '',
      });
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
    const payload: UpdateTripStatusRequest = {
      status: val.status,
      note: val.note || undefined,
    };
    this.save.emit(payload);
  }

  private initForm(): FormGroup {
    return this.fb.group({
      status: ['', [Validators.required]],
      note: [''],
    });
  }

  private getValidTransitions(current: TripStatus): SelectOption<TripStatus>[] {
    switch (current) {
      case 'SCHEDULED':
        return [
          { label: this.i18n.translate('trips.statusDialog.transitions.ready'), value: 'READY' },
          { label: this.i18n.translate('trips.statusDialog.transitions.cancelled'), value: 'CANCELLED' },
        ];
      case 'READY':
        return [
          { label: this.i18n.translate('trips.statusDialog.transitions.departed'), value: 'DEPARTED' },
          { label: this.i18n.translate('trips.statusDialog.transitions.scheduled'), value: 'SCHEDULED' },
          { label: this.i18n.translate('trips.statusDialog.transitions.cancelled'), value: 'CANCELLED' },
        ];
      case 'DEPARTED':
        return [
          { label: this.i18n.translate('trips.statusDialog.transitions.completed'), value: 'COMPLETED' },
          { label: this.i18n.translate('trips.statusDialog.transitions.cancelled'), value: 'CANCELLED' },
        ];
      default:
        return [];
    }
  }
}
