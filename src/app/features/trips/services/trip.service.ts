import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse, PageResponse } from '../../../core/models/api-response.model';
import {
  ConflictCheckRequest,
  ConflictCheckResponse,
  CreateTripRequest,
  Trip,
  TripStatus,
  UpdateTripRequest,
  UpdateTripStatusRequest,
} from '../models/trip.model';

@Injectable({
  providedIn: 'root',
})
export class TripService {
  private readonly http = inject(HttpClient);
  private readonly BASE_URL = environment.apiBaseUrl;

  searchTrips(
    page = 0,
    size = 10,
    sort = 'departureTime,asc',
    keyword?: string,
    routeId?: string,
    vehicleId?: string,
    driverId?: string,
    status?: TripStatus,
    fromDate?: string,
    toDate?: string
  ): Observable<PageResponse<Trip>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (sort) params = params.set('sort', sort);
    if (keyword?.trim()) params = params.set('keyword', keyword.trim());
    if (routeId) params = params.set('routeId', routeId);
    if (vehicleId) params = params.set('vehicleId', vehicleId);
    if (driverId) params = params.set('driverId', driverId);
    if (status) params = params.set('status', status);
    if (fromDate) params = params.set('fromDate', fromDate);
    if (toDate) params = params.set('toDate', toDate);

    return this.http.get<PageResponse<Trip>>(`${this.BASE_URL}/trips`, { params });
  }

  getTripById(id: string): Observable<ApiResponse<Trip>> {
    return this.http.get<ApiResponse<Trip>>(`${this.BASE_URL}/trips/${id}`);
  }

  createTrip(payload: CreateTripRequest): Observable<ApiResponse<Trip>> {
    return this.http.post<ApiResponse<Trip>>(`${this.BASE_URL}/trips`, payload);
  }

  updateTrip(id: string, payload: UpdateTripRequest): Observable<ApiResponse<Trip>> {
    return this.http.put<ApiResponse<Trip>>(`${this.BASE_URL}/trips/${id}`, payload);
  }

  updateStatus(id: string, payload: UpdateTripStatusRequest): Observable<ApiResponse<Trip>> {
    return this.http.patch<ApiResponse<Trip>>(`${this.BASE_URL}/trips/${id}/status`, payload);
  }

  checkConflict(payload: ConflictCheckRequest): Observable<ApiResponse<ConflictCheckResponse>> {
    return this.http.post<ApiResponse<ConflictCheckResponse>>(`${this.BASE_URL}/trips/check-conflict`, payload);
  }
}
