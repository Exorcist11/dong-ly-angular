/**
 * Model tùy chọn cho dropdown / select dùng chung
 */
export interface SelectOption<T = string> {
  label: string;
  value: T;
  disabled?: boolean;
  icon?: string;
}
