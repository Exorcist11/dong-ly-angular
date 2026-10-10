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
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
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
  CommonStatus,
  CreateStopPointRequest,
  LocationItem,
  StopPoint,
  UpdateStopPointRequest,
} from '../../models/route.model';
import { RouteService } from '../../services/route.service';
import { StopPointDialogComponent } from '../../components/stop-point-dialog/stop-point-dialog.component';

@Component({
  selector: 'app-stop-point-list-page',
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
    StopPointDialogComponent,
  ],
  templateUrl: './stop-point-list-page.component.html',
  styleUrls: ['./stop-point-list-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StopPointListPageComponent implements OnInit {
  private readonly routeService = inject(RouteService);
  private readonly notification = inject(NotificationService);
  private readonly translationService = inject(TranslationService);

  // MASTER DATA
  readonly locations = signal<LocationItem[]>([]);

  // STOP POINTS TABLE STATE
  readonly stopPoints = signal<StopPoint[]>([]);
  readonly totalStopPoints = signal<number>(0);
  readonly stopPointLoading = signal<boolean>(false);
  readonly stopPointPage = signal<number>(0);
  readonly stopPointPageSize = signal<number>(10);
  readonly stopPointKeyword = signal<string>('');
  readonly stopPointLocationFilter = signal<string>('');
  readonly stopPointStatusFilter = signal<CommonStatus | ''>('');

  // DIALOGS & MODALS
  readonly showStopPointDialog = signal<boolean>(false);
  readonly editingStopPoint = signal<StopPoint | null>(null);
  readonly stopPointDialogSubmitting = signal<boolean>(false);

  // CONFIRM STATUS MODAL
  readonly showConfirmModal = signal<boolean>(false);
  readonly confirmModalTitle = signal<string>('');
  readonly confirmModalMessage = signal<string>('');
  readonly confirmModalAction = signal<() => void>(() => {});

  // BREADCRUMBS
  readonly breadcrumbs = computed(() => [
    { label: this.translationService.translate('navigation.home'), url: '/dashboard' },
    { label: this.translationService.translate('navigation.groups.operations') },
    { label: this.translationService.translate('routes.stopsTitle') },
  ]);

  // COLUMNS STOP POINT
  readonly stopPointColumns = computed<TableColumn<StopPoint>[]>(() => {
    this.translationService.currentLang();
    return [
      { field: 'code', header: this.translationService.translate('routes.stopPointColumns.code'), width: '140px', sortable: true },
      { field: 'name', header: this.translationService.translate('routes.stopPointColumns.name'), width: '220px', sortable: true },
      { field: 'locationName', header: this.translationService.translate('routes.stopPointColumns.location'), width: '150px' },
      { field: 'address', header: this.translationService.translate('routes.stopPointColumns.address'), width: '260px' },
      { field: 'contactPhone', header: this.translationService.translate('routes.stopPointColumns.phone'), width: '130px' },
      { field: 'status', header: this.translationService.translate('routes.stopPointColumns.status'), width: '120px' },
      { field: 'actions', header: this.translationService.translate('routes.stopPointColumns.actions'), width: '140px', align: 'center' },
    ];
  });

  // FILTERS CONFIG
  readonly stopPointFilterConfigs = computed<TableFilterConfig[]>(() => {
    this.translationService.currentLang();
    const locOptions: SelectOption[] = [
      { label: this.translationService.translate('routes.filters.allLocations'), value: '' },
      ...this.locations().map((loc) => ({ label: loc.name, value: loc.id })),
    ];
    return [
      {
        key: 'locationId',
        label: this.translationService.translate('routes.filters.locationLabel'),
        placeholder: this.translationService.translate('routes.filters.allLocations'),
        options: locOptions,
      },
      {
        key: 'status',
        label: this.translationService.translate('routes.filters.statusLabel'),
        placeholder: this.translationService.translate('routes.filters.allStatuses'),
        options: [
          { label: this.translationService.translate('routes.filters.allStatuses'), value: '' },
          { label: this.translationService.translate('routes.statuses.active'), value: 'ACTIVE' },
          { label: this.translationService.translate('routes.statuses.inactive'), value: 'INACTIVE' },
        ],
      },
    ];
  });

  ngOnInit(): void {
    this.loadLocations();
    this.loadStopPoints();
  }

  loadLocations(): void {
    this.routeService.getActiveLocations().subscribe({
      next: (res) => this.locations.set(res.data),
      error: () => {},
    });
  }

  loadStopPoints(): void {
    this.stopPointLoading.set(true);
    this.routeService
      .searchStopPoints(
        this.stopPointPage(),
        this.stopPointPageSize(),
        'createdAt,desc',
        this.stopPointKeyword() || undefined,
        this.stopPointLocationFilter() || undefined,
        (this.stopPointStatusFilter() as CommonStatus) || undefined
      )
      .subscribe({
        next: (res) => {
          this.stopPoints.set(res.data.items);
          this.totalStopPoints.set(res.data.pagination.totalElements);
          this.stopPointLoading.set(false);
        },
        error: (err) => {
          this.stopPointLoading.set(false);
          this.notification.error(
            err.error?.message || this.translationService.translate('routes.notifications.loadStopPointsFailed')
          );
        },
      });
  }

  onStopPointChangeLazy(event: TableLazyLoadEvent): void {
    const pageIndex = Math.floor(event.first / event.rows);
    this.stopPointPage.set(pageIndex);
    this.stopPointPageSize.set(event.rows);
    this.loadStopPoints();
  }

  onStopPointSearch(keyword: string): void {
    this.stopPointKeyword.set(keyword);
    this.stopPointPage.set(0);
    this.loadStopPoints();
  }

  onStopPointFilterChange(event: TableFilterChangeEvent): void {
    if (event.key === 'locationId') {
      this.stopPointLocationFilter.set((event.value as string) || '');
    } else if (event.key === 'status') {
      this.stopPointStatusFilter.set((event.value as CommonStatus) || '');
    }
    this.stopPointPage.set(0);
    this.loadStopPoints();
  }

  openCreateStopPointDialog(): void {
    this.editingStopPoint.set(null);
    this.showStopPointDialog.set(true);
  }

  openEditStopPointDialog(stopPoint: StopPoint): void {
    this.editingStopPoint.set(stopPoint);
    this.showStopPointDialog.set(true);
  }

  saveStopPoint(payload: CreateStopPointRequest | UpdateStopPointRequest): void {
    this.stopPointDialogSubmitting.set(true);
    const editing = this.editingStopPoint();

    if (editing) {
      this.routeService.updateStopPoint(editing.id, payload as UpdateStopPointRequest).subscribe({
        next: () => {
          this.stopPointDialogSubmitting.set(false);
          this.showStopPointDialog.set(false);
          this.notification.success(this.translationService.translate('routes.notifications.updateStopPointSuccess'));
          this.loadStopPoints();
        },
        error: (err) => {
          this.stopPointDialogSubmitting.set(false);
          this.notification.error(err.error?.message || 'Có lỗi xảy ra');
        },
      });
    } else {
      this.routeService.createStopPoint(payload as CreateStopPointRequest).subscribe({
        next: () => {
          this.stopPointDialogSubmitting.set(false);
          this.showStopPointDialog.set(false);
          this.notification.success(this.translationService.translate('routes.notifications.createStopPointSuccess'));
          this.loadStopPoints();
        },
        error: (err) => {
          this.stopPointDialogSubmitting.set(false);
          this.notification.error(err.error?.message || 'Có lỗi xảy ra');
        },
      });
    }
  }

  confirmToggleStopPointStatus(stopPoint: StopPoint): void {
    const isActivating = stopPoint.status !== 'ACTIVE';
    const newStatus: CommonStatus = isActivating ? 'ACTIVE' : 'INACTIVE';
    const actionKey = isActivating ? 'routes.confirmations.activate' : 'routes.confirmations.deactivate';
    const actionLowerKey = isActivating ? 'routes.confirmations.activateLower' : 'routes.confirmations.deactivateLower';
    const actionTitle = this.translationService.translate(actionKey);
    const actionVerb = this.translationService.translate(actionLowerKey);

    this.confirmModalTitle.set(
      this.translationService.translate('routes.confirmations.toggleStopPointStatusTitle', { action: actionTitle })
    );
    this.confirmModalMessage.set(
      this.translationService.translate('routes.confirmations.toggleStopPointStatusMsg', {
        action: actionVerb,
        name: stopPoint.name,
      })
    );
    this.confirmModalAction.set(() => {
      this.routeService.updateStopPointStatus(stopPoint.id, newStatus).subscribe({
        next: () => {
          this.showConfirmModal.set(false);
          this.notification.success(this.translationService.translate('routes.notifications.updateStopPointStatusSuccess'));
          this.loadStopPoints();
        },
        error: (err) => {
          this.notification.error(err.error?.message || 'Có lỗi xảy ra');
        },
      });
    });
    this.showConfirmModal.set(true);
  }
}
