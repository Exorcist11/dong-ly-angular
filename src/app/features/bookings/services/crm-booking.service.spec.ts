import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CrmBookingService } from './crm-booking.service';
import { environment } from '../../../../environments/environment';
import {
  CrmTripSearchCriteria,
  CrmTripSearchResult,
  CrmTripSeatMap,
  HoldSeatsRequest,
  HoldSeatsResponse,
} from '../models/booking.model';

describe('CrmBookingService', () => {
  let service: CrmBookingService;
  let httpMock: HttpTestingController;
  const BASE_URL = `${environment.apiBaseUrl}/crm/bookings`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CrmBookingService],
    });
    service = TestBed.inject(CrmBookingService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('nên khởi tạo thành công CrmBookingService', () => {
    expect(service).toBeTruthy();
  });

  it('searchTrips: nên gửi đúng params departureDate và keyword', () => {
    const criteria: CrmTripSearchCriteria = {
      departureDate: '2026-10-15',
      keyword: '36B-028.68',
      page: 0,
      size: 20,
    };

    service.searchTrips(criteria).subscribe((res) => {
      expect(res.data.items.length).toBe(1);
      expect(res.data.items[0].tripCode).toBe('TRP-01');
    });

    const req = httpMock.expectOne((r) => r.url === `${BASE_URL}/trips/search`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('departureDate')).toBe('2026-10-15');
    expect(req.request.params.get('keyword')).toBe('36B-028.68');

    req.flush({
      success: true,
      message: 'OK',
      data: {
        items: [
          {
            tripId: 'trip-1',
            tripCode: 'TRP-01',
            departureTime: '2026-10-15T07:00:00Z',
            estimatedArrivalTime: '2026-10-15T10:00:00Z',
            routeName: 'Hà Nội - Thanh Hóa',
            availableSeats: 20,
            totalSeats: 22,
            basePrice: 250000,
          } as CrmTripSearchResult,
        ],
        pagination: { page: 0, size: 20, totalElements: 1, totalPages: 1 },
      },
    });
  });

  it('getTripSeatMap: nên gọi đúng GET /crm/bookings/trips/{tripId}/seat-map', () => {
    const tripId = 'trip-uuid-123';

    service.getTripSeatMap(tripId).subscribe((res) => {
      expect(res.data.tripCode).toBe('TRP-01');
      expect(res.data.seats.length).toBe(2);
    });

    const req = httpMock.expectOne(`${BASE_URL}/trips/${tripId}/seat-map`);
    expect(req.request.method).toBe('GET');

    req.flush({
      success: true,
      message: 'OK',
      data: {
        tripId,
        tripCode: 'TRP-01',
        totalFloors: 2,
        seats: [
          { seatId: 's1', seatCode: 'A01', occupancyStatus: 'AVAILABLE', isBookable: true },
          { seatId: 's2', seatCode: 'A02', occupancyStatus: 'HELD', isBookable: false },
        ],
      } as unknown as CrmTripSeatMap,
    });
  });

  it('holdSeats: nên gửi POST /crm/bookings/hold và trả về kết quả giữ ghế', () => {
    const payload: HoldSeatsRequest = {
      tripId: 'trip-uuid-123',
      seatIds: ['seat-1', 'seat-2'],
      note: 'Khách hotline',
    };

    service.holdSeats(payload).subscribe((res) => {
      expect(res.data.bookingCode).toBe('DL-261011-ABCD');
      expect(res.data.status).toBe('HOLDING');
      expect(res.data.remainingSeconds).toBe(600);
    });

    const req = httpMock.expectOne(`${BASE_URL}/hold`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);

    req.flush({
      success: true,
      message: 'Giữ ghế thành công',
      data: {
        bookingId: 'b-1',
        bookingCode: 'DL-261011-ABCD',
        tripId: 'trip-uuid-123',
        tripCode: 'TRP-01',
        status: 'HOLDING',
        expiresAt: '2026-10-11T10:30:00Z',
        remainingSeconds: 600,
        heldSeats: [],
        estimatedTotalPrice: 500000,
      } as HoldSeatsResponse,
    });
  });

  it('cancelHold: nên gửi POST /crm/bookings/{bookingId}/cancel-hold', () => {
    const bookingId = 'booking-uuid-456';

    service.cancelHold(bookingId).subscribe((res) => {
      expect(res.success).toBe(true);
    });

    const req = httpMock.expectOne(`${BASE_URL}/${bookingId}/cancel-hold`);
    expect(req.request.method).toBe('POST');
    req.flush({ success: true, message: 'Hủy giữ ghế thành công' });
  });

  it('confirmBooking: nên gửi POST /crm/bookings/{bookingId}/confirm và nhận BookingResponse', () => {
    const bookingId = 'booking-uuid-789';
    const payload = {
      customerName: 'Nguyễn Văn Nam',
      customerPhone: '0912345678',
      passengers: [{ seatId: 'seat-1', passengerName: 'Nguyễn Văn Nam' }],
      payment: { method: 'CASH' as const, amount: 250000 },
    };

    service.confirmBooking(bookingId, payload).subscribe((res) => {
      expect(res.data.bookingCode).toBe('DL-CONFIRMED-01');
      expect(res.data.status).toBe('CONFIRMED');
      expect(res.data.items.length).toBe(1);
    });

    const req = httpMock.expectOne(`${BASE_URL}/${bookingId}/confirm`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);

    req.flush({
      success: true,
      message: 'Xác nhận đơn thành công',
      data: {
        id: bookingId,
        bookingCode: 'DL-CONFIRMED-01',
        tripCode: 'TRP-01',
        status: 'CONFIRMED',
        totalAmount: 250000,
        items: [{ id: 'item-1', seatCode: 'A01', passengerName: 'Nguyễn Văn Nam', finalPrice: 250000, status: 'CONFIRMED' }],
      },
    });
  });

  it('searchBookings: nên gửi GET /crm/bookings với đầy đủ params phân trang & bộ lọc', () => {
    service
      .searchBookings({
        keyword: 'DL-123',
        status: 'CONFIRMED',
        fromDate: '2026-10-01',
        toDate: '2026-10-31',
        page: 1,
        size: 15,
        sort: 'createdAt,desc',
      })
      .subscribe((res) => {
        expect(res.data.items.length).toBe(1);
        expect(res.data.pagination.totalElements).toBe(10);
      });

    const req = httpMock.expectOne((r) => r.url === BASE_URL);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('keyword')).toBe('DL-123');
    expect(req.request.params.get('status')).toBe('CONFIRMED');
    expect(req.request.params.get('fromDate')).toBe('2026-10-01');
    expect(req.request.params.get('toDate')).toBe('2026-10-31');
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('size')).toBe('15');
    expect(req.request.params.get('sort')).toBe('createdAt,desc');

    req.flush({
      success: true,
      data: {
        items: [{ id: 'b-1', bookingCode: 'DL-123', status: 'CONFIRMED' }],
        pagination: { page: 1, size: 15, totalElements: 10, totalPages: 1 },
      },
    });
  });

  it('getBookingDetail: nên gửi GET /crm/bookings/{id}', () => {
    const bookingId = 'b-uuid-999';

    service.getBookingDetail(bookingId).subscribe((res) => {
      expect(res.data.id).toBe(bookingId);
      expect(res.data.bookingCode).toBe('DL-DETAIL-999');
    });

    const req = httpMock.expectOne(`${BASE_URL}/${bookingId}`);
    expect(req.request.method).toBe('GET');

    req.flush({
      success: true,
      data: {
        id: bookingId,
        bookingCode: 'DL-DETAIL-999',
        status: 'CONFIRMED',
      },
    });
  });

  it('cancelBooking: nên gửi POST /crm/bookings/{id}/cancel với cancelReason', () => {
    const bookingId = 'b-uuid-999';
    const reason = 'Khách đổi kế hoạch đột xuất';

    service.cancelBooking(bookingId, reason).subscribe((res) => {
      expect(res.data.status).toBe('CANCELLED');
    });

    const req = httpMock.expectOne((r) => r.url === `${BASE_URL}/${bookingId}/cancel`);
    expect(req.request.method).toBe('POST');
    expect(req.request.params.get('reason')).toBe(reason);

    req.flush({
      success: true,
      message: 'Hủy đơn thành công',
      data: {
        id: bookingId,
        status: 'CANCELLED',
      },
    });
  });
});
