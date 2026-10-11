import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
  inject,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AppDialogComponent,
  DialogFooterDirective,
} from '../../../../shared/components/dialog/dialog.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { CurrencyVndPipe } from '../../../../shared/pipes/currency-vnd.pipe';
import { DateViPipe } from '../../../../shared/pipes/date-vi.pipe';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';
import { BookingResponse } from '../../models/booking.model';
import { TicketItem, BookingPaymentInfo } from '../../models/ticket.model';
import { CrmBookingService } from '../../services/crm-booking.service';
import { TicketDetailComponent } from '../ticket-detail/ticket-detail.component';
import { PaymentInfoComponent } from '../payment-info/payment-info.component';

@Component({
  selector: 'app-booking-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    AppDialogComponent,
    DialogFooterDirective,
    ButtonComponent,
    StatusBadgeComponent,
    CurrencyVndPipe,
    DateViPipe,
    TranslatePipe,
    TicketDetailComponent,
    PaymentInfoComponent,
  ],
  templateUrl: './booking-detail-dialog.component.html',
  styleUrl: './booking-detail-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingDetailDialogComponent {
  private readonly bookingService = inject(CrmBookingService);

  /** Dữ liệu chi tiết đơn đặt vé */
  readonly booking = input<BookingResponse | null>(null);

  /** Cờ mở / đóng dialog */
  readonly visible = input<boolean>(false);

  /** Trạng thái loading */
  readonly loading = input<boolean>(false);

  /** Quyền hủy vé */
  readonly canCancel = input<boolean>(false);

  /** Tab khởi tạo khi mở dialog (mặc định OVERVIEW) */
  readonly initialTab = input<'OVERVIEW' | 'TICKETS'>('OVERVIEW');

  /** Sự kiện đóng dialog */
  readonly visibleChange = output<boolean>();

  /** Sự kiện yêu cầu hủy đơn đặt vé */
  readonly cancelRequested = output<BookingResponse>();

  /** Sự kiện yêu cầu thu tiền tại quầy */
  readonly counterPayRequested = output<BookingResponse>();

  /** Sự kiện yêu cầu hoàn tiền thủ công */
  readonly refundRequested = output<BookingResponse>();

  readonly tickets = signal<TicketItem[]>([]);
  readonly ticketsLoading = signal<boolean>(false);
  readonly paymentInfo = signal<BookingPaymentInfo | null>(null);
  readonly paymentAudits = signal<import('../../models/ticket.model').PaymentAuditLog[]>([]);
  readonly activeTab = signal<'OVERVIEW' | 'TICKETS'>('OVERVIEW');

  constructor() {
    effect(() => {
      const b = this.booking();
      const isVis = this.visible();
      const initTab = this.initialTab();

      if (isVis && b?.id) {
        this.activeTab.set(b.status === 'CONFIRMED' ? initTab : 'OVERVIEW');
        if (b.status === 'CONFIRMED') {
          this.fallbackTicketsFromBooking();
          this.loadTickets(b.id);
        } else {
          this.tickets.set([]);
        }
        this.loadPayment(b.id);
        this.loadAudits(b.id);
      } else {
        this.tickets.set([]);
        this.paymentInfo.set(null);
        this.paymentAudits.set([]);
        this.activeTab.set('OVERVIEW');
      }
    });
  }

  loadTickets(bookingId: string): void {
    this.ticketsLoading.set(true);
    this.bookingService.getBookingTickets(bookingId).subscribe({
      next: (res) => {
        this.ticketsLoading.set(false);
        if (res?.data && res.data.length > 0) {
          this.tickets.set(res.data);
        } else {
          this.fallbackTicketsFromBooking();
        }
      },
      error: () => {
        this.ticketsLoading.set(false);
        this.fallbackTicketsFromBooking();
      },
    });
  }

  private fallbackTicketsFromBooking(): void {
    const b = this.booking();
    if (b && b.items && b.items.length > 0) {
      const fallbackList: TicketItem[] = b.items.map((it, idx) => ({
        id: it.id || `ticket-${b.id}-${idx + 1}`,
        ticketCode: it.ticketCode || `${b.bookingCode}-${it.seatCode}`,
        bookingId: b.id,
        bookingCode: b.bookingCode,
        seatCode: it.seatCode,
        passengerName: it.passengerName || b.customerName,
        passengerPhone: it.passengerPhone || b.customerPhone,
        pickupStopName: it.pickupStopName,
        dropoffStopName: it.dropoffStopName,
        price: it.finalPrice,
        status: (it.ticketStatus as any) || (b.status === 'CONFIRMED' ? 'ISSUED' : 'CANCELLED'),
        qrCodeData: it.qrCodeData || `${b.bookingCode}:${it.seatCode}:${it.passengerName || b.customerName}`,
        issuedAt: b.createdAt,
        tripCode: b.tripCode,
        routeName: b.routeName,
        vehiclePlateNumber: b.vehiclePlateNumber,
        departureTime: b.departureTime,
      }));
      this.tickets.set(fallbackList);
    }
  }

  loadPayment(bookingId: string): void {
    this.bookingService.getBookingPayment(bookingId).subscribe({
      next: (res) => {
        this.paymentInfo.set(res.data || null);
      },
      error: () => {
        this.paymentInfo.set(null);
      },
    });
  }

  loadAudits(bookingId: string): void {
    this.bookingService.getPaymentAuditLogs(bookingId).subscribe({
      next: (res) => {
        this.paymentAudits.set(res.data || []);
      },
      error: () => {
        this.paymentAudits.set([]);
      },
    });
  }

  onTicketUpdated(updatedTicket: TicketItem): void {
    const list = this.tickets().map((t) =>
      t.ticketCode === updatedTicket.ticketCode ? updatedTicket : t
    );
    this.tickets.set(list);
  }

  close(): void {
    this.visibleChange.emit(false);
  }

  onCancelClick(): void {
    const current = this.booking();
    if (current) {
      this.cancelRequested.emit(current);
    }
  }

  onCounterPayClick(): void {
    const current = this.booking();
    if (current) {
      this.counterPayRequested.emit(current);
    }
  }

  onRefundClick(): void {
    const current = this.booking();
    if (current) {
      this.refundRequested.emit(current);
    }
  }
}

