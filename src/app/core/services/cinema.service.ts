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
  isActive?: boolean;
  lastUpdated?: string;
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

  getAllCinemas(): Observable<CinemaDTO[]> {
    return this.http.get<any>(this.apiService.apiUrl('/api/v1/cinema/get-all-cinema')).pipe(
      map(response => response.data || []),
      catchError(() => of([]))
    );
  }

  // Temporary mock for UI building until backend provides CinemaDTO[]
  mockGetCinemas(address: string): Observable<CinemaDTO[]> {
    return this.getAllCinemas().pipe(
      map(cinemas => {
        if (!address) return cinemas;
        return cinemas.filter(c => c.address.includes(address));
      })
    );
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

