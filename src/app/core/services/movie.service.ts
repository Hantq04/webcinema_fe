import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, of, catchError } from 'rxjs';

import { ApiService } from './api.service';
import { Movie, MovieDetail, DailySchedule, CinemaSchedule } from '../models/movie.model';

interface MovieApiItem {
  id?: string | number;
  movieId?: string | number;
  code?: string;
  title?: string;
  name?: string;
  image?: string;
  movieType?: string;
  premiereDate?: string;
  durationMinutes?: number | string;
  duration?: number | string;
  posterUrl?: string;
  posterPath?: string;
  poster?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  thumbnail?: string;
  backdropUrl?: string;
  backdropPath?: string;
  trailerUrl?: string;
  trailer?: string;
  rate?: string;
  rateName?: string;
  description?: string;
  ageRating?: string;
  releaseDate?: string;
  genre?: string;
  director?: string;
  actor?: string;
  language?: string;
  subtitle?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private readonly http = inject(HttpClient);
  private readonly apiService = inject(ApiService);

  getNowShowingMovies(): Observable<Movie[]> {
    return this.http.get<unknown>(this.apiService.apiUrl('/api/v1/movie/get-now-showing-movie')).pipe(
      map((response) => this.normalizeMovieList(response)),
      catchError(() => of([]))
    );
  }

  getNowShowingMoviesHot(): Observable<Movie[]> {
    return this.http.get<unknown>(this.apiService.apiUrl('/api/v1/movie/get-now-showing-movie-hot')).pipe(
      map((response) => this.normalizeMovieList(response)),
      catchError(() => of([]))
    );
  }

  getComingSoonMovies(): Observable<Movie[]> {
    return this.http.get<unknown>(this.apiService.apiUrl('/api/v1/movie/get-coming-soon-movie')).pipe(
      map((response) => this.normalizeMovieList(response)),
      catchError(() => of([]))
    );
  }

  getMovieDetailByCode(code: string): Observable<MovieDetail | null> {
    return this.http.get<unknown>(this.apiService.apiUrl(`/api/v1/movie/get-movie-detail?code=${encodeURIComponent(code)}`)).pipe(
      map((response) => {
        const item = this.extractSingleMovie(response);
        return item ? this.normalizeMovieDetail(item) : null;
      }),
      catchError(() => of(null))
    );
  }

  getMovieSchedule(movieId: string | number, address: string, roomType: string): Observable<DailySchedule[]> {
    return this.http.get<any>(this.apiService.apiUrl(`/api/v1/schedule/movie?movieId=${movieId}&address=${encodeURIComponent(address)}&roomType=${encodeURIComponent(roomType)}`)).pipe(
      map((response) => {
        if (response && response.data && Array.isArray(response.data)) {
          return response.data as DailySchedule[];
        }
        return [];
      }),
      catchError(() => of([]))
    );
  }

  private extractSingleMovie(response: unknown): MovieApiItem | null {
    if (this.isRecord(response)) {
      const candidates = [response['data'], response['result'], response['payload'], response];
      for (const candidate of candidates) {
        if (this.isRecord(candidate) && (candidate['id'] || candidate['code'])) {
          return candidate as MovieApiItem;
        }
      }
    }
    return null;
  }

  private normalizeMovieList(response: unknown): Movie[] {
    const items = this.extractMovieArray(response);

    return items
      .map((item, index) => this.normalizeMovieItem(item, index))
      .filter((movie): movie is Movie => movie !== null);
  }

  private extractMovieArray(response: unknown): MovieApiItem[] {
    if (Array.isArray(response)) {
      return response as MovieApiItem[];
    }

    if (this.isRecord(response)) {
      const record = response as Record<string, unknown>;
      const candidates = [record['data'], record['result'], record['payload'], record['items'], record['content']];

      for (const candidate of candidates) {
        if (Array.isArray(candidate)) {
          return candidate as MovieApiItem[];
        }

        if (this.isRecord(candidate)) {
          const nestedCandidates = [candidate['data'], candidate['items'], candidate['content']];

          for (const nestedCandidate of nestedCandidates) {
            if (Array.isArray(nestedCandidate)) {
              return nestedCandidate as MovieApiItem[];
            }
          }
        }
      }
    }

    return [];
  }

  private normalizeMovieItem(item: MovieApiItem, index: number): Movie | null {
    const id = this.toStringValue(item.id ?? item.movieId ?? index);
    const title = this.toStringValue(item.title ?? item.name ?? 'Untitled movie');

    if (!id || !title) {
      return null;
    }

    return {
      id,
      code: this.toStringValue(item.code),
      title,
      durationMinutes: this.toNumberValue(item.durationMinutes ?? item.duration),
      posterUrl: this.resolveMediaUrl(item.posterUrl ?? item.posterPath ?? item.poster ?? item.imageUrl ?? item.image ?? item.thumbnailUrl ?? item.thumbnail),
      backdropUrl: this.resolveMediaUrl(item.backdropUrl ?? item.backdropPath),
      trailerUrl: this.resolveMediaUrl(item.trailerUrl ?? item.trailer),
      rate: this.toStringValue(item.rate),
      description: this.toStringValue(item.description),
      ageRating: this.toStringValue(item.ageRating),
      releaseDate: this.toStringValue(item.releaseDate ?? item.premiereDate),
      genre: this.toStringValue(item.genre ?? item.movieType)
    };
  }

  private normalizeMovieDetail(item: MovieApiItem): MovieDetail | null {
    const movie = this.normalizeMovieItem(item, 0);
    if (!movie) return null;

    return {
      ...movie,
      director: this.toStringValue(item.director),
      actor: this.toStringValue(item.actor),
      language: this.toStringValue(item.language),
      movieSubtitle: this.toStringValue(item.subtitle),
      rateName: this.toStringValue(item.rateName)
    };
  }

  private resolveMediaUrl(value: unknown): string {
    const text = this.toStringValue(value);

    if (!text) {
      return '';
    }

    if (text.startsWith('http://') || text.startsWith('https://') || text.startsWith('data:')) {
      return text;
    }

    return this.apiService.apiUrl(text.startsWith('/') ? text : `/${text}`);
  }

  private toStringValue(value: unknown): string {
    if (typeof value === 'string') {
      return value.trim();
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value);
    }

    return '';
  }

  private toNumberValue(value: unknown): number {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string') {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : 0;
    }

    return 0;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }
}