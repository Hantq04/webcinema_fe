import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { FoodDTO, FoodResponse } from '../models/food.model';

@Injectable({
  providedIn: 'root'
})
export class FoodService {
  private readonly http = inject(HttpClient);
  private readonly apiService = inject(ApiService);

  getAllFood(): Observable<FoodDTO[]> {
    return this.http.get<FoodResponse>(this.apiService.apiUrl('/api/v1/food/get-all-food')).pipe(
      map(res => res?.data || [])
    );
  }

  saveFood(formData: FormData): Observable<any> {
    return this.http.post(this.apiService.apiUrl('/api/v1/food/save'), formData);
  }

  updateFood(formData: FormData): Observable<any> {
    return this.http.put(this.apiService.apiUrl('/api/v1/food/update'), formData);
  }

  deleteFood(name: string): Observable<any> {
    return this.http.delete(this.apiService.apiUrl(`/api/v1/food/delete?name=${name}`));
  }
}
