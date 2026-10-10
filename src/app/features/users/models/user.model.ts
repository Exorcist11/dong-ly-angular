/**
 * Định nghĩa mô hình dữ liệu Người dùng, Vai trò & Quyền hạn cho module Quản trị người dùng & RBAC (FE-002)
 * Đối chiếu trực tiếp từ Backend Spring-BE (com.dongly.modules.user)
 */

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'LOCKED';
export type RoleStatus = 'ACTIVE' | 'INACTIVE';

/**
 * Thực thể User trả về từ API backend.
 */
export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phone: string | null;
  status: UserStatus;
  roles: string[];
  createdAt: string;
  updatedAt?: string;
}

/**
 * Payload yêu cầu tạo người dùng mới (POST /api/v1/users).
 */
export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phone?: string | null;
  roleCodes?: string[];
}

/**
 * Payload yêu cầu cập nhật thông tin người dùng (PUT /api/v1/users/{id}).
 */
export interface UpdateUserRequest {
  fullName: string;
  email: string;
  phone?: string | null;
  roleCodes?: string[];
}

/**
 * Payload yêu cầu cập nhật trạng thái người dùng (PATCH /api/v1/users/{id}/status).
 */
export interface UpdateUserStatusRequest {
  status: UserStatus;
}

/**
 * Payload yêu cầu gán/cập nhật vai trò cho người dùng (PUT /api/v1/users/{id}/roles).
 */
export interface UpdateUserRolesRequest {
  roleCodes: string[];
}

/**
 * Thông tin vai trò trả về từ API danh sách (GET /api/v1/roles).
 */
export interface Role {
  id: string;
  code: string;
  name: string;
  description: string | null;
  status: RoleStatus;
  isSystem: boolean;
  permissionCount: number;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Thông tin quyền hạn hạt nhân trong catalog RBAC (com.dongly.modules.user.dto.PermissionResponse).
 */
export interface Permission {
  code: string;
  name: string;
  description: string;
  module: string;
  action?: string;
}

/**
 * Chi tiết vai trò kèm toàn bộ quyền hạn đã gán (GET /api/v1/roles/{id}).
 */
export interface RoleDetail {
  id: string;
  code: string;
  name: string;
  description: string | null;
  status: RoleStatus;
  isSystem: boolean;
  permissions: Permission[];
  createdAt: string;
  updatedAt?: string;
}

/**
 * Payload yêu cầu tạo vai trò tùy chỉnh (POST /api/v1/roles).
 */
export interface CreateRoleRequest {
  code: string;
  name: string;
  description?: string | null;
  permissionCodes?: string[];
}

/**
 * Payload yêu cầu sửa thông tin vai trò (PUT /api/v1/roles/{id}).
 */
export interface UpdateRoleRequest {
  name: string;
  description?: string | null;
}

/**
 * Payload cập nhật trạng thái vai trò (PATCH /api/v1/roles/{id}/status).
 */
export interface UpdateRoleStatusRequest {
  status: RoleStatus;
}

/**
 * Payload gán/cập nhật toàn bộ quyền cho vai trò (PUT /api/v1/roles/{id}/permissions).
 */
export interface AssignRolePermissionsRequest {
  permissionCodes: string[];
}

/**
 * Cấu trúc phân nhóm quyền theo module (com.dongly.modules.user.dto.PermissionGroupResponse).
 */
export interface PermissionGroup {
  module: string;
  permissions: Permission[];
}

/**
 * Danh mục toàn bộ quyền hạn hệ thống (GET /api/v1/permissions).
 */
export interface PermissionCatalog {
  totalPermissions: number;
  modules: PermissionGroup[];
  permissions: Permission[];
}

/**
 * Bộ lọc danh sách người dùng trên giao diện.
 */
export interface UserFilterState {
  searchTerm: string;
  status: UserStatus | 'ALL';
  page: number;
  size: number;
  sort: string;
}

/**
 * Bộ lọc danh sách vai trò trên giao diện.
 */
export interface RoleFilterState {
  searchTerm: string;
  status: RoleStatus | 'ALL';
  page: number;
  size: number;
  sort: string;
}
