# QUY TẮC PHÁT TRIỂN & TÁI SỬ DỤNG COMPONENT (REUSABLE COMPONENTS)
### Dự án: Đông Lý Angular Admin Portal

Tài liệu này hướng dẫn cách tái sử dụng, thiết kế và mở rộng các Shared UI Components trong toàn bộ hệ thống Đông Lý Admin.
Tài liệu kiến trúc chi tiết tham khảo: [`docs/architecture/shared-ui-guidelines.md`](../architecture/shared-ui-guidelines.md).

---

## 1. Bảng Tra cứu Shared UI Primitives Hiện có

| Component | Vị trí | Mục đích & Cách sử dụng |
| :--- | :--- | :--- |
| **`PageHeaderComponent`** | `shared/components/page-header/` | Tiêu đề trang, breadcrumb và action buttons.<br>`<app-page-header title="..." [breadcrumbs]="..."><div actions>...</div></app-page-header>` |
| **`LoadingSpinnerComponent`** | `shared/components/loading-spinner/` | Trạng thái đang tải dữ liệu toàn trang hoặc cục bộ.<br>`<app-loading-spinner [overlay]="true" message="Đang tải..." />` |
| **`EmptyStateComponent`** | `shared/components/empty-state/` | Trạng thái danh sách rỗng, không tìm thấy kết quả.<br>`<app-empty-state title="..." description="..."><div action>...</div></app-empty-state>` |
| **`StatCardComponent`** | `shared/components/stat-card/` | Thẻ thống kê KPI với chỉ số tăng giảm.<br>`<app-stat-card label="Doanh thu" [value]="..." [isPositive]="true" />` |
| **`ConfirmModalComponent`** | `shared/components/confirm-modal/` | Modal xác nhận hành vi nguy hiểm (xóa, khóa, hủy vé).<br>`<app-confirm-modal [isOpen]="open" [danger]="true" (confirm)="onOk()" (cancel)="onCancel()" />` |
| **`ThemeSwitcherComponent`** | `shared/components/theme-switcher/` | Nút chọn giao diện Sáng / Tối / Tự động theo hệ thống.<br>`<app-theme-switcher />` |
| **`LanguageSwitcherComponent`** | `shared/components/language-switcher/` | Nút chuyển đổi ngôn ngữ Tiếng Việt / Tiếng Anh.<br>`<app-language-switcher />` |

---

## 2. Quy tắc Quyết định: PrimeNG Trực tiếp vs Shared Wrapper

1. **Dùng trực tiếp PrimeNG**: Khi component đã đáp ứng tốt yêu cầu UX/UI, accessibility và forms:
   - Button (`p-button`), Input text (`input[pInputText]`), Password (`p-password`), Checkbox (`p-checkbox`), Select (`p-select`), DatePicker (`p-datepicker`), Toast (`p-toast`), Tooltip (`pTooltip`).
   - Tuyệt đối **không** bọc PrimeNG component chỉ để đổi tên thẻ (ví dụ `app-button` bọc `p-button` là vi phạm).
2. **Tạo Shared Wrapper / Component**: Khi mang lại giá trị kiến trúc rõ rệt:
   - Đóng gói logic kiểm tra lỗi và thông báo tiếng Việt lặp lại (`FormFieldComponent`).
   - Đóng gói ô tìm kiếm kèm debounce và nút xóa (`SearchInputComponent`).
   - Chuẩn hóa huy hiệu trạng thái của hệ thống (`StatusBadgeComponent`).
   - Chuẩn hóa bảng dữ liệu với cấu hình cột có type (`TableColumn<T>`) và phân trang `PageResponse<T>`.
   - Control tùy chỉnh đặc thù ngành xe khách (Sơ đồ chọn ghế 2 tầng `SeatMapSelector`).

---

## 3. Quy chuẩn Thiết kế Shared Component

1. **API rõ ràng, Type-safe 100%**:
   - Sử dụng Angular Signal Inputs `input()`, `input.required<T>()` và Outputs `output<T>()`.
   - Không sử dụng `any`. Định nghĩa interface cụ thể.
2. **Độc lập hoàn toàn (Zero Feature Coupling)**:
   - Không import models, services hay components từ `src/app/features/`.
   - Không gọi API backend trực tiếp trong Shared UI.
3. **Ưu tiên Composition & Content Projection**:
   - Sử dụng `<ng-content>` để cho phép cha tùy biến nội dung thay vì thêm hàng loạt cờ boolean `showButtonA`, `showExtraHeader`.
4. **Không tạo Universal Component quá phức tạp**:
   - Không cố gắng gộp mọi loại bảng, mọi loại modal vào 1 component duy nhất với hàng chục điều kiện rẽ nhánh khó bảo trì.
5. **Hỗ trợ đầy đủ các trạng thái giao diện**:
   - Loading, Empty, Error, Disabled, Focus, Hover.
6. **Tuân thủ Design Tokens & Dark Mode**:
   - Sử dụng CSS variables (`--color-surface`, `--color-border`, `--color-text-primary`). Không hardcode mã hex `#ffffff`, `#000000`.

---

## 4. Checklist 6 Bước Bắt buộc cho Feature Mới

Trước khi bắt đầu viết code cho bất kỳ màn hình hoặc tính năng nào:
- [ ] **Bước 1**: Khảo sát danh mục `shared/components/` xem đã có component phù hợp chưa.
- [ ] **Bước 2**: Tái sử dụng các component hiện có (`PageHeader`, `EmptyState`, `ConfirmModal`...).
- [ ] **Bước 3**: Nếu component hiện có thiếu tính năng nhỏ, ưu tiên mở rộng qua Input/Output/Slot trước khi sao chép code.
- [ ] **Bước 4**: Không tự viết lại mã tìm kiếm debounce, mã phân trang, hoặc khối HTML validation lặp lại.
- [ ] **Bước 5**: Viết unit test cho các tương tác component với Vitest.
- [ ] **Bước 6**: Chạy `npm run typecheck` và `npm test` để xác nhận không gây hồi quy (0 lỗi, 100% test pass).
