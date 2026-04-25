import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, catchError, of } from 'rxjs';
import { ApiService } from './api.service';
import { Event, EventResponse } from '../models/event.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private readonly http = inject(HttpClient);
  private readonly apiService = inject(ApiService);

  getEvents(): Observable<Event[]> {
    return this.http.get<EventResponse>(this.apiService.apiUrl('/api/v1/event/list')).pipe(
      map(response => response.data || []),
      catchError(() => of([]))
    );
  }
}
