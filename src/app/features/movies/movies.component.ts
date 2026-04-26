import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal, effect } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Movie } from '../../core/models/movie.model';
import { MovieService } from '../../core/services/movie.service';
import { LanguageService } from '../../core/services/language.service';
import { MovieScheduleModalComponent } from '../../shared/components/movie-schedule-modal/movie-schedule-modal.component';

type MoviesSection = 'now-showing' | 'coming-soon';

type PosterTone = 'teal' | 'amber' | 'red' | 'green';

interface MovieCard extends Movie {
  subtitle: string;
  posterLabel: string;
  posterTone: PosterTone;
  rank?: number;
  ctaLabel: string;
  releaseHint: string;
}

@Component({
  selector: 'app-movies',
  imports: [RouterLink, MovieScheduleModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="movies-page">
      <div class="movies-page__shell">
        <nav class="movies-breadcrumb" aria-label="Breadcrumb">
          <a routerLink="/home" class="movies-breadcrumb__home" [attr.aria-label]="t('header.homeAria')">
            <img src="/home.png" alt="" class="movies-breadcrumb__home-icon" aria-hidden="true" />
          </a>
          <span>›</span>
          <span class="movies-breadcrumb__section">{{ t('home.breadcrumbPhim') }}</span>
          <span>›</span>
          <span class="movies-breadcrumb__current">{{ sectionTitle() }}</span>
        </nav>

        <header class="movies-hero">
          <div class="movies-hero__heading">
            <h1>{{ sectionTitle() }}</h1>
            <p>{{ sectionDescription() }}</p>
          </div>

          <div class="movies-hero__switch" aria-label="{{ t('movies.title') }}">
            <button type="button" class="movies-hero__switch-link" [class.movies-hero__switch-link--active]="isActive('now-showing')" (click)="setSection('now-showing')">
              {{ t('home.nowShowingTitle') }}
            </button>
            <button type="button" class="movies-hero__switch-link" [class.movies-hero__switch-link--active]="isActive('coming-soon')" (click)="setSection('coming-soon')">
              {{ t('home.comingSoonTitle') }}
            </button>
          </div>
        </header>

        @if (activeSection() === 'now-showing') {
          <section class="movies-list" aria-label="{{ t('home.nowShowingTitle') }}">
            @for (movie of nowShowingMovies(); track movie.id) {
              <article class="movie-card">
                <a [routerLink]="['/movies', movie.code || movie.id]" class="movie-card__poster" style="display: block; text-decoration: none;">
                  <img class="movie-card__poster-image" [src]="moviePoster(movie)" [alt]="movie.title" loading="lazy" />
                  <span 
                    class="movie-card__age"
                    [class.movie-card__age--g]="movieRateCode(movie) === 'G'"
                    [class.movie-card__age--pg]="movieRateCode(movie) === 'PG'"
                    [class.movie-card__age--pg13]="movieRateCode(movie) === 'PG-13'"
                    [class.movie-card__age--r]="movieRateCode(movie) === 'R'"
                    [class.movie-card__age--nc17]="movieRateCode(movie) === 'NC-17'"
                  >{{ movie.ageRating || movie.posterLabel }}</span>
                  @if (movie.rank) {
                    <span class="movie-card__rank movie-card__rank--{{ movie.rank }}">{{ movie.rank }}</span>
                  }
                </a>

                <div class="movie-card__body">
                  <a [routerLink]="['/movies', movie.code || movie.id]" style="text-decoration: none; color: inherit;">
                    <h2 class="movie-card__title">{{ getTitle(movie) }}</h2>
                  </a>
                  <p class="movie-card__meta"><strong>{{ t('movies.genre') }}:</strong> {{ movie.subtitle }}</p>
                  <p class="movie-card__meta"><strong>{{ t('movies.duration') }}:</strong> {{ movie.durationMinutes }} {{ t('movies.minutes') }}</p>
                  <p class="movie-card__meta"><strong>{{ t('movies.releaseDate') }}:</strong> {{ movie.releaseHint }}</p>
                  <button type="button" (click)="openSchedule(movie)" class="movie-card__button">
                    <span style="font-weight: 900; font-size: 1.1rem; margin-right: 6px; line-height: 1; transform: translateY(-1px);">»</span>
                    {{ movie.ctaLabel }}
                  </button>
                </div>
              </article>
            }
          </section>
        } @else {
          <section class="movies-list movies-list--coming-soon" aria-label="{{ t('home.comingSoonTitle') }}">
            @for (movie of comingSoonMovies(); track movie.id) {
              <article class="movie-card movie-card--coming-soon">
                <a [routerLink]="['/movies', movie.code || movie.id]" class="movie-card__poster movie-card__poster--{{ movie.posterTone }}" style="display: block; text-decoration: none; cursor: pointer;">
                  @if (movie.posterUrl || movie.backdropUrl) {
                    <img class="movie-card__poster-image" [src]="moviePoster(movie)" [alt]="movie.title" loading="lazy" />
                  } @else {
                    <div class="movie-card__poster-copy movie-card__poster-copy--centered">
                      <span class="movie-card__poster-kicker">{{ movie.posterLabel }}</span>
                      <strong class="movie-card__poster-title movie-card__poster-title--coming">{{ getTitle(movie) }}</strong>
                      <span class="movie-card__poster-subtitle">{{ movie.releaseHint }}</span>
                    </div>
                  }
                  <span 
                    class="movie-card__age"
                    [class.movie-card__age--g]="movieRateCode(movie) === 'G'"
                    [class.movie-card__age--pg]="movieRateCode(movie) === 'PG'"
                    [class.movie-card__age--pg13]="movieRateCode(movie) === 'PG-13'"
                    [class.movie-card__age--r]="movieRateCode(movie) === 'R'"
                    [class.movie-card__age--nc17]="movieRateCode(movie) === 'NC-17'"
                  >{{ movie.ageRating || movie.posterLabel }}</span>
                </a>

                <div class="movie-card__body">
                  <a [routerLink]="['/movies', movie.code || movie.id]" style="text-decoration: none; color: inherit;">
                    <h2 class="movie-card__title">{{ getTitle(movie) }}</h2>
                  </a>
                  <p class="movie-card__meta"><strong>{{ t('movies.genre') }}:</strong> {{ movie.subtitle }}</p>
                  <p class="movie-card__meta"><strong>{{ t('movies.duration') }}:</strong> {{ movie.durationMinutes }} {{ t('movies.minutes') }}</p>
                  <p class="movie-card__meta"><strong>{{ t('movies.releaseDate') }}:</strong> {{ movie.releaseHint }}</p>
                </div>
              </article>
            }
          </section>
        }
      </div>

      @if (selectedMovieForSchedule(); as m) {
        <app-movie-schedule-modal
          [movieId]="m.id"
          [movieTitle]="getTitle(m)"
          [moviePoster]="moviePoster(m)"
          [movieRate]="movieRateCode(m)"
          (close)="closeSchedule()"
        />
      }
    </section>
  `,
  styles: `
    :host {
      display: block;
    }

    .movies-page {
      background:
        radial-gradient(circle at top left, rgba(214, 47, 31, 0.06), transparent 28%),
        radial-gradient(circle at top right, rgba(255, 181, 92, 0.1), transparent 24%),
        linear-gradient(180deg, #f6f0df 0%, #f8f4e9 56%, #f4ecd8 100%);
      color: #241c15;
      min-height: 100%;
      padding: 1.25rem 0 3rem;
    }

    .movies-page__shell {
      margin: 0 auto;
      max-width: 1180px;
      padding: 0 1rem;
    }

    .movies-breadcrumb {
      align-items: center;
      color: #8c7a64;
      display: flex;
      flex-wrap: wrap;
      gap: 0.55rem;
      font-size: 0.95rem;
      font-weight: 400;
      margin-bottom: 1.2rem;
    }

    .movies-breadcrumb a {
      color: inherit;
      text-decoration: none;
    }

    .movies-breadcrumb a:hover {
      color: #d62f1f;
    }

    .movies-breadcrumb__section,
    .movies-breadcrumb__current {
      color: #2a231d;
      font-weight: 500;
    }

    .movies-breadcrumb__home {
      align-items: center;
      background: rgba(0, 0, 0, 0.06);
      border-radius: 999px;
      display: inline-flex;
      height: 1.65rem;
      justify-content: center;
      width: 1.65rem;
      overflow: hidden;
    }

    .movies-breadcrumb__home-icon {
      display: block;
      height: 1rem;
      width: 1rem;
      object-fit: contain;
    }

    .movies-hero {
      align-items: end;
      border-bottom: 3px solid rgba(48, 34, 25, 0.9);
      display: flex;
      gap: 1.25rem;
      justify-content: space-between;
      margin-bottom: 1.35rem;
      padding-bottom: 0.95rem;
    }

    .movies-hero__heading h1 {
      font-size: clamp(2.3rem, 4vw, 3.7rem);
      font-weight: 400;
      letter-spacing: -0.04em;
      line-height: 1;
      margin: 0 0 0.7rem;
    }

    .movies-hero__heading p {
      color: #6f5b46;
      font-size: 1rem;
      line-height: 1.6;
      margin: 0;
    }

    .movies-hero__switch {
      display: inline-flex;
      flex-wrap: wrap;
      gap: 0.6rem;
      justify-content: flex-end;
    }

    .movies-hero__switch-link {
      background: transparent;
      border: 0;
      color: #746451;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      padding: 0.2rem 0;
      text-transform: uppercase;
    }

    .movies-hero__switch-link--active {
      color: #d62f1f;
    }

    .movies-list {
      display: grid;
      gap: 2rem;
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }

    .movie-card {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .movie-card__poster {
      border: 6px solid #111;
      box-shadow: 0 1rem 1.8rem rgba(32, 22, 14, 0.12);
      min-height: 355px;
      overflow: hidden;
      position: relative;
      background: #111;
    }

    .movie-card__poster-image {
      inset: 0;
      height: 100%;
      object-fit: cover;
      position: absolute;
      width: 100%;
    }

    .movie-card__poster::before {
      background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.14), transparent 24%),
        radial-gradient(circle at 50% 15%, rgba(255, 255, 255, 0.16), transparent 28%),
        repeating-linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0 0.45rem, transparent 0.45rem 0.9rem);
      content: '';
      inset: 0;
      position: absolute;
      z-index: 1;
    }

    .movie-card__poster--teal {
      background: linear-gradient(180deg, #234d60 0%, #081016 58%, #1e3641 100%);
    }

    .movie-card__poster--amber {
      background: linear-gradient(180deg, #4d3a18 0%, #17110b 56%, #7b5a22 100%);
    }

    .movie-card__poster--red {
      background: linear-gradient(180deg, #5b1012 0%, #160708 58%, #8a1f15 100%);
    }

    .movie-card__poster--green {
      background: linear-gradient(180deg, #436145 0%, #10170f 58%, #6b7a46 100%);
    }

    .movie-card__age {
      align-items: center;
      background: #ffb11f;
      color: #fff;
      display: inline-flex;
      font-size: 0.95rem;
      font-weight: 900;
      left: 0.55rem;
      letter-spacing: 0.03em;
      line-height: 1;
      padding: 0.28rem 0.5rem;
      position: absolute;
      top: 0.55rem;
      z-index: 2;
    }

    .movie-card__age--g { background: #2f9d44; }
    .movie-card__age--pg { background: #f39c12; }
    .movie-card__age--pg13 { background: #6d5bd0; }
    .movie-card__age--r { background: #e03a2f; }
    .movie-card__age--nc17 { background: #1f8bd6; }

    .movie-card__rank {
      align-items: center;
      border-radius: 999px;
      color: #fff;
      display: inline-flex;
      font-size: 1.15rem;
      font-weight: 900;
      height: 2.55rem;
      justify-content: center;
      position: absolute;
      right: -0.2rem;
      top: -0.2rem;
      width: 2.55rem;
      z-index: 2;
    }

    .movie-card__rank::after {
      border-left: 0.45rem solid transparent;
      border-right: 0.45rem solid transparent;
      border-top: 0.95rem solid currentColor;
      bottom: -0.65rem;
      content: '';
      height: 0;
      left: 50%;
      position: absolute;
      transform: translateX(-50%);
      width: 0;
    }

    .movie-card__rank--1 {
      background: #f01919;
      box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.9) inset;
    }

    .movie-card__rank--2 {
      background: #ff9800;
      box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.9) inset;
    }

    .movie-card__rank--3 {
      background: #1976d2;
      box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.9) inset;
    }

    .movie-card__poster-copy {
      align-items: flex-start;
      bottom: 1.1rem;
      color: #fff8ef;
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
      left: 1rem;
      position: absolute;
      right: 1rem;
      z-index: 2;
    }

    .movie-card__poster-copy--centered {
      align-items: center;
      bottom: 50%;
      left: 0.8rem;
      right: 0.8rem;
      text-align: center;
      transform: translateY(50%);
    }

    .movie-card__poster-kicker {
      font-size: 0.82rem;
      font-weight: 800;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }

    .movie-card__poster-title {
      font-size: clamp(1.55rem, 2.8vw, 2.3rem);
      font-weight: 900;
      letter-spacing: 0.02em;
      line-height: 0.95;
      margin: 0;
      text-transform: uppercase;
    }

    .movie-card__poster-title--coming {
      font-size: clamp(1.35rem, 2.3vw, 2rem);
      max-width: 100%;
    }

    .movie-card__poster-subtitle {
      font-size: 0.86rem;
      font-weight: 700;
      letter-spacing: 0.03em;
      line-height: 1.4;
    }

    .movie-card__body {
      display: flex;
      flex: 1;
      flex-direction: column;
      gap: 0.3rem;
    }

    .movie-card__title {
      font-size: 1.1rem;
      font-weight: 900;
      letter-spacing: 0.02em;
      line-height: 1.2;
      margin: 0;
      text-transform: uppercase;
    }

    .movie-card__meta {
      font-size: 0.95rem;
      line-height: 1.45;
      margin: 0;
    }

    .movie-card__meta strong {
      font-weight: 900;
    }

    .movie-card__button {
      align-self: flex-start;
      background: #ea2e1e;
      border-radius: 0.35rem;
      color: #fff;
      display: inline-flex;
      font-size: 0.84rem;
      font-weight: 900;
      letter-spacing: 0.05em;
      margin-top: auto;
      padding: 0.45rem 0.7rem;
      text-decoration: none;
      text-transform: uppercase;
    }

    .movie-card__button--ghost {
      background: #d62f1f;
    }

    .movie-card__button:hover {
      background: #c92516;
    }

    .movies-list--coming-soon .movie-card__poster {
      min-height: 355px;
    }

    @media (max-width: 1100px) {
      .movies-list {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (max-width: 640px) {
      .movies-page {
        padding-top: 0.9rem;
      }

      .movies-hero {
        align-items: start;
        flex-direction: column;
      }

      .movies-hero__switch {
        justify-content: flex-start;
      }

      .movies-list {
        gap: 1.4rem;
        grid-template-columns: 1fr;
      }

      .movie-card__poster {
        min-height: 300px;
      }
    }
  `
})
export class MoviesComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly movieService = inject(MovieService);
  protected readonly language = inject(LanguageService);
  private readonly titleService = inject(Title);
  protected readonly t = this.language.t.bind(this.language);

  protected readonly activeSection = signal<MoviesSection>('now-showing');
  protected readonly nowShowingMovies = signal<MovieCard[]>([]);
  protected readonly comingSoonMovies = signal<MovieCard[]>([]);
  protected readonly selectedMovieForSchedule = signal<MovieCard | null>(null);

  protected readonly sectionTitle = computed(() => (this.activeSection() === 'coming-soon' ? this.t('home.comingSoonTitle') : this.t('home.nowShowingTitle')));
  protected readonly sectionDescription = computed(() => (this.activeSection() === 'coming-soon' ? this.t('home.comingSoonDescription') : this.t('home.nowShowingDescription')));

  constructor() {
    effect(() => {
      this.language.currentLanguage();
      const key = this.activeSection() === 'coming-soon' ? 'titles.moviesComing' : 'titles.moviesShowing';
      this.titleService.setTitle(this.t(key));
    });
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const tab = params.get('tab');
      this.activeSection.set(tab === 'coming-soon' ? 'coming-soon' : 'now-showing');
    });

    this.movieService
      .getNowShowingMoviesHot()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((movies) => {
        const validMovies = movies.filter(m => m.title && m.posterUrl);
        this.nowShowingMovies.set(validMovies.map((movie, index) => this.toNowShowingCard(movie, index)));
      });

    this.movieService
      .getComingSoonMovies()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((movies) => {
        const validMovies = movies.filter(m => m.title && m.posterUrl);
        this.comingSoonMovies.set(validMovies.map((movie, index) => this.toComingSoonCard(movie, index)));
      });
  }

  protected isActive(section: MoviesSection): boolean {
    return this.activeSection() === section;
  }

  protected setSection(section: MoviesSection): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: section },
      queryParamsHandling: 'merge'
    });
  }

  protected openSchedule(movie: MovieCard): void {
    this.selectedMovieForSchedule.set(movie);
  }

  protected isEn(): boolean {
    return this.language.currentLanguage() === 'en';
  }

  protected getGenre(m: Movie): string {
    const genre = this.isEn() ? (m.genreEn ?? m.genre) : m.genre;
    if (Array.isArray(genre)) {
      return genre.join(', ');
    }
    return (genre as string) || '';
  }

  protected getTitle(m: Movie): string {
    return (this.isEn() ? m.titleEn : m.title) || m.title;
  }

  protected closeSchedule(): void {
    this.selectedMovieForSchedule.set(null);
  }

  protected moviePoster(movie: MovieCard): string {
    return movie.posterUrl || movie.backdropUrl || this.buildFallbackPoster(movie.title);
  }

  protected movieRateCode(movie: MovieCard): string {
    return (movie.ageRating?.trim() || movie.posterLabel?.trim() || movie.rate?.trim() || '').toUpperCase();
  }

  protected formatDate(dateString?: string): string {
    if (!dateString) return '';
    try {
      const parts = dateString.split(' ');
      if (parts.length > 0) {
        const dateParts = parts[0].split('-');
        if (dateParts.length === 3) {
          // Format as dd-mm-yyyy
          return `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
        }
      }
    } catch {
      // ignore
    }
    return dateString;
  }

  private toNowShowingCard(movie: Movie, index: number): MovieCard {
    const posterTones = ['teal', 'amber', 'red', 'green'] as const;
    const posterTone = posterTones[index % posterTones.length] ?? 'teal';

    return {
      ...movie,
      subtitle: this.getGenre(movie) || 'Đang cập nhật',
      posterLabel: movie.ageRating || movie.rate || 'P',
      posterTone,
      rank: index < 3 ? index + 1 : undefined,
      ctaLabel: this.t('home.movieActionBook'),
      releaseHint: this.formatDate(movie.releaseDate) || this.t('movies.showing')
    };
  }

  private toComingSoonCard(movie: Movie, index: number): MovieCard {
    const posterTones = ['teal', 'amber', 'red', 'green'] as const;
    const posterTone = posterTones[index % posterTones.length] ?? 'teal';

    return {
      ...movie,
      subtitle: this.getGenre(movie) || this.t('movies.coming'),
      posterLabel: movie.ageRating || movie.rate || 'P',
      posterTone,
      ctaLabel: this.t('movies.preBook'),
      releaseHint: this.formatDate(movie.releaseDate) || this.t('movies.coming')
    };
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
}
