import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse, PageResponse } from '../../../core/models/api-response.model';
import {
  CommonStatus,
  CreateRouteRequest,
  CreateStopPointRequest,
  LocationItem,
  RouteDetail,
  RouteSummary,
  StopPoint,
  UpdateRouteRequest,
  UpdateRouteStopsRequest,
  UpdateStatusRequest,
  UpdateStopPointRequest,
} from '../models/route.model';

@Injectable({
  providedIn: 'root',
})
export class RouteService {
  private readonly http = inject(HttpClient);
  private readonly BASE_URL = environment.apiBaseUrl;

  // --- LOCATIONS ---
  getActiveLocations(): Observable<ApiResponse<LocationItem[]>> {
    return this.http.get<ApiResponse<LocationItem[]>>(`${this.BASE_URL}/locations`);
  }

  // --- STOP POINTS ---
  searchStopPoints(
    page = 0,
    size = 20,
    sort = 'createdAt,desc',
    keyword?: string,
    locationId?: string,
    status?: CommonStatus
  ): Observable<PageResponse<StopPoint>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (sort) params = params.set('sort', sort);
    if (keyword?.trim()) params = params.set('keyword', keyword.trim());
    if (locationId) params = params.set('locationId', locationId);
    if (status) params = params.set('status', status);

    return this.http.get<PageResponse<StopPoint>>(`${this.BASE_URL}/stop-points`, { params });
  }

  getStopPointById(id: string): Observable<ApiResponse<StopPoint>> {
    return this.http.get<ApiResponse<StopPoint>>(`${this.BASE_URL}/stop-points/${id}`);
  }

  createStopPoint(payload: CreateStopPointRequest): Observable<ApiResponse<StopPoint>> {
    return this.http.post<ApiResponse<StopPoint>>(`${this.BASE_URL}/stop-points`, payload);
  }

  updateStopPoint(id: string, payload: UpdateStopPointRequest): Observable<ApiResponse<StopPoint>> {
    return this.http.put<ApiResponse<StopPoint>>(`${this.BASE_URL}/stop-points/${id}`, payload);
  }

  updateStopPointStatus(id: string, status: CommonStatus): Observable<ApiResponse<StopPoint>> {
    const payload: UpdateStatusRequest = { status };
    return this.http.patch<ApiResponse<StopPoint>>(`${this.BASE_URL}/stop-points/${id}/status`, payload);
  }

  // --- ROUTES ---
  searchRoutes(
    page = 0,
    size = 20,
    sort = 'createdAt,desc',
    keyword?: string,
    originLocationId?: string,
    destinationLocationId?: string,
    status?: CommonStatus
  ): Observable<PageResponse<RouteSummary>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (sort) params = params.set('sort', sort);
    if (keyword?.trim()) params = params.set('keyword', keyword.trim());
    if (originLocationId) params = params.set('originLocationId', originLocationId);
    if (destinationLocationId) params = params.set('destinationLocationId', destinationLocationId);
    if (status) params = params.set('status', status);

    return this.http.get<PageResponse<RouteSummary>>(`${this.BASE_URL}/routes`, { params });
  }

  getRouteById(id: string): Observable<ApiResponse<RouteDetail>> {
    return this.http.get<ApiResponse<RouteDetail>>(`${this.BASE_URL}/routes/${id}`);
  }

  createRoute(payload: CreateRouteRequest): Observable<ApiResponse<RouteDetail>> {
    return this.http.post<ApiResponse<RouteDetail>>(`${this.BASE_URL}/routes`, payload);
  }

  updateRoute(id: string, payload: UpdateRouteRequest): Observable<ApiResponse<RouteDetail>> {
    return this.http.put<ApiResponse<RouteDetail>>(`${this.BASE_URL}/routes/${id}`, payload);
  }

  updateRouteStatus(id: string, status: CommonStatus): Observable<ApiResponse<RouteDetail>> {
    const payload: UpdateStatusRequest = { status };
    return this.http.patch<ApiResponse<RouteDetail>>(`${this.BASE_URL}/routes/${id}/status`, payload);
  }

  updateRouteStops(id: string, payload: UpdateRouteStopsRequest): Observable<ApiResponse<RouteDetail>> {
    return this.http.put<ApiResponse<RouteDetail>>(`${this.BASE_URL}/routes/${id}/stops`, payload);
  }
}
