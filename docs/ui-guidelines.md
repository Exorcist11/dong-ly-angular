# HƯỚNG DẪN GIAO DIỆN & QUY CHUẨN PRIMENG — ĐÔNG LÝ ADMIN

Tài liệu này quy định tiêu chuẩn thiết kế UI, cấu hình Theme PrimeNG và các quy tắc xây dựng giao diện người dùng cho **Hệ thống Quản trị Nhà xe Đông Lý**.

---

## 1. PHIÊN BẢN VÀ THÀNH PHẦN UI

- **Thư viện UI chính**: PrimeNG `21.x` (`primeng`).
- **Gói Theme**: `@primeng/themes` `21.x`.
- **Thư viện Icons**: PrimeIcons `8.x` (`primeicons`).
- **Component Primitives**: `@angular/cdk` `21.x`.

---

## 2. CẤU HÌNH THEME THỐNG NHẤT (`DongLyThemePreset`)

Ứng dụng sử dụng Theme Preset chính thức mở rộng từ **Aura** preset của PrimeNG, được định nghĩa tại `src/app/core/theme/theme.config.ts`:

```typescript
import { definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';

export const DongLyThemePreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{blue.50}',
      100: '{blue.100}',
      200: '{blue.200}',
      300: '{blue.300}',
      400: '{blue.400}',
      500: '{blue.500}',
      600: '{blue.600}',
      700: '{blue.700}',
      800: '{blue.800}',
      900: '{blue.900}',
      950: '{blue.950}',
    },
    colorScheme: {
      light: {
        primary: {
          color: '{blue.600}',
          contrastColor: '#ffffff',
          hoverColor: '{blue.700}',
          activeColor: '{blue.800}',
        },
      },
    },
  },
});
```

Đăng ký tại `src/app/app.config.ts`:
```typescript
providePrimeNG({
  theme: {
    preset: DongLyThemePreset,
    options: {
      darkModeSelector: false, // Mặc định Light mode cho cổng thông tin doanh nghiệp
    },
  },
  ripple: true,
});
```

---

## 3. BỘ DESIGN TOKENS TOÀN CỤC

Được định nghĩa tại `src/styles.scss`:
- **Primary Color**: `#2563eb` (Blue 600 - Màu nhận diện thương hiệu Đông Lý).
- **Primary Hover**: `#1d4ed8` (Blue 700).
- **Navy (Sidebar & Header)**: `#0f172a` (Slate 900).
- **Neutral Text**: `#334155` (Slate 700), `#64748b` (Slate 500).
- **Borders**: `#e2e8f0` (Slate 200).
- **Background**: `#f8fafc` (Slate 50).
- **Semantic Colors**:
  - Success: `#16a34a` (Green 600).
  - Warning: `#d97706` (Amber 600).
  - Danger: `#dc2626` (Red 600).
  - Info: `#0284c7` (Sky 600).
- **Border Radius**: 8px (`--radius-md`) cho inputs, buttons, cards.
- **Typography**: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`.

---

## 4. QUY TẮC SỬ DỤNG PRIMENG: TRỰC TIẾP VS WRAPPER

### 4.1. Khi nào sử dụng PrimeNG trực tiếp (Khuyến khích tối đa):
- Hầu hết các thành phần UI tiêu chuẩn của PrimeNG đã hỗ trợ đầy đủ Accessibility, keyboard navigation, và data binding. Hãy dùng trực tiếp trong template:
  - **Button**: `<p-button label="Lưu" [loading]="isLoading()" ...></p-button>`
  - **InputText**: `<input pInputText formControlName="name" ... />`
  - **Password**: `<p-password formControlName="password" [toggleMask]="true" ...></p-password>`
  - **Checkbox**: `<p-checkbox formControlName="agree" [binary]="true"></p-checkbox>`
  - **IconField**: `<p-iconfield><p-inputicon class="pi pi-search"></p-inputicon><input pInputText /></p-iconfield>`
  - **Message**: `<p-message severity="error" text="..."></p-message>`
  - **Toast**: `<p-toast position="top-right"></p-toast>`
  - **Table**: `<p-table [value]="data" [paginator]="true" ...>`

### 4.2. Khi nào tạo Shared Wrapper Component:
Chỉ tạo wrapper khi giải quyết nhu cầu nghiệp vụ đặc thù hoặc đóng gói logic phức tạp (xem chi tiết tại [`shared-ui-guidelines.md`](./architecture/shared-ui-guidelines.md)):
1. `ConfirmModalComponent`: Đóng gói luồng xác nhận hành động nguy hiểm (xóa vé, hủy chuyến xe, khóa tài khoản).
2. `LoadingSpinnerComponent`: Trạng thái loading toàn màn hình hoặc vùng dữ liệu có kèm backdrop blur.
3. `EmptyStateComponent`: Hiển thị trạng thái dữ liệu rỗng kèm icon và nút tạo mới.
4. `PageHeaderComponent`: Tiêu đề trang chuẩn hóa kèm breadcrumbs và các nút thao tác chính.
5. `StatusBadgeComponent`: Chuẩn hóa màu sắc và nhãn hiển thị cho mọi enum trạng thái hệ thống.
6. `SearchInputComponent`: Ô tìm kiếm có debounce tự động và nút xóa nhanh, giảm tải gọi API.
7. `FormFieldComponent`: Bọc label, required mark, hint và tự động bắt lỗi validation theo tiếng Việt.
8. Form control phức tạp: Sơ đồ chọn ghế xe giường nằm / ghế ngồi xe khách Đông Lý (`SeatMapSelector`, kết hợp `ControlValueAccessor`).

**Nghiêm cấm**: Tạo component chỉ để bọc `<p-button>` hay `<input pInputText>` nhằm mục đích đổi tên selector mà không cung cấp giá trị bổ sung.

---

## 5. QUY CHUẨN FORM & VALIDATION

1. **Reactive Forms bắt buộc**: Sử dụng `FormBuilder.nonNullable` hoặc Typed FormGroup.
2. **Hiển thị lỗi**:
   - Ưu tiên sử dụng `FormFieldComponent` để tự động hóa việc hiển thị lỗi, tránh trùng lặp mã ở các feature.
   - Khi tùy biến: Sử dụng `<small class="error-text">` hoặc `<p-message severity="error">`.
   - Chỉ hiển thị lỗi khi control `invalid` VÀ (`dirty` hoặc `touched`).
   - Đặt `[invalid]="control.invalid && (control.dirty || control.touched)"` trên PrimeNG input controls để kích hoạt viền đỏ cảnh báo.
3. **Ngôn ngữ thông báo**: 100% bằng tiếng Việt thân thiện, rõ ràng, không chứa thuật ngữ kỹ thuật.
4. **Nút Submit**:
   - Tự động disable khi form `invalid` hoặc khi `isLoading() === true`.
   - Kèm spinner loading khi đang gửi HTTP request.

---

## 6. QUY CHUẨN BẢNG DỮ LIỆU (TABLES)

Cho tất cả các tính năng quản trị (User Management, Trip Management, Booking, Routes, Vehicles...):
1. Luôn sử dụng `<p-table>` với cấu hình Responsive và typed columns (`TableColumn<T>`).
2. Tương thích chuẩn phân trang Backend Go REST API (`PageResponse<T>` / `PaginationMeta`).
3. Xử lý 4 trạng thái bắt buộc:
   - **Loading State**: Hiển thị Skeleton hoặc Spinner khi đang tải dữ liệu từ API.
   - **Empty State**: Hiển thị `EmptyStateComponent` khi danh sách rỗng hoặc không tìm thấy kết quả tìm kiếm.
   - **Error State**: Hiển thị thông báo khi gọi API thất bại kèm nút "Thử lại".
   - **Data State**: Hiển thị bảng kèm phân trang theo chuẩn `PageResponse<T>`.
4. Tham khảo hướng dẫn chi tiết tại [`shared-ui-guidelines.md`](./architecture/shared-ui-guidelines.md).
