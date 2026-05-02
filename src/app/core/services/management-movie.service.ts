import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Page<T> {
  content: T[];
  pageable: any;
  totalElements: number;
  totalPages: number;
  last: boolean;
  size: number;
  number: number;
  sort: any;
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

export interface MovieDTO {
  id: number;
  code: string;
  name: string;
  nameEn: string;
  movieDuration: number;
  premiereDate: string;
  description: string;
  descriptionEn: string;
  director: string;
  actor: string;
  language: string;
  subtitle: string;
  trailer: string;
  rate: string;
  poster?: string;
  status?: string;
  durationMinutes?: number;
  duration?: number;
}

export interface MovieDetailResponse extends MovieDTO {
  movieTypeIds: number[];
  bannerId: number;
  movieTypeEn?: string[];
  movieType?: string[];
}

export interface MovieNowShowingDTO {
  id: number;
  code: string;
  name: string;
  nameEn: string;
  poster: string;
  rate: string;
}

export interface MovieShowingResponse {
  id: number;
  code: string;
  name: string;
  nameEn: string;
  poster: string;
  rate: string;
}

export interface MovieResponseDTO {
  id: number;
  code: string;
  name: string;
  nameEn: string;
  poster: string;
  rate: string;
}

export interface MovieTypeDTO {
  id: number;
  movieTypeNameVi: string;
  movieTypeNameEn: string;
  active?: boolean;
}

export interface RateDTO {
  id: number;
  code: string;
  descriptionVi?: string;
  descriptionEn?: string;
  rateName?: string;
  rateNameEn?: string;
}

export interface BannerDTO {
  id: number;
  imageUrl: string;
  title: string;
}

export interface MoviePayload {
  name: string;
  nameEn: string;
  code?: string;
  movieDuration: number;
  premiereDate: string;
  description: string;
  descriptionEn: string;
  director: string;
  actor: string;
  bannerId: number;
  language: string;
  subtitle: string;
  trailer: string;
  movieTypeIds: number[];
  rate: string;
}

@Injectable({
  providedIn: 'root'
})
export class ManagementMovieService {
  private readonly http = inject(HttpClient);
  private readonly apiService = inject(ApiService);

  // Lists and Pagination
  getMoviePage(page: number, size: number): Observable<any> {
    return this.http.get<any>(this.apiService.apiUrl(`/api/v1/movie/get-movie-page?page=${page}&size=${size}`));
  }

  getMovieDetail(code: string): Observable<any> {
    return this.http.get<any>(this.apiService.apiUrl(`/api/v1/movie/get-movie-detail?code=${code}`));
  }

  sortMovieByTicketSales(page: number, size: number): Observable<any> {
    return this.http.get<any>(this.apiService.apiUrl(`/api/v1/movie/sort-movie?page=${page}&size=${size}`));
  }

  getNowShowingMovies(): Observable<any> {
    return this.http.get<any>(this.apiService.apiUrl('/api/v1/movie/get-now-showing-movie'));
  }

  getNowShowingMoviesHot(): Observable<any> {
    return this.http.get<any>(this.apiService.apiUrl('/api/v1/movie/get-now-showing-movie-hot'));
  }

  getComingSoonMovies(): Observable<any> {
    return this.http.get<any>(this.apiService.apiUrl('/api/v1/movie/get-coming-soon-movie'));
  }

  // CRUD
  saveMovie(payload: MoviePayload): Observable<any> {
    return this.http.post<any>(this.apiService.apiUrl('/api/v1/movie/save'), payload);
  }

  updateMovie(payload: MoviePayload): Observable<any> {
    return this.http.put<any>(this.apiService.apiUrl('/api/v1/movie/update'), payload);
  }

  deleteMovieByName(name: string): Observable<any> {
    // Note: URI encoding is important for names with spaces
    return this.http.delete<any>(this.apiService.apiUrl(`/api/v1/movie/delete?name=${encodeURIComponent(name)}`));
  }

  // Supporting Dropdowns
  getAllMovieTypes(): Observable<any> {
    return this.http.get<any>(this.apiService.apiUrl('/api/v1/movie/type/get-all-type'));
  }

  getAllRates(): Observable<any> {
    return this.http.get<any>(this.apiService.apiUrl('/api/v1/rate/get-all-rate'));
  }

  getAllBanners(): Observable<any> {
    return this.http.get<any>(this.apiService.apiUrl('/api/v1/banner/get-all-banner'));
  }
}
