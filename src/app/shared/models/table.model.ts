import { SelectOption } from './select-option.model';

/**
 * Model cấu hình cột cho Data Table dùng chung Đông Lý Admin
 */
export interface TableColumn<T = unknown> {
  /** Trường dữ liệu trong model T hoặc key path */
  field: keyof T | string;
  /** Tiêu đề hiển thị ở Header */
  header: string;
  /** Độ rộng cột (vd: '160px', '20%') */
  width?: string;
  /** Độ rộng tối thiểu (vd: '200px') */
  minWidth?: string;
  /** Cho phép sắp xếp hay không */
  sortable?: boolean;
  /** Căn lề nội dung */
  align?: 'left' | 'center' | 'right';
  /** Tên định danh template tùy biến cho cell (mặc định lấy theo field nếu không khai báo) */
  template?: string;
  /** Giá trị hiển thị mặc định khi dữ liệu null hoặc undefined (mặc định là '-') */
  defaultValue?: string;
  /** Hàm format dữ liệu hiển thị (khi không dùng custom template) */
  formatter?: (value: unknown, row: T) => string;
  /** Class CSS bổ sung cho ô header */
  headerClass?: string;
  /** Class CSS bổ sung cho ô cell */
  cellClass?: string;
  /** Ẩn cột */
  hidden?: boolean;
}

/**
 * Event phát ra khi Table thay đổi trang hoặc sắp xếp (Lazy load)
 */
export interface TableLazyLoadEvent {
  first: number;
  rows: number;
  sortField?: string;
  sortOrder?: number;
}

/**
 * Cấu hình bộ lọc dropdown tích hợp trong toolbar của DataTable
 */
export interface TableFilterConfig<T = unknown> {
  /** Khóa định danh trường filter (vd: 'status', 'role') */
  key: string;
  /** Nhãn hiển thị phía trước ô chọn (vd: 'Trạng thái:') */
  label?: string;
  /** Placeholder khi chưa chọn (vd: 'Tất cả') */
  placeholder?: string;
  /** Danh sách tùy chọn hiển thị */
  options: SelectOption<T>[];
  /** Giá trị đang được chọn */
  value?: T;
  /** Độ rộng ô dropdown (vd: '160px') */
  width?: string;
}

/**
 * Sự kiện khi người dùng thay đổi giá trị bộ lọc
 */
export interface TableFilterChangeEvent<T = unknown> {
  key: string;
  value: T;
}
