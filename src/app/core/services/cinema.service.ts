import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { ApiService } from './api.service';

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
}
