import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { AppNotification, NotificationResponse, UnreadCountResponse } from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly http = inject(HttpClient);
  private readonly apiService = inject(ApiService);

  getUnreadCount(): Observable<number> {
    return this.http.get<UnreadCountResponse>(this.apiService.apiUrl('/api/v1/notification/unread-count')).pipe(
      map(res => res?.data ?? 0)
    );
  }

  getAllNotifications(page: number = 0, size: number = 10): Observable<{ content: AppNotification[], totalPages: number, totalElements: number }> {
    return this.http.get<NotificationResponse>(
      this.apiService.apiUrl(`/api/v1/notification/get-all-notification?page=${page}&size=${size}`)
    ).pipe(
      map(res => ({
        content: res?.data?.content || [],
        totalPages: res?.data?.totalPages || 0,
        totalElements: res?.data?.totalElements || 0
      }))
    );
  }

  markAsRead(id: number): Observable<any> {
    return this.http.put(this.apiService.apiUrl(`/api/v1/notification/mark-read?id=${id}`), {});
  }

  markAllAsRead(): Observable<any> {
    return this.http.put(this.apiService.apiUrl('/api/v1/notification/mark-all-read'), {});
  }
}
