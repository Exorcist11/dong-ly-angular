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
import { FormFieldComponent } from '../../../../shared/components/form-field/form-field.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';
import { TranslationService } from '../../../../core/i18n/translation.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import {
  GenerateTripsPreviewItem,
  GenerateTripsPreviewResponse,
  GenerateTripsRequest,
  TripRun,
} from '../../models/trip-run.model';
import { TripRunService } from '../../services/trip-run.service';

@Component({
  selector: 'app-generate-trips-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslatePipe,
    AppDialogComponent,
    ButtonComponent,
    FormFieldComponent,
    InputComponent,
  ],
  templateUrl: './generate-trips-dialog.component.html',
  styleUrls: ['./generate-trips-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenerateTripsDialogComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);
  private readonly tripRunService = inject(TripRunService);
  private readonly notification = inject(NotificationService);
  private readonly i18n = inject(TranslationService);

  @Input() visible = false;
  @Input() tripRun: TripRun | null = null;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() generated = new EventEmitter<void>();

  readonly form: FormGroup = this.initForm();
  readonly isPreviewing = signal(false);
  readonly isExecuting = signal(false);
  readonly previewData = signal<GenerateTripsPreviewResponse | null>(null);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible) {
      const today = new Date();
      const nextMonth = new Date();
      nextMonth.setDate(today.getDate() + 14);

      this.form.reset({
        fromDate: today.toISOString().split('T')[0],
        toDate: nextMonth.toISOString().split('T')[0],
      });
      this.previewData.set(null);
    }
  }

  onClose(): void {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  onPreview(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const val = this.form.getRawValue();
    const payload: GenerateTripsRequest = {
      tripRunId: this.tripRun ? this.tripRun.id : null,
      fromDate: val.fromDate,
      toDate: val.toDate,
    };

    this.isPreviewing.set(true);
    this.tripRunService.previewGenerateTrips(payload).subscribe({
      next: (res) => {
        this.isPreviewing.set(false);
        if (res.success && res.data) {
          this.previewData.set(res.data);
        }
      },
      error: (err) => {
        this.isPreviewing.set(false);
        this.notification.error(err.error?.message || this.i18n.translate('trips.notifications.previewFailed'));
      },
    });
  }

  onExecute(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const val = this.form.getRawValue();
    const payload: GenerateTripsRequest = {
      tripRunId: this.tripRun ? this.tripRun.id : null,
      fromDate: val.fromDate,
      toDate: val.toDate,
    };

    this.isExecuting.set(true);
    this.tripRunService.executeGenerateTrips(payload).subscribe({
      next: (res) => {
        this.isExecuting.set(false);
        if (res.success) {
          this.notification.success(res.data.message || this.i18n.translate('trips.notifications.generateSuccess'));
          this.generated.emit();
          this.onClose();
        }
      },
      error: (err) => {
        this.isExecuting.set(false);
        this.notification.error(err.error?.message || this.i18n.translate('trips.notifications.generateFailed'));
      },
    });
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  }

  formatTime(isoStr: string): string {
    if (!isoStr) return '';
    try {
      const d = new Date(isoStr);
      return d.toLocaleTimeString(this.i18n.currentLocale(), { hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoStr;
    }
  }

  getDayLabel(day: number): string {
    return this.i18n.translate(`trips.days.d${day}`);
  }

  private initForm(): FormGroup {
    return this.fb.group({
      fromDate: ['', [Validators.required]],
      toDate: ['', [Validators.required]],
    });
  }
}
