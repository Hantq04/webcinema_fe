import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { ApiService } from './api.service';

export interface RevenueFilter {
  fromDate?: string;
  toDate?: string;
  groupBy?: 'DAY' | 'WEEK' | 'MONTH';
  cinemaId?: string | number | null;
  roomId?: number | null;
  movieId?: number | null;
}

export interface RevenueSummaryItem {
  period: string;
  totalRevenue: number;
  ticketRevenue: number;
  foodRevenue: number;
  ticketCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class ManagementRevenueService {
  private readonly http = inject(HttpClient);
  private readonly apiService = inject(ApiService);

  getSummary(filter: RevenueFilter): Observable<RevenueSummaryItem[]> {
    let params = new HttpParams();
    if (filter.fromDate) params = params.set('fromDate', filter.fromDate);
    if (filter.toDate) params = params.set('toDate', filter.toDate);
    if (filter.groupBy) params = params.set('groupBy', filter.groupBy);
    if (filter.cinemaId != null) params = params.set('cinemaId', String(filter.cinemaId));
    if (filter.roomId != null) params = params.set('roomId', String(filter.roomId));
    if (filter.movieId != null) params = params.set('movieId', String(filter.movieId));

    return this.http.get<any>(this.apiService.apiUrl('/api/v1/revenue/summary'), { params }).pipe(
      catchError(err => {
        console.error('Error loading revenue summary', err);
        return of([]);
      })
    );
  }

  exportExcel(filter: RevenueFilter): Observable<Blob> {
    let params = new HttpParams();
    if (filter.fromDate) params = params.set('fromDate', filter.fromDate);
    if (filter.toDate) params = params.set('toDate', filter.toDate);
    if (filter.groupBy) params = params.set('groupBy', filter.groupBy);
    if (filter.cinemaId != null) params = params.set('cinemaId', String(filter.cinemaId));
    if (filter.roomId != null) params = params.set('roomId', String(filter.roomId));
    if (filter.movieId != null) params = params.set('movieId', String(filter.movieId));

    return this.http.get(this.apiService.apiUrl('/api/v1/revenue/summary/export'), {
      params,
      responseType: 'blob'
    });
  }
}
