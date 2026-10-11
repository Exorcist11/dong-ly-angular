import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { CurrencyVndPipe } from '../../../../shared/pipes/currency-vnd.pipe';
import { DateViPipe } from '../../../../shared/pipes/date-vi.pipe';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';
import { BookingPaymentInfo } from '../../models/ticket.model';

@Component({
  selector: 'app-payment-info',
  standalone: true,
  imports: [
    CommonModule,
    StatusBadgeComponent,
    CurrencyVndPipe,
    DateViPipe,
    TranslatePipe,
  ],
  template: `
    @if (payment()) {
      <div class="payment-info-box">
        <div class="payment-header">
          <div class="flex items-center gap-2">
            <i class="pi pi-credit-card text-emerald-600 text-lg"></i>
            <h4 class="font-semibold text-slate-800">
              {{ 'bookings.payment.infoTitle' | translate }}
            </h4>
          </div>
          <app-status-badge [status]="payment()?.status" />
        </div>

        <div class="payment-details-grid mt-3">
          <div class="field-item">
            <span class="lbl">{{ 'bookings.payment.method' | translate }}</span>
            <span class="val font-semibold">
              {{ payment()?.paymentMethod }}
              @if (payment()?.gatewayProvider) {
                <span class="text-xs text-slate-500 font-normal">({{ payment()?.gatewayProvider }})</span>
              }
            </span>
          </div>

          <div class="field-item">
            <span class="lbl">{{ 'bookings.payment.txCode' | translate }}</span>
            <span class="val font-mono">{{ payment()?.transactionCode || '-' }}</span>
          </div>

          <div class="field-item">
            <span class="lbl">{{ 'bookings.payment.amount' | translate }}</span>
            <span class="val font-bold text-emerald-700">
              {{ payment()?.amount | currencyVnd }}
            </span>
          </div>

          <div class="field-item">
            <span class="lbl">{{ 'bookings.payment.paidAt' | translate }}</span>
            <span class="val">
              {{ payment()?.paidAt ? (payment()?.paidAt | dateVi : true) : '-' }}
            </span>
          </div>
        </div>

        @if (payment()?.note) {
          <div class="payment-note mt-2 text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-200">
            <strong>{{ 'bookings.detail.note' | translate }}:</strong> {{ payment()?.note }}
          </div>
        }

        @if (audits() && audits().length > 0) {
          <div class="audit-logs-section mt-3 pt-3 border-t border-slate-200">
            <h5 class="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <i class="pi pi-history text-slate-500"></i>
              Nhật ký kiểm toán giao dịch ({{ audits().length }})
            </h5>
            <div class="space-y-2">
              @for (audit of audits(); track audit.id) {
                <div class="audit-item text-xs bg-white p-2 rounded border border-slate-200 flex flex-col gap-1">
                  <div class="flex items-center justify-between">
                    <span class="font-bold text-slate-700 font-mono">{{ audit.action }}</span>
                    <span class="text-slate-400 text-[11px]">{{ audit.createdAt | dateVi : true }}</span>
                  </div>
                  <div class="flex items-center justify-between text-slate-600">
                    <span>Người thực hiện: <strong class="text-slate-800">{{ audit.performedBy }}</strong></span>
                    <span class="font-semibold text-emerald-600">{{ audit.amount | currencyVnd }}</span>
                  </div>
                  @if (audit.referenceCode) {
                    <div class="text-[11px] text-slate-500">
                      Mã tham chiếu: <span class="font-mono">{{ audit.referenceCode }}</span>
                    </div>
                  }
                  @if (audit.reason) {
                    <div class="text-[11px] text-slate-500 italic">
                      Lý do/Ghi chú: {{ audit.reason }}
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        }
      </div>
    }
  `,
  styles: [
    `
      .payment-info-box {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 14px 16px;
      }
      .payment-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #e2e8f0;
        padding-bottom: 8px;
      }
      .payment-details-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px 16px;
      }
      .field-item {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .lbl {
        font-size: 0.75rem;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.025em;
      }
      .val {
        font-size: 0.875rem;
        color: #1e293b;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentInfoComponent {
  readonly payment = input<BookingPaymentInfo | null>(null);
  readonly audits = input<import('../../models/ticket.model').PaymentAuditLog[]>([]);
}

