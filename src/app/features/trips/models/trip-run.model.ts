import { SelectOption } from '../../../shared/models/select-option.model';

export type TripRunStatus = 'ACTIVE' | 'INACTIVE';

export interface TripRun {
  id: string;
  code: string;
  name: string;
  routeId: string;
  routeCode?: string;
  routeName?: string;
  estimatedDurationMinutes?: number;
  departureTime: string; // HH:mm:ss
  daysOfWeek: string;    // e.g. "1,2,3,4,5,6,7"
  startDate: string;     // YYYY-MM-DD
  endDate?: string | null;

  defaultVehicleId?: string | null;
  defaultVehiclePlateNumber?: string | null;
  defaultVehicleType?: string | null;

  defaultDriverId?: string | null;
  defaultDriverName?: string | null;
  defaultDriverPhone?: string | null;

  defaultAssistantDriverId?: string | null;
  defaultAssistantDriverName?: string | null;
  defaultAssistantDriverPhone?: string | null;

  basePrice: number;
  status: TripRunStatus;
  note?: string | null;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTripRunRequest {
  code: string;
  name: string;
  routeId: string;
  departureTime: string; // HH:mm:ss
  daysOfWeek: string;
  startDate: string;
  endDate?: string | null;
  defaultVehicleId?: string | null;
  defaultDriverId?: string | null;
  defaultAssistantDriverId?: string | null;
  basePrice: number;
  status?: TripRunStatus;
  note?: string;
}

export interface UpdateTripRunRequest {
  name: string;
  routeId: string;
  departureTime: string;
  daysOfWeek: string;
  startDate: string;
  endDate?: string | null;
  defaultVehicleId?: string | null;
  defaultDriverId?: string | null;
  defaultAssistantDriverId?: string | null;
  basePrice: number;
  status?: TripRunStatus;
  note?: string;
}

export interface UpdateTripRunStatusRequest {
  status: TripRunStatus;
}

export interface GenerateTripsRequest {
  tripRunId?: string | null;
  fromDate: string; // YYYY-MM-DD
  toDate: string;   // YYYY-MM-DD
}

export interface GenerateTripsPreviewItem {
  tripRunId: string;
  tripRunCode: string;
  tripRunName: string;
  targetDate: string;
  dayOfWeek: number;
  departureTime: string;
  estimatedArrivalTime: string;
  routeId?: string;
  routeCode?: string;
  routeName?: string;
  vehiclePlateNumber?: string;
  driverName?: string;
  assistantDriverName?: string;
  alreadyExists: boolean;
  statusText: string;
}

export interface GenerateTripsPreviewResponse {
  totalDatesChecked: number;
  willCreateCount: number;
  alreadyExistsCount: number;
  items: GenerateTripsPreviewItem[];
}

export interface GenerateTripsResultResponse {
  totalDatesChecked: number;
  createdCount: number;
  skippedCount: number;
  message: string;
  createdTripCodes: string[];
}
