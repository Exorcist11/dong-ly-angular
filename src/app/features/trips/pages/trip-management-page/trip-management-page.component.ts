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
import {
  StatusBadgeComponent,
  StatusTagSeverity,
} from '../../../../shared/components/status-badge/status-badge.component';
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
import {
  CreateTripRequest,
  Trip,
  TripStatus,
  UpdateTripRequest,
  UpdateTripStatusRequest,
} from '../../models/trip.model';
import { TripRunService } from '../../services/trip-run.service';
import { TripService } from '../../services/trip.service';
import { RouteService } from '../../../routes/services/route.service';
import { FleetService } from '../../../fleet/services/fleet.service';

import { TripRunFormDialogComponent } from '../../components/trip-run-form-dialog/trip-run-form-dialog.component';
import { GenerateTripsDialogComponent } from '../../components/generate-trips-dialog/generate-trips-dialog.component';
import { TripFormDialogComponent } from '../../components/trip-form-dialog/trip-form-dialog.component';
import { TripStatusDialogComponent } from '../../components/trip-status-dialog/trip-status-dialog.component';

@Component({
  selector: 'app-trip-management-page',
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
    TripFormDialogComponent,
    TripStatusDialogComponent,
  ],
  templateUrl: './trip-management-page.component.html',
  styleUrls: ['./trip-management-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TripManagementPageComponent implements OnInit {
  private readonly tripRunService = inject(TripRunService);
  private readonly tripService = inject(TripService);
  private readonly routeService = inject(RouteService);
  private readonly fleetService = inject(FleetService);
  private readonly notification = inject(NotificationService);
  private readonly i18n = inject(TranslationService);

  // CURRENT TAB: 'trips' | 'tripRuns'
  readonly activeTab = signal<'trips' | 'tripRuns'>('trips');

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
      { label: this.i18n.translate('trips.title') },
    ];
  });

  // ==================== TRIPS STATE ====================
  readonly tripsList = signal<Trip[]>([]);
  readonly tripsTotal = signal(0);
  readonly tripsLoading = signal(false);
  readonly tripsPage = signal(0);
  readonly tripsSize = signal(10);
  private tripsSort = 'departureTime,asc';
  private tripsKeyword = '';
  private tripsRouteId?: string;
  private tripsStatus?: TripStatus;

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

  // ==================== DIALOG STATES ====================
  readonly showTripRunDialog = signal(false);
  readonly selectedTripRun = signal<TripRun | null>(null);
  readonly tripRunSubmitting = signal(false);

  readonly showGenerateDialog = signal(false);
  readonly generateTargetTripRun = signal<TripRun | null>(null);

  readonly showTripDialog = signal(false);
  readonly selectedTrip = signal<Trip | null>(null);
  readonly tripSubmitting = signal(false);

  readonly showTripStatusDialog = signal(false);
  readonly targetStatusTrip = signal<Trip | null>(null);
  readonly tripStatusSubmitting = signal(false);

  // DELETE MODAL
  // DELETE MODAL
  readonly showDeleteModal = signal(false);
  readonly deleteTargetTripRun = signal<TripRun | null>(null);

  // ==================== TABLE COLUMNS ====================
  readonly tripColumns = computed<TableColumn[]>(() => {
    this.i18n.currentLang();
    return [
      { field: 'code', header: this.i18n.translate('trips.columns.code'), sortable: true, width: '150px' },
      { field: 'departureTime', header: this.i18n.translate('trips.columns.departureTime'), sortable: true, width: '150px' },
      { field: 'route', header: this.i18n.translate('trips.columns.route'), width: '200px' },
      { field: 'vehicle', header: this.i18n.translate('trips.columns.vehicle'), width: '150px' },
      { field: 'drivers', header: this.i18n.translate('trips.columns.drivers'), width: '220px' },
      { field: 'basePrice', header: this.i18n.translate('trips.columns.basePrice'), width: '130px' },
      { field: 'status', header: this.i18n.translate('trips.columns.status'), width: '140px' },
      { field: 'actions', header: this.i18n.translate('trips.columns.actions'), align: 'center', width: '120px' },
    ];
  });

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

  // ==================== TABLE FILTERS ====================
  readonly tripFilters = computed<TableFilterConfig[]>(() => [
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
        { label: `${this.i18n.translate('trips.statuses.scheduled')} (SCHEDULED)`, value: 'SCHEDULED' },
        { label: `${this.i18n.translate('trips.statuses.ready')} (READY)`, value: 'READY' },
        { label: `${this.i18n.translate('trips.statuses.departed')} (DEPARTED)`, value: 'DEPARTED' },
        { label: `${this.i18n.translate('trips.statuses.completed')} (COMPLETED)`, value: 'COMPLETED' },
        { label: `${this.i18n.translate('trips.statuses.cancelled')} (CANCELLED)`, value: 'CANCELLED' },
      ],
    },
  ]);

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
    this.loadTrips();
    this.loadTripRuns();
  }

  // ==================== LOAD CACHED OPTIONS ====================
  private loadSelectOptions(): void {
    // 1. Routes
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

    // 2. Vehicles
    this.fleetService.searchVehicles(0, 100).subscribe({
      next: (res) => {
        if (res.data?.items) {
          const opts = res.data.items.map((v) => ({
            label: `${v.plateNumber} (${v.vehicleType} - ${v.totalSeats} chỗ)`,
            value: v.id,
          }));
          this.vehicleOptions.set(opts);
        }
      },
    });

    // 3. Drivers
    this.fleetService.searchDrivers(0, 100).subscribe({
      next: (res) => {
        if (res.data?.items) {
          const opts = res.data.items.map((d) => ({
            label: `${d.code} - ${d.fullName} (${d.phone})`,
            value: d.id,
          }));
          this.driverOptions.set(opts);
        }
      },
    });
  }

  // ==================== TABS ====================
  setTab(tab: 'trips' | 'tripRuns'): void {
    this.activeTab.set(tab);
  }

  // ==================== TRIPS API ====================
  loadTrips(): void {
    this.tripsLoading.set(true);
    this.tripService
      .searchTrips(
        this.tripsPage(),
        this.tripsSize(),
        this.tripsSort,
        this.tripsKeyword,
        this.tripsRouteId,
        undefined,
        undefined,
        this.tripsStatus
      )
      .subscribe({
        next: (res) => {
          this.tripsLoading.set(false);
          this.tripsList.set(res.data?.items || []);
          this.tripsTotal.set(res.data?.pagination?.totalElements || 0);
        },
        error: () => {
          this.tripsLoading.set(false);
          this.notification.error(this.i18n.translate('trips.notifications.loadTripsFailed'));
        },
      });
  }

  onTripLazyLoad(event: TableLazyLoadEvent): void {
    this.tripsPage.set(Math.floor(event.first / event.rows));
    this.tripsSize.set(event.rows);
    if (event.sortField) {
      this.tripsSort = `${event.sortField},${event.sortOrder === 1 ? 'asc' : 'desc'}`;
    }
    this.loadTrips();
  }

  onTripSearch(query: string): void {
    this.tripsKeyword = query;
    this.tripsPage.set(0);
    this.loadTrips();
  }

  onTripFilterChange(event: TableFilterChangeEvent): void {
    if (event.key === 'routeId') {
      this.tripsRouteId = (event.value as string) || undefined;
    } else if (event.key === 'status') {
      this.tripsStatus = (event.value as TripStatus) || undefined;
    }
    this.tripsPage.set(0);
    this.loadTrips();
  }

  openCreateTripDialog(): void {
    this.selectedTrip.set(null);
    this.showTripDialog.set(true);
  }

  openEditTripDialog(trip: Trip): void {
    this.selectedTrip.set(trip);
    this.showTripDialog.set(true);
  }

  openTripStatusDialog(trip: Trip): void {
    this.targetStatusTrip.set(trip);
    this.showTripStatusDialog.set(true);
  }

  onSaveTrip(payload: CreateTripRequest | UpdateTripRequest): void {
    this.tripSubmitting.set(true);
    const editing = this.selectedTrip();

    if (editing) {
      this.tripService.updateTrip(editing.id, payload as UpdateTripRequest).subscribe({
        next: () => {
          this.tripSubmitting.set(false);
          this.notification.success(this.i18n.translate('trips.notifications.updateTripSuccess'));
          this.showTripDialog.set(false);
          this.loadTrips();
        },
        error: (err) => {
          this.tripSubmitting.set(false);
          this.notification.error(err.error?.message || this.i18n.translate('trips.notifications.updateTripFailed'));
        },
      });
    } else {
      this.tripService.createTrip(payload as CreateTripRequest).subscribe({
        next: () => {
          this.tripSubmitting.set(false);
          this.notification.success(this.i18n.translate('trips.notifications.createTripSuccess'));
          this.showTripDialog.set(false);
          this.loadTrips();
        },
        error: (err) => {
          this.tripSubmitting.set(false);
          this.notification.error(err.error?.message || this.i18n.translate('trips.notifications.createTripFailed'));
        },
      });
    }
  }

  onSaveTripStatus(payload: UpdateTripStatusRequest): void {
    const target = this.targetStatusTrip();
    if (!target) return;

    this.tripStatusSubmitting.set(true);
    this.tripService.updateStatus(target.id, payload).subscribe({
      next: () => {
        this.tripStatusSubmitting.set(false);
        this.notification.success(this.i18n.translate('trips.notifications.updateStatusSuccess'));
        this.showTripStatusDialog.set(false);
        this.loadTrips();
      },
      error: (err) => {
        this.tripStatusSubmitting.set(false);
        this.notification.error(err.error?.message || this.i18n.translate('trips.notifications.updateStatusFailed'));
      },
    });
  }

  // ==================== TRIP RUNS API ====================
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

  onGeneratedSuccess(): void {
    this.loadTrips();
  }

  // ==================== FORMATTERS ====================
  formatDateTime(isoStr: string): string {
    if (!isoStr) return '';
    try {
      const d = new Date(isoStr);
      const pad = (n: number) => (n < 10 ? '0' + n : n);
      return `${pad(d.getHours())}:${pad(d.getMinutes())} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
    } catch {
      return isoStr;
    }
  }

  formatCurrency(val: number): string {
    if (!val) return '0 đ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
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

  getTripStatusSeverity(status: TripStatus): StatusTagSeverity {
    switch (status) {
      case 'READY':
        return 'info';
      case 'DEPARTED':
        return 'warn';
      case 'COMPLETED':
        return 'success';
      case 'CANCELLED':
        return 'danger';
      default:
        return 'info';
    }
  }

  getTripStatusLabel(status: TripStatus): string {
    switch (status) {
      case 'SCHEDULED':
        return this.i18n.translate('trips.statuses.scheduled');
      case 'READY':
        return this.i18n.translate('trips.statuses.ready');
      case 'DEPARTED':
        return this.i18n.translate('trips.statuses.departed');
      case 'COMPLETED':
        return this.i18n.translate('trips.statuses.completed');
      case 'CANCELLED':
        return this.i18n.translate('trips.statuses.cancelled');
      default:
        return status;
    }
  }
}

