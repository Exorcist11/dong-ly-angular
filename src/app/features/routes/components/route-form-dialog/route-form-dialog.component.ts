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
  CreateRouteRequest,
  LocationItem,
  RouteDetail,
  RouteSummary,
  UpdateRouteRequest,
} from '../../models/route.model';

@Component({
  selector: 'app-route-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslatePipe,
    AppDialogComponent,
    InputComponent,
    SelectComponent,
  ],
  templateUrl: './route-form-dialog.component.html',
  styleUrl: './route-form-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RouteFormDialogComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);

  @Input() visible = false;
  @Input() route: RouteSummary | RouteDetail | null = null;
  @Input() locations: LocationItem[] = [];
  @Input() submitting = false;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() save = new EventEmitter<CreateRouteRequest | UpdateRouteRequest>();

  readonly form: FormGroup = this.initForm();

  get isEditMode(): boolean {
    return !!this.route;
  }

  get locationOptions(): SelectOption[] {
    return this.locations.map((loc) => ({
      label: `${loc.name} (${loc.province})`,
      value: loc.id,
    }));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['visible'] && this.visible) || (changes['locations'] && this.visible && !this.route)) {
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
      originLocationId: ['', [Validators.required]],
      destinationLocationId: ['', [Validators.required]],
      distanceKm: [null, [Validators.min(0)]],
      estimatedDurationMinutes: [null, [Validators.min(0)]],
      description: [''],
    });
  }

  private populateForm(): void {
    if (this.route) {
      this.form.patchValue({
        code: this.route.code,
        name: this.route.name,
        originLocationId: this.route.originLocation?.id ?? '',
        destinationLocationId: this.route.destinationLocation?.id ?? '',
        distanceKm: this.route.distanceKm ?? null,
        estimatedDurationMinutes: this.route.estimatedDurationMinutes ?? null,
        description: ('description' in this.route ? this.route.description : '') ?? '',
      });
    } else {
      this.form.reset({
        code: '',
        name: '',
        originLocationId: this.locations.length > 0 ? this.locations[0].id : '',
        destinationLocationId: this.locations.length > 1 ? this.locations[1].id : '',
        distanceKm: null,
        estimatedDurationMinutes: null,
        description: '',
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
    if (val.originLocationId === val.destinationLocationId) {
      this.form.get('destinationLocationId')?.setErrors({ sameAsOrigin: true });
      this.form.get('destinationLocationId')?.markAsTouched();
      return;
    }

    const payload: CreateRouteRequest = {
      code: val.code.trim().toUpperCase(),
      name: val.name.trim(),
      originLocationId: val.originLocationId,
      destinationLocationId: val.destinationLocationId,
      distanceKm: val.distanceKm ? Number(val.distanceKm) : null,
      estimatedDurationMinutes: val.estimatedDurationMinutes ? Number(val.estimatedDurationMinutes) : null,
      description: val.description ? val.description.trim() : null,
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
