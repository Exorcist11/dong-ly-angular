/**
 * Định nghĩa mô hình dữ liệu Tuyến đường & Điểm đón/trả cho module Quản lý vận tải Đông Lý
 * Đối chiếu trực tiếp với Spring Boot backend (com.dongly.modules.route)
 */

export type CommonStatus = 'ACTIVE' | 'INACTIVE';
export type RouteDirectionType = 'OUTBOUND' | 'RETURN' | 'BOTH';
export type RouteStopType = 'PICKUP' | 'DROPOFF' | 'BOTH';

export interface LocationItem {
  id: string;
  code: string;
  name: string;
  province: string;
  status: CommonStatus;
}

export interface StopPoint {
  id: string;
  code: string;
  name: string;
  locationId: string;
  locationName?: string;
  locationProvince?: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  contactPhone?: string | null;
  status: CommonStatus;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateStopPointRequest {
  code: string;
  name: string;
  locationId: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  contactPhone?: string | null;
}

export interface UpdateStopPointRequest {
  code: string;
  name: string;
  locationId: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  contactPhone?: string | null;
}

export interface RouteStop {
  id?: string;
  stopPointId: string;
  stopPointCode?: string;
  stopPointName?: string;
  address?: string;
  locationName?: string;
  direction: RouteDirectionType;
  sequence: number;
  stopType: RouteStopType;
  extraPrice: number;
  status?: CommonStatus;
}

export interface RouteSummary {
  id: string;
  code: string;
  name: string;
  originLocation: LocationItem;
  destinationLocation: LocationItem;
  distanceKm?: number | null;
  estimatedDurationMinutes?: number | null;
  totalStops: number;
  status: CommonStatus;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface RouteDetail {
  id: string;
  code: string;
  name: string;
  originLocation: LocationItem;
  destinationLocation: LocationItem;
  distanceKm?: number | null;
  estimatedDurationMinutes?: number | null;
  description?: string | null;
  status: CommonStatus;
  stops: RouteStop[];
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateRouteRequest {
  code: string;
  name: string;
  originLocationId: string;
  destinationLocationId: string;
  distanceKm?: number | null;
  estimatedDurationMinutes?: number | null;
  description?: string | null;
  stops?: RouteStopInputDto[];
}

export interface UpdateRouteRequest {
  code: string;
  name: string;
  originLocationId: string;
  destinationLocationId: string;
  distanceKm?: number | null;
  estimatedDurationMinutes?: number | null;
  description?: string | null;
}

export interface RouteStopInputDto {
  id?: string;
  stopPointId: string;
  direction: RouteDirectionType;
  sequence: number;
  stopType: RouteStopType;
  extraPrice?: number;
}

export interface UpdateRouteStopsRequest {
  stops: RouteStopInputDto[];
}

export interface UpdateStatusRequest {
  status: CommonStatus;
}
