import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import {
  BreadcrumbItem,
  PageHeaderComponent,
} from '../../../../shared/components/page-header/page-header.component';
import { DataTableComponent } from '../../../../shared/components/data-table/data-table.component';
import { TableCellDirective } from '../../../../shared/components/data-table/table-cell.directive';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';
import { HasPermissionDirective } from '../../../../shared/directives/has-permission.directive';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';
import { TranslationService } from '../../../../core/i18n/translation.service';
import { NotificationService } from '../../../../core/services/notification.service';
import {
  TableColumn,
  TableFilterChangeEvent,
  TableFilterConfig,
  TableLazyLoadEvent,
} from '../../../../shared/models/table.model';
import { SelectOption } from '../../../../shared/models/select-option.model';

import {
  CreateTripRunRequest,
  TripRun,
  TripRunStatus,
  UpdateTripRunRequest,
} from '../../models/trip-run.model';
import { TripRunService } from '../../services/trip-run.service';
import { RouteService } from '../../../routes/services/route.service';
import { FleetService } from '../../../fleet/services/fleet.service';
import { TripRunFormDialogComponent } from '../../components/trip-run-form-dialog/trip-run-form-dialog.component';
import { GenerateTripsDialogComponent } from '../../components/generate-trips-dialog/generate-trips-dialog.component';

@Component({
  selector: 'app-trip-run-list-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslatePipe,
    PageHeaderComponent,
    DataTableComponent,
    TableCellDirective,
    ButtonComponent,
    StatusBadgeComponent,
    ConfirmModalComponent,
    HasPermissionDirective,
    TripRunFormDialogComponent,
    GenerateTripsDialogComponent,
  ],
  templateUrl: './trip-run-list-page.component.html',
  styleUrls: ['./trip-run-list-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TripRunListPageComponent implements OnInit {
  private readonly tripRunService = inject(TripRunService);
  private readonly routeService = inject(RouteService);
  private readonly fleetService = inject(FleetService);
  private readonly notification = inject(NotificationService);
  private readonly i18n = inject(TranslationService);

  // SELECT OPTIONS CACHE
  readonly routeOptions = signal<SelectOption[]>([]);
  readonly vehicleOptions = signal<SelectOption[]>([]);
  readonly driverOptions = signal<SelectOption[]>([]);

  // BREADCRUMBS
  readonly breadcrumbs = computed<BreadcrumbItem[]>(() => {
    this.i18n.currentLang();
    return [
      { label: this.i18n.translate('navigation.home'), url: '/dashboard' },
      { label: this.i18n.translate('navigation.groups.operations') },
      { label: this.i18n.translate('trips.runsTitle') },
    ];
  });

  // ==================== TRIP RUNS STATE ====================
  readonly tripRunsList = signal<TripRun[]>([]);
  readonly tripRunsTotal = signal(0);
  readonly tripRunsLoading = signal(false);
  readonly tripRunsPage = signal(0);
  readonly tripRunsSize = signal(10);
  private tripRunsSort = 'createdAt,desc';
  private tripRunsKeyword = '';
  private tripRunsRouteId?: string;
  private tripRunsStatus?: TripRunStatus;

  // DIALOG STATES
  readonly showTripRunDialog = signal(false);
  readonly selectedTripRun = signal<TripRun | null>(null);
  readonly tripRunSubmitting = signal(false);

  readonly showGenerateDialog = signal(false);
  readonly generateTargetTripRun = signal<TripRun | null>(null);

  // DELETE MODAL
  readonly showDeleteModal = signal(false);
  readonly deleteTargetTripRun = signal<TripRun | null>(null);

  // TABLE COLUMNS
  readonly tripRunColumns = computed<TableColumn[]>(() => {
    this.i18n.currentLang();
    return [
      { field: 'code', header: this.i18n.translate('trips.tripRunColumns.code'), sortable: true, width: '130px' },
      { field: 'name', header: this.i18n.translate('trips.tripRunColumns.name'), sortable: true, width: '200px' },
      { field: 'route', header: this.i18n.translate('trips.tripRunColumns.route'), width: '180px' },
      { field: 'departureTime', header: this.i18n.translate('trips.tripRunColumns.departureTime'), width: '110px' },
      { field: 'daysOfWeek', header: this.i18n.translate('trips.tripRunColumns.daysOfWeek'), width: '150px' },
      { field: 'dates', header: this.i18n.translate('trips.tripRunColumns.dates'), width: '180px' },
      { field: 'status', header: this.i18n.translate('trips.tripRunColumns.status'), width: '120px' },
      { field: 'actions', header: this.i18n.translate('trips.tripRunColumns.actions'), align: 'center', width: '160px' },
    ];
  });

  // TABLE FILTERS
  readonly tripRunFilters = computed<TableFilterConfig[]>(() => [
    {
      key: 'routeId',
      label: this.i18n.translate('trips.filters.route'),
      placeholder: this.i18n.translate('trips.filters.allRoutes'),
      options: [
        { label: this.i18n.translate('trips.filters.allRoutes'), value: '' },
        ...this.routeOptions(),
      ],
    },
    {
      key: 'status',
      label: this.i18n.translate('trips.filters.status'),
      placeholder: this.i18n.translate('trips.filters.allStatuses'),
      options: [
        { label: this.i18n.translate('trips.filters.allStatuses'), value: '' },
        { label: `${this.i18n.translate('trips.statuses.active')} (ACTIVE)`, value: 'ACTIVE' },
        { label: `${this.i18n.translate('trips.statuses.inactive')} (INACTIVE)`, value: 'INACTIVE' },
      ],
    },
  ]);

  ngOnInit(): void {
    this.loadSelectOptions();
    this.loadTripRuns();
  }

  private loadSelectOptions(): void {
    // 1. Tuyến đường
    this.routeService.searchRoutes(0, 100).subscribe({
      next: (res) => {
        if (res.data?.items) {
          const opts = res.data.items.map((r) => ({
            label: `${r.code} - ${r.name}`,
            value: r.id,
          }));
          this.routeOptions.set(opts);
        }
      },
    });

    // 2. Phương tiện
    this.fleetService.searchVehicles(0, 100).subscribe({
      next: (res) => {
        if (res.data?.items) {
          const opts = res.data.items.map((v) => ({
            label: `${v.plateNumber} (${v.brand})`,
            value: v.id,
          }));
          this.vehicleOptions.set(opts);
        }
      },
    });

    // 3. Tài xế & Phụ xe
    this.fleetService.searchDrivers(0, 100).subscribe({
      next: (res) => {
        if (res.data?.items) {
          const opts = res.data.items.map((d) => ({
            label: `${d.code} - ${d.fullName}`,
            value: d.id,
          }));
          this.driverOptions.set(opts);
        }
      },
    });
  }

  loadTripRuns(): void {
    this.tripRunsLoading.set(true);
    this.tripRunService
      .searchTripRuns(
        this.tripRunsPage(),
        this.tripRunsSize(),
        this.tripRunsSort,
        this.tripRunsKeyword,
        this.tripRunsRouteId,
        this.tripRunsStatus
      )
      .subscribe({
        next: (res) => {
          this.tripRunsLoading.set(false);
          this.tripRunsList.set(res.data?.items || []);
          this.tripRunsTotal.set(res.data?.pagination?.totalElements || 0);
        },
        error: () => {
          this.tripRunsLoading.set(false);
          this.notification.error(this.i18n.translate('trips.notifications.loadTripRunsFailed'));
        },
      });
  }

  onTripRunLazyLoad(event: TableLazyLoadEvent): void {
    this.tripRunsPage.set(Math.floor(event.first / event.rows));
    this.tripRunsSize.set(event.rows);
    if (event.sortField) {
      this.tripRunsSort = `${event.sortField},${event.sortOrder === 1 ? 'asc' : 'desc'}`;
    }
    this.loadTripRuns();
  }

  onTripRunSearch(query: string): void {
    this.tripRunsKeyword = query;
    this.tripRunsPage.set(0);
    this.loadTripRuns();
  }

  onTripRunFilterChange(event: TableFilterChangeEvent): void {
    if (event.key === 'routeId') {
      this.tripRunsRouteId = (event.value as string) || undefined;
    } else if (event.key === 'status') {
      this.tripRunsStatus = (event.value as TripRunStatus) || undefined;
    }
    this.tripRunsPage.set(0);
    this.loadTripRuns();
  }

  openCreateTripRunDialog(): void {
    this.selectedTripRun.set(null);
    this.showTripRunDialog.set(true);
  }

  openEditTripRunDialog(run: TripRun): void {
    this.selectedTripRun.set(run);
    this.showTripRunDialog.set(true);
  }

  openGenerateDialog(run?: TripRun): void {
    this.generateTargetTripRun.set(run || null);
    this.showGenerateDialog.set(true);
  }

  onSaveTripRun(payload: CreateTripRunRequest | UpdateTripRunRequest): void {
    this.tripRunSubmitting.set(true);
    const editing = this.selectedTripRun();

    if (editing) {
      this.tripRunService.updateTripRun(editing.id, payload as UpdateTripRunRequest).subscribe({
        next: () => {
          this.tripRunSubmitting.set(false);
          this.notification.success(this.i18n.translate('trips.notifications.updateTripRunSuccess'));
          this.showTripRunDialog.set(false);
          this.loadTripRuns();
        },
        error: (err) => {
          this.tripRunSubmitting.set(false);
          this.notification.error(err.error?.message || this.i18n.translate('trips.notifications.updateTripRunFailed'));
        },
      });
    } else {
      this.tripRunService.createTripRun(payload as CreateTripRunRequest).subscribe({
        next: () => {
          this.tripRunSubmitting.set(false);
          this.notification.success(this.i18n.translate('trips.notifications.createTripRunSuccess'));
          this.showTripRunDialog.set(false);
          this.loadTripRuns();
        },
        error: (err) => {
          this.tripRunSubmitting.set(false);
          this.notification.error(err.error?.message || this.i18n.translate('trips.notifications.createTripRunFailed'));
        },
      });
    }
  }

  toggleTripRunStatus(run: TripRun): void {
    const nextStatus: TripRunStatus = run.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    this.tripRunService.updateStatus(run.id, nextStatus).subscribe({
      next: () => {
        this.notification.success(
          nextStatus === 'ACTIVE'
            ? this.i18n.translate('trips.notifications.activateScheduleSuccess')
            : this.i18n.translate('trips.notifications.pauseScheduleSuccess')
        );
        this.loadTripRuns();
      },
      error: (err) => {
        this.notification.error(err.error?.message || this.i18n.translate('trips.notifications.updateStatusFailed'));
      },
    });
  }

  confirmDeleteTripRun(run: TripRun): void {
    this.deleteTargetTripRun.set(run);
    this.showDeleteModal.set(true);
  }

  onExecuteDeleteTripRun(): void {
    const target = this.deleteTargetTripRun();
    if (!target) return;

    this.tripRunService.deleteTripRun(target.id).subscribe({
      next: () => {
        this.notification.success(this.i18n.translate('trips.notifications.deleteTripRunSuccess'));
        this.showDeleteModal.set(false);
        this.loadTripRuns();
      },
      error: (err) => {
        this.notification.error(err.error?.message || this.i18n.translate('trips.notifications.deleteTripRunFailed'));
      },
    });
  }

  formatDaysSummary(csv: string): string {
    if (!csv) return '';
    if (csv === '1,2,3,4,5,6,7') return this.i18n.translate('trips.labels.daily');
    const map: Record<string, string> = {
      '1': this.i18n.translate('trips.days.short1'),
      '2': this.i18n.translate('trips.days.short2'),
      '3': this.i18n.translate('trips.days.short3'),
      '4': this.i18n.translate('trips.days.short4'),
      '5': this.i18n.translate('trips.days.short5'),
      '6': this.i18n.translate('trips.days.short6'),
      '7': this.i18n.translate('trips.days.short7'),
    };
    return csv
      .split(',')
      .map((d) => map[d.trim()] || d)
      .join(', ');
  }
}
