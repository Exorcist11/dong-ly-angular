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
  CreateTripRequest,
  Trip,
  TripStatus,
  UpdateTripRequest,
  UpdateTripStatusRequest,
} from '../../models/trip.model';
import { TripService } from '../../services/trip.service';
import { RouteService } from '../../../routes/services/route.service';
import { FleetService } from '../../../fleet/services/fleet.service';

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
    HasPermissionDirective,
    TripFormDialogComponent,
    TripStatusDialogComponent,
  ],
  templateUrl: './trip-management-page.component.html',
  styleUrls: ['./trip-management-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TripManagementPageComponent implements OnInit {
  private readonly tripService = inject(TripService);
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

  // DIALOG STATES
  readonly showTripDialog = signal(false);
  readonly selectedTrip = signal<Trip | null>(null);
  readonly tripSubmitting = signal(false);

  readonly showTripStatusDialog = signal(false);
  readonly targetStatusTrip = signal<Trip | null>(null);
  readonly tripStatusSubmitting = signal(false);

  // TABLE COLUMNS
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

  // TABLE FILTERS
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

  ngOnInit(): void {
    this.loadSelectOptions();
    this.loadTrips();
  }

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
            label: `${v.plateNumber} (${v.brand})`,
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
            label: `${d.code} - ${d.fullName}`,
            value: d.id,
          }));
          this.driverOptions.set(opts);
        }
      },
    });
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
        undefined,
        this.tripsRouteId,
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

  openStatusDialog(trip: Trip): void {
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
