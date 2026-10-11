import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  OnDestroy,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// PrimeNG
import { Dialog } from 'primeng/dialog';

// Shared Components & Directives & Pipes
import { PageHeaderComponent, BreadcrumbItem } from '../../../../shared/components/page-header/page-header.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { SelectComponent } from '../../../../shared/components/select/select.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
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
import { RouteService } from '../../../routes/services/route.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { AuthService } from '../../../../core/auth/auth.service';
import {
  BookingResponse,
  BookingStatus,
  ConfirmBookingRequest,
  CrmBookingListCriteria,
  CrmSeatMapItem,
  CrmTripSearchCriteria,
  CrmTripSearchResult,
  CrmTripSeatMap,
  HoldSeatsResponse,
  PassengerItemRequest,
  PaymentMethod,
} from '../../models/booking.model';
import { CrmSeatMapComponent } from '../../components/crm-seat-map/crm-seat-map.component';
import { BookingDetailDialogComponent } from '../../components/booking-detail-dialog/booking-detail-dialog.component';

export type BookingWizardStep = 1 | 2 | 3 | 4 | 5;
export type ActiveTabType = 'CREATE_BOOKING' | 'MANAGE_BOOKINGS';

export interface PassengerFormData {
  seatId: string;
  seatCode: string;
  passengerName: string;
  passengerPhone: string;
  pickupStopId: string | null;
  dropoffStopId: string | null;
}

@Component({
  selector: 'app-booking-management-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Dialog,
    PageHeaderComponent,
    ButtonComponent,
    SelectComponent,
    InputComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    StatusBadgeComponent,
    DataTableComponent,
    TableCellDirective,
    CurrencyVndPipe,
    DateViPipe,
    TranslatePipe,
    CrmSeatMapComponent,
    BookingDetailDialogComponent,
  ],
  templateUrl: './booking-management-page.component.html',
  styleUrl: './booking-management-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingManagementPageComponent implements OnInit, OnDestroy {
  private readonly bookingService = inject(CrmBookingService);
  private readonly routeService = inject(RouteService);
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
      { label: this.i18n.translate('bookings.title') },
    ];
  });

  // TAB HIỆN TẠI (ĐẶT VÉ MỚI HOẶC DANH SÁCH BOOKINGS)
  readonly activeTab = signal<ActiveTabType>('CREATE_BOOKING');

  // ==================== TAB 1: TÌM CHUYẾN & WIZARD ĐẶT VÉ ====================
  readonly selectedDate = signal<string>(this.getTodayDateString());
  readonly selectedRouteId = signal<string | null>(null);
  readonly selectedOriginId = signal<string | null>(null);
  readonly selectedDestinationId = signal<string | null>(null);
  readonly searchKeyword = signal<string>('');

  readonly routeOptions = signal<SelectOption[]>([]);
  readonly locationOptions = signal<SelectOption[]>([]);

  readonly trips = signal<CrmTripSearchResult[]>([]);
  readonly tripsLoading = signal<boolean>(false);
  readonly tripsError = signal<string | null>(null);
  readonly hasSearched = signal<boolean>(false);

  // WIZARD ĐẶT VÉ
  readonly wizardModalVisible = signal<boolean>(false);
  readonly currentStep = signal<BookingWizardStep>(1);
  readonly selectedTrip = signal<CrmTripSearchResult | null>(null);

  // Sơ đồ ghế
  readonly seatMapData = signal<CrmTripSeatMap | null>(null);
  readonly seatMapLoading = signal<boolean>(false);
  readonly seatMapError = signal<string | null>(null);
  readonly selectedSeats = signal<CrmSeatMapItem[]>([]);
  readonly defaultPickupStopId = signal<string | null>(null);
  readonly defaultDropoffStopId = signal<string | null>(null);
  readonly holdNote = signal<string>('');
  readonly isHoldingSeats = signal<boolean>(false);

  // Kết quả giữ ghế & Countdown timer
  readonly holdResult = signal<HoldSeatsResponse | null>(null);
  readonly remainingSeconds = signal<number>(600);
  readonly isHoldExpired = signal<boolean>(false);
  private countdownTimer: ReturnType<typeof setInterval> | null = null;

  // Khách hàng & Hành khách
  readonly customerName = signal<string>('');
  readonly customerPhone = signal<string>('');
  readonly customerEmail = signal<string>('');
  readonly customerFormErrors = signal<{ name?: string; phone?: string; email?: string }>({});

  readonly passengerForms = signal<PassengerFormData[]>([]);
  readonly passengerFormErrors = signal<Record<number, { name?: string; phone?: string }>>({});

  // Thanh toán
  readonly paymentMethod = signal<PaymentMethod>('CASH');
  readonly paymentTransactionCode = signal<string>('');
  readonly paymentNote = signal<string>('');
  readonly bookingFinalNote = signal<string>('');
  readonly isConfirmingBooking = signal<boolean>(false);

  // Kết quả đặt vé
  readonly confirmedBooking = signal<BookingResponse | null>(null);

  // ==================== TAB 2: QUẢN LÝ DANH SÁCH BOOKINGS ====================
  readonly bookingsList = signal<BookingResponse[]>([]);
  readonly bookingsTotal = signal<number>(0);
  readonly bookingsLoading = signal<boolean>(false);
  readonly bookingsPage = signal<number>(0);
  readonly bookingsSize = signal<number>(10);
  private bookingsSort = 'createdAt,desc';

  // Bộ lọc danh sách Bookings
  readonly filterBookingKeyword = signal<string>('');
  readonly filterBookingStatus = signal<BookingStatus | null>(null);
  readonly filterBookingFromDate = signal<string>('');
  readonly filterBookingToDate = signal<string>('');

  // Dialog chi tiết & Hủy đơn
  readonly detailDialogVisible = signal<boolean>(false);
  readonly selectedBookingDetail = signal<BookingResponse | null>(null);
  readonly detailLoading = signal<boolean>(false);

  readonly cancelModalVisible = signal<boolean>(false);
  readonly bookingToCancel = signal<BookingResponse | null>(null);
  readonly cancelReasonInput = signal<string>('');
  readonly cancelLoading = signal<boolean>(false);

  // Cấu hình bảng dữ liệu Bookings
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

  readonly paymentMethodOptions = computed<SelectOption<PaymentMethod>[]>(() => {
    this.i18n.currentLang();
    return [
      { label: this.i18n.translate('bookings.paymentMethods.cash'), value: 'CASH' },
      { label: this.i18n.translate('bookings.paymentMethods.bankTransfer'), value: 'BANK_TRANSFER' },
      { label: this.i18n.translate('bookings.paymentMethods.vietQr'), value: 'VIETQR' },
    ];
  });

  readonly pickupStopOptions = computed<SelectOption[]>(() => {
    const stops = this.seatMapData()?.stops || [];
    return stops
      .filter((s) => s.stopType === 'PICKUP' || s.stopType === 'BOTH')
      .map((s) => ({
        label: `${s.stopName} (+${new Intl.NumberFormat('vi-VN').format(s.extraPrice)}đ)`,
        value: s.routeStopId,
      }));
  });

  readonly dropoffStopOptions = computed<SelectOption[]>(() => {
    const stops = this.seatMapData()?.stops || [];
    return stops
      .filter((s) => s.stopType === 'DROPOFF' || s.stopType === 'BOTH')
      .map((s) => ({
        label: `${s.stopName} (+${new Intl.NumberFormat('vi-VN').format(s.extraPrice)}đ)`,
        value: s.routeStopId,
      }));
  });

  readonly selectedSeatIds = computed<string[]>(() => {
    return this.selectedSeats().map((s) => s.seatId);
  });

  readonly formattedCountdown = computed<string>(() => {
    const sec = this.remainingSeconds();
    if (sec <= 0) return '00:00';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  });

  readonly totalConfirmedPrice = computed<number>(() => {
    return this.holdResult()?.estimatedTotalPrice ?? 0;
  });

  switchTab(tab: ActiveTabType): void {
    this.activeTab.set(tab);
    if (tab === 'MANAGE_BOOKINGS') {
      this.loadBookingsList();
    }
  }

  canCancelBooking(booking: BookingResponse): boolean {
    return (
      this.canManage() &&
      booking.status !== 'CANCELLED' &&
      booking.status !== 'EXPIRED' &&
      booking.status !== 'COMPLETED'
    );
  }

  ngOnInit(): void {
    this.loadFilterOptions();
    this.searchTrips();
    this.loadBookingsList();
  }

  ngOnDestroy(): void {
    this.stopCountdownTimer();
  }

  private getTodayDateString(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  loadFilterOptions(): void {
    this.routeService.searchRoutes(0, 100).subscribe({
      next: (res) => {
        const items = res.data?.items || [];
        const options: SelectOption[] = items.map((r) => ({
          label: `${r.name} (${r.code})`,
          value: r.id,
        }));
        this.routeOptions.set(options);
      },
    });

    this.routeService.getActiveLocations().subscribe({
      next: (res) => {
        const options: SelectOption[] = (res.data || []).map((l) => ({
          label: l.name,
          value: l.id,
        }));
        this.locationOptions.set(options);
      },
    });
  }

  // ==================== QUẢN LÝ DANH SÁCH BOOKINGS (TAB 2) ====================
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

  openBookingDetail(booking: BookingResponse): void {
    this.selectedBookingDetail.set(booking);
    this.detailDialogVisible.set(true);

    // Tải chi tiết đầy đủ với items từ BE
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
    const booking = this.bookingToCancel();
    if (!booking) return;

    this.cancelLoading.set(true);
    const reason = this.cancelReasonInput().trim() || this.i18n.translate('bookings.cancelModal.reasonPlaceholder');

    this.bookingService.cancelBooking(booking.id, reason).subscribe({
      next: (res) => {
        this.cancelLoading.set(false);
        this.cancelModalVisible.set(false);
        this.notification.success(
          this.i18n.translate('bookings.messages.cancelSuccess', { code: booking.bookingCode })
        );

        // Đóng dialog chi tiết nếu đang mở
        this.detailDialogVisible.set(false);

        // Tải lại danh sách booking và tìm chuyến
        this.loadBookingsList();
        this.searchTrips();
      },
      error: (err) => {
        this.cancelLoading.set(false);
        const msg = err.error?.message || this.i18n.translate('bookings.messages.cancelError');
        this.notification.error(msg);
      },
    });
  }

  // ==================== TÌM CHUYẾN & WIZARD (TAB 1) ====================
  searchTrips(): void {
    const date = this.selectedDate();
    if (!date) {
      this.notification.warning(this.i18n.translate('bookings.messages.selectDateWarning'));
      return;
    }

    this.tripsLoading.set(true);
    this.tripsError.set(null);
    this.hasSearched.set(true);

    const criteria: CrmTripSearchCriteria = {
      departureDate: date,
      routeId: this.selectedRouteId() || undefined,
      originLocationId: this.selectedOriginId() || undefined,
      destinationLocationId: this.selectedDestinationId() || undefined,
      keyword: this.searchKeyword() || undefined,
      page: 0,
      size: 50,
      sort: 'departureTime,asc',
    };

    this.bookingService.searchTrips(criteria).subscribe({
      next: (res) => {
        this.trips.set(res.data?.items || []);
        this.tripsLoading.set(false);
      },
      error: (err) => {
        this.tripsLoading.set(false);
        const msg = err.error?.message || this.i18n.translate('bookings.messages.loadTripsError');
        this.tripsError.set(msg);
        this.notification.error(msg);
      },
    });
  }

  resetFilters(): void {
    this.selectedDate.set(this.getTodayDateString());
    this.selectedRouteId.set(null);
    this.selectedOriginId.set(null);
    this.selectedDestinationId.set(null);
    this.searchKeyword.set('');
    this.searchTrips();
  }

  openBookingWizard(trip: CrmTripSearchResult): void {
    this.selectedTrip.set(trip);
    this.currentStep.set(1);
    this.selectedSeats.set([]);
    this.defaultPickupStopId.set(null);
    this.defaultDropoffStopId.set(null);
    this.holdNote.set('');
    this.holdResult.set(null);
    this.isHoldExpired.set(false);
    this.stopCountdownTimer();
    this.confirmedBooking.set(null);

    this.wizardModalVisible.set(true);
    this.loadSeatMapData(trip.tripId);
  }

  loadSeatMapData(tripId: string): void {
    this.seatMapLoading.set(true);
    this.seatMapError.set(null);

    this.bookingService.getTripSeatMap(tripId).subscribe({
      next: (res) => {
        this.seatMapData.set(res.data);
        this.seatMapLoading.set(false);
      },
      error: (err) => {
        this.seatMapLoading.set(false);
        const msg = err.error?.message || this.i18n.translate('bookings.messages.loadSeatMapError');
        this.seatMapError.set(msg);
        this.notification.error(msg);
      },
    });
  }

  onSeatsSelectionChange(seats: CrmSeatMapItem[]): void {
    this.selectedSeats.set(seats);
  }

  proceedToCustomerStep(): void {
    const trip = this.selectedTrip();
    const seats = this.selectedSeats();

    if (!trip || seats.length === 0) {
      this.notification.warning(this.i18n.translate('bookings.messages.selectAtLeastOneSeat'));
      return;
    }

    this.isHoldingSeats.set(true);

    const payload = {
      tripId: trip.tripId,
      seatIds: seats.map((s) => s.seatId),
      pickupStopId: this.defaultPickupStopId() || undefined,
      dropoffStopId: this.defaultDropoffStopId() || undefined,
      note: this.holdNote() || undefined,
    };

    this.bookingService.holdSeats(payload).subscribe({
      next: (res) => {
        this.isHoldingSeats.set(false);
        this.holdResult.set(res.data);
        this.notification.success(res.message || this.i18n.translate('bookings.messages.holdSuccess'));

        this.startCountdownTimer(res.data.expiresAt);

        const passengers: PassengerFormData[] = (res.data.heldSeats || []).map((hs) => ({
          seatId: hs.seatId,
          seatCode: hs.seatNumber,
          passengerName: this.customerName() || '',
          passengerPhone: this.customerPhone() || '',
          pickupStopId: this.defaultPickupStopId(),
          dropoffStopId: this.defaultDropoffStopId(),
        }));
        this.passengerForms.set(passengers);

        this.currentStep.set(2);
      },
      error: (err) => {
        this.isHoldingSeats.set(false);
        const msg =
          err.error?.message || this.i18n.translate('bookings.messages.holdError');
        this.notification.error(msg);

        this.loadSeatMapData(trip.tripId);
        this.selectedSeats.set([]);
      },
    });
  }

  private startCountdownTimer(expiresAtIso: string): void {
    this.stopCountdownTimer();
    const expiryTime = new Date(expiresAtIso).getTime();

    const updateRemaining = () => {
      const now = Date.now();
      const diffSec = Math.max(0, Math.floor((expiryTime - now) / 1000));
      this.remainingSeconds.set(diffSec);

      if (diffSec <= 0) {
        this.isHoldExpired.set(true);
        this.stopCountdownTimer();
        this.notification.error(this.i18n.translate('bookings.messages.holdExpired'));
      }
    };

    updateRemaining();
    this.countdownTimer = setInterval(updateRemaining, 1000);
  }

  private stopCountdownTimer(): void {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
  }

  proceedToPassengerStep(): void {
    if (this.checkHoldExpiration()) return;

    const errors: { name?: string; phone?: string; email?: string } = {};
    const name = this.customerName().trim();
    const phone = this.customerPhone().trim();
    const email = this.customerEmail().trim();

    if (!name) {
      errors.name = this.i18n.translate('bookings.validation.customerNameRequired');
    }
    const phoneRegex = /^(0[3|5|7|8|9])[0-9]{8}$/;
    if (!phone) {
      errors.phone = this.i18n.translate('bookings.validation.phoneRequired');
    } else if (!phoneRegex.test(phone)) {
      errors.phone = this.i18n.translate('bookings.validation.phoneInvalid');
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = this.i18n.translate('bookings.validation.emailInvalid');
    }

    this.customerFormErrors.set(errors);

    if (Object.keys(errors).length > 0) {
      this.notification.warning(this.i18n.translate('bookings.messages.checkCustomerInfo'));
      return;
    }

    const passengers = [...this.passengerForms()];
    if (passengers.length > 0 && !passengers[0].passengerName) {
      passengers[0].passengerName = name;
      passengers[0].passengerPhone = phone;
      this.passengerForms.set(passengers);
    }

    this.currentStep.set(3);
  }

  proceedToReviewStep(): void {
    if (this.checkHoldExpiration()) return;

    const passengers = this.passengerForms();
    const errors: Record<number, { name?: string; phone?: string }> = {};
    let hasError = false;

    passengers.forEach((p, index) => {
      const pErrors: { name?: string; phone?: string } = {};
      if (!p.passengerName || !p.passengerName.trim()) {
        pErrors.name = this.i18n.translate('bookings.validation.passengerNameRequired');
        hasError = true;
      }
      if (p.passengerPhone && !/^(0[3|5|7|8|9])[0-9]{8}$/.test(p.passengerPhone.trim())) {
        pErrors.phone = this.i18n.translate('bookings.validation.passengerPhoneInvalid');
        hasError = true;
      }
      if (Object.keys(pErrors).length > 0) {
        errors[index] = pErrors;
      }
    });

    this.passengerFormErrors.set(errors);

    if (hasError) {
      this.notification.warning(this.i18n.translate('bookings.messages.passengerNameRequiredAll'));
      return;
    }

    this.currentStep.set(4);
  }

  confirmBooking(): void {
    if (this.checkHoldExpiration()) return;

    const hold = this.holdResult();
    if (!hold) {
      this.notification.error(this.i18n.translate('bookings.messages.holdNotFound'));
      return;
    }

    this.isConfirmingBooking.set(true);

    const passengerRequests: PassengerItemRequest[] = this.passengerForms().map((p) => ({
      seatId: p.seatId,
      passengerName: p.passengerName.trim(),
      passengerPhone: p.passengerPhone?.trim() || undefined,
      pickupStopId: p.pickupStopId || undefined,
      dropoffStopId: p.dropoffStopId || undefined,
    }));

    const payload: ConfirmBookingRequest = {
      customerName: this.customerName().trim(),
      customerPhone: this.customerPhone().trim(),
      customerEmail: this.customerEmail().trim() || undefined,
      passengers: passengerRequests,
      payment: {
        method: this.paymentMethod(),
        amount: hold.estimatedTotalPrice,
        transactionCode: this.paymentTransactionCode().trim() || undefined,
        note: this.paymentNote().trim() || undefined,
      },
      note: this.bookingFinalNote().trim() || undefined,
    };

    this.bookingService.confirmBooking(hold.bookingId, payload).subscribe({
      next: (res) => {
        this.isConfirmingBooking.set(false);
        this.stopCountdownTimer();
        this.confirmedBooking.set(res.data);
        this.notification.success(this.i18n.translate('bookings.messages.bookingSuccess'));
        this.currentStep.set(5);

        // Cập nhật lại danh sách chuyến xe và danh sách booking
        this.searchTrips();
        this.loadBookingsList();
      },
      error: (err) => {
        this.isConfirmingBooking.set(false);
        const msg =
          err.error?.message ||
          this.i18n.translate('bookings.messages.confirmError');
        this.notification.error(msg);

        if (err.status === 410 || msg.includes('hết hạn')) {
          this.isHoldExpired.set(true);
        }
      },
    });
  }

  cancelCurrentHold(): void {
    const hold = this.holdResult();
    if (!hold) {
      this.closeWizard();
      return;
    }

    this.bookingService.cancelHold(hold.bookingId).subscribe({
      next: () => {
        this.notification.info(this.i18n.translate('bookings.messages.cancelHoldSuccess'));
        this.closeWizard();
        this.searchTrips();
      },
      error: () => {
        this.closeWizard();
      },
    });
  }

  private checkHoldExpiration(): boolean {
    if (this.isHoldExpired() || this.remainingSeconds() <= 0) {
      this.notification.error(this.i18n.translate('bookings.messages.holdExpiredReselect'));
      this.currentStep.set(1);
      if (this.selectedTrip()) {
        this.loadSeatMapData(this.selectedTrip()!.tripId);
      }
      return true;
    }
    return false;
  }

  closeWizard(): void {
    this.stopCountdownTimer();
    this.wizardModalVisible.set(false);
    this.currentStep.set(1);
    this.holdResult.set(null);
    this.selectedSeats.set([]);
  }

  updatePassengerName(index: number, name: string): void {
    const list = [...this.passengerForms()];
    if (list[index]) {
      list[index].passengerName = name;
      this.passengerForms.set(list);
    }
  }

  updatePassengerPhone(index: number, phone: string): void {
    const list = [...this.passengerForms()];
    if (list[index]) {
      list[index].passengerPhone = phone;
      this.passengerForms.set(list);
    }
  }

  updatePassengerPickup(index: number, stopId: string | null): void {
    const list = [...this.passengerForms()];
    if (list[index]) {
      list[index].pickupStopId = stopId;
      this.passengerForms.set(list);
    }
  }

  updatePassengerDropoff(index: number, stopId: string | null): void {
    const list = [...this.passengerForms()];
    if (list[index]) {
      list[index].dropoffStopId = stopId;
      this.passengerForms.set(list);
    }
  }
}
