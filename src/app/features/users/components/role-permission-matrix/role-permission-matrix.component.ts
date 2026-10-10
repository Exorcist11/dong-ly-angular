import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AppDialogComponent,
  DialogFooterDirective,
  DialogHeaderDirective,
} from '../../../../shared/components/dialog/dialog.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { Checkbox } from 'primeng/checkbox';
import { Tag } from 'primeng/tag';
import { Tooltip } from 'primeng/tooltip';
import { RoleService } from '../../services/role.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { TranslationService } from '../../../../core/i18n/translation.service';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';
import { Permission, PermissionCatalog, PermissionGroup } from '../../models/user.model';
import { forkJoin, finalize } from 'rxjs';

import { SearchInputComponent } from '../../../../shared/components/search-input/search-input.component';

/**
 * 5 quyền hạn cốt lõi bảo vệ của ADMIN được quy định tại Backend RBAC:
 * Com.dongly.modules.user.service.RoleService.CORE_ADMIN_PERMISSIONS
 */
export const CORE_ADMIN_PERMISSIONS = [
  'ROLE_READ',
  'ROLE_CREATE',
  'ROLE_UPDATE',
  'ROLE_ASSIGN',
  'PERMISSION_READ',
] as const;

@Component({
  selector: 'app-role-permission-matrix',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslatePipe,
    AppDialogComponent,
    DialogHeaderDirective,
    DialogFooterDirective,
    ButtonComponent,
    Checkbox,
    Tag,
    Tooltip,
    SearchInputComponent,
  ],
  templateUrl: './role-permission-matrix.component.html',
  styleUrl: './role-permission-matrix.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RolePermissionMatrixComponent implements OnChanges {
  private readonly roleService = inject(RoleService);
  private readonly notification = inject(NotificationService);
  private readonly translationService = inject(TranslationService);

  @Input() visible = false;
  @Input() roleId: string | null = null;
  @Input() roleName = '';
  @Input() roleCode = '';
  @Input() isSystemRole = false;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() permissionsSaved = new EventEmitter<void>();

  readonly loading = signal<boolean>(false);
  readonly saving = signal<boolean>(false);
  readonly catalog = signal<PermissionCatalog | null>(null);
  readonly selectedCodes = signal<Set<string>>(new Set());
  readonly initialCodes = signal<Set<string>>(new Set());
  readonly searchQuery = signal<string>('');

  readonly isAdminRole = computed(() => this.roleCode === 'ADMIN');

  /**
   * Danh sách các module và quyền đã lọc theo từ khóa tìm kiếm.
   */
  readonly filteredModules = computed(() => {
    const cat = this.catalog();
    if (!cat) return [];

    const query = this.searchQuery().trim().toLowerCase();
    if (!query) return cat.modules;

    return cat.modules
      .map((group) => {
        const matchingPermissions = group.permissions.filter(
          (p) =>
            p.name.toLowerCase().includes(query) ||
            p.code.toLowerCase().includes(query) ||
            p.description.toLowerCase().includes(query) ||
            group.module.toLowerCase().includes(query)
        );
        return {
          module: group.module,
          permissions: matchingPermissions,
        };
      })
      .filter((group) => group.permissions.length > 0);
  });

  /**
   * Tổng số quyền trong hệ thống.
   */
  readonly totalSystemPermissions = computed(() => {
    return this.catalog()?.totalPermissions ?? 0;
  });

  /**
   * Số lượng quyền đang được chọn.
   */
  readonly selectedCount = computed(() => {
    return this.selectedCodes().size;
  });

  /**
   * Số quyền thêm mới so với ban đầu.
   */
  readonly addedCount = computed(() => {
    const initial = this.initialCodes();
    const current = this.selectedCodes();
    let count = 0;
    current.forEach((code) => {
      if (!initial.has(code)) count++;
    });
    return count;
  });

  /**
   * Số quyền bị thu hồi so với ban đầu.
   */
  readonly removedCount = computed(() => {
    const initial = this.initialCodes();
    const current = this.selectedCodes();
    let count = 0;
    initial.forEach((code) => {
      if (!current.has(code)) count++;
    });
    return count;
  });

  /**
   * Có sự thay đổi quyền so với ban đầu hay không.
   */
  readonly hasChanges = computed(() => {
    return this.addedCount() > 0 || this.removedCount() > 0;
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible && this.roleId) {
      this.loadMatrixData();
    }
  }

  loadMatrixData(): void {
    if (!this.roleId) return;

    this.loading.set(true);
    this.searchQuery.set('');

    forkJoin({
      catalogRes: this.roleService.getPermissionsCatalog(),
      rolePermsRes: this.roleService.getRolePermissions(this.roleId),
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ catalogRes, rolePermsRes }) => {
          if (catalogRes.success && catalogRes.data) {
            this.catalog.set(catalogRes.data);
          }

          const currentPerms = new Set<string>();
          if (rolePermsRes.success && rolePermsRes.data) {
            rolePermsRes.data.forEach((p) => currentPerms.add(p.code));
          }

          // Ràng buộc an toàn: Nếu là vai trò ADMIN, bắt buộc 5 quyền cốt lõi
          if (this.roleCode === 'ADMIN') {
            CORE_ADMIN_PERMISSIONS.forEach((coreCode) => currentPerms.add(coreCode));
          }

          this.initialCodes.set(new Set(currentPerms));
          this.selectedCodes.set(new Set(currentPerms));
        },
        error: (err) => {
          this.notification.error(
            err.error?.message || 'Không thể tải danh mục quyền hạn của vai trò'
          );
        },
      });
  }

  /**
   * Kiểm tra xem quyền có phải quyền cốt lõi bị khóa của ADMIN hay không.
   */
  isCoreAdminPermission(permCode: string): boolean {
    return this.isAdminRole() && (CORE_ADMIN_PERMISSIONS as readonly string[]).includes(permCode);
  }

  /**
   * Kiểm tra quyền đã được chọn hay chưa.
   */
  isPermissionSelected(permCode: string): boolean {
    return this.selectedCodes().has(permCode);
  }

  /**
   * Đảo trạng thái chọn của một quyền.
   */
  togglePermission(permCode: string): void {
    if (this.isCoreAdminPermission(permCode)) {
      return; // Không được thay đổi quyền cốt lõi của ADMIN
    }

    const current = new Set(this.selectedCodes());
    if (current.has(permCode)) {
      current.delete(permCode);
    } else {
      current.add(permCode);
    }
    this.selectedCodes.set(current);
  }

  /**
   * Kiểm tra trạng thái chọn của toàn bộ module.
   */
  isModuleAllSelected(group: PermissionGroup): boolean {
    if (!group.permissions.length) return false;
    const current = this.selectedCodes();
    return group.permissions.every((p) => current.has(p.code));
  }

  /**
   * Kiểm tra xem module có được chọn một phần hay không.
   */
  isModulePartiallySelected(group: PermissionGroup): boolean {
    const current = this.selectedCodes();
    const count = group.permissions.filter((p) => current.has(p.code)).length;
    return count > 0 && count < group.permissions.length;
  }

  /**
   * Chọn hoặc bỏ chọn toàn bộ module.
   */
  toggleModule(group: PermissionGroup): void {
    const current = new Set(this.selectedCodes());
    const allSelected = this.isModuleAllSelected(group);

    if (allSelected) {
      // Bỏ chọn tất cả quyền trong module (trừ quyền core của ADMIN)
      group.permissions.forEach((p) => {
        if (!this.isCoreAdminPermission(p.code)) {
          current.delete(p.code);
        }
      });
    } else {
      // Chọn tất cả quyền trong module
      group.permissions.forEach((p) => {
        current.add(p.code);
      });
    }

    this.selectedCodes.set(current);
  }

  /**
   * Chọn toàn bộ quyền trong danh mục.
   */
  selectAll(): void {
    const cat = this.catalog();
    if (!cat) return;

    const current = new Set<string>();
    cat.permissions.forEach((p) => current.add(p.code));
    this.selectedCodes.set(current);
  }

  /**
   * Bỏ chọn tất cả (giữ nguyên quyền cốt lõi nếu là ADMIN).
   */
  deselectAll(): void {
    const current = new Set<string>();
    if (this.isAdminRole()) {
      CORE_ADMIN_PERMISSIONS.forEach((coreCode) => current.add(coreCode));
    }
    this.selectedCodes.set(current);
  }

  /**
   * Khôi phục về danh sách quyền ban đầu.
   */
  resetChanges(): void {
    this.selectedCodes.set(new Set(this.initialCodes()));
  }

  /**
   * Lưu ma trận phân quyền lên backend.
   */
  savePermissions(): void {
    if (this.saving() || !this.roleId) return;

    // Ràng buộc bảo vệ trước khi gửi: Nếu là ADMIN, bảo đảm không bị sót quyền cốt lõi
    const codes = Array.from(this.selectedCodes());
    if (this.isAdminRole()) {
      CORE_ADMIN_PERMISSIONS.forEach((coreCode) => {
        if (!codes.includes(coreCode)) {
          codes.push(coreCode);
        }
      });
    }

    this.saving.set(true);
    this.roleService
      .assignRolePermissions(this.roleId, { permissionCodes: codes })
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.notification.success(
              this.translationService.translate('roles.matrix.saveSuccess', {
                count: codes.length,
                name: this.roleName,
              })
            );
            this.permissionsSaved.emit();
            this.onClose();
          }
        },
        error: (err) => {
          this.notification.error(
            err.error?.message || this.translationService.translate('roles.matrix.saveError')
          );
        },
      });
  }

  onVisibleChange(val: boolean): void {
    if (!val && this.saving()) return;
    this.visible = val;
    this.visibleChange.emit(val);
  }

  onClose(): void {
    if (this.saving()) return;
    this.onVisibleChange(false);
  }
}
