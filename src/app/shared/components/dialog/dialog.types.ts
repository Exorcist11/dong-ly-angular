import { ButtonVariant } from '../button/button.types';

/**
 * Các kích thước chuẩn của Dialog trong Hệ thống Quản trị Đông Lý.
 * - sm: ~480px (Modal xác nhận, form đơn giản ít trường)
 * - md: ~540px (Form tiêu chuẩn: tạo người dùng, phân quyền cơ bản)
 * - lg: ~640px (Form nhiều trường hoặc danh sách lựa chọn có preview)
 * - xl: ~860px (Ma trận phân quyền, dữ liệu dạng lưới)
 * - full: Không gian gần toàn màn hình, giới hạn viewport
 */
export type DialogSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface DialogDimensions {
  width: string;
  maxWidth: string;
  height?: string;
  maxHeight?: string;
}

/**
 * Cấu hình kích thước tập trung, đảm bảo tính nhất quán trên toàn bộ hệ thống.
 */
export const DIALOG_SIZE_CONFIG: Record<DialogSize, DialogDimensions> = {
  sm: {
    width: '480px',
    maxWidth: '95vw',
  },
  md: {
    width: '540px',
    maxWidth: '95vw',
  },
  lg: {
    width: '640px',
    maxWidth: '95vw',
  },
  xl: {
    width: '860px',
    maxWidth: '96vw',
  },
  full: {
    width: '96vw',
    maxWidth: '1400px',
    height: '92vh',
    maxHeight: '96vh',
  },
};

export interface DialogActionConfig {
  label?: string;
  icon?: string;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
}
