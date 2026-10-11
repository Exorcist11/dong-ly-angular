import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse, PageResponse } from '../../../core/models/api-response.model';
import {
  CrmSeatMapItem,
  CrmTripSearchCriteria,
  CrmTripSearchResult,
  CrmTripSeatMap,
  HoldSeatsRequest,
  HoldSeatsResponse,
} from '../models/booking.model';

@Injectable({
  providedIn: 'root',
})
export class CrmBookingService {
  private readonly http = inject(HttpClient);
  private readonly BASE_URL = `${environment.apiBaseUrl}/crm/bookings`;

  /**
   * Tìm kiếm các chuyến xe khả dụng cho CRM theo ngày, tuyến, điểm đón/trả và từ khóa.
   */
  searchTrips(criteria: CrmTripSearchCriteria): Observable<PageResponse<CrmTripSearchResult>> {
    let params = new HttpParams().set('departureDate', criteria.departureDate);

    if (criteria.routeId) params = params.set('routeId', criteria.routeId);
    if (criteria.originLocationId) params = params.set('originLocationId', criteria.originLocationId);
    if (criteria.destinationLocationId) params = params.set('destinationLocationId', criteria.destinationLocationId);
    if (criteria.keyword?.trim()) params = params.set('keyword', criteria.keyword.trim());
    if (criteria.page !== undefined) params = params.set('page', criteria.page.toString());
    if (criteria.size !== undefined) params = params.set('size', criteria.size.toString());
    if (criteria.sort) params = params.set('sort', criteria.sort);

    return this.http.get<PageResponse<CrmTripSearchResult>>(`${this.BASE_URL}/trips/search`, { params });
  }

  /**
   * Lấy sơ đồ lưới ghế thời gian thực của chuyến xe (AVAILABLE, HELD, BOOKED, LOCKED).
   */
  getTripSeatMap(tripId: string): Observable<ApiResponse<CrmTripSeatMap>> {
    return this.http.get<ApiResponse<CrmTripSeatMap>>(`${this.BASE_URL}/trips/${tripId}/seat-map`);
  }

  /**
   * Giữ 1 hoặc nhiều ghế tạm thời (mặc định 10 phút) có bảo vệ khóa chống race condition.
   */
  holdSeats(payload: HoldSeatsRequest): Observable<ApiResponse<HoldSeatsResponse>> {
    return this.http.post<ApiResponse<HoldSeatsResponse>>(`${this.BASE_URL}/hold`, payload);
  }

  /**
   * Xác nhận đơn đặt vé, ghi nhận thanh toán và phát hành vé điện tử.
   */
  confirmBooking(
    bookingId: string,
    payload: import('../models/booking.model').ConfirmBookingRequest
  ): Observable<ApiResponse<import('../models/booking.model').BookingResponse>> {
    return this.http.post<ApiResponse<import('../models/booking.model').BookingResponse>>(
      `${this.BASE_URL}/${bookingId}/confirm`,
      payload
    );
  }

  /**
   * Hủy giữ ghế chủ động trước khi hết hạn.
   */
  cancelHold(bookingId: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.BASE_URL}/${bookingId}/cancel-hold`, {});
  }

  /**
   * Tra cứu danh sách đơn đặt vé CRM phân trang và bộ lọc.
   */
  searchBookings(criteria: import('../models/booking.model').CrmBookingListCriteria): Observable<PageResponse<import('../models/booking.model').BookingResponse>> {
    let params = new HttpParams();

    if (criteria.keyword?.trim()) params = params.set('keyword', criteria.keyword.trim());
    if (criteria.status) params = params.set('status', criteria.status);
    if (criteria.tripId) params = params.set('tripId', criteria.tripId);
    if (criteria.fromDate) params = params.set('fromDate', criteria.fromDate);
    if (criteria.toDate) params = params.set('toDate', criteria.toDate);
    if (criteria.page !== undefined) params = params.set('page', criteria.page.toString());
    if (criteria.size !== undefined) params = params.set('size', criteria.size.toString());
    if (criteria.sort) params = params.set('sort', criteria.sort);

    return this.http.get<PageResponse<import('../models/booking.model').BookingResponse>>(`${this.BASE_URL}`, { params });
  }

  /**
   * Lấy chi tiết đơn đặt vé theo ID.
   */
  getBookingDetail(id: string): Observable<ApiResponse<import('../models/booking.model').BookingResponse>> {
    return this.http.get<ApiResponse<import('../models/booking.model').BookingResponse>>(`${this.BASE_URL}/${id}`);
  }

  /**
   * Hủy đơn đặt vé theo quy định (không tự động hoàn tiền).
   */
  cancelBooking(id: string, reason?: string): Observable<ApiResponse<import('../models/booking.model').BookingResponse>> {
    let params = new HttpParams();
    if (reason?.trim()) {
      params = params.set('reason', reason.trim());
    }
    return this.http.post<ApiResponse<import('../models/booking.model').BookingResponse>>(`${this.BASE_URL}/${id}/cancel`, {}, { params });
  }

  /**
   * Lấy danh sách vé điện tử kèm mã QR của đơn đặt vé.
   */
  getBookingTickets(bookingId: string): Observable<ApiResponse<import('../models/ticket.model').TicketItem[]>> {
    return this.http.get<ApiResponse<import('../models/ticket.model').TicketItem[]>>(`${this.BASE_URL}/${bookingId}/tickets`);
  }

  /**
   * Lấy thông tin thanh toán của đơn đặt vé.
   */
  getBookingPayment(bookingId: string): Observable<ApiResponse<import('../models/ticket.model').BookingPaymentInfo>> {
    return this.http.get<ApiResponse<import('../models/ticket.model').BookingPaymentInfo>>(`${this.BASE_URL}/${bookingId}/payment`);
  }

  /**
   * Tra cứu chi tiết vé theo mã vé (Ticket Code).
   */
  getTicketByCode(ticketCode: string): Observable<ApiResponse<import('../models/ticket.model').TicketItem>> {
    return this.http.get<ApiResponse<import('../models/ticket.model').TicketItem>>(`${environment.apiBaseUrl}/crm/tickets/${ticketCode}`);
  }

  /**
   * Làm mới mã JWT QR cho vé điện tử khi hết hạn.
   */
  refreshTicketQr(ticketCode: string): Observable<ApiResponse<import('../models/ticket.model').TicketItem>> {
    return this.http.post<ApiResponse<import('../models/ticket.model').TicketItem>>(`${environment.apiBaseUrl}/crm/tickets/${ticketCode}/refresh-qr`, {});
  }

  /**
   * Tra cứu vé điện tử công khai cho khách hàng theo mã đơn và số điện thoại.
   */
  lookupCustomerTickets(bookingCode: string, phone: string): Observable<ApiResponse<import('../models/ticket.model').TicketItem[]>> {
    const params = new HttpParams().set('bookingCode', bookingCode).set('phone', phone);
    return this.http.get<ApiResponse<import('../models/ticket.model').TicketItem[]>>(`${environment.apiBaseUrl}/public/tickets/lookup`, { params });
  }

  /**
   * Thu tiền mặt tại quầy cho đơn giữ chỗ.
   */
  processCounterPayment(payload: import('../models/ticket.model').CounterPaymentRequest): Observable<ApiResponse<import('../models/booking.model').BookingResponse>> {
    return this.http.post<ApiResponse<import('../models/booking.model').BookingResponse>>(`${environment.apiBaseUrl}/payments/counter/pay`, payload);
  }

  /**
   * Xác nhận thanh toán VietQR tĩnh sau khi đối soát sao kê ngân hàng.
   */
  confirmVietQrPayment(payload: import('../models/ticket.model').VietQrConfirmRequest): Observable<ApiResponse<import('../models/booking.model').BookingResponse>> {
    return this.http.post<ApiResponse<import('../models/booking.model').BookingResponse>>(`${environment.apiBaseUrl}/payments/counter/vietqr/confirm`, payload);
  }

  /**
   * Ghi nhận hoàn tiền thủ công cho đơn đã hủy có kiểm soát.
   */
  recordManualRefund(payload: import('../models/ticket.model').ManualRefundRequest): Observable<ApiResponse<import('../models/ticket.model').PaymentAuditLog>> {
    return this.http.post<ApiResponse<import('../models/ticket.model').PaymentAuditLog>>(`${environment.apiBaseUrl}/payments/counter/refund`, payload);
  }

  /**
   * Lấy lịch sử nhật ký kiểm toán thanh toán & hoàn tiền của đơn vé.
   */
  getPaymentAuditLogs(bookingId: string): Observable<ApiResponse<import('../models/ticket.model').PaymentAuditLog[]>> {
    return this.http.get<ApiResponse<import('../models/ticket.model').PaymentAuditLog[]>>(`${environment.apiBaseUrl}/payments/counter/booking/${bookingId}/audits`);
  }
}

