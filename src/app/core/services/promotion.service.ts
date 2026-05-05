import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { PromotionResponse, PromotionRequest, PromotionListResponse } from '../models/promotion.model';

@Injectable({
  providedIn: 'root'
})
export class PromotionService {
  private readonly http = inject(HttpClient);
  private readonly apiService = inject(ApiService);

  getAllPromotions(): Observable<PromotionResponse[]> {
    return this.http.get<PromotionListResponse>(this.apiService.apiUrl('/api/v1/promotion/get-all-promotion')).pipe(
      map(res => res?.data || [])
    );
  }

  savePromotion(promotion: PromotionRequest): Observable<any> {
    return this.http.post(this.apiService.apiUrl('/api/v1/promotion/save'), promotion);
  }

  deletePromotion(name: string): Observable<any> {
    return this.http.delete(this.apiService.apiUrl(`/api/v1/promotion/delete?name=${name}`));
  }
}
