import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { ApiService } from './api.service';

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
}
