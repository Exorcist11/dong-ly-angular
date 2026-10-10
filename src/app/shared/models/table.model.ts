/**
 * Model cấu hình cột cho Data Table dùng chung
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
  /** Tên ng-template tùy biến cho cell nếu có */
  template?: string;
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
