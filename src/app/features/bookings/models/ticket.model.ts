export type TicketStatus = 'ISSUED' | 'CHECKED_IN' | 'CANCELLED';

export interface TicketItem {
  id: string;
  ticketCode: string;
  bookingId?: string;
  bookingCode: string;
  seatCode: string;
  passengerName: string;
  passengerPhone?: string;
  pickupStopName?: string;
  dropoffStopName?: string;
  price: number;
  status: TicketStatus;
  qrCodeData: string;
  issuedAt: string;
  checkedInAt?: string;
  tripCode?: string;
  routeName?: string;
  vehiclePlateNumber?: string;
  departureTime?: string;
}

export interface BookingPaymentInfo {
  id: string;
  bookingId: string;
  bookingCode: string;
  paymentMethod: string;
  gatewayProvider?: string;
  status: string;
  amount: number;
  transactionCode: string;
  paidAt?: string;
  receivedBy?: string;
  note?: string;
}

export interface PaymentAuditLog {
  id: string;
  paymentId: string;
  bookingId: string;
  action: string;
  fromStatus?: string;
  toStatus: string;
  amount: number;
  performedBy: string;
  referenceCode?: string;
  reason?: string;
  createdAt: string;
}

export interface CounterPaymentRequest {
  bookingId: string;
  receiptNumber?: string;
  note?: string;
}

export interface VietQrConfirmRequest {
  bookingId: string;
  transferredAmount: number;
  bankTransactionReference: string;
  note?: string;
}

export interface ManualRefundRequest {
  bookingId: string;
  refundAmount: number;
  reason: string;
  refundReference?: string;
  note?: string;
}

