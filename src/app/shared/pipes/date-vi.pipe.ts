import { Pipe, PipeTransform } from '@angular/core';
import { formatDateVi } from '../utils/date-utils';

/**
 * Standalone Pure Pipe định dạng ngày tháng tiếng Việt.
 * Ví dụ: {{ trip.departureTime | dateVi:true }} -> "08:30 15/10/2026"
 */
@Pipe({
  name: 'dateVi',
  standalone: true,
  pure: true,
})
export class DateViPipe implements PipeTransform {
  transform(
    value: string | number | Date | null | undefined,
    includeTime = false
  ): string {
    return formatDateVi(value, includeTime);
  }
}
