# KIẾN TRÚC TỔNG THỂ HỆ THỐNG ANGULAR ADMIN PORTAL
### Dự án: Hệ thống đặt vé xe khách trực tuyến & Quản lý vận tải Đông Lý

---

## 1. Mục tiêu và Phạm vi
* **Phạm vi**: Ứng dụng Portal Quản trị nội bộ (Admin Web Application) dành cho điều hành viên, nhân viên bán vé, kế toán và ban quản trị nhà xe Đông Lý.
* **Giao tiếp Backend**: RESTful API với backend chuẩn Stateless JWT, phân quyền Role-Based Access Control (RBAC) với các quyền hạn chi tiết (Fine-grained Permissions).
* **Nền tảng công nghệ**:
  * Angular 21.x Standalone Components (100% không dùng NgModule cũ).
  * Build tool: Vite / esbuild bundler (tích hợp sẵn trong Angular CLI).
  * Unit Testing: Vitest.
  * State Management: Angular Signals cho UI/computed state + RxJS cho HTTP streams và asynchronous events.
  * TypeScript: Strict Mode (`strict: true`, không dùng `any` bừa bãi).

---

## 2. Mô hình Kiến trúc Phân lớp (Layered Architecture)

Hệ thống được tổ chức theo 4 phân tầng chính:

```
┌─────────────────────────────────────────────────────────────┐
│                       LAYOUTS LAYER                         │
│  Quản lý cấu trúc bố cục trang (AdminLayout: Sidebar, Top)  │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                      FEATURES LAYER                         │
│  Các module nghiệp vụ độc lập: Dashboard, Users, Trips...   │
│  Mỗi feature tự quản lý Components, Services, Models riêng │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
┌──────────────▼──────────────┐┌──────────────▼───────────────┐
│        SHARED LAYER         ││          CORE LAYER          │
│  UI Primitives dùng chung   ││  Singleton Services toàn cục │
│  Pipes, Directives, Utils   ││  Auth, Guards, Interceptors  │
│  (Không chứa business logic)││  Global Error Handling       │
└─────────────────────────────┘└──────────────────────────────┘
```

1. **Core Layer (`src/app/core/`)**:
   - Chứa các dịch vụ singleton chạy xuyên suốt vòng đời ứng dụng: `AuthService`, `TokenStorageService`, `NotificationService`.
   - Chứa cơ chế an ninh, xác thực: `authInterceptor`, `errorInterceptor`, `authGuard`, `permissionGuard`.
   - Chứa xử lý lỗi toàn cục: `GlobalErrorHandler`, `NotFoundComponent`.
   - **Quy tắc**: Không import ngược từ `features` hay `shared`.

2. **Shared Layer (`src/app/shared/`)**:
   - Chứa các thành phần UI dùng chung: `PageHeader`, `LoadingSpinner`, `EmptyState`, `StatCard`, `ConfirmModal`, `ThemeSwitcher`, `LanguageSwitcher`, `StatusBadge`, `SearchInput`, `FormField`.
   - Chứa Directives (`HasPermissionDirective`), Pipes (`CurrencyVndPipe`, `DateViPipe`, `TranslatePipe`), Pure Utilities (`date-utils.ts`, `number-utils.ts`), và Shared Models (`table.model.ts`, `select-option.model.ts`).
   - Quy chuẩn chi tiết: xem [`shared-ui-guidelines.md`](./shared-ui-guidelines.md).
   - **Quy tắc**: Tuyệt đối không chứa business logic đặc thù của bất kỳ feature nào.

3. **Layout Layer (`src/app/layout/`)**:
   - Định nghĩa shell khung ứng dụng: `LayoutShellComponent` gồm Sidebar điều hướng, Topbar hồ sơ cá nhân, Language & Theme switchers, Toast Notification container và `<router-outlet>`.

4. **Features Layer (`src/app/features/`)**:
   - Chứa các miền nghiệp vụ độc lập: `dashboard`, `users`, `trips`, `bookings`, `routes`, `vehicles`, `reports`.
   - Được nạp theo cơ chế **Lazy Loading** thông qua Angular Router.
