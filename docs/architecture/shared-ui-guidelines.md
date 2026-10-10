# QUY CHUẨN KIẾN TRÚC SHARED UI COMPONENTS — ĐÔNG LÝ ANGULAR FE
### Dự án: Hệ thống đặt vé xe khách trực tuyến & Quản lý vận tải Đông Lý

Tài liệu này là quy chuẩn kỹ thuật bắt buộc về việc thiết kế, xây dựng, phân loại, tái sử dụng và kiểm thử các thành phần giao diện dùng chung (**Shared UI Components**) trong toàn bộ hệ thống Đông Lý Admin.

---

## 1. TỔNG QUAN VÀ MỤC TIÊU KIẾN TRÚC

Trong hệ thống quản trị nhà xe Đông Lý (bao gồm các phân hệ Quản lý Người dùng & RBAC, Lịch trình & Chuyến xe, Điểm đón trả & Tuyến đường, Phương tiện & Sơ đồ ghế, Đặt vé & Xuất vé, Thanh toán và Báo cáo doanh thu), các màn hình có mức độ tương đồng giao diện rất cao (Bảng dữ liệu phân trang, Thanh tìm kiếm/lọc, Dialog biểu mẫu, Thẻ tóm tắt, Trạng thái rỗng/lỗi).

### Mục tiêu kiến trúc:
1. **Tối đa hóa khả năng tái sử dụng**: Tránh viết lại cùng một cấu trúc HTML, CSS, validation và xử lý sự kiện ở từng feature.
2. **Loại bỏ trùng lặp mã nguồn (DRY)**: Đóng gói các logic giao diện lặp lại vào đúng tầng kiến trúc.
3. **Phân tách trách nhiệm triệt để (Separation of Concerns)**:
   - **Shared UI**: Chỉ chịu trách nhiệm về trình bày trực quan, trải nghiệm người dùng, tương tác form thuần túy và phát ra sự kiện. Tuyệt đối **không** chứa business logic hay gọi API của feature.
   - **Feature Modules**: Chịu trách nhiệm về nghiệp vụ, điều phối dữ liệu từ Service, xử lý quyền hạn và truyền dữ liệu xuống Shared UI.
4. **Nhất quán trải nghiệm (Consistent UX/UI)**: Mọi bảng dữ liệu, form nhập liệu, modal xác nhận đều tuân theo Design System (`DongLyThemePreset`, Semantic CSS Variables, 8pt Grid).
5. **Dễ mở rộng, bảo trì và kiểm thử**: Các component dùng chung được cô lập, có type-safe API và đạt độ bao phủ kiểm thử cao với Vitest.

---

## 2. MA TRẬN PHÂN LOẠI UI: PRIMENG TRỰC TIẾP VS SHARED WRAPPER

Dự án sử dụng **PrimeNG 21.x** kết hợp `@primeng/themes` (`DongLyThemePreset`) và `@angular/cdk 21.x`. Nguyên tắc cốt lõi: **Không tạo wrapper vô giá trị chỉ để đổi tên thẻ, nhưng bắt buộc tạo Shared Component khi mang lại giá trị kiến trúc cụ thể.**

```
┌────────────────────────────────────────────────────────────────────────┐
│                        QUYẾT ĐỊNH XÂY DỰNG UI                          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
    ┌───────────────────────────────┴───────────────────────────────┐
    ▼                                                               ▼
【DÙNG TRỰC TIẾP PRIMENG】                                   【TẠO SHARED WRAPPER / COMPONENT】
- Không có logic bổ sung                                    - Đóng gói logic validation form lặp lại
- PrimeNG đã hỗ trợ A11y & Form                             - Chuẩn hóa layout & state (Loading, Empty, Error)
- Ví dụ:                                                    - Tích hợp hợp đồng Backend (PageResponse<T>)
  * p-button (nút bấm đơn lẻ)                                - Dialog xác nhận chuẩn hóa (ConfirmModal)
  * input[pInputText] (input thuần)                          - Format đặc thù vận tải (Biển số xe, Sơ đồ ghế)
  * p-password, p-checkbox, p-toast                         - Ví dụ:
                                                              * FormFieldComponent (Label + Control + Error)
                                                              * DataTableComponent (hoặc chuẩn p-table wrapper)
                                                              * StatusBadgeComponent (Tag chuẩn màu/trạng thái)
                                                              * SearchInputComponent (Input + debounce + clear)
```

---

## 3. DANH MỤC SHARED UI COMPONENTS (TAXONOMY)

### 3.1. Form Controls (Thành phần biểu mẫu)
| Component / Pattern | Trách nhiệm & Giá trị kiến trúc | Cách tiếp cận triển khai |
| :--- | :--- | :--- |
| **`FormFieldComponent`** | Đóng gói nhãn (`label`), đánh dấu bắt buộc (`*`), gợi ý (`hint`), và thông báo lỗi validation tự động theo tiếng Việt. | Component dùng chung (`shared/components/form-field`). Chiếu control qua Content Projection `<ng-content>`. |
| **`SearchInputComponent`** | Ô tìm kiếm kèm icon kính lúp, nút xóa nhanh (clear), và cơ chế debounce emission để tránh spam API. | Component dùng chung (`shared/components/search-input`). Nhận `[placeholder]`, phát `(searchChange)`. |
| **`Button`** | Nút bấm thao tác, hỗ trợ trạng thái loading, icon, severity. | Dùng trực tiếp `<p-button>` của PrimeNG theo Design Tokens. |
| **`Input / Textarea`** | Nhập văn bản một hoặc nhiều dòng. | Dùng trực tiếp `input[pInputText]` / `textarea[pTextarea]`. |
| **`Select / Dropdown`** | Chọn giá trị từ danh sách tùy chọn. | Dùng trực tiếp `<p-select>` với model type-safe `SelectOption<T>`. |
| **`Checkbox / Radio`** | Chọn một hoặc nhiều tùy chọn logic. | Dùng trực tiếp `<p-checkbox>` / `<p-radiobutton>`. |
| **`DatePicker`** | Chọn ngày tháng / khoảng thời gian. | Dùng trực tiếp `<p-datepicker>` với format Việt Nam `dd/mm/yy`. |
| **`SeatMapSelector`** | Sơ đồ chọn ghế xe khách giường nằm / ghế ngồi 2 tầng đặc thù Đông Lý. | Shared Component triển khai `ControlValueAccessor` (`shared/components/seat-map-selector`). |

### 3.2. Data Display (Hiển thị dữ liệu)
| Component / Pattern | Trách nhiệm & Giá trị kiến trúc | Cách tiếp cận triển khai |
| :--- | :--- | :--- |
| **`Table` (Data Table)** | Hiển thị dữ liệu dạng bảng có cấu hình cột (`TableColumn<T>`), phân trang tương thích `PageResponse<T>`, sorting, lazy loading, empty state, action buttons. | Chuẩn hóa cấu trúc dùng chung (xem chi tiết mục 5). |
| **`Pagination`** | Phân trang chuyển trang, kích thước trang. | Tích hợp trong Table hoặc dùng `p-paginator` khi cần độc lập. |
| **`StatusBadgeComponent`** | Hiển thị huy hiệu trạng thái (ACTIVE, INACTIVE, LOCKED, PENDING, COMPLETED, CANCELLED) với màu sắc và nhãn tiếng Việt chuẩn hóa. | Component dùng chung (`shared/components/status-badge`). |
| **`EmptyStateComponent`** | Hiển thị trạng thái không có dữ liệu, kèm icon, thông điệp và nút CTA hành động. | Đã có tại `shared/components/empty-state`. |
| **`LoadingSpinnerComponent`** | Hiển thị con quay tải dữ liệu toàn trang hoặc cục bộ với hiệu ứng mờ nền. | Đã có tại `shared/components/loading-spinner`. |
| **`StatCardComponent`** | Thẻ thống kê KPI với chỉ số tăng giảm phần trăm. | Đã có tại `shared/components/stat-card`. |
| **`Tooltip`** | Chú thích nổi khi di chuột. | Dùng trực tiếp `pTooltip` của PrimeNG. |

### 3.3. Overlay & Feedback (Hộp thoại & Phản hồi)
| Component / Pattern | Trách nhiệm & Giá trị kiến trúc | Cách tiếp cận triển khai |
| :--- | :--- | :--- |
| **`ConfirmModalComponent`** | Hộp thoại xác nhận thao tác nguy hiểm (xóa, khóa, hủy đơn) với hai lựa chọn Xác nhận / Hủy bỏ, hỗ trợ trạng thái loading. | Đã có tại `shared/components/confirm-modal`. |
| **`DialogWrapperComponent`** | Hộp thoại form chuẩn hóa kích thước, header, body cuộn, footer action buttons và hành vi phím ESC. | Chuẩn hóa thuộc tính `p-dialog` hoặc wrapper component. |
| **`Toast / Notification`** | Thông báo kết quả thao tác (Thành công, Thất bại, Cảnh báo). | Tích hợp qua `NotificationService` toàn cục và `<p-toast>`. |

### 3.4. Layout & Tiện ích
| Component / Pattern | Trách nhiệm & Giá trị kiến trúc | Cách tiếp cận triển khai |
| :--- | :--- | :--- |
| **`PageHeaderComponent`** | Tiêu đề trang, breadcrumb điều hướng và khu vực nút thao tác chính (`[actions]`). | Đã có tại `shared/components/page-header`. |
| **`FilterToolbarComponent`** | Khung chứa ô tìm kiếm, các bộ lọc trạng thái và nút làm mới dữ liệu. | Chuẩn hóa cấu trúc layout hoặc wrapper component. |
| **`ThemeSwitcherComponent`** | Bộ chuyển đổi giao diện Sáng / Tối / Hệ thống. | Đã có tại `shared/components/theme-switcher`. |
| **`LanguageSwitcherComponent`** | Bộ chuyển đổi ngôn ngữ Việt / Anh. | Đã có tại `shared/components/language-switcher`. |

---

## 4. QUY TẮC THIẾT KẾ VÀ PHÁT TRIỂN COMPONENT (DESIGN RULES)

Mọi Shared UI Component phải tuân thủ nghiêm ngặt các nguyên tắc kỹ thuật sau:

### 4.1. Độc lập & Trách nhiệm Đơn nhất (Single Responsibility)
- Không import bất kỳ Feature Model hay Service nào (không gọi `UserService`, `TripService`, `BookingModel`).
- Chỉ giao tiếp với bên ngoài qua:
  - `@Input()` (hoặc Angular Signal Inputs `input()`, `input.required()`) để nhận cấu hình và dữ liệu.
  - `@Output()` (hoặc Angular Output `output()`) để phát sự kiện cho component cha.
  - Content Projection (`<ng-content>`) để cha tự quyết định nội dung bên trong khi cần tùy biến.

### 4.2. Không dùng `any` — Type Safety 100%
- Mọi dữ liệu truyền vào và phát ra phải có kiểu dữ liệu rõ ràng:
  ```typescript
  // ĐÚNG:
  readonly columns = input.required<TableColumn<T>[]>();
  readonly rowSelect = output<T>();

  // SAI:
  @Input() columns: any[];
  @Output() rowSelect = new EventEmitter<any>();
  ```

### 4.3. Tích hợp Angular Reactive Forms & ControlValueAccessor
- Khi tạo custom form controls (ví dụ sơ đồ chọn ghế, bộ lọc đa cấp), bắt buộc triển khai `ControlValueAccessor`:
  - `writeValue(value: T): void`
  - `registerOnChange(fn: (value: T) => void): void`
  - `registerOnTouched(fn: () => void): void`
  - `setDisabledState?(isDisabled: boolean): void`
- Không can thiệp trực tiếp vào DOM (`document.getElementById`, `nativeElement.style`).

### 4.4. Hỗ trợ Accessibility (A11y) & Trạng thái tương tác
- Đầy đủ trạng thái: Default, Hover, Focus (với focus ring `--color-focus`), Disabled, Loading.
- Các nút biểu tượng không chữ bắt buộc có `aria-label` hoặc `pTooltip`.
- Hỗ trợ đóng mở modal bằng phím `ESC` và kích hoạt bằng phím `Enter`/`Space`.

---

## 5. QUY CHUẨN CHI TIẾT: TABLE DÙNG CHUNG (REUSABLE TABLE)

### 5.1. Yêu cầu kiến trúc Table
Trong ứng dụng quản trị Đông Lý, mọi bảng dữ liệu danh sách nghiệp vụ đều cần đáp ứng:
1. **Generic Type `<T>`**: Nhận mảng dữ liệu có type an toàn.
2. **Cấu hình Cột (`TableColumn<T>`)**:
   ```typescript
   export interface TableColumn<T = unknown> {
     field: keyof T | string;
     header: string;
     width?: string;
     minWidth?: string;
     sortable?: boolean;
     align?: 'left' | 'center' | 'right';
     template?: string; // Tên ng-template tùy biến cho cell
   }
   ```
3. **Tương thích Phân trang Backend**:
   - Nhận `totalRecords: number`, `pageSize: number`, `currentPage: number`.
   - Phát sự kiện `(lazyLoad)` gồm `{ page: number, size: number, sortField?: string, sortOrder?: number }` khớp với `PaginationMeta` của Backend Go REST API.
4. **4 Trạng thái bắt buộc**:
   - **Loading State**: Hiển thị bảng kèm PrimeNG spinner hoặc skeleton loading khi `isLoading() === true`.
   - **Empty State**: Tự động hiển thị `EmptyStateComponent` khi `items.length === 0` và không loading.
   - **Error State**: Có vùng hiển thị thông báo lỗi kèm nút "Thử lại".
   - **Data State**: Hiển thị dữ liệu kèm thanh phân trang chuẩn tiếng Việt: *"Hiển thị {first} - {last} trong tổng số {totalRecords} bản ghi"*.
5. **Custom Cells**: Hỗ trợ chiếu template tùy biến (ví dụ avatar, role pills, status badge, action buttons) qua Angular `ng-template` có context rõ ràng.

### 5.2. Mẫu triển khai Reusable Table Chuẩn
```html
<p-table
  [value]="data()"
  [lazy]="true"
  (onLazyLoad)="onLazyLoad($event)"
  [paginator]="true"
  [rows]="pageSize()"
  [totalRecords]="totalRecords()"
  [loading]="isLoading()"
  [rowsPerPageOptions]="[10, 20, 50]"
  [showCurrentPageReport]="true"
  currentPageReportTemplate="Hiển thị {first} - {last} trong tổng số {totalRecords} bản ghi"
  styleClass="p-datatable-sm saas-data-table"
  responsiveLayout="scroll"
>
  <!-- Template Header -->
  ...
  <!-- Template Body với dynamic hoặc slot templates -->
  ...
  <!-- Template Empty State -->
  <ng-template pTemplate="emptymessage">
    <tr>
      <td [attr.colspan]="columnCount" class="p-0">
        <app-empty-state
          [title]="emptyTitle"
          [description]="emptyDescription"
        />
      </td>
    </tr>
  </ng-template>
</p-table>
```

---

## 6. QUY CHUẨN CHI TIẾT: FORM CONTROLS & VALIDATION

### 6.1. Vấn đề hiện tại cần khắc phục
Hiện tại các form như `user-form-dialog` và `role-form-dialog` lặp lại mã kiểm tra lỗi:
```html
<!-- MÃ LẶP LẠI KHÔNG NÊN VIẾT Ở TỪNG COMPONENT: -->
@if (isFieldInvalid('username')) {
  <small class="error-message">
    @if (form.get('username')?.hasError('required')) { Tên đăng nhập không được để trống. }
    @else if (form.get('username')?.hasError('minlength')) { Tối thiểu 3 ký tự. }
  </small>
}
```

### 6.2. Giải pháp kiến trúc: `FormFieldComponent`
Chuẩn hóa vùng nhập liệu bằng wrapper `app-form-field`:
```html
<app-form-field
  label="Tên đăng nhập"
  [required]="true"
  [control]="userForm.get('username')"
  hint="Chỉ chứa chữ cái, số và ký tự . _ -"
>
  <input
    id="username"
    type="text"
    pInputText
    formControlName="username"
    placeholder="vd: nguyen_van_a"
  />
</app-form-field>
```
**Trách nhiệm của `FormFieldComponent`**:
1. Tự động render `<label [for]="forId">{{ label }} @if (required) { <span class="required-mark">*</span> }</label>`.
2. Kiểm tra `control.invalid && (control.dirty || control.touched)`.
3. Tự động dịch các mã lỗi phổ biến (`required`, `minlength`, `maxlength`, `email`, `pattern`) thành thông báo tiếng Việt chuẩn xác.
4. Hiển thị `<small class="field-hint">{{ hint }}</small>` khi không có lỗi.

---

## 7. QUY CHUẨN CHI TIẾT: MODAL & DIALOG

### 7.1. Hộp thoại xác nhận nguy hiểm (`ConfirmModalComponent`)
- Đã được chuẩn hóa tại `src/app/shared/components/confirm-modal/`.
- Sử dụng cho:
  - Xóa tài khoản, xóa vai trò, xóa chuyến xe, xóa lộ trình.
  - Tạm khóa / Kích hoạt tài khoản hoặc vai trò.
  - Hủy vé đã đặt hoặc hoàn tiền.
- Bắt buộc cấu hình: `title`, `message`, `confirmText`, `danger` (màu đỏ nếu hành động phá hủy), phát sự kiện `(confirm)` và `(cancel)`.

### 7.2. Hộp thoại Form dữ liệu (`DialogWrapper` / PrimeNG Dialog)
- Sử dụng `<p-dialog>` cấu hình nhất quán:
  - `[modal]="true"`
  - `[draggable]="false"`
  - `[resizable]="false"`
  - `[dismissableMask]="true"`
  - Chiều rộng chuẩn hóa theo kích thước nội dung: `sm` (420px), `md` (540px), `lg` (720px), `xl` (960px).
- Nút footer nhất quán: Nút Hủy (Secondary, outlined), Nút Lưu/Submit (Danger/Primary tùy độ quan trọng, kèm trạng thái `[loading]`).

---

## 8. CẤU TRÚC THƯ MỤC CHUẨN CHO SHARED LAYER

```text
src/app/shared/
├── components/                 # Các component UI primitives dùng chung
│   ├── confirm-modal/          # Modal xác nhận thao tác nguy hiểm (ConfirmModalComponent)
│   ├── empty-state/            # Trạng thái danh sách rỗng (EmptyStateComponent)
│   ├── loading-spinner/        # Trạng thái loading kèm backdrop (LoadingSpinnerComponent)
│   ├── page-header/            # Header trang, breadcrumb & actions (PageHeaderComponent)
│   ├── stat-card/              # Thẻ thống kê KPI (StatCardComponent)
│   ├── status-badge/           # Huy hiệu hiển thị trạng thái chuẩn hóa (StatusBadgeComponent)
│   ├── search-input/           # Ô tìm kiếm có debounce & nút clear (SearchInputComponent)
│   ├── form-field/             # Wrapper label + control + validation error (FormFieldComponent)
│   ├── theme-switcher/         # Chuyển đổi Light/Dark/System (ThemeSwitcherComponent)
│   └── language-switcher/      # Chuyển đổi tiếng Việt / tiếng Anh (LanguageSwitcherComponent)
├── directives/                 # Directives dùng chung
│   └── has-permission.directive.ts
├── pipes/                      # Pure Pipes định dạng hiển thị
│   ├── currency-vnd.pipe.ts    # Định dạng tiền tệ VND (100.000 ₫)
│   ├── date-vi.pipe.ts         # Định dạng ngày giờ chuẩn Việt Nam (DD/MM/YYYY HH:mm)
│   └── translate.pipe.ts       # Định dạng đa ngôn ngữ
├── models/                     # Interfaces/Types dùng chung cho UI
│   ├── table.model.ts          # TableColumn, TableLazyLoadEvent
│   ├── select-option.model.ts  # SelectOption<T> cho Dropdown/Select
│   └── dialog-config.model.ts  # Cấu hình modal/dialog chuẩn
└── utils/                      # Pure helper functions
    ├── date-utils.ts           # Xử lý ngày tháng an toàn
    └── number-utils.ts         # Xử lý số học và tiền tệ
```

---

## 9. QUY TẮC BẮT BUỘC KHI PHÁT TRIỂN FEATURE MỚI (CHECKLIST)

Mọi lập trình viên và AI Agent khi triển khai hoặc chỉnh sửa màn hình nghiệp vụ **bắt buộc** tuân thủ:

1. **Khảo sát Shared UI trước khi code**:
   - Kiểm tra `src/app/shared/components/` xem đã có thành phần tương ứng chưa.
   - Nếu có (ví dụ: `PageHeader`, `EmptyState`, `ConfirmModal`, `StatusBadge`), **bắt buộc tái sử dụng**.
2. **Không tự dựng lại (No Reinventing the Wheel)**:
   - Không tự viết lại HTML/CSS của ô tìm kiếm, không tự viết lại logic debounce.
   - Không tự sao chép đoạn mã kiểm tra `@if (control.hasError('...'))` lặp đi lặp lại.
   - Không tự tạo modal xác nhận riêng cho từng màn hình bằng alert trình duyệt hay custom div.
3. **Đánh giá mở rộng (Extend before Fork)**:
   - Nếu component dùng chung thiếu một thuộc tính (ví dụ: `PageHeader` cần thêm nút phụ hoặc slot), hãy mở rộng component dùng chung qua `@Input()` hoặc `<ng-content>` thay vì sao chép ra component mới.
4. **Không làm rò rỉ nghiệp vụ vào Shared**:
   - Tuyệt đối không import models hoặc gọi API của Users, Trips, Bookings, Tickets vào `src/app/shared/`.
5. **Tuân thủ Design Tokens & Dark Mode**:
   - Sử dụng CSS variables (`--color-surface`, `--color-border`, `--color-text-primary`). Không hardcode mã hex `#ffffff`, `#000000`.
6. **Kiểm thử đầy đủ**:
   - Viết Unit Test cho component mới với Vitest. Đảm bảo toàn bộ test pass (`npm test`).

---

## 10. KẾ HOẠCH LỘ TRÌNH CHUẨN HÓA (REFACTOR ROADMAP)

Để đảm bảo không làm gián đoạn hệ thống đang hoạt động và không tạo rủi ro hồi quy (regression), lộ trình chuẩn hóa Shared UI được chia làm 4 giai đoạn:

### Giai đoạn 1: Chuẩn hóa Quy tắc & Nền tảng Tài liệu (Hiện tại)
- Thiết lập quy chuẩn kiến trúc Shared UI trong `AGENTS.md`, `docs/architecture/shared-ui-guidelines.md` và các tài liệu kỹ thuật liên quan.
- Thống nhất hợp đồng kiểu dữ liệu UI chung (`TableColumn<T>`, `SelectOption<T>`).
- Kiểm tra độ tương thích với toàn bộ test hiện tại (115 tests pass).

### Giai đoạn 2: Xây dựng & Kiểm thử các Primitives Cấp bách
- Tạo `StatusBadgeComponent` (`shared/components/status-badge/`): chuẩn hóa hiển thị trạng thái cho User, Role, sau này dùng cho Trip, Booking, Ticket.
- Tạo `SearchInputComponent` (`shared/components/search-input/`): đóng gói debounce input và nút clear.
- Tạo `FormFieldComponent` (`shared/components/form-field/`): chuẩn hóa hiển thị nhãn và validation errors.
- Viết Unit Test 100% cho các component mới này.

### Giai đoạn 3: Tái cấu trúc Áp dụng Thử nghiệm (Pilot Refactor)
- Refactor `user-list-page` và `role-list-page`:
  - Thay thế custom search box bằng `SearchInputComponent`.
  - Thay thế tag trạng thái thủ công bằng `StatusBadgeComponent`.
- Refactor `user-form-dialog` và `role-form-dialog`:
  - Sử dụng `FormFieldComponent` để tinh gọn 50% dòng code HTML validation.
- Chạy toàn bộ test suite để đảm bảo không hồi quy.

### Giai đoạn 4: Chuẩn hóa Data Table & Áp dụng cho các Feature Tiếp theo
- Chuẩn hóa mẫu DataTable có cấu hình typed columns, tích hợp tự động với `PageResponse<T>`.
- Áp dụng ngay từ đầu cho các feature sắp phát triển: `Trips`, `Bookings`, `Vehicles`, `Routes`, `Tickets`.
