import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Dialog } from 'primeng/dialog';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { CurrencyVndPipe } from '../../../../shared/pipes/currency-vnd.pipe';
import { DateViPipe } from '../../../../shared/pipes/date-vi.pipe';
import { BookingResponse } from '../../models/booking.model';

@Component({
  selector: 'app-booking-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    Dialog,
    ButtonComponent,
    StatusBadgeComponent,
    CurrencyVndPipe,
    DateViPipe,
  ],
  templateUrl: './booking-detail-dialog.component.html',
  styleUrl: './booking-detail-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingDetailDialogComponent {
  /** Dữ liệu chi tiết đơn đặt vé */
  readonly booking = input<BookingResponse | null>(null);

  /** Cờ mở / đóng dialog */
  readonly visible = input<boolean>(false);

  /** Trạng thái loading */
  readonly loading = input<boolean>(false);

  /** Quyền hủy vé */
  readonly canCancel = input<boolean>(false);

  /** Sự kiện đóng dialog */
  readonly visibleChange = output<boolean>();

  /** Sự kiện yêu cầu hủy đơn đặt vé */
  readonly cancelRequested = output<BookingResponse>();

  close(): void {
    this.visibleChange.emit(false);
  }

  onCancelClick(): void {
    const current = this.booking();
    if (current) {
      this.cancelRequested.emit(current);
    }
  }
}
