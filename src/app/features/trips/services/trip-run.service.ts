import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse, PageResponse } from '../../../core/models/api-response.model';
import {
  CreateTripRunRequest,
  GenerateTripsPreviewResponse,
  GenerateTripsRequest,
  GenerateTripsResultResponse,
  TripRun,
  TripRunStatus,
  UpdateTripRunRequest,
  UpdateTripRunStatusRequest,
} from '../models/trip-run.model';

@Injectable({
  providedIn: 'root',
})
export class TripRunService {
  private readonly http = inject(HttpClient);
  private readonly BASE_URL = environment.apiBaseUrl;

  searchTripRuns(
    page = 0,
    size = 10,
    sort = 'createdAt,desc',
    keyword?: string,
    routeId?: string,
    status?: TripRunStatus
  ): Observable<PageResponse<TripRun>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (sort) params = params.set('sort', sort);
    if (keyword?.trim()) params = params.set('keyword', keyword.trim());
    if (routeId) params = params.set('routeId', routeId);
    if (status) params = params.set('status', status);

    return this.http.get<PageResponse<TripRun>>(`${this.BASE_URL}/trip-runs`, { params });
  }

  getTripRunById(id: string): Observable<ApiResponse<TripRun>> {
    return this.http.get<ApiResponse<TripRun>>(`${this.BASE_URL}/trip-runs/${id}`);
  }

  createTripRun(payload: CreateTripRunRequest): Observable<ApiResponse<TripRun>> {
    return this.http.post<ApiResponse<TripRun>>(`${this.BASE_URL}/trip-runs`, payload);
  }

  updateTripRun(id: string, payload: UpdateTripRunRequest): Observable<ApiResponse<TripRun>> {
    return this.http.put<ApiResponse<TripRun>>(`${this.BASE_URL}/trip-runs/${id}`, payload);
  }

  updateStatus(id: string, status: TripRunStatus): Observable<ApiResponse<TripRun>> {
    const payload: UpdateTripRunStatusRequest = { status };
    return this.http.patch<ApiResponse<TripRun>>(`${this.BASE_URL}/trip-runs/${id}/status`, payload);
  }

  deleteTripRun(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.BASE_URL}/trip-runs/${id}`);
  }

  previewGenerateTrips(payload: GenerateTripsRequest): Observable<ApiResponse<GenerateTripsPreviewResponse>> {
    return this.http.post<ApiResponse<GenerateTripsPreviewResponse>>(
      `${this.BASE_URL}/trips/preview-generate`,
      payload
    );
  }

  executeGenerateTrips(payload: GenerateTripsRequest): Observable<ApiResponse<GenerateTripsResultResponse>> {
    return this.http.post<ApiResponse<GenerateTripsResultResponse>>(
      `${this.BASE_URL}/trips/generate`,
      payload
    );
  }
}
