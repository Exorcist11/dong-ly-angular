/**
 * Định nghĩa kiểu dữ liệu cho Shared Button Component — Dự án Đông Lý.
 * Tuân thủ TypeScript Strict Mode, không sử dụng any.
 */

/**
 * Các biến thể thị giác (visual variants) chuẩn hóa theo Design Tokens Đông Lý.
 * - primary: Nút hành động chính (Đỏ Đông Lý #D71920)
 * - secondary: Nút phụ / viền ngoài (Outlined)
 * - danger: Thao tác nguy hiểm, phá hủy (Xóa, Hủy đơn, Tạm khóa)
 * - success: Thao tác xác nhận thành công, kích hoạt an toàn
 * - warn: Thao tác cảnh báo, cần thận trọng
 * - info: Thao tác thông tin, hỗ trợ
 * - text: Nút dạng chữ không viền (chuyên dùng cho table actions, icon button phẳng)
 * - outlined: Nút viền chính màu primary
 */
export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'success'
  | 'warn'
  | 'info'
  | 'text'
  | 'outlined';

/** Kích thước nút theo 8pt grid của hệ thống */
export type ButtonSize = 'small' | 'medium' | 'large';

/** Thuộc tính type chuẩn của HTML button */
export type ButtonType = 'button' | 'submit' | 'reset';

/** Vị trí icon so với nhãn text */
export type ButtonIconPosition = 'left' | 'right';

/** Vị trí hiển thị Tooltip chú thích */
export type ButtonTooltipPosition = 'top' | 'bottom' | 'left' | 'right';
