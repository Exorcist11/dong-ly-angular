import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse, PageResponse } from '../../../core/models/api-response.model';
import {
  ConfigureSeatLayoutRequest,
  CreateDriverRequest,
  CreateVehicleRequest,
  Driver,
  DriverStatus,
  SeatStatus,
  UpdateDriverRequest,
  UpdateDriverStatusRequest,
  UpdateVehicleRequest,
  UpdateVehicleStatusRequest,
  VehicleDetail,
  VehicleSeat,
  VehicleSeatLayoutResponse,
  VehicleStatus,
  VehicleSummary,
  VehicleType,
} from '../models/fleet.model';

@Injectable({
  providedIn: 'root',
})
export class FleetService {
  private readonly http = inject(HttpClient);
  private readonly BASE_URL = environment.apiBaseUrl;

  // ==================== VEHICLES ====================

  searchVehicles(
    page = 0,
    size = 10,
    sort = 'createdAt,desc',
    keyword?: string,
    vehicleType?: VehicleType,
    status?: VehicleStatus
  ): Observable<PageResponse<VehicleSummary>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (sort) params = params.set('sort', sort);
    if (keyword?.trim()) params = params.set('keyword', keyword.trim());
    if (vehicleType) params = params.set('vehicleType', vehicleType);
    if (status) params = params.set('status', status);

    return this.http.get<PageResponse<VehicleSummary>>(`${this.BASE_URL}/vehicles`, { params });
  }

  getVehicleById(id: string): Observable<ApiResponse<VehicleDetail>> {
    return this.http.get<ApiResponse<VehicleDetail>>(`${this.BASE_URL}/vehicles/${id}`);
  }

  createVehicle(payload: CreateVehicleRequest): Observable<ApiResponse<VehicleDetail>> {
    return this.http.post<ApiResponse<VehicleDetail>>(`${this.BASE_URL}/vehicles`, payload);
  }

  updateVehicle(id: string, payload: UpdateVehicleRequest): Observable<ApiResponse<VehicleDetail>> {
    return this.http.put<ApiResponse<VehicleDetail>>(`${this.BASE_URL}/vehicles/${id}`, payload);
  }

  updateVehicleStatus(id: string, status: VehicleStatus): Observable<ApiResponse<VehicleDetail>> {
    const payload: UpdateVehicleStatusRequest = { status };
    return this.http.patch<ApiResponse<VehicleDetail>>(`${this.BASE_URL}/vehicles/${id}/status`, payload);
  }

  deleteVehicle(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.BASE_URL}/vehicles/${id}`);
  }

  // ==================== SEAT LAYOUT ====================

  getSeatLayout(vehicleId: string): Observable<ApiResponse<VehicleSeatLayoutResponse>> {
    return this.http.get<ApiResponse<VehicleSeatLayoutResponse>>(`${this.BASE_URL}/vehicles/${vehicleId}/seats`);
  }

  configureSeatLayout(
    vehicleId: string,
    payload: ConfigureSeatLayoutRequest
  ): Observable<ApiResponse<VehicleSeatLayoutResponse>> {
    return this.http.put<ApiResponse<VehicleSeatLayoutResponse>>(
      `${this.BASE_URL}/vehicles/${vehicleId}/seats`,
      payload
    );
  }

  updateSeatStatus(
    vehicleId: string,
    seatId: string,
    status: SeatStatus
  ): Observable<ApiResponse<VehicleSeat>> {
    return this.http.patch<ApiResponse<VehicleSeat>>(
      `${this.BASE_URL}/vehicles/${vehicleId}/seats/${seatId}/status`,
      { status }
    );
  }

  // ==================== DRIVERS ====================

  searchDrivers(
    page = 0,
    size = 10,
    sort = 'createdAt,desc',
    keyword?: string,
    status?: DriverStatus,
    licenseClass?: string
  ): Observable<PageResponse<Driver>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (sort) params = params.set('sort', sort);
    if (keyword?.trim()) params = params.set('keyword', keyword.trim());
    if (status) params = params.set('status', status);
    if (licenseClass?.trim()) params = params.set('licenseClass', licenseClass.trim());

    return this.http.get<PageResponse<Driver>>(`${this.BASE_URL}/drivers`, { params });
  }

  getDriverById(id: string): Observable<ApiResponse<Driver>> {
    return this.http.get<ApiResponse<Driver>>(`${this.BASE_URL}/drivers/${id}`);
  }

  createDriver(payload: CreateDriverRequest): Observable<ApiResponse<Driver>> {
    return this.http.post<ApiResponse<Driver>>(`${this.BASE_URL}/drivers`, payload);
  }

  updateDriver(id: string, payload: UpdateDriverRequest): Observable<ApiResponse<Driver>> {
    return this.http.put<ApiResponse<Driver>>(`${this.BASE_URL}/drivers/${id}`, payload);
  }

  updateDriverStatus(id: string, status: DriverStatus): Observable<ApiResponse<Driver>> {
    const payload: UpdateDriverStatusRequest = { status };
    return this.http.patch<ApiResponse<Driver>>(`${this.BASE_URL}/drivers/${id}/status`, payload);
  }

  deleteDriver(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.BASE_URL}/drivers/${id}`);
  }
}
