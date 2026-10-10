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

---

## 5. Tiêu chuẩn Nút bấm & Semantic Controls (Shared Button Policy)
* **Bắt buộc sử dụng Shared Button**: 100% nút bấm trong toàn bộ màn hình, modal, dialog, toolbar, table action, form phải sử dụng `ButtonComponent` (`<app-button>`). Nghiêm cấm tự tạo button component riêng, viết CSS riêng (`.btn`, `.btn-primary`), hoặc dùng trực tiếp `<p-button>`, `button[pButton]`, hay `<button>` thuần nếu không có ngoại lệ kỹ thuật được phê duyệt.
* **Phân biệt rạch ròi Button vs Navigation Link**:
  - Dùng `<app-button>` khi thực thi hành động (action), kích hoạt mutation, mở dialog/modal, submit form.
  - Dùng `<a routerLink="...">` khi điều hướng trang / chuyển đổi URL. Tuyệt đối không dùng button để bọc routerLink hoặc gọi `router.navigate()` cho điều hướng thông thường.
  - Không dùng button để giả lập checkbox, radio, tab hoặc toggle switch.
* **Chuẩn hóa Thuộc tính HTML `type`**:
  - `type="button"` (mặc định) cho các thao tác thông thường, hủy bỏ, đóng modal.
  - `type="submit"` bắt buộc cho nút gửi form (phối hợp với `formGroup` và form submit event).
  - `type="reset"` chỉ dùng khi thực sự cần reset form về trạng thái ban đầu.
* **Trợ năng (Accessibility) & Accessible Name**:
  - Nút có chữ: `label="key.or.text"`.
  - Nút chỉ có icon (icon-only button): Bắt buộc có thuộc tính `[ariaLabel]="..."` và nên có `[tooltip]="..."` để Screen Reader đọc được hành động.
* **Ngăn chặn Double-Submit & Quản lý Trạng thái**:
  - Luôn truyền `[loading]="isSubmitting()"` vào nút thao tác chính/submit form. Nút tự động hiển thị spinner và ngăn chặn phát sinh thêm click event cho đến khi request hoàn tất.
  - Kiểm soát `[disabled]` khi form không hợp lệ (`form.invalid`) hoặc khi người dùng chưa có đủ điều kiện thao tác.
* **Phân tách Trách nhiệm (Separation of Concerns)**:
  - Nút bấm chỉ là thành phần trình bày (presentational UI primitive).
  - Tuyệt đối không nhúng logic gọi API, xử lý nghiệp vụ, hay kiểm tra quyền hạn vào trong button.
  - Phân quyền phải đặt ở tầng ngoài thông qua structural directive `*appHasPermission="'USER_CREATE'"` hoặc RBAC check ở component controller.
* **Quản trị API & Ngoại lệ Kỹ thuật**:
  - Không tùy tiện thêm inputs/props vào `ButtonComponent` chỉ phục vụ 1 feature cá biệt (tuân thủ YAGNI & SRP).
  - Mọi ngoại lệ kỹ thuật (ví dụ template lồng của 3rd-party component như `p-fileUpload`) phải có ghi chú `<!-- EXEMPTION [BUTTON]: <lý do> -->`, giới hạn phạm vi cục bộ và duy trì tính nhất quán thị giác qua Design Tokens.

