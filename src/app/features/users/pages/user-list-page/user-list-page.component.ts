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
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { Select } from 'primeng/select';
import { Tooltip } from 'primeng/tooltip';

import { AuthService } from '../../../../core/auth/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';
import { SearchInputComponent } from '../../../../shared/components/search-input/search-input.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
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
    TableModule,
    Button,
    Select,
    Tooltip,
    PageHeaderComponent,
    EmptyStateComponent,
    ConfirmModalComponent,
    SearchInputComponent,
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

  // DATA SIGNALS
  readonly users = signal<User[]>([]);
  readonly availableRoles = signal<Role[]>([]);
  readonly totalRecords = signal<number>(0);
  readonly currentPage = signal<number>(0);
  readonly pageSize = signal<number>(10);
  readonly sortField = signal<string>('createdAt,desc');

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
    title: 'Xác nhận thao tác',
    message: '',
    confirmText: 'Xác nhận',
    isDanger: false,
    targetStatus: 'ACTIVE',
  });

  readonly statusOptions = [
    { label: 'Tất cả trạng thái', value: 'ALL' },
    { label: 'Đang hoạt động', value: 'ACTIVE' },
    { label: 'Ngưng hoạt động', value: 'INACTIVE' },
    { label: 'Đã khóa', value: 'LOCKED' },
  ];

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
            this.notification.success('Cập nhật thông tin người dùng thành công.');
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
            this.notification.success('Tạo người dùng mới thành công.');
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
          this.notification.success('Cập nhật vai trò người dùng thành công.');
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
      this.notification.warning('Không thể tự khóa tài khoản của chính mình.');
      return;
    }

    this.statusTargetUser.set(user);

    if (user.status === 'ACTIVE') {
      this.statusModalConfig.set({
        title: 'Khóa tài khoản người dùng',
        message: `Bạn có chắc chắn muốn khóa tài khoản "${user.fullName}" (@${user.username})? Người dùng này sẽ bị thu hồi phiên làm việc và không thể đăng nhập.`,
        confirmText: 'Khóa tài khoản',
        isDanger: true,
        targetStatus: 'LOCKED',
      });
    } else {
      this.statusModalConfig.set({
        title: 'Kích hoạt lại tài khoản',
        message: `Kích hoạt lại tài khoản "${user.fullName}" (@${user.username})? Người dùng có thể đăng nhập bình thường sau khi kích hoạt.`,
        confirmText: 'Kích hoạt',
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
              ? 'Kích hoạt tài khoản thành công.'
              : 'Đã khóa tài khoản người dùng.'
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
