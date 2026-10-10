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
  CreateRouteRequest,
  CreateStopPointRequest,
  LocationItem,
  RouteDetail,
  RouteSummary,
  StopPoint,
  UpdateRouteRequest,
  UpdateRouteStopsRequest,
  UpdateStopPointRequest,
} from '../../models/route.model';
import { RouteService } from '../../services/route.service';
import { RouteFormDialogComponent } from '../../components/route-form-dialog/route-form-dialog.component';
import { StopPointDialogComponent } from '../../components/stop-point-dialog/stop-point-dialog.component';
import { RouteStopsDialogComponent } from '../../components/route-stops-dialog/route-stops-dialog.component';

@Component({
  selector: 'app-route-list-page',
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
    RouteFormDialogComponent,
    StopPointDialogComponent,
    RouteStopsDialogComponent,
  ],
  templateUrl: './route-list-page.component.html',
  styleUrls: ['./route-list-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RouteListPageComponent implements OnInit {
  private readonly routeService = inject(RouteService);
  private readonly notification = inject(NotificationService);
  private readonly translationService = inject(TranslationService);

  // CURRENT TAB: 'routes' | 'stopPoints'
  readonly activeMainTab = signal<'routes' | 'stopPoints'>('routes');

  // MASTER DATA
  readonly locations = signal<LocationItem[]>([]);
  readonly allStopPoints = signal<StopPoint[]>([]);

  // ROUTES TABLE STATE
  readonly routes = signal<RouteSummary[]>([]);
  readonly totalRoutes = signal<number>(0);
  readonly routeLoading = signal<boolean>(false);
  readonly routePage = signal<number>(0);
  readonly routePageSize = signal<number>(10);
  readonly routeKeyword = signal<string>('');
  readonly routeStatusFilter = signal<CommonStatus | ''>('');

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
  readonly showRouteDialog = signal<boolean>(false);
  readonly editingRoute = signal<RouteSummary | null>(null);
  readonly routeDialogSubmitting = signal<boolean>(false);

  readonly showStopPointDialog = signal<boolean>(false);
  readonly editingStopPoint = signal<StopPoint | null>(null);
  readonly stopPointDialogSubmitting = signal<boolean>(false);

  readonly showStopsConfigDialog = signal<boolean>(false);
  readonly configuringRoute = signal<RouteDetail | null>(null);
  readonly stopsConfigSubmitting = signal<boolean>(false);

  // CONFIRM STATUS MODAL
  readonly showConfirmModal = signal<boolean>(false);
  readonly confirmModalTitle = signal<string>('');
  readonly confirmModalMessage = signal<string>('');
  readonly confirmModalAction = signal<() => void>(() => {});

  // BREADCRUMBS
  readonly breadcrumbs = computed(() => [
    { label: this.translationService.translate('navigation.home'), url: '/dashboard' },
    { label: this.translationService.translate('navigation.groups.operations') },
    { label: this.translationService.translate('routes.title') },
  ]);

  // COLUMNS ROUTE
  readonly routeColumns = computed<TableColumn<RouteSummary>[]>(() => {
    this.translationService.currentLang();
    return [
      { field: 'code', header: this.translationService.translate('routes.columns.code'), width: '130px', sortable: true },
      { field: 'name', header: this.translationService.translate('routes.columns.name'), width: '220px', sortable: true },
      { field: 'originLocation', header: this.translationService.translate('routes.columns.origin'), width: '160px' },
      { field: 'destinationLocation', header: this.translationService.translate('routes.columns.destination'), width: '160px' },
      { field: 'distanceKm', header: this.translationService.translate('routes.columns.distance'), width: '110px' },
      { field: 'totalStops', header: this.translationService.translate('routes.columns.totalStops'), width: '100px', align: 'center' },
      { field: 'status', header: this.translationService.translate('routes.columns.status'), width: '130px' },
      { field: 'actions', header: this.translationService.translate('routes.columns.actions'), width: '180px', align: 'center' },
    ];
  });

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
  readonly routeFilterConfigs = computed<TableFilterConfig[]>(() => {
    this.translationService.currentLang();
    return [
      {
        key: 'status',
        label: this.translationService.translate('routes.filters.statusLabel'),
        placeholder: this.translationService.translate('routes.filters.allStatuses'),
        options: [
          { label: this.translationService.translate('common.status.active'), value: 'ACTIVE' },
          { label: this.translationService.translate('common.status.inactive'), value: 'INACTIVE' },
        ],
        width: '180px',
      },
    ];
  });

  readonly stopPointFilterConfigs = computed<TableFilterConfig[]>(() => {
    this.translationService.currentLang();
    return [
      {
        key: 'locationId',
        label: this.translationService.translate('routes.filters.locationLabel'),
        placeholder: this.translationService.translate('routes.filters.allLocations'),
        options: this.locations().map((loc) => ({
          label: loc.name,
          value: loc.id,
        })),
        width: '200px',
      },
      {
        key: 'status',
        label: this.translationService.translate('routes.filters.statusLabel'),
        placeholder: this.translationService.translate('routes.filters.allStatuses'),
        options: [
          { label: this.translationService.translate('common.status.active'), value: 'ACTIVE' },
          { label: this.translationService.translate('common.status.inactive'), value: 'INACTIVE' },
        ],
        width: '180px',
      },
    ];
  });

  ngOnInit(): void {
    this.loadLocations();
    this.loadRoutes();
    this.loadStopPoints();
  }

  // --- DATA LOADING ---
  loadLocations(): void {
    this.routeService.getActiveLocations().subscribe({
      next: (res) => {
        this.locations.set(res.data);
      },
    });
  }

  loadRoutes(): void {
    this.routeLoading.set(true);
    const statusParam = this.routeStatusFilter() ? (this.routeStatusFilter() as CommonStatus) : undefined;

    this.routeService
      .searchRoutes(
        this.routePage(),
        this.routePageSize(),
        'createdAt,desc',
        this.routeKeyword(),
        undefined,
        undefined,
        statusParam
      )
      .subscribe({
        next: (res) => {
          this.routes.set(res.data.items);
          this.totalRoutes.set(res.data.pagination.totalElements);
          this.routeLoading.set(false);
        },
        error: () => {
          this.routeLoading.set(false);
          this.notification.error(this.translationService.translate('routes.notifications.loadRoutesFailed'));
        },
      });
  }

  loadStopPoints(): void {
    this.stopPointLoading.set(true);
    const statusParam = this.stopPointStatusFilter() ? (this.stopPointStatusFilter() as CommonStatus) : undefined;
    const locationParam = this.stopPointLocationFilter() ? this.stopPointLocationFilter() : undefined;

    this.routeService
      .searchStopPoints(
        this.stopPointPage(),
        this.stopPointPageSize(),
        'createdAt,desc',
        this.stopPointKeyword(),
        locationParam,
        statusParam
      )
      .subscribe({
        next: (res) => {
          this.stopPoints.set(res.data.items);
          this.totalStopPoints.set(res.data.pagination.totalElements);
          this.allStopPoints.set(res.data.items);
          this.stopPointLoading.set(false);
        },
        error: () => {
          this.stopPointLoading.set(false);
          this.notification.error(this.translationService.translate('routes.notifications.loadStopPointsFailed'));
        },
      });
  }

  // --- TABLE EVENTS FOR ROUTES ---
  onRouteChangeLazy(event: TableLazyLoadEvent): void {
    const pageIndex = Math.floor(event.first / (event.rows || 10));
    this.routePage.set(pageIndex);
    this.routePageSize.set(event.rows);
    this.loadRoutes();
  }

  onRouteSearch(keyword: string): void {
    this.routeKeyword.set(keyword);
    this.routePage.set(0);
    this.loadRoutes();
  }

  onRouteFilterChange(event: TableFilterChangeEvent<any>): void {
    if (event.key === 'status') {
      this.routeStatusFilter.set((event.value as CommonStatus) || '');
      this.routePage.set(0);
      this.loadRoutes();
    }
  }

  // --- TABLE EVENTS FOR STOP POINTS ---
  onStopPointChangeLazy(event: TableLazyLoadEvent): void {
    const pageIndex = Math.floor(event.first / (event.rows || 10));
    this.stopPointPage.set(pageIndex);
    this.stopPointPageSize.set(event.rows);
    this.loadStopPoints();
  }

  onStopPointSearch(keyword: string): void {
    this.stopPointKeyword.set(keyword);
    this.stopPointPage.set(0);
    this.loadStopPoints();
  }

  onStopPointFilterChange(event: TableFilterChangeEvent<any>): void {
    if (event.key === 'locationId') {
      this.stopPointLocationFilter.set((event.value as string) || '');
    } else if (event.key === 'status') {
      this.stopPointStatusFilter.set((event.value as CommonStatus) || '');
    }
    this.stopPointPage.set(0);
    this.loadStopPoints();
  }

  // --- ROUTE ACTIONS ---
  openCreateRouteDialog(): void {
    this.editingRoute.set(null);
    this.showRouteDialog.set(true);
  }

  openEditRouteDialog(route: RouteSummary): void {
    this.editingRoute.set(route);
    this.showRouteDialog.set(true);
  }

  openStopsConfigDialog(route: RouteSummary): void {
    this.routeLoading.set(true);
    this.routeService.getRouteById(route.id).subscribe({
      next: (res) => {
        this.configuringRoute.set(res.data);
        this.showStopsConfigDialog.set(true);
        this.routeLoading.set(false);
      },
      error: () => {
        this.routeLoading.set(false);
        this.notification.error(this.translationService.translate('routes.notifications.loadStopsFailed'));
      },
    });
  }

  saveRoute(payload: CreateRouteRequest | UpdateRouteRequest): void {
    this.routeDialogSubmitting.set(true);
    const editing = this.editingRoute();

    if (editing) {
      this.routeService.updateRoute(editing.id, payload as UpdateRouteRequest).subscribe({
        next: () => {
          this.routeDialogSubmitting.set(false);
          this.showRouteDialog.set(false);
          this.notification.success(this.translationService.translate('routes.notifications.updateSuccess'));
          this.loadRoutes();
        },
        error: (err) => {
          this.routeDialogSubmitting.set(false);
          this.notification.error(err.error?.message || this.translationService.translate('common.errors.unexpected'));
        },
      });
    } else {
      this.routeService.createRoute(payload as CreateRouteRequest).subscribe({
        next: () => {
          this.routeDialogSubmitting.set(false);
          this.showRouteDialog.set(false);
          this.notification.success(this.translationService.translate('routes.notifications.createSuccess'));
          this.loadRoutes();
        },
        error: (err) => {
          this.routeDialogSubmitting.set(false);
          this.notification.error(err.error?.message || this.translationService.translate('common.errors.unexpected'));
        },
      });
    }
  }

  saveStopsConfig(payload: UpdateRouteStopsRequest): void {
    const route = this.configuringRoute();
    if (!route) return;

    this.stopsConfigSubmitting.set(true);
    this.routeService.updateRouteStops(route.id, payload).subscribe({
      next: () => {
        this.stopsConfigSubmitting.set(false);
        this.showStopsConfigDialog.set(false);
        this.notification.success(this.translationService.translate('routes.notifications.saveStopsSuccess'));
        this.loadRoutes();
      },
      error: (err) => {
        this.stopsConfigSubmitting.set(false);
        this.notification.error(err.error?.message || this.translationService.translate('common.errors.unexpected'));
      },
    });
  }

  confirmToggleRouteStatus(route: RouteSummary): void {
    const isActivating = route.status !== 'ACTIVE';
    const newStatus: CommonStatus = isActivating ? 'ACTIVE' : 'INACTIVE';
    const actionKey = isActivating ? 'routes.confirmations.activate' : 'routes.confirmations.deactivate';
    const actionLowerKey = isActivating ? 'routes.confirmations.activateLower' : 'routes.confirmations.deactivateLower';
    const actionTitle = this.translationService.translate(actionKey);
    const actionVerb = this.translationService.translate(actionLowerKey);

    this.confirmModalTitle.set(
      this.translationService.translate('routes.confirmations.toggleRouteStatusTitle', { action: actionTitle })
    );
    this.confirmModalMessage.set(
      this.translationService.translate('routes.confirmations.toggleRouteStatusMsg', { action: actionVerb, name: route.name })
    );
    this.confirmModalAction.set(() => {
      this.routeService.updateRouteStatus(route.id, newStatus).subscribe({
        next: () => {
          this.showConfirmModal.set(false);
          this.notification.success(this.translationService.translate('routes.notifications.updateStatusSuccess'));
          this.loadRoutes();
        },
        error: (err) => {
          this.notification.error(err.error?.message || this.translationService.translate('common.errors.unexpected'));
        },
      });
    });
    this.showConfirmModal.set(true);
  }

  // --- STOP POINT ACTIONS ---
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
          this.notification.error(err.error?.message || this.translationService.translate('common.errors.unexpected'));
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
          this.notification.error(err.error?.message || this.translationService.translate('common.errors.unexpected'));
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
      this.translationService.translate('routes.confirmations.toggleStopPointStatusMsg', { action: actionVerb, name: stopPoint.name })
    );
    this.confirmModalAction.set(() => {
      this.routeService.updateStopPointStatus(stopPoint.id, newStatus).subscribe({
        next: () => {
          this.showConfirmModal.set(false);
          this.notification.success(this.translationService.translate('routes.notifications.updateStopPointStatusSuccess'));
          this.loadStopPoints();
        },
        error: (err) => {
          this.notification.error(err.error?.message || this.translationService.translate('common.errors.unexpected'));
        },
      });
    });
    this.showConfirmModal.set(true);
  }
}
