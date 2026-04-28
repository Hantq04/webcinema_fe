import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal, effect } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Movie, MovieDetail, DailySchedule } from '../../../core/models/movie.model';
import { MovieService } from '../../../core/services/movie.service';
import { LanguageService } from '../../../core/services/language.service';
import { Title, DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule, Location } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

import { MovieScheduleModalComponent } from '../../../shared/components/movie-schedule-modal/movie-schedule-modal.component';

@Component({
  selector: 'app-movie-detail',
  imports: [RouterLink, CommonModule, MovieScheduleModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="movie-detail-page">
      <div class="movie-detail-page__shell">
        <nav class="movies-breadcrumb" aria-label="Breadcrumb">
          <a routerLink="/home" class="movies-breadcrumb__home" [attr.aria-label]="t('header.homeAria')">
            <img src="/home.png" alt="" class="movies-breadcrumb__home-icon" aria-hidden="true" />
          </a>
          <span>›</span>
          <a routerLink="/movies" class="movies-breadcrumb__link">{{ t('home.breadcrumbPhim') }}</a>
          <span>›</span>
          <a [routerLink]="['/movies']" [queryParams]="{ tab: isComingSoon() ? 'coming-soon' : 'now-showing' }" 
             class="movies-breadcrumb__link">
            {{ isComingSoon() ? t('movies.coming') : t('movies.showing') }}
          </a>
          <span>›</span>
          <span class="movies-breadcrumb__current">{{ movie()?.title | uppercase }}</span>
        </nav>

        <div class="movie-detail-hero">
          <h1 class="movie-detail-hero__heading">{{ t('movies.contentTitle') }}</h1>
          
          @if (movie(); as m) {
            <div class="movie-detail-content">
              <div class="movie-detail-content__left">
                <div class="movie-detail-poster" #posterContainer (mousemove)="onMouseMove($event)" (mouseleave)="onMouseLeave()">
                  <img class="movie-detail-poster__image" [src]="moviePoster(m)" [alt]="m.title" />
                  @if (showZoom()) {
                    <div class="movie-detail-poster__lens" [style.left.px]="lensX()" [style.top.px]="lensY()"></div>
                    <div class="movie-detail-poster__zoom-view">
                      <div class="movie-detail-poster__zoom-img" 
                           [style.background-image]="'url(' + moviePoster(m) + ')'"
                           [style.background-position]="zoomPos()">
                      </div>
                    </div>
                  }
                </div>
              </div>
              
              <div class="movie-detail-content__right">
                <h2 class="movie-detail-info__title">{{ getTitle(m) | uppercase }}</h2>
                
                <div class="movie-detail-info__grid">
                  <div class="movie-detail-info__row">
                    <strong>{{ t('movies.director') }}:</strong>
                    <span>{{ m.director || 'Đang cập nhật' }}</span>
                  </div>
                  <div class="movie-detail-info__row">
                    <strong>{{ t('movies.actor') }}:</strong>
                    <span>{{ m.actor || 'Đang cập nhật' }}</span>
                  </div>
                  <div class="movie-detail-info__row">
                    <strong>{{ t('movies.genre') }}:</strong>
                    <span>{{ getGenre(m) }}</span>
                  </div>
                  <div class="movie-detail-info__row">
                    <strong>{{ t('movies.releaseDate') }}:</strong>
                    <span>{{ formatDate(m.releaseDate) }}</span>
                  </div>
                  <div class="movie-detail-info__row">
                    <strong>{{ t('movies.duration') }}:</strong>
                    <span>{{ m.durationMinutes }} {{ t('movies.minutes') }}</span>
                  </div>
                  <div class="movie-detail-info__row">
                    <strong>{{ t('movies.language') }}:</strong>
                    <span>{{ getLanguage(m) }}</span>
                  </div>
                  <div class="movie-detail-info__row">
                    <strong>{{ t('movies.rated') }}:</strong>
                    <span class="movie-detail-info__rated-text">{{ getRateText(m) }}</span>
                  </div>
                </div>

                <div class="movie-detail-formats">
                  @if (m.rate) {
                    <span class="movie-detail-badge movie-detail-badge--rate"
                          [class.movie-detail-badge--g]="movieRateCode(m) === 'G'"
                          [class.movie-detail-badge--pg]="movieRateCode(m) === 'PG'"
                          [class.movie-detail-badge--pg13]="movieRateCode(m) === 'PG-13'"
                          [class.movie-detail-badge--r]="movieRateCode(m) === 'R'"
                          [class.movie-detail-badge--nc17]="movieRateCode(m) === 'NC-17'">
                      {{ movieRateCode(m) }}
                    </span>
                  }
                  <span class="movie-detail-badge movie-detail-badge--format">4DX</span>
                  <span class="movie-detail-badge movie-detail-badge--format movie-detail-badge--imax">IMAX</span>
                  <span class="movie-detail-badge movie-detail-badge--format">ULTRA 4DX</span>
                </div>

                <div class="movie-detail-actions">
                  @if (!isComingSoon()) {
                    <button type="button" (click)="openSchedule()" class="movie-detail-btn movie-detail-btn--buy">
                      <span class="btn-arrow-icon">»</span>
                      {{ t('home.movieActionBook') }}
                    </button>
                  }
                </div>
              </div>
            </div>

            <div class="movie-detail-tabs">
              <div class="movie-detail-tabs__header-container">
                <div class="movie-detail-tabs__ribbon">
                  <div class="movie-detail-tabs__icon-wrap">
                    <svg class="ribbon-icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/>
                    </svg>
                  </div>
                  <button type="button" class="movie-detail-tabs__btn movie-detail-tabs__btn--active">
                    {{ t('home.movieTrailerDetail') }}
                  </button>
                  <span class="movie-detail-tabs__separator">|</span>
                  <button type="button" class="movie-detail-tabs__btn" (click)="openTrailer(m)">Trailer</button>
                </div>
              </div>
              <div class="movie-detail-tabs__content">
                <p class="movie-detail-desc">{{ getDescription(m) }}</p>
              </div>
            </div>

            @if (trailerPreview()) {
              <div class="trailer-modal" role="dialog" aria-modal="true" aria-labelledby="trailer-modal-title" (click)="closeTrailer()" (keydown.escape)="closeTrailer()" tabindex="-1">
                <div class="trailer-modal__panel" (click)="$event.stopPropagation()">
                  <div class="trailer-modal__header">
                    <div class="trailer-modal__title-wrap">
                      <h3 id="trailer-modal-title" class="trailer-modal__title">{{ trailerPreview()?.title }}</h3>
                      <span class="trailer-modal__subtitle">Trailer</span>
                    </div>

                    <button type="button" class="trailer-modal__close" (click)="closeTrailer()" aria-label="Đóng">
                      ×
                    </button>
                  </div>

                  <div class="trailer-modal__frame-shell">
                    <iframe
                      class="trailer-modal__frame"
                      [src]="trailerPreview()?.embedUrl"
                      title="Trailer preview"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerpolicy="strict-origin-when-cross-origin"
                      allowfullscreen
                    ></iframe>
                  </div>
                </div>
              </div>
            }

            @if (isScheduleOpen()) {
              <app-movie-schedule-modal
                [movieId]="movie()?.id || ''"
                [movieTitle]="movie()?.title || ''"
                [moviePoster]="moviePoster(movie()!)"
                [movieRate]="movieRateCode(movie()!)"
                (close)="closeSchedule()"
              />
            }
          } @else if (!loading()) {
            <div class="movie-detail-error">
              <p>{{ t('movies.notFound') }}</p>
              <a href="javascript:void(0)" (click)="goBack()" class="movie-detail-error__link">{{ t('movies.goBack') }}</a>
            </div>
          } @else {
            <div class="movie-detail-loading">
              <div class="spinner"></div>
            </div>
          }
        </div>
      </div>
    </section>
  `,
  styleUrl: './movie-detail.component.css'
})
export class MovieDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly movieService = inject(MovieService);
  private readonly languageService = inject(LanguageService);
  private readonly titleService = inject(Title);
  private readonly destroyRef = inject(DestroyRef);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly t = this.languageService.t.bind(this.languageService);
  private readonly location = inject(Location);
  protected readonly movie = signal<MovieDetail | null>(null);
  protected readonly loading = signal(true);
  protected readonly isComingSoon = computed(() => {
    const m = this.movie();
    if (!m?.releaseDate) return false;
    // Format: "YYYY-MM-DD" or similar
    const releaseDate = new Date(m.releaseDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return releaseDate > today;
  });
  protected readonly trailerPreview = signal<{ title: string; embedUrl: SafeResourceUrl } | null>(null);

  protected readonly isScheduleOpen = signal(false);

  // Zoom logic signals
  protected readonly showZoom = signal(false);
  protected readonly lensX = signal(0);
  protected readonly lensY = signal(0);
  protected readonly zoomPos = signal('0% 0%');

  constructor() {
    effect(() => {
      this.languageService.currentLanguage();
      const m = this.movie();
      if (m) {
        this.titleService.setTitle(`${this.getTitle(m)} | ${this.t('titles.movieDetail')}`);
      }
    });

    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const code = params.get('code');
      if (code) {
        window.scrollTo(0, 0); // Always scroll to top when opening a new movie detail
        this.loading.set(true);
        this.movieService.getMovieDetailByCode(code).subscribe((detail) => {
          this.movie.set(detail);
          this.loading.set(false);
        });
      } else {
        this.loading.set(false);
      }
    });

    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      if (params.get('openSchedule') === 'true') {
        this.openSchedule();
      }
    });
  }

  protected movieRateCode(movie: MovieDetail | Movie): string {
    const rate = (movie.rate || (movie as any).ageRating || '').toUpperCase();
    if (rate.includes('PG-13')) return 'PG-13';
    if (rate.includes('NC-17')) return 'NC-17';
    if (rate.startsWith('PG')) return 'PG';
    if (rate.startsWith('G')) return 'G';
    if (rate.startsWith('R')) return 'R';
    return (rate.split(/[\s-]/)[0] || '').trim();
  }

  protected goBack(): void {
    this.location.back();
  }

  protected moviePoster(movie: MovieDetail): string {
    return movie.posterUrl || movie.backdropUrl || this.buildFallbackPoster(movie.title);
  }

  protected formatRate(movie: MovieDetail): string {
    if (movie.rate && movie.rateName) {
      return `${movie.rate} - ${movie.rateName}`;
    }
    return movie.rateName || movie.rate || 'P';
  }

  protected isEn(): boolean {
    return this.languageService.currentLanguage() === 'en';
  }

  protected getGenre(m: MovieDetail): string {
    const genre = this.isEn() ? (m.genreEn ?? m.genre) : m.genre;
    if (Array.isArray(genre)) {
      return genre.join(', ');
    }
    return genre || 'Đang cập nhật';
  }

  protected getTitle(m: MovieDetail): string {
    return (this.isEn() ? m.titleEn : m.title) || m.title;
  }

  protected getDescription(m: MovieDetail): string {
    return (this.isEn() ? m.descriptionEn : m.description) || m.description || 'Nội dung đang được cập nhật.';
  }

  protected getRateText(m: MovieDetail): string {
    const rate = this.isEn() ? (m.rateEn ?? m.rate) : m.rate;
    const name = this.isEn() ? (m.rateNameEn ?? m.rateName) : m.rateName;
    return `${rate} - ${name}`.toUpperCase();
  }

  protected getLanguage(m: MovieDetail): string {
    if (m.language && m.movieSubtitle) {
      return `${m.language} - Phụ đề ${m.movieSubtitle}`;
    }
    return m.language || 'Đang cập nhật';
  }

  protected formatDate(dateString?: string): string {
    if (!dateString) return this.t('shared.loading');
    // dateString from API might be "2026-04-13 00:00:00"
    try {
      const parts = dateString.split(' ');
      if (parts.length > 0) {
        const dateParts = parts[0].split('-');
        if (dateParts.length === 3) {
          return `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
        }
      }
    } catch {
      // ignore
    }
    return dateString;
  }

  private buildFallbackPoster(title: string): string {
    const safeTitle = title.trim() || 'CineGo';
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 900">
        <defs>
          <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#234d60" />
            <stop offset="55%" stop-color="#081016" />
            <stop offset="100%" stop-color="#7b5a22" />
          </linearGradient>
        </defs>
        <rect width="600" height="900" fill="url(#bg)" />
        <text x="50%" y="50%" text-anchor="middle" font-family="Arial, sans-serif" font-size="40" font-weight="700" fill="#fff8ef">${safeTitle}</text>
      </svg>
    `;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }

  protected openTrailer(movie: MovieDetail): void {
    const trailerUrl = movie.trailerUrl;
    if (!trailerUrl) return;

    const embedUrl = this.toYoutubeEmbedUrl(trailerUrl);

    if (!embedUrl) {
      window.open(trailerUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    this.trailerPreview.set({
      title: movie.title,
      embedUrl: this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl)
    });
  }

  protected closeTrailer(): void {
    this.trailerPreview.set(null);
  }

  private toYoutubeEmbedUrl(value: string): string {
    try {
      const parsedUrl = new URL(value);
      const host = parsedUrl.hostname.replace(/^www\./, '');
      let videoId = '';

      if (host === 'youtu.be') {
        videoId = parsedUrl.pathname.split('/').filter(Boolean)[0] ?? '';
      } else if (host.endsWith('youtube.com')) {
        videoId = parsedUrl.searchParams.get('v') ?? '';

        if (!videoId && parsedUrl.pathname.startsWith('/shorts/')) {
          videoId = parsedUrl.pathname.split('/')[2] ?? '';
        }
      }

      return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0` : '';
    } catch {
      return '';
    }
  }

  protected openSchedule(): void {
    this.isScheduleOpen.set(true);
  }

  protected closeSchedule(): void {
    this.isScheduleOpen.set(false);
  }

  protected onMouseMove(event: MouseEvent): void {
    const container = event.currentTarget as HTMLElement;
    const rect = container.getBoundingClientRect();

    // Lens size (CSS)
    const LENS_SIZE = 100;

    let x = event.clientX - rect.left - LENS_SIZE / 2;
    let y = event.clientY - rect.top - LENS_SIZE / 2;

    // Boundary check
    if (x < 0) x = 0;
    if (y < 0) y = 0;
    if (x > rect.width - LENS_SIZE) x = rect.width - LENS_SIZE;
    if (y > rect.height - LENS_SIZE) y = rect.height - LENS_SIZE;

    this.lensX.set(x);
    this.lensY.set(y);
    this.showZoom.set(true);

    // Calculate zoom position percentage
    const xp = (x / (rect.width - LENS_SIZE)) * 100;
    const yp = (y / (rect.height - LENS_SIZE)) * 100;
    this.zoomPos.set(`${xp}% ${yp}%`);
  }

  protected onMouseLeave(): void {
    this.showZoom.set(false);
  }
}
