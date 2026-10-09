/**
 * Standard Envelope Response từ Spring-BE.
 * Định dạng phản hồi cho mọi API đơn lẻ.
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

/**
 * Metadata phân trang chuẩn theo Spring Boot Pageable.
 */
export interface PaginationMeta {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  isFirst: boolean;
  isLast: boolean;
}

/**
 * Cấu trúc đóng gói danh sách dữ liệu kèm phân trang.
 */
export interface PageData<T> {
  items: T[];
  pagination: PaginationMeta;
}

/**
 * Phản hồi danh sách có phân trang chuẩn toàn hệ thống.
 */
export interface PageResponse<T> {
  success: boolean;
  message: string;
  data: PageData<T>;
  timestamp: string;
}

/**
 * Cấu trúc lỗi chuẩn trả về từ GlobalExceptionHandler của Backend.
 */
export interface ApiErrorResponse {
  status: number;
  code: string;
  message: string;
  path: string;
  timestamp: string;
}
