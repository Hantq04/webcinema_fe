import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { GeneralSetting, GeneralSettingResponse, GeneralSettingListResponse } from '../models/setting.model';

@Injectable({
  providedIn: 'root'
})
export class SettingService {
  private readonly http = inject(HttpClient);
  private readonly apiService = inject(ApiService);

  getLatestSetting(): Observable<GeneralSetting | null> {
    return this.http.get<GeneralSettingResponse>(this.apiService.apiUrl('/api/v1/setting/get-latest-setting')).pipe(
      map(res => res?.data || null)
    );
  }

  getAllSettings(): Observable<GeneralSetting[]> {
    return this.http.get<GeneralSettingListResponse>(this.apiService.apiUrl('/api/v1/setting/get-all-setting')).pipe(
      map(res => res?.data || [])
    );
  }

  saveSetting(setting: GeneralSetting): Observable<any> {
    return this.http.post(this.apiService.apiUrl('/api/v1/setting/save'), setting);
  }

  updateSetting(setting: GeneralSetting): Observable<any> {
    return this.http.put(this.apiService.apiUrl('/api/v1/setting/update'), setting);
  }

  deleteSetting(id: number): Observable<any> {
    return this.http.delete(this.apiService.apiUrl(`/api/v1/setting/delete?id=${id}`));
  }
}
