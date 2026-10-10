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
  CreateDriverRequest,
  Driver,
  DriverStatus,
  UpdateDriverRequest,
} from '../../models/fleet.model';
import { FleetService } from '../../services/fleet.service';
import { DriverFormDialogComponent } from '../../components/driver-form-dialog/driver-form-dialog.component';

@Component({
  selector: 'app-driver-list-page',
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
    DriverFormDialogComponent,
    TranslatePipe,
  ],
  templateUrl: './driver-list-page.component.html',
  styleUrls: ['./driver-list-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DriverListPageComponent implements OnInit {
  private readonly fleetService = inject(FleetService);
  private readonly notification = inject(NotificationService);
  private readonly i18n = inject(TranslationService);

  // BREADCRUMBS
  readonly breadcrumbs = computed<BreadcrumbItem[]>(() => {
    this.i18n.currentLang();
    return [
      { label: this.i18n.translate('navigation.items.dashboard'), url: '/dashboard' },
      { label: this.i18n.translate('navigation.groups.operations') },
      { label: this.i18n.translate('fleet.driversTitle') },
    ];
  });

  // DRIVERS TABLE STATE
  readonly drivers = signal<Driver[]>([]);
  readonly totalDrivers = signal<number>(0);
  readonly driverLoading = signal<boolean>(false);
  readonly driverPage = signal<number>(0);
  readonly driverPageSize = signal<number>(10);
  readonly driverKeyword = signal<string>('');
  readonly driverStatusFilter = signal<DriverStatus | ''>('');

  // DIALOGS & MODALS
  readonly showDriverDialog = signal<boolean>(false);
  readonly editingDriver = signal<Driver | null>(null);
  readonly submittingDriver = signal<boolean>(false);

  readonly showDeleteConfirm = signal<boolean>(false);
  readonly deletingId = signal<string | null>(null);
  readonly deletingName = signal<string>('');
  readonly deletingInProgress = signal<boolean>(false);

  // TABLE CONFIGS
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
    this.loadDrivers();
  }

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

  confirmDeleteDriver(driver: Driver): void {
    this.deletingId.set(driver.id);
    this.deletingName.set(`${driver.code} - ${driver.fullName}`);
    this.showDeleteConfirm.set(true);
  }

  executeDelete(): void {
    const id = this.deletingId();
    if (!id) return;

    this.deletingInProgress.set(true);
    this.fleetService.deleteDriver(id).subscribe({
      next: () => {
        this.deletingInProgress.set(false);
        this.showDeleteConfirm.set(false);
        this.notification.success(this.i18n.translate('fleet.notifications.deleteDriverSuccess'));
        this.loadDrivers();
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
