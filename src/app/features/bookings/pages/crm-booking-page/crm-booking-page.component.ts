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
import { Router, RouterLink } from '@angular/router';

// PrimeNG
import { Dialog } from 'primeng/dialog';

// Shared Components & Pipes
import { PageHeaderComponent, BreadcrumbItem } from '../../../../shared/components/page-header/page-header.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { SelectComponent } from '../../../../shared/components/select/select.component';
import { DateInputComponent } from '../../../../shared/components/date-input/date-input.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { CurrencyVndPipe } from '../../../../shared/pipes/currency-vnd.pipe';
import { DateViPipe } from '../../../../shared/pipes/date-vi.pipe';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';
import { TranslationService } from '../../../../core/i18n/translation.service';
import { SelectOption } from '../../../../shared/models/select-option.model';

// Services & Models
import { CrmBookingService } from '../../services/crm-booking.service';
import { RouteService } from '../../../routes/services/route.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { AuthService } from '../../../../core/auth/auth.service';
import {
  BookingResponse,
  ConfirmBookingRequest,
  CrmSeatMapItem,
  CrmTripSearchCriteria,
  CrmTripSearchResult,
  CrmTripSeatMap,
  HoldSeatsRequest,
  HoldSeatsResponse,
  PassengerItemRequest,
  PaymentMethod,
} from '../../models/booking.model';
import { CrmSeatMapComponent } from '../../components/crm-seat-map/crm-seat-map.component';

export type BookingWizardStep = 1 | 2 | 3 | 4 | 5;

export interface PassengerFormData {
  seatId: string;
  seatCode: string;
  passengerName: string;
  passengerPhone: string;
  pickupStopId: string | null;
  dropoffStopId: string | null;
}

@Component({
  selector: 'app-crm-booking-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    Dialog,
    PageHeaderComponent,
    ButtonComponent,
    SelectComponent,
    DateInputComponent,
    InputComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    StatusBadgeComponent,
    CurrencyVndPipe,
    DateViPipe,
    TranslatePipe,
    CrmSeatMapComponent,
  ],
  templateUrl: './crm-booking-page.component.html',
  styleUrl: './crm-booking-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrmBookingPageComponent implements OnInit, OnDestroy {
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
      { label: this.i18n.translate('navigation.items.crmBooking') },
    ];
  });

  // TÌM CHUYẾN & BỘ LỌC
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
      .map((s) => {
        const name = s.name || s.stopName || this.i18n.translate('bookings.passengers.pickupLabel');
        const extra = Number(s.extraPrice) > 0
          ? ` (+${new Intl.NumberFormat('vi-VN').format(Number(s.extraPrice))}đ)`
          : '';
        return {
          label: `${name}${extra}`,
          value: s.routeStopId,
        };
      });
  });

  readonly dropoffStopOptions = computed<SelectOption[]>(() => {
    const stops = this.seatMapData()?.stops || [];
    return stops
      .filter((s) => s.stopType === 'DROPOFF' || s.stopType === 'BOTH')
      .map((s) => {
        const name = s.name || s.stopName || this.i18n.translate('bookings.passengers.dropoffLabel');
        const extra = Number(s.extraPrice) > 0
          ? ` (+${new Intl.NumberFormat('vi-VN').format(Number(s.extraPrice))}đ)`
          : '';
        return {
          label: `${name}${extra}`,
          value: s.routeStopId,
        };
      });
  });

  getStopNameById(stopId: string | null | undefined): string {
    if (!stopId) return '';
    const stop = this.seatMapData()?.stops?.find((s) => s.routeStopId === stopId);
    if (!stop) return '';
    return stop.name || stop.stopName || '';
  }

  getVehicleTypeLabel(type: string | undefined | null): string {
    if (!type) return '';
    switch (type.toUpperCase()) {
      case 'LIMOUSINE':
        return this.i18n.translate('fleet.vehicles.types.limousine');
      case 'SLEEPER':
        return this.i18n.translate('fleet.vehicles.types.sleeper');
      case 'SEATER':
        return this.i18n.translate('fleet.vehicles.types.seater');
      default:
        return type;
    }
  }

  readonly selectedSeatIds = computed<string[]>(() => {
    return this.selectedSeats().map((s) => s.seatId);
  });

  readonly formattedCountdown = computed<string>(() => {
    const sec = this.remainingSeconds();
    if (isNaN(sec) || sec <= 0) return '00:00';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  });

  readonly totalConfirmedPrice = computed<number>(() => {
    const hold = this.holdResult();
    const holdAmount =
      hold?.totalEstimatedAmount ??
      hold?.totalAmount ??
      hold?.estimatedTotalPrice ??
      hold?.totalPrice ??
      0;

    if (holdAmount > 0) return holdAmount;

    // Fallback: Tự động tính từ các ghế đã chọn + giá vé chuyến + phụ phí đón/trả
    const trip = this.selectedTrip();
    const basePrice = Number(trip?.basePrice) || 0;
    const seats = this.selectedSeats();
    if (seats.length === 0) return 0;

    let total = 0;
    for (const seat of seats) {
      const seatPrice = Number(seat.calculatedPrice) || (basePrice + (Number(seat.extraPrice) || 0));
      total += seatPrice;
    }

    const stops = this.seatMapData()?.stops || [];
    for (const p of this.passengerForms()) {
      const pStop = stops.find((s) => s.routeStopId === (p.pickupStopId || this.defaultPickupStopId()));
      const dStop = stops.find((s) => s.routeStopId === (p.dropoffStopId || this.defaultDropoffStopId()));
      total += (Number(pStop?.extraPrice) || 0) + (Number(dStop?.extraPrice) || 0);
    }

    return total;
  });

  ngOnInit(): void {
    this.loadFilterOptions();
    this.searchTrips();
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

  searchTrips(): void {
    this.tripsLoading.set(true);
    this.tripsError.set(null);
    this.hasSearched.set(true);

    const criteria: CrmTripSearchCriteria = {
      departureDate: this.selectedDate(),
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

    // Tự động kế thừa ghi chú sang bước thanh toán nếu chưa có
    if (!this.bookingFinalNote() && this.holdNote()) {
      this.bookingFinalNote.set(this.holdNote());
    }

    // Chuyển sang Bước 2: Nhập thông tin người đặt
    this.currentStep.set(2);
  }

  private parseExpiryTime(expStr?: string | null): number {
    if (!expStr) return NaN;
    let time = new Date(expStr).getTime();
    if (!isNaN(time)) return time;

    const normalized = expStr.trim().replace(' ', 'T').replace(/(\.\d{3})\d+/, '$1');
    time = new Date(normalized).getTime();
    return time;
  }

  private startCountdownTimer(expiresAtIso?: string | null): void {
    this.stopCountdownTimer();

    const expStr =
      expiresAtIso ||
      this.holdResult()?.holdExpiresAt ||
      this.holdResult()?.expiresAt;

    let expiryTime = this.parseExpiryTime(expStr);

    if (isNaN(expiryTime)) {
      const fallbackSec = this.holdResult()?.remainingSeconds ?? 600;
      expiryTime = Date.now() + fallbackSec * 1000;
    }

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
    const trip = this.selectedTrip();
    const seats = this.selectedSeats();

    if (!trip || seats.length === 0) {
      this.notification.warning(this.i18n.translate('bookings.messages.selectAtLeastOneSeat'));
      this.currentStep.set(1);
      return;
    }

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

    // Nếu đã giữ ghế trước đó và chưa hết hạn, cập nhật hành khách rồi đi tiếp
    if (this.holdResult() && !this.isHoldExpired()) {
      this.syncPassengerFormsFromCustomer();
      this.currentStep.set(3);
      return;
    }

    this.isHoldingSeats.set(true);

    const payload: HoldSeatsRequest = {
      tripId: trip.tripId,
      seatIds: seats.map((s) => s.seatId),
      customerName: name,
      customerPhone: phone,
      pickupStopId: this.defaultPickupStopId() || undefined,
      dropoffStopId: this.defaultDropoffStopId() || undefined,
      note: this.holdNote().trim() || undefined,
    };

    this.bookingService.holdSeats(payload).subscribe({
      next: (res) => {
        this.isHoldingSeats.set(false);
        this.holdResult.set(res.data);
        this.notification.success(res.message || this.i18n.translate('bookings.messages.holdSuccess'));

        this.startCountdownTimer(res.data.holdExpiresAt || res.data.expiresAt);

        const passengers: PassengerFormData[] = seats.map((seat, idx) => ({
          seatId: seat.seatId,
          seatCode: seat.seatCode,
          passengerName: idx === 0 ? name : '',
          passengerPhone: idx === 0 ? phone : '',
          pickupStopId: this.defaultPickupStopId(),
          dropoffStopId: this.defaultDropoffStopId(),
        }));
        this.passengerForms.set(passengers);

        this.currentStep.set(3);
      },
      error: (err) => {
        this.isHoldingSeats.set(false);
        const msg =
          err.error?.message || this.i18n.translate('bookings.messages.holdError');
        this.notification.error(msg);

        this.loadSeatMapData(trip.tripId);
      },
    });
  }

  private syncPassengerFormsFromCustomer(): void {
    const list = [...this.passengerForms()];
    if (list.length > 0) {
      if (!list[0].passengerName) list[0].passengerName = this.customerName().trim();
      if (!list[0].passengerPhone) list[0].passengerPhone = this.customerPhone().trim();
      list.forEach((p) => {
        if (!p.pickupStopId) p.pickupStopId = this.defaultPickupStopId();
        if (!p.dropoffStopId) p.dropoffStopId = this.defaultDropoffStopId();
      });
      this.passengerForms.set(list);
    }
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
        amount: this.totalConfirmedPrice(),
        transactionCode: this.paymentTransactionCode().trim() || undefined,
        note: this.paymentNote().trim() || undefined,
      },
      note: this.bookingFinalNote().trim() || this.holdNote().trim() || undefined,
    };

    this.bookingService.confirmBooking(hold.bookingId, payload).subscribe({
      next: (res) => {
        this.isConfirmingBooking.set(false);
        this.stopCountdownTimer();
        this.confirmedBooking.set(res.data);
        this.notification.success(this.i18n.translate('bookings.messages.bookingSuccess'));
        this.currentStep.set(5);

        // Cập nhật lại danh sách chuyến xe
        this.searchTrips();
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
    const sec = this.remainingSeconds();
    if (this.isHoldExpired() || isNaN(sec) || sec <= 0) {
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
