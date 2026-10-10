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
import { Button } from 'primeng/button';
import { Tooltip } from 'primeng/tooltip';

import { NotificationService } from '../../../../core/services/notification.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { DataTableComponent } from '../../../../shared/components/data-table/data-table.component';
import { TableCellDirective } from '../../../../shared/components/data-table/table-cell.directive';
import {
  TableColumn,
  TableFilterChangeEvent,
  TableFilterConfig,
  TableLazyLoadEvent,
} from '../../../../shared/models/table.model';
import { SelectOption } from '../../../../shared/models/select-option.model';
import { HasPermissionDirective } from '../../../../shared/directives/has-permission.directive';
import { DateViPipe } from '../../../../shared/pipes/date-vi.pipe';

import {
  CreateRoleRequest,
  Role,
  RoleStatus,
  UpdateRoleRequest,
  UpdateRoleStatusRequest,
} from '../../models/user.model';
import { RoleService } from '../../services/role.service';
import { RoleFormDialogComponent } from '../../components/role-form-dialog/role-form-dialog.component';
import { RolePermissionMatrixComponent } from '../../components/role-permission-matrix/role-permission-matrix.component';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-role-list-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DataTableComponent,
    TableCellDirective,
    Button,
    Tooltip,
    PageHeaderComponent,
    ConfirmModalComponent,
    StatusBadgeComponent,
    HasPermissionDirective,
    DateViPipe,
    RoleFormDialogComponent,
    RolePermissionMatrixComponent,
  ],
  templateUrl: './role-list-page.component.html',
  styleUrls: ['./role-list-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoleListPageComponent implements OnInit {
  private readonly roleService = inject(RoleService);
  private readonly notification = inject(NotificationService);

  // DATA SIGNALS
  readonly roles = signal<Role[]>([]);
  readonly totalRecords = signal<number>(0);
  readonly currentPage = signal<number>(0);
  readonly pageSize = signal<number>(10);
  readonly sortField = signal<string>('createdAt,desc');

  // SHARED TABLE CONFIG
  readonly columns: TableColumn<Role>[] = [
    { field: 'code', header: 'Mã vai trò', width: '160px' },
    { field: 'name', header: 'Tên vai trò', minWidth: '180px' },
    { field: 'isSystem', header: 'Loại vai trò', width: '130px' },
    { field: 'description', header: 'Mô tả', minWidth: '220px' },
    { field: 'permissionCount', header: 'Quyền hạn', width: '130px', align: 'center' },
    { field: 'status', header: 'Trạng thái', width: '130px', align: 'center' },
    { field: 'createdAt', header: 'Ngày tạo', width: '140px' },
    { field: 'actions', header: 'Thao tác', width: '160px', align: 'right' },
  ];

  // FILTER SIGNALS
  readonly searchTerm = signal<string>('');
  readonly selectedStatus = signal<RoleStatus | 'ALL'>('ALL');

  // UI STATE SIGNALS
  readonly loading = signal<boolean>(false);
  readonly submittingForm = signal<boolean>(false);

  // DIALOG STATE SIGNALS
  readonly roleFormVisible = signal<boolean>(false);
  readonly selectedRoleForEdit = signal<Role | null>(null);

  readonly matrixVisible = signal<boolean>(false);
  readonly selectedRoleForMatrix = signal<Role | null>(null);

  // CONFIRM MODAL SIGNALS
  readonly statusConfirmVisible = signal<boolean>(false);
  readonly roleForStatusChange = signal<Role | null>(null);
  readonly pendingStatus = signal<RoleStatus>('ACTIVE');

  readonly deleteConfirmVisible = signal<boolean>(false);
  readonly roleForDelete = signal<Role | null>(null);

  // OPTIONS
  readonly statusFilterOptions: SelectOption<RoleStatus | 'ALL'>[] = [
    { label: 'Tất cả trạng thái', value: 'ALL' },
    { label: 'Đang hoạt động', value: 'ACTIVE' },
    { label: 'Tạm khóa', value: 'INACTIVE' },
  ];

  readonly tableFilters = computed<TableFilterConfig<RoleStatus | 'ALL'>[]>(() => [
    {
      key: 'status',
      placeholder: 'Lọc trạng thái',
      options: this.statusFilterOptions,
      value: this.selectedStatus(),
      width: '180px',
    },
  ]);

  // COMPUTED
  readonly isFiltered = computed(() => {
    return !!this.searchTerm().trim() || this.selectedStatus() !== 'ALL';
  });

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.loading.set(true);

    const statusParam =
      this.selectedStatus() !== 'ALL' ? (this.selectedStatus() as RoleStatus) : undefined;
    const searchParam = this.searchTerm().trim() || undefined;

    this.roleService
      .getRoles(
        this.currentPage(),
        this.pageSize(),
        this.sortField(),
        searchParam,
        statusParam
      )
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.roles.set(response.data.items);
            this.totalRecords.set(response.data.pagination.totalElements);
          }
        },
        error: (err) => {
          this.notification.error(
            err.error?.message || 'Không thể kết nối đến máy chủ.'
          );
        },
      });
  }

  onLazyLoad(event: TableLazyLoadEvent): void {
    const page = event.first !== undefined && event.rows ? Math.floor(event.first / event.rows) : 0;
    const size = event.rows || 10;
    let sort = 'createdAt,desc';

    if (event.sortField) {
      const order = event.sortOrder === 1 ? 'asc' : 'desc';
      sort = `${event.sortField},${order}`;
    }

    this.currentPage.set(page);
    this.pageSize.set(size);
    this.sortField.set(sort);

    this.loadRoles();
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
    this.currentPage.set(0);
    this.loadRoles();
  }

  onStatusFilterChange(status: RoleStatus | 'ALL'): void {
    this.selectedStatus.set(status);
    this.currentPage.set(0);
    this.loadRoles();
  }

  onFilterChange(event: TableFilterChangeEvent<any>): void {
    if (event.key === 'status') {
      this.onStatusFilterChange(event.value as RoleStatus | 'ALL');
    }
  }

  onResetFilters(): void {
    this.searchTerm.set('');
    this.selectedStatus.set('ALL');
    this.currentPage.set(0);
    this.loadRoles();
  }

  // DIALOG ACTIONS
  openCreateDialog(): void {
    this.selectedRoleForEdit.set(null);
    this.roleFormVisible.set(true);
  }

  openEditDialog(role: Role): void {
    this.selectedRoleForEdit.set(role);
    this.roleFormVisible.set(true);
  }

  openMatrixDialog(role: Role): void {
    this.selectedRoleForMatrix.set(role);
    this.matrixVisible.set(true);
  }

  onSaveRole(payload: CreateRoleRequest | UpdateRoleRequest): void {
    const editRole = this.selectedRoleForEdit();
    this.submittingForm.set(true);

    if (editRole) {
      // Update role
      this.roleService
        .updateRole(editRole.id, payload as UpdateRoleRequest)
        .pipe(finalize(() => this.submittingForm.set(false)))
        .subscribe({
          next: (res) => {
            if (res.success) {
              this.notification.success('Đã cập nhật thông tin vai trò');
              this.roleFormVisible.set(false);
              this.loadRoles();
            }
          },
          error: (err) => {
            this.notification.error(
              err.error?.message || 'Không thể cập nhật thông tin vai trò'
            );
          },
        });
    } else {
      // Create role
      this.roleService
        .createRole(payload as CreateRoleRequest)
        .pipe(finalize(() => this.submittingForm.set(false)))
        .subscribe({
          next: (res) => {
            if (res.success) {
              this.notification.success('Đã tạo vai trò mới thành công');
              this.roleFormVisible.set(false);
              this.loadRoles();
            }
          },
          error: (err) => {
            this.notification.error(
              err.error?.message || 'Không thể tạo mới vai trò'
            );
          },
        });
    }
  }

  // STATUS CHANGE
  confirmStatusChange(role: Role): void {
    if (role.isSystem) {
      this.notification.info(
        'Vai trò hệ thống luôn ở trạng thái hoạt động và không thể khóa.'
      );
      return;
    }

    const nextStatus: RoleStatus = role.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    this.roleForStatusChange.set(role);
    this.pendingStatus.set(nextStatus);
    this.statusConfirmVisible.set(true);
  }

  onExecuteStatusChange(): void {
    const role = this.roleForStatusChange();
    const nextStatus = this.pendingStatus();
    if (!role) return;

    const payload: UpdateRoleStatusRequest = { status: nextStatus };

    this.roleService.updateRoleStatus(role.id, payload).subscribe({
      next: (res) => {
        if (res.success) {
          const actionText = nextStatus === 'ACTIVE' ? 'kích hoạt' : 'tạm khóa';
          this.notification.success(`Đã ${actionText} vai trò "${role.name}"`);
          this.statusConfirmVisible.set(false);
          this.loadRoles();
        }
      },
      error: (err) => {
        this.notification.error(
          err.error?.message || 'Không thể cập nhật trạng thái vai trò'
        );
        this.statusConfirmVisible.set(false);
      },
    });
  }

  // DELETE ROLE
  confirmDeleteRole(role: Role): void {
    if (role.isSystem) {
      this.notification.error(
        'Vai trò hệ thống được bảo vệ và không thể xóa.'
      );
      return;
    }

    this.roleForDelete.set(role);
    this.deleteConfirmVisible.set(true);
  }

  onExecuteDeleteRole(): void {
    const role = this.roleForDelete();
    if (!role) return;

    this.roleService.deleteRole(role.id).subscribe({
      next: (res) => {
        if (res.success) {
          this.notification.success(`Đã xóa vai trò "${role.name}"`);
          this.deleteConfirmVisible.set(false);
          this.loadRoles();
        }
      },
      error: (err) => {
        const msg =
          err.error?.code === 'ROLE_IN_USE'
            ? 'Không thể xóa vai trò vì đang có người dùng được gán. Vui lòng gỡ vai trò khỏi người dùng trước khi xóa.'
            : err.error?.message || 'Không thể xóa vai trò này.';
        this.notification.error(msg);
        this.deleteConfirmVisible.set(false);
      },
    });
  }

  onPermissionsSaved(): void {
    this.loadRoles();
  }
}
