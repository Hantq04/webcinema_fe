import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface ScheduleResponse {
  id: number;
  cinema: string;
  roomCode: string;
  roomType: string;
  movie: string;
  startAt: string;
  endAt: string;
  code: string;
  name: string;
  isActive: boolean;
}

export interface ScheduleShowtimeResponse {
  time: string;
  scheduleCode: string;
}

export interface CinemaScheduleResponse {
  cinemaName: string;
  roomCode: string;
  roomType: string;
  showtimes: ScheduleShowtimeResponse[];
}

export interface ScheduleGroupByDateResponse {
  date: string;
  cinemas: CinemaScheduleResponse[];
}

export interface ScheduleDTO {
  id?: number;
  startAt: string;
  endAt?: string;
  code?: string;
  name?: string;
  movieName?: string;
  roomName?: string;
  roomCode?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ManagementScheduleService {
  private readonly http = inject(HttpClient);
  private readonly apiService = inject(ApiService);

  getAllSchedules(): Observable<any> {
    return this.http.get<any>(this.apiService.apiUrl('/api/v1/schedule/get-all-schedule'));
  }

  saveSchedule(payload: ScheduleDTO): Observable<any> {
    return this.http.post<any>(this.apiService.apiUrl('/api/v1/schedule/save'), payload);
  }

  updateSchedule(payload: ScheduleDTO): Observable<any> {
    return this.http.put<any>(this.apiService.apiUrl('/api/v1/schedule/update'), payload);
  }

  deleteSchedule(code: string, movieId: number): Observable<any> {
    return this.http.delete<any>(this.apiService.apiUrl(`/api/v1/schedule/delete?code=${code}&movieId=${movieId}`));
  }

  deactivateExpired(): Observable<any> {
    return this.http.put<any>(this.apiService.apiUrl('/api/v1/schedule/deactivate-expired'), {});
  }

  getScheduleMovie(movieId: number, date: string, address: string, roomType: string): Observable<any> {
    return this.http.get<any>(this.apiService.apiUrl(`/api/v1/schedule/movie?movieId=${movieId}&date=${date}&address=${address}&roomType=${roomType}`));
  }
}
