# QUY TẮC PHÁT TRIỂN & TÁI SỬ DỤNG COMPONENT (REUSABLE COMPONENTS)
### Dự án: Đông Lý Angular Admin Portal

Tài liệu này hướng dẫn cách tái sử dụng, thiết kế và mở rộng các Shared UI Components trong toàn bộ hệ thống Đông Lý Admin.
Tài liệu kiến trúc chi tiết tham khảo: [`docs/architecture/shared-ui-guidelines.md`](../architecture/shared-ui-guidelines.md).

---

## 1. Bảng Tra cứu Shared UI Primitives Hiện có

| Component | Vị trí | Mục đích & Cách sử dụng |
| :--- | :--- | :--- |
| **`ButtonComponent`** | `shared/components/button/` | **BẮT BUỘC CHO MỌI BUTTON**: Nút bấm thao tác chuẩn hóa (Variants, sizes, loading chống double-submit, WCAG 2.2 AA, i18n).<br>`<app-button label="common.actions.save" variant="primary" type="submit" [loading]="isSaving()" (clicked)="onSave()" />` |
| **`PageHeaderComponent`** | `shared/components/page-header/` | Tiêu đề trang, breadcrumb và action buttons.<br>`<app-page-header title="..." [breadcrumbs]="..."><div actions>...</div></app-page-header>` |
| **`LoadingSpinnerComponent`** | `shared/components/loading-spinner/` | Trạng thái đang tải dữ liệu toàn trang hoặc cục bộ.<br>`<app-loading-spinner [overlay]="true" message="Đang tải..." />` |
| **`EmptyStateComponent`** | `shared/components/empty-state/` | Trạng thái danh sách rỗng, không tìm thấy kết quả.<br>`<app-empty-state title="..." description="..."><div action>...</div></app-empty-state>` |
| **`StatCardComponent`** | `shared/components/stat-card/` | Thẻ thống kê KPI với chỉ số tăng giảm.<br>`<app-stat-card label="Doanh thu" [value]="..." [isPositive]="true" />` |
| **`ConfirmModalComponent`** | `shared/components/confirm-modal/` | Modal xác nhận hành vi nguy hiểm (xóa, khóa, hủy vé).<br>`<app-confirm-modal [isOpen]="open" [danger]="true" (confirm)="onOk()" (cancel)="onCancel()" />` |
| **`StatusBadgeComponent`** | `shared/components/status-badge/` | Huy hiệu trạng thái chuẩn hóa enum (ACTIVE, INACTIVE, LOCKED...).<br>`<app-status-badge [status]="user.status" />` |
| **`SearchInputComponent`** | `shared/components/search-input/` | Ô tìm kiếm có debounce và nút xóa nhanh.<br>`<app-search-input [placeholder]="..." (searchChange)="onSearch($event)" />` |
| **`SelectComponent`** | `shared/components/select/` | Dropdown chọn dữ liệu tương thích Reactive Forms qua `ControlValueAccessor`.<br>`<app-select [options]="options" formControlName="roleId" />` |
| **`FormFieldComponent`** | `shared/components/form-field/` | Wrapper nhãn, required mark, hint và validation error tiếng Việt tự động.<br>`<app-form-field label="..." [control]="..."><input pInputText ... /></app-form-field>` |
| **`ThemeSwitcherComponent`** | `shared/components/theme-switcher/` | Nút chọn giao diện Sáng / Tối / Tự động theo hệ thống.<br>`<app-theme-switcher />` |
| **`LanguageSwitcherComponent`** | `shared/components/language-switcher/` | Nút chuyển đổi ngôn ngữ Tiếng Việt / Tiếng Anh.<br>`<app-language-switcher />` |

---

## 2. Tiêu chuẩn Bắt buộc cho Shared Button Component (`app-button`)

Nút bấm là điểm tương tác quan trọng nhất trên hệ thống quản trị Đông Lý. Để đảm bảo tính nhất quán trải nghiệm, an toàn tương tác, và khả năng tiếp cận WCAG 2.2 AA, dự án áp dụng **8 điều luật bắt buộc**:

1. **Chuẩn hóa bắt buộc toàn diện**: Mọi button giao diện mới (trên trang quản trị, dialog/modal, form actions, toolbar, header, bảng dữ liệu) **bắt buộc sử dụng `ButtonComponent`** (`<app-button>`).
2. **Nghiêm cấm button tự chế**:
   - Tuyệt đối không tự tạo button component riêng trong feature.
   - Không viết class CSS button riêng (ví dụ `.btn`, `.btn-primary`, `.save-btn`).
   - Không sử dụng trực tiếp button của thư viện UI (`<p-button>`, `button[pButton]`, hoặc native `<button>` cho các hành động tương tác) trong feature templates nếu không có ngoại lệ kỹ thuật được phê duyệt.
3. **Quản trị API tập trung (Zero-Ad-hoc-Props)**:
   - Chỉ được mở rộng API của `ButtonComponent` (`button.types.ts`) khi có nhu cầu dùng chung thực sự từ 2 feature trở lên.
   - Nghiêm cấm thêm input/prop chỉ phục vụ riêng 1 màn hình đơn lẻ (tuân thủ YAGNI & SRP).
4. **Phân tách ngữ nghĩa (Semantic Distinction)**:
   - **Button (`<app-button>`)**: Dùng cho hành động (actions), kích hoạt thay đổi dữ liệu (mutations), gọi API, mở dialog, gửi form.
   - **Link điều hướng (`<a routerLink="...">`)**: Bắt buộc dùng thẻ `<a>` kèm `routerLink` cho việc chuyển trang/URL. Không dùng Button để thay thế thẻ Link.
   - **Semantic Controls khác**: Không dùng Button để giả lập tabs, checkboxes, toggle switches hoặc dropdown menus.
5. **Chuẩn hóa Thuộc tính & Trợ năng (A11y & Forms)**:
   - Mọi button phải có mục đích rõ ràng và khai báo đúng `[type]="'button' | 'submit' | 'reset'"` (mặc định `'button'`, submit form bắt buộc `'submit'`).
   - Accessible name: Bắt buộc có `label` hoặc `ariaLabel` (đặc biệt các nút icon-only trong table).
   - Tự động hiển thị trạng thái `loading` (spinner và vô hiệu hóa click chống double-submit) và `disabled`.
   - Hỗ trợ dịch tự động i18n qua `TranslationService` theo chuẩn dự án (`label="common.actions.save"`).
6. **Phân tầng kiến trúc (Zero Business Logic in Button)**:
   - Button chỉ chịu trách nhiệm trình bày trạng thái giao diện và phát sự kiện `(clicked)`.
   - Logic nghiệp vụ, gọi API backend, xử lý lỗi và kiểm tra quyền hạn (directive `*appHasPermission`, logic RBAC) phải nằm ở component controller, service hoặc directive cha, tuyệt đối không đưa vào trong button.
7. **Kiểm tra tuân thủ khi tạo hoặc sửa feature**:
   - Khi tạo mới hoặc chỉnh sửa bất kỳ feature nào, bắt buộc rà soát 100% template để đảm bảo tuân thủ `<app-button>`.
   - Phát hiện và loại bỏ triệt để các thẻ `<button>` hoặc `<p-button>` không tuân thủ.
8. **Quy trình Quản lý Ngoại lệ Kỹ thuật**:
   - Ngoại lệ chỉ được chấp thuận khi có lý do kỹ thuật bất khả kháng (ví dụ: template lồng đặc thù của 3rd-party component như `p-fileUpload`, hoặc thao tác đồ họa canvas/SVG không hỗ trợ custom element host).
   - **Phạm vi**: Chỉ áp dụng đúng phần tử ngoại lệ, không lan rộng.
   - **Ghi nhận**: Bắt buộc chú thích mã nguồn `<!-- EXEMPTION [BUTTON]: <lý do kỹ thuật chi tiết> -->`.
   - **Duy trì nhất quán**: Sử dụng Design Tokens để đảm bảo visual và accessibility đồng nhất với toàn hệ thống.

---

## 3. Quy tắc Quyết định: PrimeNG Trực tiếp vs Shared Component

1. **Dùng trực tiếp PrimeNG**: Chỉ áp dụng cho các input controls cơ bản khi component đã đáp ứng tốt yêu cầu UX/UI, accessibility và forms:
   - Input text (`input[pInputText]`), Password (`p-password`), Checkbox (`p-checkbox`), DatePicker (`p-datepicker`), Toast (`p-toast`), Tooltip (`pTooltip`).
   - Riêng **Button** là trường hợp đặc biệt: **BẮT BUỘC sử dụng `<app-button>`**, không dùng trực tiếp `<p-button>` trong feature templates.
2. **Tạo Shared Wrapper / Component**: Khi mang lại giá trị kiến trúc rõ rệt:
   - Nút bấm toàn hệ thống chuẩn hóa variants, a11y, loading, i18n (`ButtonComponent`).
   - Đóng gói logic kiểm tra lỗi và thông báo tiếng Việt lặp lại (`FormFieldComponent`).
   - Đóng gói ô tìm kiếm kèm debounce và nút xóa (`SearchInputComponent`).
   - Chuẩn hóa huy hiệu trạng thái của hệ thống (`StatusBadgeComponent`).
   - Chuẩn hóa bảng dữ liệu với cấu hình cột có type (`TableColumn<T>`) và phân trang `PageResponse<T>` (`DataTableComponent`).
   - Control tùy chỉnh đặc thù ngành xe khách (Sơ đồ chọn ghế 2 tầng `SeatMapSelector`).

---

## 4. Quy chuẩn Thiết kế Shared Component

1. **API rõ ràng, Type-safe 100%**:
   - Sử dụng Angular Signal Inputs `input()`, `input.required<T>()` và Outputs `output<T>()`.
   - Không sử dụng `any`. Định nghĩa interface/type cụ thể.
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

## 5. Checklist 6 Bước Bắt buộc cho Feature Mới

Trước khi bắt đầu viết code hoặc nghiệm thu bất kỳ màn hình / tính năng nào:
- [ ] **Bước 1**: Khảo sát danh mục `shared/components/` xem đã có component phù hợp chưa.
- [ ] **Bước 2**: Tái sử dụng các component hiện có (`ButtonComponent` - `<app-button>`, `PageHeader`, `EmptyState`, `ConfirmModal`, `StatusBadge`, `SearchInput`, `SelectComponent`).
- [ ] **Bước 3**: **Kiểm tra 100% nút bấm**:
  - Đã sử dụng `<app-button>` chưa?
  - Đúng `[type]` (`button` hay `submit`) chưa?
  - Có accessible name (`label` hoặc `ariaLabel`) cho Screen Reader chưa?
  - Có trạng thái `loading` và `disabled` đầy đủ chưa?
  - Có bị dùng nhầm button thay cho link điều hướng `routerLink` không?
  - Nếu có ngoại lệ, đã có chú thích `<!-- EXEMPTION [BUTTON]: ... -->` chưa?
- [ ] **Bước 4**: Nếu component hiện có thiếu tính năng nhỏ, đánh giá nhu cầu dùng chung trước khi mở rộng API; không thêm prop riêng cho 1 feature.
- [ ] **Bước 5**: Viết unit test cho các tương tác component với Vitest.
- [ ] **Bước 6**: Chạy `npm run typecheck` và `npx ng test --watch=false` để xác nhận không gây hồi quy (0 lỗi, 100% test pass).

