import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of, catchError } from 'rxjs';
import { ApiService } from './api.service';
import { SeatScheduleData } from '../models/seat.model';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private readonly http = inject(HttpClient);
  private readonly apiService = inject(ApiService);

  getSeatsBySchedule(scheduleCode: string): Observable<SeatScheduleData | null> {
    return this.http.get<any>(this.apiService.apiUrl(`/api/v1/seat/get-by-schedule?scheduleCode=${scheduleCode}`)).pipe(
      map((response) => {
        if (response && response.data) {
          return response.data as SeatScheduleData;
        }
        return null;
      }),
      catchError((error) => {
        console.error('Error fetching seats', error);
        return of(null);
      })
    );
  }

  getAllFood(): Observable<any[]> {
    return this.http.get<any>(this.apiService.apiUrl('/api/v1/food/get-all-food')).pipe(
      map(response => response.data || []),
      catchError((error) => {
        console.error('Error fetching food', error);
        return of([]);
      })
    );
  }
}
