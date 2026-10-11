import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { QrDisplayComponent } from '../qr-display/qr-display.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CurrencyVndPipe } from '../../../../shared/pipes/currency-vnd.pipe';
import { DateViPipe } from '../../../../shared/pipes/date-vi.pipe';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';
import { TicketItem } from '../../models/ticket.model';
import { CrmBookingService } from '../../services/crm-booking.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [
    CommonModule,
    QrDisplayComponent,
    StatusBadgeComponent,
    ButtonComponent,
    CurrencyVndPipe,
    DateViPipe,
    TranslatePipe,
  ],
  template: `
    @if (ticket()) {
      <div class="ticket-card" [class.cancelled]="ticket()?.status === 'CANCELLED'">
        <!-- Print / Screen Container -->
        <div class="ticket-inner printable-ticket">
          <!-- Ticket Header -->
          <div class="ticket-brand">
            <div class="brand-title">
              <span class="company-name">XE KHÁCH ĐÔNG LÝ</span>
              <span class="ticket-title-sub">VÉ ĐIỆN TỬ XE KHÁCH / E-TICKET</span>
            </div>
            <div class="ticket-code-badge">
              {{ ticket()?.ticketCode }}
            </div>
          </div>

          <div class="ticket-body">
            <!-- Left: Journey & Passenger info -->
            <div class="ticket-info-col">
              <div class="route-line">
                {{ ticket()?.routeName || ('bookings.ticket.route' | translate) }}
              </div>

              <div class="meta-grid">
                <div class="meta-item">
                  <span class="meta-label">{{ 'bookings.ticket.departureTime' | translate }}</span>
                  <span class="meta-val meta-val-departure">
                    {{ ticket()?.departureTime ? (ticket()?.departureTime | dateVi : true) : '-' }}
                  </span>
                </div>

                <div class="meta-item">
                  <span class="meta-label">{{ 'bookings.ticket.seat' | translate }}</span>
                  <span class="meta-val seat-highlight">
                    {{ ticket()?.seatCode }}
                  </span>
                </div>

                <div class="meta-item">
                  <span class="meta-label">{{ 'bookings.ticket.passenger' | translate }}</span>
                  <span class="meta-val meta-val-passenger">
                    {{ ticket()?.passengerName }}
                  </span>
                </div>

                <div class="meta-item">
                  <span class="meta-label">{{ 'bookings.ticket.phone' | translate }}</span>
                  <span class="meta-val meta-val-mono">
                    {{ ticket()?.passengerPhone || '-' }}
                  </span>
                </div>

                @if (ticket()?.pickupStopName) {
                  <div class="meta-item col-span-2">
                    <span class="meta-label">{{ 'bookings.ticket.pickup' | translate }}</span>
                    <span class="meta-val meta-val-stop">
                      {{ ticket()?.pickupStopName }}
                    </span>
                  </div>
                }

                @if (ticket()?.dropoffStopName) {
                  <div class="meta-item col-span-2">
                    <span class="meta-label">{{ 'bookings.ticket.dropoff' | translate }}</span>
                    <span class="meta-val meta-val-stop">
                      {{ ticket()?.dropoffStopName }}
                    </span>
                  </div>
                }

                <div class="meta-item">
                  <span class="meta-label">{{ 'bookings.ticket.bookingCode' | translate }}</span>
                  <span class="meta-val meta-val-mono">
                    {{ ticket()?.bookingCode }}
                  </span>
                </div>

                <div class="meta-item">
                  <span class="meta-label">{{ 'bookings.ticket.price' | translate }}</span>
                  <span class="meta-val meta-val-price">
                    {{ ticket()?.price | currencyVnd }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Right: QR Code & Status -->
            <div class="ticket-qr-col">
              <app-qr-display
                [qrData]="ticket()?.qrCodeData || ''"
                [size]="120"
                [isExpired]="isQrExpired()"
                [allowRefresh]="canRefresh()"
                [refreshing]="refreshing()"
                (refreshRequested)="onRefreshQr()"
              />

              <div class="ticket-status-pill">
                <app-status-badge [status]="ticket()?.status" />
              </div>

              <span class="ticket-issued-at">
                {{ ticket()?.issuedAt | dateVi : true }}
              </span>
            </div>
          </div>

          <div class="ticket-footer">
            <span>* Vui lòng có mặt tại điểm đón trước 15 phút. Hotline hỗ trợ: 1900 xxxx</span>
          </div>
        </div>

        <!-- Action bar (Hidden on Print) -->
        <div class="ticket-actions no-print">
          <app-button
            variant="secondary"
            size="small"
            icon="pi pi-print"
            [label]="'bookings.ticket.print' | translate"
            (clicked)="printTicket()"
          />
        </div>
      </div>
    }
  `,
  styles: [
    `
      .ticket-card {
        background: #ffffff;
        border: 1px dashed #cbd5e1;
        border-radius: 12px;
        padding: 16px;
        position: relative;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      }
      .ticket-card.cancelled {
        opacity: 0.75;
        background: #fff1f2;
        border-color: #fca5a5;
      }
      .ticket-brand {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 2px solid #0f172a;
        padding-bottom: 8px;
        margin-bottom: 12px;
      }
      .company-name {
        font-size: 1.1rem;
        font-weight: 800;
        color: #0f172a;
        letter-spacing: 0.05em;
        display: block;
      }
      .ticket-title-sub {
        font-size: 0.7rem;
        color: #64748b;
        letter-spacing: 0.05em;
        font-weight: 600;
      }
      .ticket-code-badge {
        background: #f1f5f9;
        padding: 4px 10px;
        border-radius: 6px;
        font-size: 0.85rem;
        font-weight: 700;
        color: #1e293b;
        border: 1px solid #e2e8f0;
        font-family: monospace;
      }
      .ticket-body {
        display: flex;
        gap: 16px;
      }
      .ticket-info-col {
        flex: 1;
      }
      .route-line {
        font-size: 1rem;
        font-weight: 700;
        color: #0f172a;
      }
      .meta-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px 12px;
        margin-top: 8px;
      }
      .col-span-2 {
        grid-column: span 2 / span 2;
      }
      .meta-item {
        display: flex;
        flex-direction: column;
      }
      .meta-label {
        font-size: 0.7rem;
        color: #64748b;
        text-transform: uppercase;
      }
      .meta-val {
        font-size: 0.85rem;
        color: #1e293b;
      }
      .meta-val-departure {
        font-weight: 600;
        color: #0369a1;
      }
      .meta-val-passenger {
        font-weight: 600;
        color: #1e293b;
      }
      .meta-val-mono {
        font-family: monospace;
        font-size: 0.85rem;
        color: #334155;
      }
      .meta-val-stop {
        font-size: 0.8125rem;
        color: #475569;
      }
      .meta-val-price {
        font-weight: 700;
        color: #047857;
      }
      .seat-highlight {
        font-size: 1.1rem;
        font-weight: 800;
        color: #0284c7;
      }
      .ticket-qr-col {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-width: 130px;
        padding-left: 12px;
        border-left: 1px dashed #e2e8f0;
      }
      .ticket-status-pill {
        margin-top: 8px;
      }
      .ticket-issued-at {
        font-size: 10px;
        color: #94a3b8;
        font-family: monospace;
        text-align: center;
        margin-top: 4px;
      }
      .ticket-footer {
        margin-top: 12px;
        padding-top: 8px;
        border-top: 1px solid #f1f5f9;
        text-align: center;
        font-size: 11px;
        color: #64748b;
      }
      .ticket-actions {
        display: flex;
        justify-content: flex-end;
        margin-top: 12px;
      }

      /* PRINT STYLES */
      @media print {
        .no-print {
          display: none !important;
        }
        .ticket-card {
          box-shadow: none !important;
          border: 1px solid #000000 !important;
          page-break-inside: avoid;
          margin-bottom: 20px;
        }
        .ticket-brand {
          border-bottom: 2px solid #000000 !important;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketDetailComponent {
  private readonly bookingService = inject(CrmBookingService);
  private readonly notification = inject(NotificationService);

  readonly ticket = input<TicketItem | null>(null);
  readonly canRefresh = input<boolean>(false);
  readonly ticketUpdated = output<TicketItem>();

  readonly refreshing = signal<boolean>(false);

  isQrExpired(): boolean {
    const t = this.ticket();
    if (!t) return false;
    if (t.status === 'CANCELLED') return true;
    return false;
  }

  onRefreshQr(): void {
    const code = this.ticket()?.ticketCode;
    if (!code) return;

    this.refreshing.set(true);
    this.bookingService.refreshTicketQr(code).subscribe({
      next: (res) => {
        this.refreshing.set(false);
        if (res.data) {
          this.notification.success('Làm mới mã QR vé thành công');
          this.ticketUpdated.emit(res.data);
        }
      },
      error: (err: any) => {
        this.refreshing.set(false);
        this.notification.error(err?.error?.message || 'Không thể làm mới mã QR');
      },
    });
  }

  printTicket(): void {
    window.print();
  }
}
