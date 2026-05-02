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
  lastUpdated?: string;
}

export interface RoomPayload {
  code?: string;
  name: string;
  cinemaName: string;
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

  // Temporary mock for UI building until backend returns RoomDTO[]
  mockGetRoomsByCinema(cinemaName: string): Observable<RoomDTO[]> {
    if (!cinemaName) return of([]);
    const mocks: RoomDTO[] = [
      { code: 'R1', name: 'Phòng 1', cinemaName: 'CineGo Hoàn Kiếm', capacity: 150, type: 'STANDARD', status: 'Active', description: 'Phòng 2D tiêu chuẩn', lastUpdated: '2026-05-01' },
      { code: 'R2', name: 'Phòng 2 VIP', cinemaName: 'CineGo Hoàn Kiếm', capacity: 80, type: 'VIP', status: 'Active', description: 'Phòng VIP ghế da', lastUpdated: '2026-05-02' },
      { code: 'IMAX1', name: 'IMAX Laser', cinemaName: 'CineGo Cầu Giấy', capacity: 350, type: 'IMAX', status: 'Active', description: 'Phòng chiếu IMAX lớn nhất', lastUpdated: '2026-04-20' },
      { code: 'R3', name: 'Phòng 3', cinemaName: 'CineGo Cầu Giấy', capacity: 120, type: 'STANDARD', status: 'Maintenance', description: 'Đang bảo trì màn chiếu', lastUpdated: '2026-05-02' }
    ];
    const filtered = mocks.filter(m => m.cinemaName.includes(cinemaName) || cinemaName.includes(m.cinemaName));
    return of(filtered.length > 0 ? filtered : [
      { code: 'A1', name: 'Phòng chiếu 1', cinemaName: cinemaName, capacity: 100, type: 'STANDARD', status: 'Active' },
      { code: 'A2', name: 'Phòng chiếu 2', cinemaName: cinemaName, capacity: 120, type: 'STANDARD', status: 'Active' }
    ]);
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

