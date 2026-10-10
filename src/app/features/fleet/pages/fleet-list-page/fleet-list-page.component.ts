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
  CreateVehicleRequest,
  UpdateVehicleRequest,
  VehicleSeat,
  VehicleStatus,
  VehicleSummary,
  VehicleType,
} from '../../models/fleet.model';
import { FleetService } from '../../services/fleet.service';
import { VehicleFormDialogComponent } from '../../components/vehicle-form-dialog/vehicle-form-dialog.component';
import { SeatLayoutDialogComponent } from '../../components/seat-layout-dialog/seat-layout-dialog.component';

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

  // BREADCRUMBS
  readonly breadcrumbs = computed<BreadcrumbItem[]>(() => {
    this.i18n.currentLang();
    return [
      { label: this.i18n.translate('navigation.items.dashboard'), url: '/dashboard' },
      { label: this.i18n.translate('navigation.groups.operations') },
      { label: this.i18n.translate('fleet.vehiclesTitle') },
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

  // DIALOGS & MODALS
  readonly showVehicleDialog = signal<boolean>(false);
  readonly editingVehicle = signal<VehicleSummary | null>(null);
  readonly submittingVehicle = signal<boolean>(false);

  readonly showSeatLayoutDialog = signal<boolean>(false);
  readonly configuringVehicle = signal<VehicleSummary | null>(null);
  readonly currentVehicleSeats = signal<VehicleSeat[]>([]);
  readonly submittingSeatLayout = signal<boolean>(false);

  readonly showDeleteConfirm = signal<boolean>(false);
  readonly deletingId = signal<string | null>(null);
  readonly deletingName = signal<string>('');
  readonly deletingInProgress = signal<boolean>(false);

  // TABLE CONFIGS
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

  ngOnInit(): void {
    this.loadVehicles();
  }

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

  openSeatLayoutDialog(vehicle: VehicleSummary): void {
    this.configuringVehicle.set(vehicle);
    this.fleetService.getSeatLayout(vehicle.id).subscribe({
      next: (res) => {
        this.currentVehicleSeats.set(res.data?.seats || []);
        this.showSeatLayoutDialog.set(true);
      },
      error: (err: { error?: { message?: string } }) => {
        this.notification.error(
          err.error?.message || this.i18n.translate('fleet.notifications.error')
        );
      },
    });
  }

  onSaveSeatLayout(seats: ConfigureSeatLayoutRequest): void {
    const vehicle = this.configuringVehicle();
    if (!vehicle) return;

    this.submittingSeatLayout.set(true);
    this.fleetService.configureSeatLayout(vehicle.id, seats).subscribe({
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

  confirmDeleteVehicle(vehicle: VehicleSummary): void {
    this.deletingId.set(vehicle.id);
    this.deletingName.set(`${vehicle.plateNumber}`);
    this.showDeleteConfirm.set(true);
  }

  executeDelete(): void {
    const id = this.deletingId();
    if (!id) return;

    this.deletingInProgress.set(true);
    this.fleetService.deleteVehicle(id).subscribe({
      next: () => {
        this.deletingInProgress.set(false);
        this.showDeleteConfirm.set(false);
        this.notification.success(this.i18n.translate('fleet.notifications.deleteVehicleSuccess'));
        this.loadVehicles();
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
