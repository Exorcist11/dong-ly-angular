import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

// Design System components
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { CurrencyVndPipe } from '../../../../shared/pipes/currency-vnd.pipe';
import { DateViPipe } from '../../../../shared/pipes/date-vi.pipe';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';
import { TranslationService } from '../../../../core/i18n/translation.service';
import { NotificationService } from '../../../../core/services/notification.service';

// Feature components & services
import { TicketItem } from '../../models/ticket.model';
import { CrmBookingService } from '../../services/crm-booking.service';
import { TicketDetailComponent } from '../../components/ticket-detail/ticket-detail.component';

@Component({
  selector: 'app-ticket-lookup-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    ButtonComponent,
    InputComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    TranslatePipe,
    TicketDetailComponent,
  ],
  templateUrl: './ticket-lookup-page.component.html',
  styleUrl: './ticket-lookup-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketLookupPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly bookingService = inject(CrmBookingService);
  private readonly notification = inject(NotificationService);
  private readonly i18n = inject(TranslationService);

  readonly bookingCode = signal<string>('');
  readonly phone = signal<string>('');
  readonly loading = signal<boolean>(false);
  readonly hasSearched = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly tickets = signal<TicketItem[]>([]);

  ngOnInit(): void {
    // Cho phép đọc query params nếu khách mở link từ SMS/Email
    this.route.queryParamMap.subscribe((params) => {
      const code = params.get('bookingCode');
      const p = params.get('phone');
      if (code) this.bookingCode.set(code.trim());
      if (p) this.phone.set(p.trim());

      if (code && p) {
        this.lookupTickets();
      }
    });
  }

  lookupTickets(): void {
    const code = this.bookingCode().trim();
    const phoneNumber = this.phone().trim();

    if (!code) {
      this.notification.warning(this.i18n.translate('portal.validation.bookingCodeRequired'));
      return;
    }
    if (!phoneNumber) {
      this.notification.warning(this.i18n.translate('portal.validation.phoneRequired'));
      return;
    }

    this.loading.set(true);
    this.hasSearched.set(true);
    this.errorMessage.set(null);

    this.bookingService.lookupCustomerTickets(code, phoneNumber).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.tickets.set(res.data || []);
      },
      error: (err) => {
        this.loading.set(false);
        this.tickets.set([]);
        const msg = err?.error?.message || this.i18n.translate('portal.messages.lookupFailed');
        this.errorMessage.set(msg);
        this.notification.error(msg);
      },
    });
  }

  onTicketUpdated(updated: TicketItem): void {
    const list = this.tickets().map((t) => (t.ticketCode === updated.ticketCode ? updated : t));
    this.tickets.set(list);
  }

  printAllTickets(): void {
    window.print();
  }
}
