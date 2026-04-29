import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { ApiService } from './api.service';

export interface SeatResponse {
  id: number;
  line: string;
  number: number;
  status: string; // Available, Held, Occupied
  room: string;
  seatType: string; // Standard, VIP, Sweet Box
  priceTicket?: number;
  notes?: string;
}

export interface SeatByScheduleDTO {
  id?: number;
  line: string;
  number: number;
  status: string; // Available, Held, Occupied
  seatType: string; // Standard, VIP, Sweet Box
  priceTicket: number;
}

export interface GenerateSeatPayload {
  roomName: string;
  roomCode: string;
}

export interface UpdateSeatPayload {
  id: number;
  line: string;
  number: number;
  roomName: string;
  roomCode: string;
  status?: string;
  seatType?: string;
  priceTicket?: number;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SeatService {
  private readonly http = inject(HttpClient);
  private readonly apiService = inject(ApiService);

  getAllSeats(): Observable<SeatResponse[]> {
    return this.http.get<any>(this.apiService.apiUrl('/api/v1/seat/get-all-seat')).pipe(
      map(response => {
        if (response && response.data && Array.isArray(response.data)) {
          return response.data as SeatResponse[];
        }
        if (Array.isArray(response)) {
          return response as SeatResponse[];
        }
        return [];
      }),
      catchError((err) => {
        console.error('Error fetching seats', err);
        return of([]);
      })
    );
  }

  getSeatsBySchedule(scheduleCode: string): Observable<SeatByScheduleDTO[]> {
    const params = new HttpParams().set('scheduleCode', scheduleCode);
    return this.http.get<any>(this.apiService.apiUrl('/api/v1/seat/get-by-schedule'), { params }).pipe(
      map(response => {
        if (response && response.data && Array.isArray(response.data)) {
          return response.data as SeatByScheduleDTO[];
        }
        if (Array.isArray(response)) {
          return response as SeatByScheduleDTO[];
        }
        return [];
      }),
      catchError((err) => {
        console.error('Error fetching seats by schedule', err);
        return of([]);
      })
    );
  }

  getSeatsByRoom(roomCode: string): Observable<SeatResponse[]> {
    const params = new HttpParams().set('roomCode', roomCode);
    return this.http.get<any>(this.apiService.apiUrl('/api/v1/seat/get-by-room'), { params }).pipe(
      map(response => {
        if (response && response.data) {
          if (Array.isArray(response.data)) {
            return response.data as SeatResponse[];
          }
          if (response.data.seats && Array.isArray(response.data.seats)) {
            return response.data.seats as SeatResponse[];
          }
        }
        if (Array.isArray(response)) {
          return response as SeatResponse[];
        }
        return [];
      }),
      catchError((err) => {
        console.error('Error fetching seats by room', err);
        return of([]);
      })
    );
  }

  generateSeats(payload: GenerateSeatPayload): Observable<any> {
    return this.http.post<any>(this.apiService.apiUrl('/api/v1/seat/save'), payload);
  }

  updateSeat(payload: UpdateSeatPayload): Observable<any> {
    return this.http.put<any>(this.apiService.apiUrl('/api/v1/seat/update'), payload);
  }

  deleteSeat(id: number): Observable<any> {
    const params = new HttpParams().set('id', id.toString());
    return this.http.delete<any>(this.apiService.apiUrl('/api/v1/seat/delete'), { params });
  }

  refreshSeatStatus(tradingCode: string): Observable<any> {
    const params = new HttpParams().set('code', tradingCode);
    return this.http.put<any>(this.apiService.apiUrl('/api/v1/seat/refresh'), null, { params });
  }
}
