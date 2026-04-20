import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, of, catchError } from 'rxjs';

import { ApiService } from './api.service';
import { Movie } from '../models/movie.model';

interface MovieApiItem {
  id?: string | number;
  movieId?: string | number;
  title?: string;
  name?: string;
  durationMinutes?: number | string;
  duration?: number | string;
  posterUrl?: string;
  posterPath?: string;
  poster?: string;
  imageUrl?: string;
  image?: string;
  thumbnailUrl?: string;
  thumbnail?: string;
  backdropUrl?: string;
  backdropPath?: string;
  trailerUrl?: string;
  trailer?: string;
  rate?: string;
  description?: string;
  ageRating?: string;
  releaseDate?: string;
  genre?: string;
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
      title,
      durationMinutes: this.toNumberValue(item.durationMinutes ?? item.duration),
      posterUrl: this.resolveMediaUrl(item.posterUrl ?? item.posterPath ?? item.poster ?? item.imageUrl ?? item.image ?? item.thumbnailUrl ?? item.thumbnail),
      backdropUrl: this.resolveMediaUrl(item.backdropUrl ?? item.backdropPath),
      trailerUrl: this.resolveMediaUrl(item.trailerUrl ?? item.trailer),
      rate: this.toStringValue(item.rate),
      description: this.toStringValue(item.description),
      ageRating: this.toStringValue(item.ageRating),
      releaseDate: this.toStringValue(item.releaseDate),
      genre: this.toStringValue(item.genre)
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