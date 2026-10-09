# KIẾN TRÚC HỆ THỐNG ANGULAR ADMIN — NHÀ XE ĐÔNG LÝ

Tài liệu này mô tả kiến trúc kỹ thuật tổng thể của dự án Frontend Quản trị (`Angular-FE`) thuộc **Hệ thống đặt vé xe khách trực tuyến & quản lý vận tải Đông Lý**.

---

## 1. TỔNG QUAN CÔNG NGHỆ

- **Framework**: Angular 21 (CLI 21.2.26, standalone components 100%).
- **Ngôn ngữ**: TypeScript 5.9.x (Strict mode).
- **UI Library**: PrimeNG 21.x (`primeng`), `@primeng/themes` (Preset: `Aura` tùy biến `DongLyThemePreset`), `primeicons 8.x`.
- **State & Reactivity**: Angular Signals cho UI & Computed state; RxJS 7.8 cho asynchronous streams, HTTP requests và event queues.
- **Change Detection**: `ChangeDetectionStrategy.OnPush` mặc định cho toàn bộ components.
- **Backend Communication**: REST API tích hợp với Go REST API backend (Stateless JWT token).

---

## 2. FEATURE-BASED ARCHITECTURE

Codebase được tổ chức theo mô hình kiến trúc dựa trên tính năng (Feature-based Architecture), chia thành 4 tầng ranh giới rõ rệt:

```text
src/app/
├── core/                     # Hạ tầng ứng dụng & Singleton Services
│   ├── auth/                 # AuthService, TokenStorageService, Auth Models
│   ├── guards/               # Route Guards (authGuard, guestGuard, permissionGuard)
│   ├── interceptors/         # Functional HTTP Interceptors (authInterceptor, errorInterceptor)
│   ├── models/               # ApiResponse, PageResponse, ApiErrorResponse
│   ├── services/             # NotificationService, LoggingService
│   ├── theme/                # DongLyThemePreset, PrimeNG Theme Configuration
│   └── error-handling/       # GlobalErrorHandler, NotFoundComponent
├── layouts/                  # Bố cục giao diện cấp cao
│   └── admin-layout/         # AdminLayoutComponent (Sidebar, Topbar, Toast Container, Outlet)
├── shared/                   # Thành phần dùng chung toàn hệ thống
│   ├── components/           # ConfirmModal, PageHeader, StatCard, LoadingSpinner, EmptyState
│   ├── directives/           # HasPermissionDirective
│   ├── pipes/                # CurrencyVndPipe, DateViPipe
│   └── utils/                # DateUtils, NumberUtils, Formatters (Pure functions)
└── features/                 # Các Module nghiệp vụ độc lập (Lazy-loaded Routes)
    ├── auth/                 # Đăng nhập & Xác thực người dùng (FE-001)
    ├── dashboard/            # Bàn làm việc tổng quan
    ├── users/                # Quản lý người dùng (FE-002)
    ├── roles/                # Quản lý phân quyền (FE-003)
    ├── locations/            # Quản lý bến xe / điểm đón trả
    ├── routes/               # Quản lý tuyến đường & điểm dừng
    ├── vehicles/             # Quản lý phương tiện & sơ đồ ghế
    ├── drivers/              # Quản lý tài xế & phụ xe
    ├── trips/                # Quản lý chuyến xe & lịch xuất bến
    ├── bookings/             # Quản lý đặt vé & giữ chỗ
    ├── payments/             # Quản lý thanh toán & hóa đơn
    ├── tickets/              # Quản lý vé in & vé điện tử
    └── reports/              # Báo cáo thống kê & doanh thu
```

---

## 3. NGUYÊN TẮC PHỤ THUỘC (DEPENDENCY RULES)

1. **Ranh giới Core**:
   - `core` là nơi chứa các singleton providers, guards, interceptors, và base models.
   - **Tuyệt đối không** import bất kỳ file nào từ `features` vào `core`.
2. **Ranh giới Shared**:
   - `shared` chứa UI primitives tái sử dụng, pure pipes, và utilities độc lập.
   - **Tuyệt đối không** chứa business logic đặc thù của một feature cụ thể (ví dụ: không đặt logic tính giá vé xe hoặc validate mã chuyến xe vào shared).
3. **Ranh giới Features**:
   - Các feature độc lập với nhau. Feature A **không được phép** import trực tiếp component hoặc service nội bộ của Feature B.
   - Nếu có nhu cầu trao đổi dữ liệu hoặc tái sử dụng giữa từ 2 feature trở lên, phần dùng chung đó phải được chuẩn hóa và chuyển vào `shared` hoặc thông qua route params/API.
4. **Vòng lặp phụ thuộc (Circular Dependency)**:
   - Nghiêm cấm tạo vòng lặp phụ thuộc giữa các file. Dùng Angular CLI và TypeScript compiler để kiểm soát.

---

## 4. LUỒNG DỮ LIỆU (DATA FLOW)

```text
[ Người dùng tương tác UI ]
          │
          ▼
   [ Component ] ──(Forms / Events)──► Gọi method của Feature Service
                                              │
                                              ▼
                                     [ Feature / Core Service ]
                                              │
                                       (HttpClient)
                                              │
                                              ▼
                                     [ authInterceptor ]
                                     (Gắn Bearer Token)
                                              │
                                              ▼
                                    [ Go REST API Backend ]
                                              │
                                              ▼
                                     [ errorInterceptor ]
                                     (Bắt mã lỗi chuẩn hóa)
                                              │
                                              ▼
                                  [ Cập nhật Signals / RxJS ]
                                              │
                                              ▼
                                   [ Re-render OnPush UI ]
```

---

## 5. MÔ HÌNH QUẢN LÝ TRẠNG THÁI (STATE MANAGEMENT)

- **UI State & Computed State**: Sử dụng **Angular Signals** (`signal()`, `computed()`) làm cơ chế chính vì tính năng reactive đồng bộ, hiệu năng cao và tương thích tối đa với `ChangeDetectionStrategy.OnPush`.
- **Asynchronous Data Stream & HTTP**: Sử dụng **RxJS** cho HTTP requests, chuyển đổi luồng dữ liệu (`switchMap`, `map`, `catchError`), và dọn dẹp subscription bằng `takeUntilDestroyed()`.
- **Không sử dụng** Redux/NgRx Store cồng kềnh khi cấu trúc ứng dụng hiện tại chỉ yêu cầu quản lý cục bộ theo từng service và feature.
