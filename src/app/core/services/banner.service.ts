import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { BannerResponse, BannerListResponse } from '../models/banner.model';

@Injectable({
  providedIn: 'root'
})
export class BannerService {
  private readonly http = inject(HttpClient);
  private readonly apiService = inject(ApiService);

  getAllBanners(): Observable<BannerResponse[]> {
    return this.http.get<BannerListResponse>(this.apiService.apiUrl('/api/v1/banner/get-all-banner')).pipe(
      map(res => res?.data || [])
    );
  }

  saveBanner(formData: FormData): Observable<any> {
    return this.http.post(this.apiService.apiUrl('/api/v1/banner/save'), formData);
  }

  deleteBanner(id: number): Observable<any> {
    return this.http.delete(this.apiService.apiUrl(`/api/v1/banner/delete?id=${id}`));
  }
}
