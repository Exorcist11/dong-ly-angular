# BÁO CÁO KHẢO SÁT & ĐỐI CHIẾU BACKEND SPRING-BE (RBAC & USER MANAGEMENT)

**Dự án**: Hệ thống Quản trị & Vận tải Nhà xe Đông Lý  
**Nguồn tham chiếu Backend**: `E:\du-an-ma\Spring-BE`  
**Mục tiêu**: Khảo sát trực tiếp source code Backend Spring Boot (`com.dongly`), đối chiếu hợp đồng API, cấu trúc DTO, cơ chế bảo mật và quy tắc phân quyền RBAC trước khi triển khai module Quản trị người dùng trên Frontend `Angular-FE`.

---

## 1. TỔNG QUAN KHẢO SÁT BACKEND (`E:\du-an-ma\Spring-BE`)

### 1.1. Kiến trúc & Công nghệ Backend
- **Framework & Java**: Spring Boot 3.x, Java 21 LTS, Spring Security 6.
- **Database & Migration**: PostgreSQL, Flyway migration (`V1` đến `V4__enhance_rbac_tables_and_seed_permissions.sql`).
- **Mô hình kiến trúc**: Modular Monolith, Feature-oriented (`com.dongly.modules.auth`, `com.dongly.modules.user`).
- **Bảo mật & Phiên**: Stateless JWT (HMAC-SHA256, BCrypt cost 12), kết hợp Refresh Token lưu database dưới dạng SHA-256 hash.

### 1.2. Chuẩn đóng gói phản hồi (Envelope Contract)
1. **Thành công (Single Entity)**:
   ```json
   {
     "success": true,
     "message": "Thông điệp phản hồi",
     "data": { ... },
     "timestamp": "2026-10-10T03:00:00Z"
   }
   ```
2. **Thành công (Phân trang PageResponse)**:
   ```json
   {
     "success": true,
     "message": "Lấy danh sách thành công",
     "data": {
       "items": [ ... ],
       "pagination": {
         "page": 0,
         "size": 20,
         "totalElements": 100,
         "totalPages": 5,
         "isFirst": true,
         "isLast": false
       }
     },
     "timestamp": "2026-10-10T03:00:00Z"
   }
   ```
3. **Thất bại (ApiErrorResponse)**:
   ```json
   {
     "timestamp": "2026-10-10T03:00:00Z",
     "status": 403,
     "code": "ACCESS_DENIED",
     "message": "Bạn không có quyền thực hiện hành động này",
     "path": "/api/v1/users",
     "errors": null
   }
   ```
   *(Với lỗi validation 400 BAD_REQUEST, trường `errors` chứa danh sách `{ field, rejectedValue, message }`)*.

---

## 2. MA TRẬN ĐỐI CHIẾU ENDPOINT BACKEND VÀ FRONTEND

### 2.1. Phân hệ Xác thực & Phiên làm việc (`/api/v1/auth`)

| HTTP Method & Endpoint | Quyền hạn yêu cầu | Request Payload | Response Data | Mô tả & Quy tắc nghiệp vụ |
| :--- | :--- | :--- | :--- | :--- |
| `POST /api/v1/auth/login` | Public (Permit All) | `LoginRequest` `{ username, password }` | `ApiResponse<TokenResponse>` `{ accessToken, refreshToken, tokenType: 'Bearer', expiresIn }` | Kiểm tra tài khoản. Từ chối nếu user `LOCKED` hoặc `INACTIVE`. Không trả thông tin user. |
| `POST /api/v1/auth/refresh` | Public (Permit All) | `RefreshTokenRequest` `{ refreshToken }` | `ApiResponse<TokenResponse>` | Cơ chế Token Rotation: Thu hồi refresh token cũ, sinh cặp token mới. Phát hiện Replay Attack để hủy toàn bộ phiên. |
| `POST /api/v1/auth/logout` | Authenticated | `LogoutRequest` `{ refreshToken }` | `ApiResponse<Void>` | Thu hồi token hash tương ứng trong DB. Yêu cầu đúng chủ sở hữu phiên. |
| `GET /api/v1/auth/me` | Authenticated | Không (Bearer Token Header) | `ApiResponse<UserProfileResponse>` | Lấy thông tin user hiện tại kèm `roles: string[]` và `permissions: string[]` hợp nhất từ các role đang `ACTIVE`. |

### 2.2. Phân hệ Quản trị Người dùng (`/api/v1/users`)

| HTTP Method & Endpoint | Quyền hạn yêu cầu | Request Payload / Params | Response Data | Mô tả & Quy tắc nghiệp vụ |
| :--- | :--- | :--- | :--- | :--- |
| `GET /api/v1/users` | `hasAuthority('USER_READ')` | Params: `page` (default 0), `size` (default 20, max 100), `sort` (default `createdAt,desc`) | `PageResponse<UserResponse>` | Lấy danh sách người dùng phân trang. *(Chưa hỗ trợ `search` hay filter `status` trên backend)*. |
| `GET /api/v1/users/{id}` | `isAuthenticated()` *(Kiểm tra IDOR trong service)* | Path: `id` (UUID) | `ApiResponse<UserResponse>` | Chỉ chủ sở hữu hoặc người có quyền `USER_READ` / `ADMIN` mới được xem chi tiết. |
| `POST /api/v1/users` | `hasAuthority('USER_CREATE')` | `CreateUserRequest` `{ username, email, password, fullName, phone, roleCodes }` | `ApiResponse<UserResponse>` (HTTP 201) | Tạo người dùng mới. Mặc định gán role `CUSTOMER` nếu không truyền `roleCodes`. Chỉ ADMIN mới được gán role `ADMIN`. |
| `PUT /api/v1/users/{id}` | `hasAuthority('USER_UPDATE')` | Path: `id` (UUID), Body: `UpdateUserRequest` `{ fullName, email, phone, roleCodes }` | `ApiResponse<UserResponse>` | Cập nhật thông tin và vai trò. Non-admin không được chỉnh sửa tài khoản có role `ADMIN`. |
| `PATCH /api/v1/users/{id}/status` | `hasAuthority('USER_UPDATE')` | Path: `id` (UUID), Body: `UpdateUserStatusRequest` `{ status }` (`ACTIVE`\|`INACTIVE`\|`LOCKED`) | `ApiResponse<UserResponse>` | Cập nhật trạng thái tài khoản. Cấm tự khóa/vô hiệu hóa chính mình. Cấm khóa Admin cuối cùng. Tự động thu hồi toàn bộ Refresh Token khi khóa. |
| `GET /api/v1/users/{id}/roles` | `isAuthenticated()` | Path: `id` (UUID) | `ApiResponse<List<RoleResponse>>` | Xem danh sách vai trò của một người dùng (yêu cầu `USER_READ`, `ROLE_READ`, `ADMIN` hoặc chính chủ). |
| `PUT /api/v1/users/{id}/roles` | `hasAuthority('ROLE_ASSIGN') or hasRole('ADMIN')` | Path: `id` (UUID), Body: `UpdateUserRolesRequest` `{ roleCodes }` | `ApiResponse<List<RoleResponse>>` | Cập nhật vai trò người dùng. Thu hồi toàn bộ Refresh Token của user bị đổi vai trò. Chống tự nâng quyền. Không được thu hồi role `ADMIN` của admin cuối cùng. |

### 2.3. Phân hệ Quản trị Vai trò (`/api/v1/roles`)

| HTTP Method & Endpoint | Quyền hạn yêu cầu | Request Payload / Params | Response Data | Mô tả & Quy tắc nghiệp vụ |
| :--- | :--- | :--- | :--- | :--- |
| `GET /api/v1/roles` | `hasAuthority('ROLE_READ')` | Params: `page`, `size`, `sort`, `search` (tùy chọn), `status` (`ACTIVE`\|`INACTIVE`) | `PageResponse<RoleResponse>` | Tìm kiếm, lọc và phân trang danh sách vai trò. Trả về kèm `permissionCount`. |
| `GET /api/v1/roles/{id}` | `hasAuthority('ROLE_READ')` | Path: `id` (UUID) | `ApiResponse<RoleDetailResponse>` | Lấy chi tiết vai trò kèm toàn bộ danh sách `permissions` đã gán. |
| `POST /api/v1/roles` | `hasAuthority('ROLE_CREATE')` | `CreateRoleRequest` `{ code, name, description, permissionCodes }` | `ApiResponse<RoleDetailResponse>` (HTTP 201) | Tạo vai trò tùy chỉnh (`isSystem = false`). Không cho phép trùng mã code. |
| `PUT /api/v1/roles/{id}` | `hasAuthority('ROLE_UPDATE')` | Path: `id` (UUID), Body: `UpdateRoleRequest` `{ name, description }` | `ApiResponse<RoleResponse>` | Cập nhật tên và mô tả vai trò. Cấm sửa vai trò hệ thống (`is_system = true` hoặc `ADMIN`). Không cho phép đổi mã `code`. |
| `PATCH /api/v1/roles/{id}/status` | `hasAuthority('ROLE_UPDATE')` | Path: `id` (UUID), Body: `UpdateRoleStatusRequest` `{ status }` | `ApiResponse<RoleResponse>` | Đổi trạng thái `ACTIVE` / `INACTIVE`. Cấm vô hiệu hóa vai trò hệ thống hoặc vai trò đang có người dùng (`ROLE_IN_USE`). |
| `GET /api/v1/roles/{id}/permissions` | `hasAuthority('ROLE_READ')` | Path: `id` (UUID) | `ApiResponse<List<PermissionResponse>>` | Lấy danh sách quyền hạt nhân đã gán cho vai trò. |
| `PUT /api/v1/roles/{id}/permissions` | `hasAuthority('ROLE_ASSIGN')` | Path: `id` (UUID), Body: `AssignRolePermissionsRequest` `{ permissionCodes }` | `ApiResponse<RoleDetailResponse>` | Cập nhật danh mục quyền cho vai trò. Cấm thu hồi 5 quyền cốt lõi khỏi vai trò `ADMIN`. Chống tự nâng quyền (không được gán quyền bản thân không sở hữu). |
| `DELETE /api/v1/roles/{id}` | `hasAuthority('ROLE_DELETE')` | Path: `id` (UUID) | `ApiResponse<Void>` | Xóa vai trò tùy chỉnh. Cấm xóa vai trò hệ thống và vai trò đang có người dùng sử dụng. |

### 2.4. Phân hệ Danh mục Quyền hạn (`/api/v1/permissions`)

| HTTP Method & Endpoint | Quyền hạn yêu cầu | Query Params | Response Data | Mô tả & Quy tắc nghiệp vụ |
| :--- | :--- | :--- | :--- | :--- |
| `GET /api/v1/permissions` | `hasAuthority('PERMISSION_READ') or hasAuthority('ROLE_READ')` | `module` (tùy chọn: `USER`, `ROLE`, `ROUTE`, `FLEET`, `TRIP`, `BOOKING`, `TICKET`) | `ApiResponse<PermissionCatalogResponse>` | Trả về tổng số quyền `totalPermissions`, danh sách phân nhóm `modules: PermissionGroupResponse[]`, và danh sách phẳng `permissions: PermissionResponse[]`. |

---

## 3. CƠ CHẾ RBAC & QUY TẮC BẢO MẬT TỪ BACKEND

### 3.1. Mô hình Phân quyền (RBAC + Granular Permissions)
1. **User - Role**: Quan hệ N-N qua bảng `user_roles`. Một người dùng có thể sở hữu nhiều vai trò.
2. **Role - Permission**: Quan hệ N-N qua bảng `role_permissions`. Một vai trò bao gồm nhiều quyền thao tác hạt nhân.
3. **Vai trò Hệ thống (System Roles)**:
   - `ADMIN`: Quản trị toàn quyền hệ thống. Được gán toàn bộ quyền.
   - `OPERATOR`: Điều hành vận tải (Tuyến, Đội xe, Chuyến xe).
   - `STAFF`: Nhân viên bán vé (Đặt vé, In vé, Tra cứu).
   - `CUSTOMER`: Khách hàng trực tuyến (Mặc định khi tạo tài khoản).
   - Tất cả các role này có `is_system = true`, được bảo vệ nghiêm ngặt: không được sửa code, không được đổi trạng thái sang INACTIVE, không được xóa.
4. **Quyền hạt nhân (Granular Permissions)**:
   - Module `USER`: `USER_READ`, `USER_CREATE`, `USER_UPDATE`, `USER_DELETE`.
   - Module `ROLE`: `ROLE_READ`, `ROLE_CREATE`, `ROLE_UPDATE`, `ROLE_DELETE`, `ROLE_ASSIGN`.
   - Module `PERMISSION`: `PERMISSION_READ`.
   - Vận tải & Bán vé (sẵn sàng cho các giai đoạn tiếp): `ROUTE_READ`, `ROUTE_MANAGE`, `FLEET_READ`, `FLEET_MANAGE`, `TRIP_READ`, `TRIP_MANAGE`, `BOOKING_READ`, `BOOKING_MANAGE`, `TICKET_READ`.

### 3.2. Nạp quyền vào Security Context & JWT Claims
- **Khi đăng nhập hoặc refresh token**:
  - Backend trích xuất danh sách mã role (`code`) của các vai trò đang `ACTIVE`.
  - Backend trích xuất danh sách mã quyền (`code`) của các vai trò đang `ACTIVE`.
  - Nạp đồng thời vào JWT Access Token: claim `roles` và claim `permissions`.
- **Khi request đến Backend (`JwtAuthenticationFilter`)**:
  - `roles` được ánh xạ thành `GrantedAuthority` với tiền tố `ROLE_` (ví dụ `ROLE_ADMIN`).
  - `permissions` được nạp trực tiếp thành `GrantedAuthority` (ví dụ `USER_READ`, `ROLE_ASSIGN`).
  - Endpoint kiểm tra bằng `@PreAuthorize("hasAuthority('USER_READ')")` hoặc `@PreAuthorize("hasRole('ADMIN')")`.

### 3.3. Thời điểm Quyền mới có Hiệu lực
- Access Token có thời gian sống là **30 phút (1800 giây)**.
- Khi người quản trị thay đổi vai trò qua `PUT /api/v1/users/{id}/roles` hoặc khóa tài khoản qua `PATCH /api/v1/users/{id}/status`:
  - Backend **ngay lập tức thu hồi toàn bộ Refresh Token** của người dùng đó trong cơ sở dữ liệu (`refreshTokenRepository.revokeAllActiveTokensByUserId(id)`).
  - Người dùng đó sẽ không thể gia hạn phiên (refresh) và bị buộc phải đăng nhập lại để nhận quyền mới khi Access Token cũ hết hạn (hoặc khi logout).
  - Trên Frontend: Khi gọi `GET /api/v1/auth/me`, dữ liệu quyền luôn được truy vấn mới nhất từ Database.

### 3.4. Các quy tắc phòng thủ nghiệp vụ (Anti-Privilege Escalation)
1. **Chống tự khóa tài khoản**: Người dùng đang đăng nhập không được tự cập nhật trạng thái của mình sang `INACTIVE` hoặc `LOCKED`.
2. **Chống tự nâng quyền**: Người dùng không thể tự thêm vai trò hoặc tự gán quyền cho chính mình.
3. **Bảo vệ tài khoản Quản trị viên**: Người dùng không có vai trò `ADMIN` không thể chỉnh sửa hoặc thay đổi trạng thái của tài khoản có role `ADMIN`.
4. **Bảo vệ Quản trị viên cuối cùng**: Không thể thu hồi role `ADMIN` hoặc khóa tài khoản của người quản trị duy nhất còn lại trong hệ thống (`countUsersByRoleId <= 1`).
5. **Bảo vệ 5 quyền cốt lõi của vai trò ADMIN**: Cấm thu hồi các quyền `ROLE_READ`, `ROLE_CREATE`, `ROLE_UPDATE`, `ROLE_ASSIGN`, `PERMISSION_READ` khỏi vai trò `ADMIN`.
6. **Bảo vệ vai trò đang sử dụng**: Cấm xóa hoặc chuyển sang `INACTIVE` nếu vai trò đang được gán cho ít nhất 1 người dùng (`ROLE_IN_USE`).

---

## 4. DANH SÁCH MÃ LỖI CHUẨN BACKEND (`ErrorCode`)

| Mã lỗi (`code`) | HTTP Status | Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- |
| `VALIDATION_ERROR` | 400 Bad Request | Lỗi định dạng dữ liệu đầu vào (Bean Validation). Kèm mảng `errors`. |
| `MALFORMED_JSON` | 400 Bad Request | Cú pháp JSON sai hoặc body request rỗng. |
| `INVALID_ARGUMENT` | 400 Bad Request | Tham số URL hoặc kiểu dữ liệu không hợp lệ. |
| `UNAUTHORIZED` | 401 Unauthorized | Sai thông tin đăng nhập, token không hợp lệ hoặc tài khoản bị khóa/chưa kích hoạt. |
| `INVALID_TOKEN` | 401 Unauthorized | Token hết hạn, token bị thu hồi hoặc chữ ký số không hợp lệ. |
| `ACCESS_DENIED` | 403 Forbidden | Không đủ quyền thực thi hành động hoặc cố ý leo thang quyền. |
| `SYSTEM_ROLE_PROTECTED` | 403 Forbidden | Thao tác bị từ chối do tác động vào vai trò hệ thống được bảo vệ. |
| `RESOURCE_NOT_FOUND` | 404 Not Found | Không tìm thấy ID tài khoản, vai trò hoặc quyền yêu cầu. |
| `RESOURCE_ALREADY_EXISTS` | 409 Conflict | Trùng username, trùng email hoặc trùng mã role `code`. |
| `ROLE_IN_USE` | 409 Conflict | Không thể xóa/tắt vai trò đang được gán cho người dùng. |
| `BUSINESS_RULE_VIOLATION`| 422 Unprocessable | Vi phạm ràng buộc logic nghiệp vụ (tự khóa, xóa admin cuối cùng...). |
| `INTERNAL_SERVER_ERROR` | 500 Server Error | Lỗi hệ thống nội bộ. |

---

## 5. NHỮNG NGHIỆP VỤ ĐÃ HỖ TRỢ VÀ NHỮNG ĐIỂM CÒN THIẾU

### 5.1. Các nghiệp vụ Backend đã hỗ trợ hoàn chỉnh
1. Đăng nhập, refresh token có xoay vòng, logout và lấy thông tin chi tiết qua `/me`.
2. Lấy danh sách người dùng phân trang và sắp xếp.
3. Tạo người dùng mới có mật khẩu mã hóa BCrypt cost 12 và gán vai trò ban đầu.
4. Cập nhật thông tin người dùng (Họ tên, email, SĐT, danh sách vai trò).
5. Đổi trạng thái người dùng (`ACTIVE`, `INACTIVE`, `LOCKED`) với đầy đủ cơ chế thu hồi phiên làm việc.
6. Xem và cập nhật danh sách vai trò của từng người dùng (`PUT /api/v1/users/{id}/roles`).
7. Quản trị vai trò (Lấy danh sách có tìm kiếm và lọc trạng thái, xem chi tiết, tạo vai trò tùy chỉnh, sửa tên/mô tả, đổi trạng thái, xóa vai trò không dùng).
8. Quản trị phân quyền vai trò (Xem danh sách quyền của vai trò, cập nhật toàn bộ quyền cho vai trò).
9. Lấy catalog toàn bộ danh mục quyền theo nhóm module.

### 5.2. Các điểm Backend chưa có API tương ứng (Cần ghi nhận)
1. **Tìm kiếm & Lọc trên danh sách người dùng**: Endpoint `GET /api/v1/users` hiện chỉ nhận `page`, `size`, `sort`, chưa nhận query param `search` (từ khóa) hoặc `status` (trạng thái) như bên `RoleController`.
   - *Giải pháp Frontend hiện tại*: Phân trang và sắp xếp server-side theo đúng params backend cho phép. Đề xuất backend bổ sung Specification search keyword (username, email, phone) và status filter.
2. **Đặt lại mật khẩu (Admin Password Reset)**: Backend chưa có endpoint dành cho Admin đổi/reset mật khẩu tài khoản người dùng (`POST /api/v1/users/{id}/reset-password`).
3. **Hard Delete người dùng**: Backend áp dụng Soft Status (`PATCH /api/v1/users/{id}/status` chuyển sang `LOCKED`/`INACTIVE`) thay vì xóa vật lý khỏi DB để bảo toàn dữ liệu quan hệ (Audit Log, Booking). Mặc dù có quyền `USER_DELETE`, hành động này được ánh xạ vào việc vô hiệu hóa tài khoản.
4. **Cập nhật hồ sơ cá nhân của chính mình (Self-Profile Update)**: Hiện chỉ có `GET /api/v1/auth/me`. Chưa có endpoint riêng `PUT /api/v1/auth/me` để người dùng thông thường tự đổi thông tin cá nhân mà không cần quyền `USER_UPDATE`.
