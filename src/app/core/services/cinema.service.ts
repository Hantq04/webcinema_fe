import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { ApiService } from './api.service';

export interface CinemaDTO {
  code: string;
  nameOfCinema: string;
  address: string;
  description?: string;
  status?: string;
  totalRooms?: number;
}

export interface CinemaPayload {
  code?: string;
  nameOfCinema: string;
  address: string;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CinemaService {
  private readonly http = inject(HttpClient);
  private readonly apiService = inject(ApiService);

  getAllAddresses(): Observable<string[]> {
    return this.http.get<any>(this.apiService.apiUrl('/api/v1/cinema/get-all-address')).pipe(
      map(response => response.data || []),
      catchError(() => of([]))
    );
  }

  getCinemasByAddress(address: string): Observable<string[]> {
    return this.http.get<any>(this.apiService.apiUrl(`/api/v1/cinema/get-name-by-address?address=${address}`)).pipe(
      map(response => response.data || []),
      catchError(() => of([]))
    );
  }

  // Temporary mock for UI building until backend returns CinemaDTO[]
  mockGetCinemas(address: string): Observable<CinemaDTO[]> {
    const mocks: CinemaDTO[] = [
      { code: 'HN01', nameOfCinema: 'CineGo Hoàn Kiếm', address: 'Hoàn Kiếm, Hà Nội', status: 'Active', totalRooms: 5, description: 'Rạp trung tâm' },
      { code: 'HN02', nameOfCinema: 'CineGo Cầu Giấy', address: 'Cầu Giấy, Hà Nội', status: 'Active', totalRooms: 8, description: 'Rạp sinh viên' },
      { code: 'HCM01', nameOfCinema: 'CineGo Q1', address: 'Quận 1, TP.HCM', status: 'Maintenance', totalRooms: 4, description: 'Rạp flagship' }
    ];
    const filtered = address ? mocks.filter(m => m.address.includes(address)) : mocks;
    return of(filtered);
  }

  saveCinema(payload: CinemaPayload): Observable<any> {
    return this.http.post<any>(this.apiService.apiUrl('/api/v1/cinema/save'), payload);
  }

  updateCinema(payload: CinemaPayload): Observable<any> {
    return this.http.put<any>(this.apiService.apiUrl('/api/v1/cinema/update'), payload);
  }

  deleteCinema(code: string): Observable<any> {
    return this.http.delete<any>(this.apiService.apiUrl(`/api/v1/cinema/delete?code=${code}`));
  }
}

