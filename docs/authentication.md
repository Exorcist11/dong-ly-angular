# TÀI LIỆU XÁC THỰC VÀ PHÂN QUYỀN (FE-001 AUTHENTICATION) — ĐÔNG LÝ ADMIN

Tài liệu này mô tả chi tiết cơ chế xác thực, quản lý phiên đăng nhập và phân quyền trong **Hệ thống Quản trị Nhà xe Đông Lý**.

---

## 1. TỔNG QUAN CƠ CHẾ XÁC THỰC

- **Kiến trúc**: Stateless JWT Token (Access Token & Refresh Token).
- **Backend API Base URL**: `https://dong-ly-be.onrender.com/api/v1` (Production) hoặc `/api/v1` (Dev proxy).
- **Lưu trữ Token phía Client**: Quản lý tập trung qua `TokenStorageService` với cơ chế lưu `dongly_access_token` và `dongly_refresh_token` trong `localStorage`.
- **Quản lý trạng thái**: `AuthService` lưu thông tin người dùng trong Angular Signal `currentUser: signal<UserProfile | null>`. Trạng thái `isAuthenticated` được tính toán tự động qua `computed()`.

---

## 2. API CONTRACT CHI TIẾT

### 2.1. Đăng nhập (Login)
- **Endpoint**: `POST /api/v1/auth/login`
- **Request Body**:
  ```json
  {
    "username": "admin",
    "password": "your_secure_password"
  }
  ```
- **Response Success (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Đăng nhập thành công",
    "data": {
      "accessToken": "eyJhbGciOi...",
      "refreshToken": "d8f9a2e1...",
      "tokenType": "Bearer",
      "expiresIn": 3600
    },
    "timestamp": "2026-10-09T16:00:00Z"
  }
  ```
- **Response Failure (401 Unauthorized)**:
  ```json
  {
    "status": 401,
    "code": "UNAUTHORIZED",
    "message": "Tên đăng nhập hoặc mật khẩu không chính xác",
    "path": "/api/v1/auth/login",
    "timestamp": "2026-10-09T16:00:00Z"
  }
  ```

### 2.2. Lấy hồ sơ người dùng (Get Profile & Permissions)
- **Endpoint**: `GET /api/v1/auth/me`
- **Headers**: `Authorization: Bearer <accessToken>`
- **Response Success (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Lấy thông tin người dùng thành công",
    "data": {
      "id": "usr-123",
      "username": "admin",
      "email": "admin@dongly.vn",
      "fullName": "Quản Trị Viên Đông Lý",
      "phone": "0987654321",
      "status": "ACTIVE",
      "roles": ["ROLE_ADMIN"],
      "permissions": ["USER_READ", "TRIP_MANAGE", "BOOKING_MANAGE"],
      "createdAt": "2026-01-01T00:00:00Z"
    },
    "timestamp": "2026-10-09T16:00:00Z"
  }
  ```

### 2.3. Xoay vòng Refresh Token
- **Endpoint**: `POST /api/v1/auth/refresh`
- **Request Body**:
  ```json
  {
    "refreshToken": "d8f9a2e1..."
  }
  ```
- **Response Success (200 OK)**: Trả về cặp Token mới (`TokenResponse`).

### 2.4. Đăng xuất (Logout)
- **Endpoint**: `POST /api/v1/auth/logout`
- **Request Body**:
  ```json
  {
    "refreshToken": "d8f9a2e1..."
  }
  ```

---

## 3. LUỒNG ĐĂNG NHẬP 2 BƯỚC (TWO-STEP LOGIN FLOW)

Vì backend API login không trả trực tiếp thông tin người dùng trong payload login, `AuthService.login()` thực hiện quy trình 2 bước chuẩn:
1. Gửi `POST /api/v1/auth/login` với thông tin đăng nhập.
2. Lưu cặp token vào `TokenStorageService`.
3. Tự động gọi `GET /api/v1/auth/me` (có kèm `Authorization: Bearer <accessToken>`) để lấy `UserProfile`, cập nhật signal `_currentUser`, và chuyển hướng người dùng vào `/dashboard` hoặc `returnUrl`.

---

## 4. ROUTE GUARDS

1. **`authGuard` (`src/app/core/guards/auth.guard.ts`)**:
   - Bảo vệ toàn bộ layout Admin.
   - Nếu chưa có Access Token: Điều hướng về `/auth/login?returnUrl=...`.
   - Nếu đã có Access Token nhưng reload trang (F5): Tự động gọi `fetchCurrentUser()` để khôi phục profile. Nếu token đã bị thu hồi/hết hạn, dọn dẹp storage và đưa về trang đăng nhập.
2. **`guestGuard` (`src/app/core/guards/guest.guard.ts`)**:
   - Bảo vệ route `/auth/login`.
   - Nếu người dùng đã có token hợp lệ, tự động chuyển hướng vào `/dashboard` để tránh đăng nhập lại không cần thiết.
3. **`permissionGuard` (`src/app/core/guards/permission.guard.ts`)**:
   - Kiểm tra quyền (`permission`) hoặc vai trò (`role`) đối với các module chức năng.

---

## 5. HTTP INTERCEPTORS

1. **`authInterceptor` (`src/app/core/interceptors/auth.interceptor.ts`)**:
   - Tự động gắn header `Authorization: Bearer <token>` vào mọi HTTP request (trừ các endpoint auth public: `/login`, `/refresh`, `/logout`).
   - Xử lý lỗi `401 Unauthorized` với cơ chế **Mutex Queue (BehaviorSubject)**:
     - Khi nhiều request đồng thời gặp 401, chỉ một tiến trình refresh token duy nhất được gửi đi.
     - Các request còn lại xếp hàng đợi token mới để retry tự động.
     - Nếu refresh thất bại, tiến hành xóa session và đưa người dùng về trang login.
2. **`errorInterceptor` (`src/app/core/interceptors/error.interceptor.ts`)**:
   - Bắt các lỗi HTTP toàn cục và hiển thị toast notification tiếng Việt (bỏ qua 401 vì authInterceptor đã xử lý).

---

## 6. NHỮNG ĐIỂM CẦN PHỐI HỢP VỚI BACKEND

1. **Thời gian sống của Token**: Cần thống nhất `expiresIn` giữa môi trường Dev, Staging và Production.
2. **Mã phân quyền chi tiết (Permissions Code List)**: Thống nhất bảng mã quyền (`USER_READ`, `USER_WRITE`, `TRIP_CREATE`, `BOOKING_CANCEL`...) để áp dụng cho `permissionGuard` và directive `*appHasPermission` trong các tính năng tiếp theo.
