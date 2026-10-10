import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse, PageResponse } from '../../../core/models/api-response.model';
import {
  AssignRolePermissionsRequest,
  CreateRoleRequest,
  Permission,
  PermissionCatalog,
  Role,
  RoleDetail,
  RoleStatus,
  UpdateRoleRequest,
  UpdateRoleStatusRequest,
} from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  private readonly http = inject(HttpClient);
  private readonly ROLES_URL = `${environment.apiBaseUrl}/roles`;
  private readonly PERMISSIONS_URL = `${environment.apiBaseUrl}/permissions`;

  /**
   * Lấy danh sách vai trò có phân trang, lọc và tìm kiếm.
   */
  getRoles(
    page = 0,
    size = 20,
    sort = 'createdAt,desc',
    search?: string,
    status?: RoleStatus
  ): Observable<PageResponse<Role>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }

    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<PageResponse<Role>>(this.ROLES_URL, { params });
  }

  /**
   * Lấy danh sách tất cả vai trò đang hoạt động (ACTIVE).
   */
  getActiveRoles(): Observable<PageResponse<Role>> {
    return this.getRoles(0, 100, 'name,asc', undefined, 'ACTIVE');
  }

  /**
   * Lấy chi tiết vai trò kèm toàn bộ quyền hạn đã gán.
   */
  getRoleById(id: string): Observable<ApiResponse<RoleDetail>> {
    return this.http.get<ApiResponse<RoleDetail>>(`${this.ROLES_URL}/${id}`);
  }

  /**
   * Tạo mới vai trò tùy chỉnh (POST /api/v1/roles).
   */
  createRole(payload: CreateRoleRequest): Observable<ApiResponse<RoleDetail>> {
    return this.http.post<ApiResponse<RoleDetail>>(this.ROLES_URL, payload);
  }

  /**
   * Cập nhật tên và mô tả vai trò (PUT /api/v1/roles/{id}).
   */
  updateRole(id: string, payload: UpdateRoleRequest): Observable<ApiResponse<Role>> {
    return this.http.put<ApiResponse<Role>>(`${this.ROLES_URL}/${id}`, payload);
  }

  /**
   * Cập nhật trạng thái vai trò (PATCH /api/v1/roles/{id}/status).
   */
  updateRoleStatus(id: string, payload: UpdateRoleStatusRequest): Observable<ApiResponse<Role>> {
    return this.http.patch<ApiResponse<Role>>(`${this.ROLES_URL}/${id}/status`, payload);
  }

  /**
   * Xóa vai trò tùy chỉnh (DELETE /api/v1/roles/{id}).
   */
  deleteRole(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.ROLES_URL}/${id}`);
  }

  /**
   * Lấy danh sách quyền hạn đã gán cho vai trò (GET /api/v1/roles/{id}/permissions).
   */
  getRolePermissions(id: string): Observable<ApiResponse<Permission[]>> {
    return this.http.get<ApiResponse<Permission[]>>(`${this.ROLES_URL}/${id}/permissions`);
  }

  /**
   * Gán/cập nhật toàn bộ quyền cho vai trò (PUT /api/v1/roles/{id}/permissions).
   */
  assignRolePermissions(
    id: string,
    payload: AssignRolePermissionsRequest
  ): Observable<ApiResponse<RoleDetail>> {
    return this.http.put<ApiResponse<RoleDetail>>(`${this.ROLES_URL}/${id}/permissions`, payload);
  }

  /**
   * Lấy toàn bộ danh mục quyền hạn hệ thống theo nhóm module (GET /api/v1/permissions).
   */
  getPermissionsCatalog(module?: string): Observable<ApiResponse<PermissionCatalog>> {
    let params = new HttpParams();
    if (module && module.trim()) {
      params = params.set('module', module.trim());
    }
    return this.http.get<ApiResponse<PermissionCatalog>>(this.PERMISSIONS_URL, { params });
  }
}
