import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

// Shared Components & Pipes
import { PageHeaderComponent, BreadcrumbItem } from '../../../../shared/components/page-header/page-header.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { AppDialogComponent } from '../../../../shared/components/dialog/dialog.component';
import { SelectComponent } from '../../../../shared/components/select/select.component';
import { DateInputComponent } from '../../../../shared/components/date-input/date-input.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { DataTableComponent } from '../../../../shared/components/data-table/data-table.component';
import { TableCellDirective } from '../../../../shared/components/data-table/table-cell.directive';
import { CurrencyVndPipe } from '../../../../shared/pipes/currency-vnd.pipe';
import { DateViPipe } from '../../../../shared/pipes/date-vi.pipe';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';
import { TranslationService } from '../../../../core/i18n/translation.service';
import { TableColumn, TableLazyLoadEvent } from '../../../../shared/models/table.model';
import { SelectOption } from '../../../../shared/models/select-option.model';

// Services & Models
import { CrmBookingService } from '../../services/crm-booking.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { AuthService } from '../../../../core/auth/auth.service';
import {
  BookingResponse,
  BookingStatus,
  CrmBookingListCriteria,
} from '../../models/booking.model';
import { BookingDetailDialogComponent } from '../../components/booking-detail-dialog/booking-detail-dialog.component';

@Component({
  selector: 'app-booking-list-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    AppDialogComponent,
    PageHeaderComponent,
    ButtonComponent,
    SelectComponent,
    DateInputComponent,
    InputComponent,
    StatusBadgeComponent,
    DataTableComponent,
    TableCellDirective,
    CurrencyVndPipe,
    DateViPipe,
    TranslatePipe,
    BookingDetailDialogComponent,
  ],
  templateUrl: './booking-list-page.component.html',
  styleUrl: './booking-list-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingListPageComponent implements OnInit {
  private readonly bookingService = inject(CrmBookingService);
  private readonly notification = inject(NotificationService);
  private readonly authService = inject(AuthService);
  private readonly i18n = inject(TranslationService);
  private readonly router = inject(Router);

  // QUYỀN HẠN
  readonly canManage = computed(() => this.authService.hasPermission('BOOKING_MANAGE'));

  // BREADCRUMBS
  readonly breadcrumbs = computed<BreadcrumbItem[]>(() => {
    this.i18n.currentLang();
    return [
      { label: this.i18n.translate('navigation.home'), url: '/dashboard' },
      { label: this.i18n.translate('navigation.groups.operations') },
      { label: this.i18n.translate('navigation.items.bookingList') },
    ];
  });

  // BỘ LỌC DANH SÁCH BOOKINGS
  readonly filterBookingKeyword = signal<string>('');
  readonly filterBookingStatus = signal<BookingStatus | null>(null);
  readonly filterBookingFromDate = signal<string>('');
  readonly filterBookingToDate = signal<string>('');

  // TRẠNG THÁI BẢNG DỮ LIỆU
  readonly bookingsList = signal<BookingResponse[]>([]);
  readonly bookingsTotal = signal<number>(0);
  readonly bookingsLoading = signal<boolean>(false);
  readonly bookingsPage = signal<number>(0);
  readonly bookingsSize = signal<number>(10);
  private bookingsSort = 'createdAt,desc';

  // DIALOG CHI TIẾT & HỦY VÉ
  readonly detailDialogVisible = signal<boolean>(false);
  readonly selectedBookingDetail = signal<BookingResponse | null>(null);
  readonly detailLoading = signal<boolean>(false);

  readonly cancelModalVisible = signal<boolean>(false);
  readonly bookingToCancel = signal<BookingResponse | null>(null);
  readonly cancelReasonInput = signal<string>('');
  readonly cancelLoading = signal<boolean>(false);

  // MODAL THU TIỀN TẠI QUẦY & DUYỆT VIETQR
  readonly counterPayModalVisible = signal<boolean>(false);
  readonly bookingToPay = signal<BookingResponse | null>(null);
  readonly counterPayMethod = signal<'CASH' | 'VIETQR'>('CASH');
  readonly counterReceiptInput = signal<string>('');
  readonly counterBankRefInput = signal<string>('');
  readonly counterNoteInput = signal<string>('');
  readonly counterPayLoading = signal<boolean>(false);

  // MODAL HOÀN TIỀN THỦ CÔNG
  readonly refundModalVisible = signal<boolean>(false);
  readonly bookingToRefund = signal<BookingResponse | null>(null);
  readonly refundAmountInput = signal<number>(0);
  readonly refundReasonInput = signal<string>('');
  readonly refundRefInput = signal<string>('');
  readonly refundNoteInput = signal<string>('');
  readonly refundLoading = signal<boolean>(false);

  // CẤU HÌNH CỘT DỮ LIỆU
  readonly bookingColumns = computed<TableColumn<BookingResponse>[]>(() => {
    this.i18n.currentLang();
    return [
      { field: 'bookingCode', header: this.i18n.translate('bookings.columns.bookingCode'), width: '150px' },
      { field: 'customerName', header: this.i18n.translate('bookings.columns.customer'), width: '200px' },
      { field: 'routeName', header: this.i18n.translate('bookings.columns.routeAndTrip'), width: '220px' },
      { field: 'departureTime', header: this.i18n.translate('bookings.columns.departureTime'), width: '160px' },
      { field: 'totalAmount', header: this.i18n.translate('bookings.columns.totalAmount'), width: '140px', align: 'right' },
      { field: 'status', header: this.i18n.translate('bookings.columns.status'), width: '130px', align: 'center' },
      { field: 'actions', header: this.i18n.translate('bookings.columns.actions'), width: '120px', align: 'center' },
    ];
  });

  readonly statusFilterOptions = computed<SelectOption<BookingStatus>[]>(() => {
    this.i18n.currentLang();
    return [
      { label: this.i18n.translate('common.status.all'), value: undefined as any },
      { label: this.i18n.translate('bookings.status.confirmed'), value: 'CONFIRMED' },
      { label: this.i18n.translate('bookings.status.held'), value: 'HELD' },
      { label: this.i18n.translate('bookings.status.cancelled'), value: 'CANCELLED' },
      { label: this.i18n.translate('bookings.status.expired'), value: 'EXPIRED' },
      { label: this.i18n.translate('bookings.status.completed'), value: 'COMPLETED' },
    ];
  });

  ngOnInit(): void {
    this.loadBookingsList();
  }

  loadBookingsList(): void {
    this.bookingsLoading.set(true);

    const criteria: CrmBookingListCriteria = {
      keyword: this.filterBookingKeyword().trim() || undefined,
      status: this.filterBookingStatus() || undefined,
      fromDate: this.filterBookingFromDate() || undefined,
      toDate: this.filterBookingToDate() || undefined,
      page: this.bookingsPage(),
      size: this.bookingsSize(),
      sort: this.bookingsSort,
    };

    this.bookingService.searchBookings(criteria).subscribe({
      next: (res) => {
        this.bookingsList.set(res.data?.items || []);
        this.bookingsTotal.set(res.data?.pagination?.totalElements || 0);
        this.bookingsLoading.set(false);
      },
      error: (err) => {
        this.bookingsLoading.set(false);
        const msg = err.error?.message || this.i18n.translate('bookings.messages.loadBookingsError');
        this.notification.error(msg);
      },
    });
  }

  onBookingsTableLazyLoad(event: TableLazyLoadEvent): void {
    const pageIndex = Math.floor(event.first / event.rows);
    this.bookingsPage.set(pageIndex);
    this.bookingsSize.set(event.rows);

    if (event.sortField) {
      const order = event.sortOrder === 1 ? 'asc' : 'desc';
      this.bookingsSort = `${event.sortField},${order}`;
    }

    this.loadBookingsList();
  }

  onSearchBookingKeywordChange(val: string): void {
    this.filterBookingKeyword.set(val);
    this.bookingsPage.set(0);
    this.loadBookingsList();
  }

  resetBookingFilters(): void {
    this.filterBookingKeyword.set('');
    this.filterBookingStatus.set(null);
    this.filterBookingFromDate.set('');
    this.filterBookingToDate.set('');
    this.bookingsPage.set(0);
    this.loadBookingsList();
  }

  readonly detailDialogInitialTab = signal<'OVERVIEW' | 'TICKETS'>('OVERVIEW');

  openBookingDetail(booking: BookingResponse): void {
    this.detailDialogInitialTab.set('OVERVIEW');
    this.selectedBookingDetail.set(booking);
    this.detailDialogVisible.set(true);

    this.detailLoading.set(true);
    this.bookingService.getBookingDetail(booking.id).subscribe({
      next: (res) => {
        this.selectedBookingDetail.set(res.data);
        this.detailLoading.set(false);
      },
      error: () => {
        this.detailLoading.set(false);
      },
    });
  }

  openBookingTickets(booking: BookingResponse): void {
    this.detailDialogInitialTab.set('TICKETS');
    this.selectedBookingDetail.set(booking);
    this.detailDialogVisible.set(true);

    this.detailLoading.set(true);
    this.bookingService.getBookingDetail(booking.id).subscribe({
      next: (res) => {
        this.selectedBookingDetail.set(res.data);
        this.detailLoading.set(false);
      },
      error: () => {
        this.detailLoading.set(false);
      },
    });
  }

  openCancelBookingModal(booking: BookingResponse): void {
    this.bookingToCancel.set(booking);
    this.cancelReasonInput.set('');
    this.cancelModalVisible.set(true);
  }

  submitCancelBooking(): void {
    const b = this.bookingToCancel();
    const reason = this.cancelReasonInput().trim();

    if (!b) return;

    if (!reason) {
      this.notification.warning(this.i18n.translate('bookings.validation.cancelReasonRequired'));
      return;
    }

    this.cancelLoading.set(true);
    this.bookingService.cancelBooking(b.id, reason).subscribe({
      next: () => {
        this.cancelLoading.set(false);
        this.cancelModalVisible.set(false);
        this.notification.success(this.i18n.translate('bookings.messages.cancelSuccess'));

        this.loadBookingsList();

        if (this.selectedBookingDetail()?.id === b.id) {
          this.detailDialogVisible.set(false);
        }
      },
      error: (err) => {
        this.cancelLoading.set(false);
        const msg =
          err.error?.message || this.i18n.translate('bookings.messages.cancelError');
        this.notification.error(msg);
      },
    });
  }

  canCancelBooking(booking: BookingResponse): boolean {
    return (
      this.canManage() &&
      booking.status !== 'CANCELLED' &&
      booking.status !== 'EXPIRED' &&
      booking.status !== 'COMPLETED'
    );
  }

  openCounterPayModal(booking: BookingResponse): void {
    this.bookingToPay.set(booking);
    this.counterPayMethod.set('CASH');
    this.counterReceiptInput.set('');
    this.counterBankRefInput.set('');
    this.counterNoteInput.set('');
    this.counterPayModalVisible.set(true);
  }

  submitCounterPay(): void {
    const b = this.bookingToPay();
    if (!b) return;

    this.counterPayLoading.set(true);
    if (this.counterPayMethod() === 'CASH') {
      this.bookingService
        .processCounterPayment({
          bookingId: b.id,
          receiptNumber: this.counterReceiptInput().trim() || undefined,
          note: this.counterNoteInput().trim() || undefined,
        })
        .subscribe({
          next: () => {
            this.counterPayLoading.set(false);
            this.counterPayModalVisible.set(false);
            this.notification.success('Thu tiền mặt tại quầy thành công! Vé đã được phát hành.');
            this.loadBookingsList();
            if (this.selectedBookingDetail()?.id === b.id) {
              this.detailDialogVisible.set(false);
            }
          },
          error: (err) => {
            this.counterPayLoading.set(false);
            this.notification.error(err.error?.message || 'Không thể ghi nhận thu tiền tại quầy');
          },
        });
    } else {
      const bankRef = this.counterBankRefInput().trim();
      if (!bankRef) {
        this.counterPayLoading.set(false);
        this.notification.warning('Vui lòng nhập mã tham chiếu giao dịch chuyển khoản VietQR');
        return;
      }
      this.bookingService
        .confirmVietQrPayment({
          bookingId: b.id,
          transferredAmount: b.totalAmount,
          bankTransactionReference: bankRef,
          note: this.counterNoteInput().trim() || undefined,
        })
        .subscribe({
          next: () => {
            this.counterPayLoading.set(false);
            this.counterPayModalVisible.set(false);
            this.notification.success('Xác nhận chuyển khoản VietQR thành công! Vé đã được phát hành.');
            this.loadBookingsList();
            if (this.selectedBookingDetail()?.id === b.id) {
              this.detailDialogVisible.set(false);
            }
          },
          error: (err) => {
            this.counterPayLoading.set(false);
            this.notification.error(err.error?.message || 'Không thể xác nhận giao dịch VietQR');
          },
        });
    }
  }

  openRefundModal(booking: BookingResponse): void {
    this.bookingToRefund.set(booking);
    this.refundAmountInput.set(booking.totalAmount || 0);
    this.refundReasonInput.set('');
    this.refundRefInput.set('');
    this.refundNoteInput.set('');
    this.refundModalVisible.set(true);
  }

  submitRefund(): void {
    const b = this.bookingToRefund();
    const reason = this.refundReasonInput().trim();
    const amount = Number(this.refundAmountInput());

    if (!b) return;
    if (!reason) {
      this.notification.warning('Vui lòng nhập lý do hoàn tiền');
      return;
    }
    if (!amount || amount <= 0) {
      this.notification.warning('Số tiền hoàn phải lớn hơn 0');
      return;
    }

    this.refundLoading.set(true);
    this.bookingService
      .recordManualRefund({
        bookingId: b.id,
        refundAmount: amount,
        reason,
        refundReference: this.refundRefInput().trim() || undefined,
        note: this.refundNoteInput().trim() || undefined,
      })
      .subscribe({
        next: () => {
          this.refundLoading.set(false);
          this.refundModalVisible.set(false);
          this.notification.success('Ghi nhận hoàn tiền thành công! Trạng thái thanh toán đã được cập nhật.');
          this.loadBookingsList();
          if (this.selectedBookingDetail()?.id === b.id) {
            this.detailDialogVisible.set(false);
          }
        },
        error: (err) => {
          this.refundLoading.set(false);
          this.notification.error(err.error?.message || 'Không thể ghi nhận hoàn tiền');
        },
      });
  }
}

