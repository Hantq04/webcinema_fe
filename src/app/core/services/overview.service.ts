import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { OverviewResponse } from '../models/overview.model';

@Injectable({
  providedIn: 'root'
})
export class OverviewService {
  private readonly http = inject(HttpClient);
  private readonly apiService = inject(ApiService);

  getOverview(): Observable<OverviewResponse> {
    return this.http.get<any>(this.apiService.apiUrl('/api/v1/overview')).pipe(
      map(res => res?.data)
    );
  }
}
