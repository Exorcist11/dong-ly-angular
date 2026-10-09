/**
 * Tiện ích xử lý và định dạng ngày tháng tiếng Việt (Pure Functions).
 * Độc lập với Angular DI, dễ dàng viết Unit Test độc lập.
 */

/**
 * Định dạng ngày giờ chuẩn Việt Nam (DD/MM/YYYY HH:mm:ss hoặc DD/MM/YYYY).
 */
export function formatDateVi(
  dateInput: string | number | Date | null | undefined,
  includeTime = false
): string {
  if (!dateInput) return '-';

  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '-';

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  if (!includeTime) {
    return `${day}/${month}/${year}`;
  }

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes} ${day}/${month}/${year}`;
}

/**
 * Định dạng tiền tệ VND chuẩn Việt Nam (VD: 250000 -> 250.000 ₫).
 */
export function formatCurrencyVnd(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return '0 ₫';
  const num = typeof value === 'string' ? Number(value) : value;
  if (isNaN(num)) return '0 ₫';

  return `${num.toLocaleString('vi-VN')} ₫`;
}
