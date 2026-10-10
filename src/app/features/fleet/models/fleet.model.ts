/**
 * Mô hình dữ liệu Phương tiện, Sơ đồ ghế và Tài xế (Fleet Management)
 * Tương thích trực tiếp với Spring Boot backend (com.dongly.modules.fleet)
 */

export type VehicleType = 'SLEEPER' | 'LIMOUSINE' | 'SEATER';
export type VehicleStatus = 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE';

export type SeatType = 'STANDARD' | 'VIP' | 'SLEEPER' | 'LUXURY_ROOM';
export type SeatStatus = 'ACTIVE' | 'BLOCKED' | 'INACTIVE';

export type DriverStatus = 'ACTIVE' | 'ON_LEAVE' | 'INACTIVE';

export interface VehicleSummary {
  id: string;
  plateNumber: string;
  vehicleType: VehicleType;
  brand: string;
  model?: string | null;
  manufactureYear?: number | null;
  totalFloors: number;
  totalRows: number;
  totalColumns: number;
  seatRows?: number;
  seatColumns?: number;
  totalSeats: number;
  status: VehicleStatus;
  description?: string | null;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleSeat {
  id: string;
  vehicleId: string;
  seatCode: string;
  floor: number;
  rowIndex: number;
  columnIndex: number;
  seatType: SeatType;
  extraPrice: number;
  status: SeatStatus;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleDetail {
  vehicle: VehicleSummary;
  seats: VehicleSeat[];
}

export interface CreateVehicleRequest {
  plateNumber: string;
  vehicleType: VehicleType;
  brand: string;
  model?: string;
  manufactureYear?: number;
  totalFloors: number;
  totalRows: number;
  totalColumns: number;
  description?: string;
}

export interface UpdateVehicleRequest {
  plateNumber: string;
  vehicleType: VehicleType;
  brand: string;
  model?: string;
  manufactureYear?: number;
  totalFloors: number;
  totalRows: number;
  totalColumns: number;
  description?: string;
}

export interface UpdateVehicleStatusRequest {
  status: VehicleStatus;
}

export interface SeatItemDto {
  seatCode: string;
  floor: number;
  rowIndex: number;
  columnIndex: number;
  seatType: SeatType;
  extraPrice: number;
  status: SeatStatus;
}

export interface ConfigureSeatLayoutRequest {
  totalFloors: number;
  totalRows: number;
  totalColumns: number;
  seats: SeatItemDto[];
}

export interface VehicleSeatLayoutResponse {
  vehicleId: string;
  plateNumber: string;
  totalFloors: number;
  totalRows: number;
  totalColumns: number;
  totalSeats: number;
  seats: VehicleSeat[];
}

export interface Driver {
  id: string;
  code: string;
  fullName: string;
  phone: string;
  licenseNumber: string;
  licenseClass: string;
  licenseExpiryDate?: string | null;
  dateOfBirth?: string | null;
  status: DriverStatus;
  note?: string | null;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDriverRequest {
  code: string;
  fullName: string;
  phone: string;
  licenseNumber: string;
  licenseClass: string;
  licenseExpiryDate?: string | null;
  dateOfBirth?: string | null;
  note?: string;
}

export interface UpdateDriverRequest {
  code: string;
  fullName: string;
  phone: string;
  licenseNumber: string;
  licenseClass: string;
  licenseExpiryDate?: string | null;
  dateOfBirth?: string | null;
  note?: string;
}

export interface UpdateDriverStatusRequest {
  status: DriverStatus;
}
