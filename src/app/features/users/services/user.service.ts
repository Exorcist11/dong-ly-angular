import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse, PageResponse } from '../../../core/models/api-response.model';
import {
  CreateUserRequest,
  Role,
  UpdateUserRequest,
  UpdateUserRolesRequest,
  UpdateUserStatusRequest,
  User,
} from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.apiBaseUrl}/users`;

  /**
   * Lấy danh sách người dùng có phân trang và sắp xếp.
   * @param page Số trang (0-indexed)
   * @param size Kích thước trang
   * @param sort Tiêu chí sắp xếp, ví dụ "createdAt,desc"
   */
  getUsers(page = 0, size = 10, sort = 'createdAt,desc'): Observable<PageResponse<User>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (sort) {
      params = params.set('sort', sort);
    }

    return this.http.get<PageResponse<User>>(this.API_URL, { params });
  }

  /**
   * Lấy chi tiết thông tin một người dùng theo ID.
   */
  getUserById(id: string): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.API_URL}/${id}`);
  }

  /**
   * Tạo người dùng mới trong hệ thống.
   */
  createUser(payload: CreateUserRequest): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(this.API_URL, payload);
  }

  /**
   * Cập nhật thông tin người dùng theo ID.
   */
  updateUser(id: string, payload: UpdateUserRequest): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${this.API_URL}/${id}`, payload);
  }

  /**
   * Cập nhật trạng thái người dùng (ACTIVE, INACTIVE, LOCKED).
   */
  updateUserStatus(id: string, payload: UpdateUserStatusRequest): Observable<ApiResponse<User>> {
    return this.http.patch<ApiResponse<User>>(`${this.API_URL}/${id}/status`, payload);
  }

  /**
   * Lấy danh sách vai trò đang được gán cho một người dùng.
   */
  getUserRoles(id: string): Observable<ApiResponse<Role[]>> {
    return this.http.get<ApiResponse<Role[]>>(`${this.API_URL}/${id}/roles`);
  }

  /**
   * Cập nhật toàn bộ vai trò cho người dùng.
   */
  updateUserRoles(id: string, payload: UpdateUserRolesRequest): Observable<ApiResponse<Role[]>> {
    return this.http.put<ApiResponse<Role[]>>(`${this.API_URL}/${id}/roles`, payload);
  }
}
