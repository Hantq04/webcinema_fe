import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { UserResponse, UserDetailResponse, StaffRegisterDTO, UserProfileResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class ManagementUserService {
  private readonly http = inject(HttpClient);
  private readonly apiService = inject(ApiService);

  getAllUsers(): Observable<UserResponse[]> {
    return this.http.get<{ data: UserResponse[] }>(this.apiService.apiUrl('/api/v1/user/get-all')).pipe(
      map(response => response.data || [])
    );
  }

  getUserById(id: number | string): Observable<UserDetailResponse> {
    return this.http.get<{ data: UserDetailResponse }>(this.apiService.apiUrl(`/api/v1/user/find-by-id?id=${id}`)).pipe(
      map(response => response.data)
    );
  }

  getUserProfile(userName: string): Observable<UserProfileResponse> {
    return this.http.get<{ data: UserProfileResponse }>(this.apiService.apiUrl(`/api/v1/user/profile?userName=${userName}`)).pipe(
      map(response => response.data)
    );
  }

  staffRegister(payload: StaffRegisterDTO): Observable<any> {
    return this.http.post<any>(this.apiService.apiUrl('/api/v1/user/staff-register'), payload);
  }

  deleteUsers(userNames: string[]): Observable<any> {
    let params = new HttpParams();
    userNames.forEach(userName => {
      params = params.append('userName', userName);
    });
    return this.http.delete<any>(this.apiService.apiUrl('/api/v1/user/delete'), { params });
  }

  updateProfile(formData: FormData): Observable<any> {
    return this.http.put<any>(this.apiService.apiUrl('/api/v1/user/update-profile'), formData);
  }
}
