export type TripStatus = 'SCHEDULED' | 'READY' | 'DEPARTED' | 'COMPLETED' | 'CANCELLED';

export interface Trip {
  id: string;
  code: string;
  tripRunId?: string | null;
  tripRunCode?: string | null;

  // Route info
  routeId: string;
  routeCode?: string;
  routeName?: string;
  distanceKm?: number;
  estimatedDurationMinutes?: number;

  // Vehicle info
  vehicleId: string;
  vehiclePlateNumber?: string;
  vehicleType?: string;
  totalSeats?: number;

  // Driver & Assistant
  driverId: string;
  driverName?: string;
  driverPhone?: string;

  assistantDriverId: string;
  assistantDriverName?: string;
  assistantDriverPhone?: string;

  // Schedule & Price
  departureTime: string;          // ISO string
  estimatedArrivalTime: string;   // ISO string
  actualDepartureTime?: string | null;
  actualArrivalTime?: string | null;
  basePrice: number;
  status: TripStatus;
  note?: string | null;

  // Audit
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTripRequest {
  code?: string;
  tripRunId?: string | null;
  routeId: string;
  vehicleId: string;
  driverId: string;
  assistantDriverId: string;
  departureTime: string; // ISO string
  estimatedArrivalTime?: string;
  basePrice: number;
  status?: TripStatus;
  note?: string;
}

export interface UpdateTripRequest {
  vehicleId: string;
  driverId: string;
  assistantDriverId: string;
  departureTime: string;
  estimatedArrivalTime?: string;
  basePrice: number;
  note?: string;
}

export interface UpdateTripStatusRequest {
  status: TripStatus;
  actualDepartureTime?: string;
  actualArrivalTime?: string;
  note?: string;
}

export interface ConflictCheckRequest {
  tripId?: string | null;
  vehicleId?: string | null;
  driverId?: string | null;
  assistantDriverId?: string | null;
  departureTime: string;
  estimatedArrivalTime: string;
}

export interface ConflictCheckResponse {
  hasConflict: boolean;
  vehicleConflict: boolean;
  driverConflict: boolean;
  assistantDriverConflict: boolean;
  conflictMessages: string[];
}
