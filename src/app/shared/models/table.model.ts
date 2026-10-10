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
