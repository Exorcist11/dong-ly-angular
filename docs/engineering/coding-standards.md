# TIÊU CHUẨN LẬP TRÌNH TYPESCRIPT & ANGULAR (CODING STANDARDS)
### Dự án: Đông Lý Angular Admin Portal

---

## 1. Tiêu chuẩn Angular 21
* **Standalone 100%**: Mọi component, pipe, directive khai báo với `standalone: true`. Không sử dụng `NgModule`.
* **OnPush Change Detection**: Tất cả component khai báo `changeDetection: ChangeDetectionStrategy.OnPush` để tối ưu hóa hiệu năng render.
* **Control Flow mới**: Sử dụng cú pháp `@if`, `@for`, `@switch` thay vì `*ngIf`, `*ngFor`, `*ngSwitch`.
* **Angular Signals**: Sử dụng `signal()`, `computed()` cho trạng thái UI đồng bộ và computed values. Kết hợp RxJS cho các luồng bất đồng bộ (HTTP, Router events).
* **Dependency Injection**: Sử dụng hàm `inject()` thay vì constructor injection.

---

## 2. Tiêu chuẩn TypeScript Strict
* Bật `strict: true` trong `tsconfig.json`.
* **Tuyệt đối không dùng `any` bừa bãi**: Sử dụng kiểu dữ liệu tường minh, `unknown` khi chưa xác định và type narrowing an toàn (`typeof`, `instanceof`, user-defined type guards).
* Không dùng `!` (non-null assertion operator) để che giấu lỗi null/undefined.
* Khai báo interface cho tất cả API Request DTO, Response DTO, và View Models.

---

## 3. Tiêu chuẩn RxJS & Quản lý Subscription
* Quản lý vòng đời subscription an toàn: Sử dụng `takeUntilDestroyed()`, `take(1)`, hoặc chuyển đổi sang Signals bằng `toSignal()`.
* **Không lồng `subscribe` (nested subscription)**: Thay thế bằng các operators biến đổi phù hợp:
  * `switchMap`: Khi request mới hủy bỏ request trước (tìm kiếm, chuyển trang).
  * `concatMap`: Khi cần thực hiện tuần tự theo thứ tự phát ra.
  * `mergeMap`: Khi các request chạy song song độc lập.
  * `forkJoin`: Khi cần chờ nhiều request đồng thời hoàn tất.

---

## 4. Quy ước Đặt tên (Naming Conventions)
* **File names**: kebab-case kèm định danh (`user-list.component.ts`, `auth.service.ts`, `currency-vnd.pipe.ts`).
* **Class names**: PascalCase (`UserListComponent`, `AuthService`, `CurrencyVndPipe`).
* **Methods & Variables**: camelCase (`fetchCurrentUser()`, `isRefreshing`, `totalElements`).
* **Constants**: UPPER_SNAKE_CASE (`ACCESS_TOKEN_KEY`, `DEFAULT_PAGE_SIZE`).
