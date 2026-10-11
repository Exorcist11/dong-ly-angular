import { SeatType } from '../../fleet/models/fleet.model';

export type SeatOccupancyStatus = 'AVAILABLE' | 'HELD' | 'BOOKED' | 'LOCKED';

export type BookingStatus = 'HELD' | 'CONFIRMED' | 'CANCELLED' | 'EXPIRED' | 'COMPLETED';

export interface CrmTripSearchCriteria {
  departureDate: string; // YYYY-MM-DD
  routeId?: string;
  originLocationId?: string;
  destinationLocationId?: string;
  keyword?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface CrmBookingListCriteria {
  keyword?: string;
  status?: BookingStatus;
  tripId?: string;
  fromDate?: string; // YYYY-MM-DD
  toDate?: string; // YYYY-MM-DD
  page?: number;
  size?: number;
  sort?: string;
}

export interface CrmTripSearchResult {
  tripId: string;
  tripCode: string;
  departureTime: string;
  estimatedArrivalTime: string;
  routeId: string;
  routeName: string;
  originLocationName: string;
  destinationLocationName: string;
  vehicleId: string;
  vehiclePlateNumber: string;
  vehicleTypeName: string;
  totalSeats: number;
  availableSeats: number;
  basePrice: number;
  status: string;
}

export interface CrmSeatMapItem {
  seatId: string;
  seatCode: string;
  floor: number;
  rowIndex: number;
  columnIndex: number;
  seatType: SeatType;
  extraPrice: number;
  calculatedPrice: number;
  occupancyStatus: SeatOccupancyStatus;
  isBookable: boolean;
}

export interface CrmRouteStopItem {
  routeStopId: string;
  stopPointId: string;
  stopName: string;
  address: string;
  sequence: number;
  stopType: 'PICKUP' | 'DROPOFF' | 'BOTH';
  extraPrice: number;
}

export interface CrmTripSeatMap {
  tripId: string;
  tripCode: string;
  departureTime: string;
  routeName: string;
  vehiclePlateNumber: string;
  vehicleTypeName: string;
  totalFloors: number;
  totalRows: number;
  totalColumns: number;
  totalSeats: number;
  availableSeats: number;
  basePrice: number;
  seats: CrmSeatMapItem[];
  stops: CrmRouteStopItem[];
}

export interface HoldSeatsRequest {
  tripId: string;
  seatIds: string[];
  pickupStopId?: string;
  dropoffStopId?: string;
  note?: string;
}

export interface HeldSeatItem {
  seatId: string;
  seatNumber: string;
  floor: number;
  price: number;
}

export interface HoldSeatsResponse {
  bookingId: string;
  bookingCode: string;
  tripId: string;
  tripCode: string;
  status: string;
  expiresAt: string;
  remainingSeconds: number;
  heldSeats: HeldSeatItem[];
  estimatedTotalPrice: number;
}

export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'VIETQR';

export interface PassengerItemRequest {
  seatId: string;
  passengerName: string;
  passengerPhone?: string;
  pickupStopId?: string;
  dropoffStopId?: string;
}

export interface PaymentRequest {
  method: PaymentMethod;
  amount: number;
  transactionCode?: string;
  note?: string;
}

export interface ConfirmBookingRequest {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  passengers: PassengerItemRequest[];
  payment: PaymentRequest;
  note?: string;
}

export interface BookingItemResponse {
  id: string;
  seatId: string;
  seatCode: string;
  passengerName: string;
  passengerPhone?: string;
  pickupStopName?: string;
  dropoffStopName?: string;
  basePrice: number;
  seatExtraPrice: number;
  pickupExtraPrice: number;
  dropoffExtraPrice: number;
  finalPrice: number;
  status: string;
}

export interface BookingResponse {
  id: string;
  bookingCode: string;
  tripId: string;
  tripCode: string;
  routeName: string;
  vehiclePlateNumber: string;
  departureTime: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  channel: string;
  status: string;
  totalAmount: number;
  holdExpiresAt?: string;
  note?: string;
  createdBy: string;
  createdAt: string;
  items: BookingItemResponse[];
}

