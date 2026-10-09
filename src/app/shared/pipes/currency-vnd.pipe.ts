import { Pipe, PipeTransform } from '@angular/core';
import { formatCurrencyVnd } from '../utils/date-utils';

/**
 * Standalone Pure Pipe định dạng số tiền sang định dạng tiền Việt Nam Đồng (VND).
 * Ví dụ: {{ ticket.price | currencyVnd }} -> "150.000 ₫"
 */
@Pipe({
  name: 'currencyVnd',
  standalone: true,
  pure: true,
})
export class CurrencyVndPipe implements PipeTransform {
  transform(value: number | string | null | undefined): string {
    return formatCurrencyVnd(value);
  }
}
