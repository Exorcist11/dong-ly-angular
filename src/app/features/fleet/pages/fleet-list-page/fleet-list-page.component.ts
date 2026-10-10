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
import {
  ConfigureSeatLayoutRequest,
  CreateDriverRequest,
  CreateVehicleRequest,
  Driver,
  DriverStatus,
  UpdateDriverRequest,
  UpdateVehicleRequest,
  VehicleSeat,
  VehicleStatus,
  VehicleSummary,
  VehicleType,
} from '../../models/fleet.model';
import { FleetService } from '../../services/fleet.service';
import { VehicleFormDialogComponent } from '../../components/vehicle-form-dialog/vehicle-form-dialog.component';
import { SeatLayoutDialogComponent } from '../../components/seat-layout-dialog/seat-layout-dialog.component';
import { DriverFormDialogComponent } from '../../components/driver-form-dialog/driver-form-dialog.component';

@Component({
  selector: 'app-fleet-list-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageHeaderComponent,
    DataTableComponent,
    TableCellDirective,
    ButtonComponent,
    StatusBadgeComponent,
    ConfirmModalComponent,
    HasPermissionDirective,
    VehicleFormDialogComponent,
    SeatLayoutDialogComponent,
    DriverFormDialogComponent,
    TranslatePipe,
  ],
  templateUrl: './fleet-list-page.component.html',
  styleUrls: ['./fleet-list-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FleetListPageComponent implements OnInit {
  private readonly fleetService = inject(FleetService);
  private readonly notification = inject(NotificationService);
  private readonly i18n = inject(TranslationService);

  // CURRENT TAB: 'vehicles' | 'drivers'
  readonly activeMainTab = signal<'vehicles' | 'drivers'>('vehicles');

  // BREADCRUMBS
  readonly breadcrumbs = computed<BreadcrumbItem[]>(() => {
    this.i18n.currentLang(); // Track reactive language changes
    return [
      { label: this.i18n.translate('navigation.items.dashboard'), url: '/dashboard' },
      {
        label:
          this.activeMainTab() === 'vehicles'
            ? this.i18n.translate('fleet.breadcrumbs.vehicles')
            : this.i18n.translate('fleet.breadcrumbs.drivers'),
      },
    ];
  });

  // VEHICLES TABLE STATE
  readonly vehicles = signal<VehicleSummary[]>([]);
  readonly totalVehicles = signal<number>(0);
  readonly vehicleLoading = signal<boolean>(false);
  readonly vehiclePage = signal<number>(0);
  readonly vehiclePageSize = signal<number>(10);
  readonly vehicleKeyword = signal<string>('');
  readonly vehicleTypeFilter = signal<VehicleType | ''>('');
  readonly vehicleStatusFilter = signal<VehicleStatus | ''>('');

  // DRIVERS TABLE STATE
  readonly drivers = signal<Driver[]>([]);
  readonly totalDrivers = signal<number>(0);
  readonly driverLoading = signal<boolean>(false);
  readonly driverPage = signal<number>(0);
  readonly driverPageSize = signal<number>(10);
  readonly driverKeyword = signal<string>('');
  readonly driverStatusFilter = signal<DriverStatus | ''>('');

  // DIALOGS & MODALS
  readonly showVehicleDialog = signal<boolean>(false);
  readonly editingVehicle = signal<VehicleSummary | null>(null);
  readonly submittingVehicle = signal<boolean>(false);

  readonly showSeatLayoutDialog = signal<boolean>(false);
  readonly configuringVehicle = signal<VehicleSummary | null>(null);
  readonly currentVehicleSeats = signal<VehicleSeat[]>([]);
  readonly submittingSeatLayout = signal<boolean>(false);

  readonly showDriverDialog = signal<boolean>(false);
  readonly editingDriver = signal<Driver | null>(null);
  readonly submittingDriver = signal<boolean>(false);

  readonly showDeleteConfirm = signal<boolean>(false);
  readonly deleteItemType = signal<'vehicle' | 'driver'>('vehicle');
  readonly deletingId = signal<string | null>(null);
  readonly deletingName = signal<string>('');
  readonly deletingInProgress = signal<boolean>(false);

  // REACTIVE TABLE COLUMNS & FILTERS
  readonly vehicleColumns = computed<TableColumn[]>(() => {
    this.i18n.currentLang();
    return [
      { field: 'plateNumber', header: this.i18n.translate('fleet.vehicles.columns.plateNumber'), sortable: true },
      { field: 'vehicleType', header: this.i18n.translate('fleet.vehicles.columns.vehicleType'), sortable: true },
      { field: 'brand', header: this.i18n.translate('fleet.vehicles.columns.brand') },
      { field: 'seatInfo', header: this.i18n.translate('fleet.vehicles.columns.seatInfo') },
      { field: 'status', header: this.i18n.translate('fleet.vehicles.columns.status'), sortable: true },
      { field: 'actions', header: this.i18n.translate('fleet.vehicles.columns.actions') },
    ];
  });

  readonly vehicleFilterConfigs = computed<TableFilterConfig[]>(() => {
    this.i18n.currentLang();
    return [
      {
        key: 'vehicleType',
        label: this.i18n.translate('fleet.vehicles.filters.typeLabel'),
        placeholder: this.i18n.translate('fleet.vehicles.filters.allTypes'),
        options: [
          { label: this.i18n.translate('fleet.vehicles.filters.allTypes'), value: '' },
          { label: this.i18n.translate('fleet.vehicles.types.sleeper'), value: 'SLEEPER' },
          { label: this.i18n.translate('fleet.vehicles.types.limousine'), value: 'LIMOUSINE' },
          { label: this.i18n.translate('fleet.vehicles.types.seater'), value: 'SEATER' },
        ],
      },
      {
        key: 'status',
        label: this.i18n.translate('fleet.vehicles.filters.statusLabel'),
        placeholder: this.i18n.translate('fleet.vehicles.filters.allStatuses'),
        options: [
          { label: this.i18n.translate('fleet.vehicles.filters.allStatuses'), value: '' },
          { label: this.i18n.translate('fleet.vehicles.statuses.active'), value: 'ACTIVE' },
          { label: this.i18n.translate('fleet.vehicles.statuses.maintenance'), value: 'MAINTENANCE' },
          { label: this.i18n.translate('fleet.vehicles.statuses.inactive'), value: 'INACTIVE' },
        ],
      },
    ];
  });

  readonly driverColumns = computed<TableColumn[]>(() => {
    this.i18n.currentLang();
    return [
      { field: 'code', header: this.i18n.translate('fleet.drivers.columns.code'), sortable: true },
      { field: 'fullName', header: this.i18n.translate('fleet.drivers.columns.fullName'), sortable: true },
      { field: 'phone', header: this.i18n.translate('fleet.drivers.columns.phone') },
      { field: 'license', header: this.i18n.translate('fleet.drivers.columns.license') },
      { field: 'expiry', header: this.i18n.translate('fleet.drivers.columns.expiry') },
      { field: 'status', header: this.i18n.translate('fleet.drivers.columns.status'), sortable: true },
      { field: 'actions', header: this.i18n.translate('fleet.drivers.columns.actions') },
    ];
  });

  readonly driverFilterConfigs = computed<TableFilterConfig[]>(() => {
    this.i18n.currentLang();
    return [
      {
        key: 'status',
        label: this.i18n.translate('fleet.drivers.filters.statusLabel'),
        placeholder: this.i18n.translate('fleet.drivers.filters.allStatuses'),
        options: [
          { label: this.i18n.translate('fleet.drivers.filters.allStatuses'), value: '' },
          { label: this.i18n.translate('fleet.drivers.statuses.active'), value: 'ACTIVE' },
          { label: this.i18n.translate('fleet.drivers.statuses.onLeave'), value: 'ON_LEAVE' },
          { label: this.i18n.translate('fleet.drivers.statuses.inactive'), value: 'INACTIVE' },
        ],
      },
    ];
  });

  ngOnInit(): void {
    this.loadVehicles();
  }

  onTabChange(tab: 'vehicles' | 'drivers'): void {
    this.activeMainTab.set(tab);
    if (tab === 'vehicles') {
      this.loadVehicles();
    } else {
      this.loadDrivers();
    }
  }

  // ==================== VEHICLES MANAGEMENT ====================

  loadVehicles(): void {
    this.vehicleLoading.set(true);
    this.fleetService
      .searchVehicles(
        this.vehiclePage(),
        this.vehiclePageSize(),
        'createdAt,desc',
        this.vehicleKeyword(),
        (this.vehicleTypeFilter() as VehicleType) || undefined,
        (this.vehicleStatusFilter() as VehicleStatus) || undefined
      )
      .subscribe({
        next: (res) => {
          this.vehicles.set(res.data.items);
          this.totalVehicles.set(res.data.pagination.totalElements);
          this.vehicleLoading.set(false);
        },
        error: (err) => {
          this.vehicleLoading.set(false);
          this.notification.error(
            err.error?.message || this.i18n.translate('fleet.notifications.error')
          );
        },
      });
  }

  onVehicleLazyLoad(event: TableLazyLoadEvent): void {
    const pageIndex = Math.floor(event.first / event.rows);
    this.vehiclePage.set(pageIndex);
    this.vehiclePageSize.set(event.rows);
    this.loadVehicles();
  }

  onVehicleSearch(query: string): void {
    this.vehicleKeyword.set(query);
    this.vehiclePage.set(0);
    this.loadVehicles();
  }

  onVehicleFilterChange(event: TableFilterChangeEvent): void {
    if (event.key === 'vehicleType') {
      this.vehicleTypeFilter.set(event.value as VehicleType);
    } else if (event.key === 'status') {
      this.vehicleStatusFilter.set(event.value as VehicleStatus);
    }
    this.vehiclePage.set(0);
    this.loadVehicles();
  }

  openCreateVehicleDialog(): void {
    this.editingVehicle.set(null);
    this.showVehicleDialog.set(true);
  }

  openEditVehicleDialog(vehicle: VehicleSummary): void {
    this.editingVehicle.set(vehicle);
    this.showVehicleDialog.set(true);
  }

  onSaveVehicle(payload: CreateVehicleRequest | UpdateVehicleRequest): void {
    this.submittingVehicle.set(true);
    const editing = this.editingVehicle();

    const request$ = editing
      ? this.fleetService.updateVehicle(editing.id, payload as UpdateVehicleRequest)
      : this.fleetService.createVehicle(payload as CreateVehicleRequest);

    request$.subscribe({
      next: () => {
        this.submittingVehicle.set(false);
        this.showVehicleDialog.set(false);
        this.notification.success(
          editing
            ? this.i18n.translate('fleet.notifications.updateVehicleSuccess')
            : this.i18n.translate('fleet.notifications.createVehicleSuccess')
        );
        this.loadVehicles();
      },
      error: (err) => {
        this.submittingVehicle.set(false);
        this.notification.error(
          err.error?.message || this.i18n.translate('fleet.notifications.error')
        );
      },
    });
  }

  // ==================== SEAT LAYOUT ====================

  openSeatLayoutDialog(vehicle: VehicleSummary): void {
    this.configuringVehicle.set(vehicle);
    this.fleetService.getSeatLayout(vehicle.id).subscribe({
      next: (res) => {
        this.currentVehicleSeats.set(res.data.seats);
        this.showSeatLayoutDialog.set(true);
      },
      error: (err) => {
        this.notification.error(
          err.error?.message || this.i18n.translate('fleet.notifications.error')
        );
      },
    });
  }

  onSaveSeatLayout(payload: ConfigureSeatLayoutRequest): void {
    const vehicle = this.configuringVehicle();
    if (!vehicle) return;

    this.submittingSeatLayout.set(true);
    this.fleetService.configureSeatLayout(vehicle.id, payload).subscribe({
      next: () => {
        this.submittingSeatLayout.set(false);
        this.showSeatLayoutDialog.set(false);
        this.notification.success(
          this.i18n.translate('fleet.notifications.saveSeatLayoutSuccess')
        );
        this.loadVehicles();
      },
      error: (err) => {
        this.submittingSeatLayout.set(false);
        this.notification.error(
          err.error?.message || this.i18n.translate('fleet.notifications.error')
        );
      },
    });
  }

  // ==================== DRIVERS MANAGEMENT ====================

  loadDrivers(): void {
    this.driverLoading.set(true);
    this.fleetService
      .searchDrivers(
        this.driverPage(),
        this.driverPageSize(),
        'createdAt,desc',
        this.driverKeyword(),
        (this.driverStatusFilter() as DriverStatus) || undefined
      )
      .subscribe({
        next: (res) => {
          this.drivers.set(res.data.items);
          this.totalDrivers.set(res.data.pagination.totalElements);
          this.driverLoading.set(false);
        },
        error: (err) => {
          this.driverLoading.set(false);
          this.notification.error(
            err.error?.message || this.i18n.translate('fleet.notifications.error')
          );
        },
      });
  }

  onDriverLazyLoad(event: TableLazyLoadEvent): void {
    const pageIndex = Math.floor(event.first / event.rows);
    this.driverPage.set(pageIndex);
    this.driverPageSize.set(event.rows);
    this.loadDrivers();
  }

  onDriverSearch(query: string): void {
    this.driverKeyword.set(query);
    this.driverPage.set(0);
    this.loadDrivers();
  }

  onDriverFilterChange(event: TableFilterChangeEvent): void {
    if (event.key === 'status') {
      this.driverStatusFilter.set(event.value as DriverStatus);
    }
    this.driverPage.set(0);
    this.loadDrivers();
  }

  openCreateDriverDialog(): void {
    this.editingDriver.set(null);
    this.showDriverDialog.set(true);
  }

  openEditDriverDialog(driver: Driver): void {
    this.editingDriver.set(driver);
    this.showDriverDialog.set(true);
  }

  onSaveDriver(payload: CreateDriverRequest | UpdateDriverRequest): void {
    this.submittingDriver.set(true);
    const editing = this.editingDriver();

    const request$ = editing
      ? this.fleetService.updateDriver(editing.id, payload as UpdateDriverRequest)
      : this.fleetService.createDriver(payload as CreateDriverRequest);

    request$.subscribe({
      next: () => {
        this.submittingDriver.set(false);
        this.showDriverDialog.set(false);
        this.notification.success(
          editing
            ? this.i18n.translate('fleet.notifications.updateDriverSuccess')
            : this.i18n.translate('fleet.notifications.createDriverSuccess')
        );
        this.loadDrivers();
      },
      error: (err) => {
        this.submittingDriver.set(false);
        this.notification.error(
          err.error?.message || this.i18n.translate('fleet.notifications.error')
        );
      },
    });
  }

  // ==================== DELETE DIALOG ====================

  confirmDeleteVehicle(vehicle: VehicleSummary): void {
    this.deleteItemType.set('vehicle');
    this.deletingId.set(vehicle.id);
    this.deletingName.set(`${vehicle.plateNumber}`);
    this.showDeleteConfirm.set(true);
  }

  confirmDeleteDriver(driver: Driver): void {
    this.deleteItemType.set('driver');
    this.deletingId.set(driver.id);
    this.deletingName.set(`${driver.code} - ${driver.fullName}`);
    this.showDeleteConfirm.set(true);
  }

  executeDelete(): void {
    const id = this.deletingId();
    if (!id) return;

    this.deletingInProgress.set(true);
    const isVehicle = this.deleteItemType() === 'vehicle';
    const delete$ = isVehicle
      ? this.fleetService.deleteVehicle(id)
      : this.fleetService.deleteDriver(id);

    delete$.subscribe({
      next: () => {
        this.deletingInProgress.set(false);
        this.showDeleteConfirm.set(false);
        this.notification.success(
          isVehicle
            ? this.i18n.translate('fleet.notifications.deleteVehicleSuccess')
            : this.i18n.translate('fleet.notifications.deleteDriverSuccess')
        );
        if (isVehicle) {
          this.loadVehicles();
        } else {
          this.loadDrivers();
        }
      },
      error: (err) => {
        this.deletingInProgress.set(false);
        this.notification.error(
          err.error?.message || this.i18n.translate('fleet.notifications.error')
        );
      },
    });
  }
}
