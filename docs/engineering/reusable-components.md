# QUY TẮC PHÁT TRIỂN & TÁI SỬ DỤNG COMPONENT (REUSABLE COMPONENTS)
### Dự án: Đông Lý Angular Admin Portal

---

## 1. Hướng dẫn Tái sử dụng các UI Primitives Hiện có

| Component | Vị trí | Mục đích & Cách sử dụng |
| :--- | :--- | :--- |
| **`PageHeaderComponent`** | `shared/components/page-header/` | Tiêu đề trang, breadcrumb và action buttons.<br>`<app-page-header [title]="'...'"><div actions>...</div></app-page-header>` |
| **`LoadingSpinnerComponent`** | `shared/components/loading-spinner/` | Trạng thái đang tải dữ liệu.<br>`<app-loading-spinner [overlay]="true" [message]="'Đang tải...'"/>` |
| **`EmptyStateComponent`** | `shared/components/empty-state/` | Trạng thái danh sách rỗng.<br>`<app-empty-state [title]="'Chưa có xe'" [description]="'...'" />` |
| **`StatCardComponent`** | `shared/components/stat-card/` | Thẻ thống kê KPI với chỉ số tăng giảm.<br>`<app-stat-card [label]="'Doanh thu'" [value]="'...'" [isPositive]="true" />` |
| **`ConfirmModalComponent`** | `shared/components/confirm-modal/` | Modal xác nhận hành động nguy hiểm/xóa.<br>`<app-confirm-modal [isOpen]="showModal" (confirm)="onDelete()" (cancel)="closeModal()"/>` |

---

## 2. Quy tắc Thiết kế Component Mới Dùng chung (Shared Component)
1. **API rõ ràng**: Khai báo `@Input({ required: true })` cho các thuộc tính bắt buộc, cung cấp giá trị mặc định cho thuộc tính tùy chọn.
2. **Không chứa Business Logic**: Shared component không được import models hay services của feature (không gọi Users, Trips, Bookings).
3. **Ưu tiên Composition**: Sử dụng Content Projection (`<ng-content>`) để cho phép component cha tùy biến nội dung thay vì thêm hàng loạt flags `showButtonA`, `showButtonB`.
4. **Không tạo Universal Component**: Không cố gắng gộp mọi loại bảng, mọi loại modal vào 1 file duy nhất với hàng chục điều kiện rẽ nhánh.
