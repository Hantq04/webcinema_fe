import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { ApiService } from './api.service';

export interface RoomDTO {
  code: string;
  name: string;
  cinemaName: string;
  capacity: number;
  type: string;
  description?: string;
  status?: string;
  isActive?: boolean;
  lastUpdated?: string;
}

export interface RoomPayload {
  code?: string;
  name: string;
  capacity: number;
  type: string;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private readonly http = inject(HttpClient);
  private readonly apiService = inject(ApiService);

  getRoomsByCinema(cinemaName: string): Observable<string[]> {
    return this.http.get<any>(this.apiService.apiUrl(`/api/v1/room/get-by-cinema?cinemaName=${cinemaName}`)).pipe(
      map(response => {
        if (response && response.data && Array.isArray(response.data)) {
          return response.data as string[];
        }
        if (Array.isArray(response)) {
          return response as string[];
        }
        return [];
      }),
      catchError((err) => {
        console.error('Error fetching rooms', err);
        return of([]);
      })
    );
  }

  getRoomsByCinemaDetail(cinemaName: string): Observable<RoomDTO[]> {
    return this.http.get<any>(this.apiService.apiUrl(`/api/v1/room/get-by-cinema-detail?cinemaName=${cinemaName}`)).pipe(
      map(response => response.data || []),
      catchError(() => of([]))
    );
  }

  // Temporary mock for UI building until backend provides RoomDTO[]
  mockGetRoomsByCinema(cinemaName: string): Observable<RoomDTO[]> {
    return this.getRoomsByCinemaDetail(cinemaName);
  }

  saveRoom(payload: RoomPayload): Observable<any> {
    return this.http.post<any>(this.apiService.apiUrl('/api/v1/room/save'), payload);
  }

  updateRoom(payload: RoomPayload): Observable<any> {
    return this.http.put<any>(this.apiService.apiUrl('/api/v1/room/update'), payload);
  }

  deleteRoom(code: string): Observable<any> {
    return this.http.delete<any>(this.apiService.apiUrl(`/api/v1/room/delete?code=${code}`));
  }
}

