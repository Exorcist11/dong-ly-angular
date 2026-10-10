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
import { AuthService } from '../../../../core/auth/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { TranslationService } from '../../../../core/i18n/translation.service';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
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
  CreateUserRequest,
  Role,
  UpdateUserRequest,
  User,
  UserStatus,
} from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { RoleService } from '../../services/role.service';
import { UserFormDialogComponent } from '../../components/user-form-dialog/user-form-dialog.component';
import { UserRoleDialogComponent } from '../../components/user-role-dialog/user-role-dialog.component';

@Component({
  selector: 'app-user-list-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslatePipe,
    DataTableComponent,
    TableCellDirective,
    Button,
    Tooltip,
    PageHeaderComponent,
    ConfirmModalComponent,
    StatusBadgeComponent,
    HasPermissionDirective,
    DateViPipe,
    UserFormDialogComponent,
    UserRoleDialogComponent,
  ],
  templateUrl: './user-list-page.component.html',
  styleUrls: ['./user-list-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserListPageComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly roleService = inject(RoleService);
  private readonly authService = inject(AuthService);
  private readonly notification = inject(NotificationService);
  private readonly translationService = inject(TranslationService);

  // DATA SIGNALS
  readonly users = signal<User[]>([]);
  readonly availableRoles = signal<Role[]>([]);
  readonly totalRecords = signal<number>(0);
  readonly currentPage = signal<number>(0);
  readonly pageSize = signal<number>(10);
  readonly sortField = signal<string>('createdAt,desc');

  // SHARED TABLE CONFIG
  readonly columns = computed<TableColumn<User>[]>(() => {
    this.translationService.currentLang();
    return [
      { field: 'fullName', header: this.translationService.translate('users.columns.accountAndName'), width: '260px' },
      { field: 'email', header: this.translationService.translate('users.columns.contact'), width: '220px' },
      { field: 'status', header: this.translationService.translate('users.columns.status'), width: '140px' },
      { field: 'roles', header: this.translationService.translate('users.columns.roles'), width: '220px' },
      { field: 'createdAt', header: this.translationService.translate('users.columns.createdAt'), width: '130px', sortable: true },
      { field: 'actions', header: this.translationService.translate('users.columns.actions'), width: '120px', align: 'center' },
    ];
  });

  readonly breadcrumbs = computed(() => [
    { label: this.translationService.translate('navigation.home'), url: '/dashboard' },
    { label: this.translationService.translate('navigation.systemGroup') },
    { label: this.translationService.translate('users.breadcrumbs.users') },
  ]);

  readonly rowClass = (u: User) => (this.isCurrentUser(u) ? 'self-row' : '');

  // FILTER SIGNALS
  readonly searchTerm = signal<string>('');
  readonly selectedStatus = signal<UserStatus | 'ALL'>('ALL');

  // UI STATE SIGNALS
  readonly isLoading = signal<boolean>(false);
  readonly isSubmitting = signal<boolean>(false);
  readonly hasError = signal<boolean>(false);

  // DIALOG SIGNALS
  readonly isFormDialogOpen = signal<boolean>(false);
  readonly isRoleDialogOpen = signal<boolean>(false);
  readonly isConfirmStatusModalOpen = signal<boolean>(false);
  readonly selectedUser = signal<User | null>(null);
  readonly statusTargetUser = signal<User | null>(null);

  readonly statusModalConfig = signal<{
    title: string;
    message: string;
    confirmText: string;
    isDanger: boolean;
    targetStatus: UserStatus;
  }>({
    title: '',
    message: '',
    confirmText: '',
    isDanger: false,
    targetStatus: 'ACTIVE',
  });

  readonly statusOptions = computed<SelectOption<UserStatus | 'ALL'>[]>(() => {
    this.translationService.currentLang();
    return [
      { label: this.translationService.translate('users.allStatuses'), value: 'ALL' },
      { label: this.translationService.translate('common.status.active'), value: 'ACTIVE' },
      { label: this.translationService.translate('common.status.inactive'), value: 'INACTIVE' },
      { label: this.translationService.translate('common.status.locked'), value: 'LOCKED' },
    ];
  });

  readonly tableFilters = computed<TableFilterConfig<UserStatus | 'ALL'>[]>(() => [
    {
      key: 'status',
      label: this.translationService.translate('users.statusFilter'),
      placeholder: this.translationService.translate('users.allStatuses'),
      options: this.statusOptions(),
      value: this.selectedStatus(),
      width: '180px',
    },
  ]);

  // COMPUTED: Lọc hiển thị danh sách người dùng
  readonly displayedUsers = computed(() => {
    const rawList = this.users();
    const query = this.searchTerm().trim().toLowerCase();
    const status = this.selectedStatus();

    return rawList.filter((u) => {
      // 1. Lọc theo trạng thái
      if (status !== 'ALL' && u.status !== status) {
        return false;
      }

      // 2. Lọc theo từ khóa tìm kiếm (họ tên, username, email, phone)
      if (query) {
        const matchName = u.fullName?.toLowerCase().includes(query);
        const matchUser = u.username?.toLowerCase().includes(query);
        const matchEmail = u.email?.toLowerCase().includes(query);
        const matchPhone = u.phone?.toLowerCase().includes(query);
        return matchName || matchUser || matchEmail || matchPhone;
      }

      return true;
    });
  });

  ngOnInit(): void {
    this.loadRoles();
    this.loadUsers();
  }

  loadRoles(): void {
    this.roleService.getActiveRoles().subscribe({
      next: (res) => {
        this.availableRoles.set(res.data.items ?? []);
      },
      error: () => {
        // Lỗi lấy danh sách role không chặn trang danh sách user
      },
    });
  }

  loadUsers(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.userService
      .getUsers(this.currentPage(), this.pageSize(), this.sortField())
      .subscribe({
        next: (res) => {
          this.isLoading.set(false);
          this.users.set(res.data.items ?? []);
          this.totalRecords.set(res.data.pagination?.totalElements ?? 0);
        },
        error: () => {
          this.isLoading.set(false);
          this.hasError.set(true);
        },
      });
  }

  onLazyLoad(event: TableLazyLoadEvent): void {
    const first = event.first ?? 0;
    const rows = event.rows ?? 10;
    const page = Math.floor(first / rows);

    this.pageSize.set(rows);
    this.currentPage.set(page);

    if (event.sortField) {
      const order = event.sortOrder === 1 ? 'asc' : 'desc';
      this.sortField.set(`${event.sortField},${order}`);
    } else {
      this.sortField.set('createdAt,desc');
    }

    this.loadUsers();
  }

  onSearchChange(term: string): void {
    this.searchTerm.set(term);
  }

  onStatusChange(status: UserStatus | 'ALL'): void {
    this.selectedStatus.set(status);
  }

  onFilterChange(event: TableFilterChangeEvent<any>): void {
    if (event.key === 'status') {
      this.onStatusChange(event.value as UserStatus | 'ALL');
    }
  }

  // DIALOG ACTIONS: CREATE / EDIT USER
  openCreateDialog(): void {
    this.selectedUser.set(null);
    this.isFormDialogOpen.set(true);
  }

  openEditDialog(user: User): void {
    this.selectedUser.set(user);
    this.isFormDialogOpen.set(true);
  }

  onFormDialogVisibleChange(visible: boolean): void {
    this.isFormDialogOpen.set(visible);
    if (!visible) {
      this.selectedUser.set(null);
    }
  }

  onSaveUser(payload: CreateUserRequest | UpdateUserRequest): void {
    this.isSubmitting.set(true);
    const currentUser = this.selectedUser();

    if (currentUser) {
      // CHẾ ĐỘ CẬP NHẬT
      this.userService
        .updateUser(currentUser.id, payload as UpdateUserRequest)
        .subscribe({
          next: () => {
            this.isSubmitting.set(false);
            this.isFormDialogOpen.set(false);
            this.notification.success(this.translationService.translate('users.notifications.updateSuccess'));
            this.loadUsers();
          },
          error: () => {
            this.isSubmitting.set(false);
          },
        });
    } else {
      // CHẾ ĐỘ TẠO MỚI
      this.userService
        .createUser(payload as CreateUserRequest)
        .subscribe({
          next: () => {
            this.isSubmitting.set(false);
            this.isFormDialogOpen.set(false);
            this.notification.success(this.translationService.translate('users.notifications.createSuccess'));
            this.loadUsers();
          },
          error: () => {
            this.isSubmitting.set(false);
          },
        });
    }
  }

  // DIALOG ACTIONS: ROLES ASSIGNMENT
  openRoleDialog(user: User): void {
    this.selectedUser.set(user);
    this.isRoleDialogOpen.set(true);
  }

  onRoleDialogVisibleChange(visible: boolean): void {
    this.isRoleDialogOpen.set(visible);
    if (!visible) {
      this.selectedUser.set(null);
    }
  }

  onSaveRoles(data: { userId: string; roleCodes: string[] }): void {
    this.isSubmitting.set(true);
    this.userService
      .updateUserRoles(data.userId, { roleCodes: data.roleCodes })
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.isRoleDialogOpen.set(false);
          this.notification.success(this.translationService.translate('users.notifications.updateRolesSuccess'));
          this.loadUsers();
        },
        error: () => {
          this.isSubmitting.set(false);
        },
      });
  }

  // STATUS CHANGE MODAL
  confirmToggleStatus(user: User): void {
    if (this.isCurrentUser(user)) {
      this.notification.warning(this.translationService.translate('users.notifications.cannotLockSelf'));
      return;
    }

    this.statusTargetUser.set(user);

    if (user.status === 'ACTIVE') {
      this.statusModalConfig.set({
        title: this.translationService.translate('users.statusModal.lockTitle'),
        message: this.translationService.translate('users.statusModal.lockMessage', {
          name: user.fullName,
          username: user.username,
        }),
        confirmText: this.translationService.translate('users.statusModal.lockConfirm'),
        isDanger: true,
        targetStatus: 'LOCKED',
      });
    } else {
      this.statusModalConfig.set({
        title: this.translationService.translate('users.statusModal.unlockTitle'),
        message: this.translationService.translate('users.statusModal.unlockMessage', {
          name: user.fullName,
          username: user.username,
        }),
        confirmText: this.translationService.translate('users.statusModal.unlockConfirm'),
        isDanger: false,
        targetStatus: 'ACTIVE',
      });
    }

    this.isConfirmStatusModalOpen.set(true);
  }

  cancelStatusChange(): void {
    this.isConfirmStatusModalOpen.set(false);
    this.statusTargetUser.set(null);
  }

  executeStatusChange(): void {
    const target = this.statusTargetUser();
    if (!target) return;

    const newStatus = this.statusModalConfig().targetStatus;

    this.userService
      .updateUserStatus(target.id, { status: newStatus })
      .subscribe({
        next: () => {
          this.isConfirmStatusModalOpen.set(false);
          this.statusTargetUser.set(null);
          this.notification.success(
            newStatus === 'ACTIVE'
              ? this.translationService.translate('users.notifications.activateSuccess')
              : this.translationService.translate('users.notifications.lockSuccess')
          );
          this.loadUsers();
        },
        error: () => {
          this.isConfirmStatusModalOpen.set(false);
        },
      });
  }

  // HELPER FORMATTERS
  isCurrentUser(user: User): boolean {
    return this.authService.currentUser()?.id === user.id;
  }

  hasAdminRole(user: User): boolean {
    return user.roles?.includes('ADMIN') ?? false;
  }

  isActionDisabled(user: User): boolean {
    // Non-admin không được sửa admin
    if (this.hasAdminRole(user) && !this.authService.hasRole('ADMIN')) {
      return true;
    }
    return false;
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  getStatusLabel(status: UserStatus): string {
    switch (status) {
      case 'ACTIVE':
        return 'Hoạt động';
      case 'INACTIVE':
        return 'Ngưng hoạt động';
      case 'LOCKED':
        return 'Đã khóa';
      default:
        return status;
    }
  }

  getStatusSeverity(status: UserStatus): 'success' | 'warn' | 'danger' | 'secondary' {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'INACTIVE':
        return 'secondary';
      case 'LOCKED':
        return 'danger';
      default:
        return 'secondary';
    }
  }
}
