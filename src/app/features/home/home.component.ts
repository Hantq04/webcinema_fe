import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Movie } from '../../core/models/movie.model';
import { MovieService } from '../../core/services/movie.service';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="home-shell">
      <div class="home-shell__glow" aria-hidden="true"></div>

      <div class="mx-auto max-w-7xl px-4 pb-12 pt-6 max-[640px]:pb-10 max-[640px]:pt-4">
        <div class="quick-links-grid" aria-label="{{ t('home.quickAccessTitle') }}">
          @for (link of quickLinks; track link.id) {
            <a [routerLink]="link.href" class="quick-link-card">
              <span class="quick-link-card__icon" aria-hidden="true">{{ link.icon }}</span>
              <strong class="quick-link-card__title">{{ t(link.titleKey) }}</strong>
              <small class="quick-link-card__subtitle">{{ t(link.subtitleKey) }}</small>
            </a>
          }
        </div>

        <section class="movie-section" aria-labelledby="movie-selection-title">
          <div class="movie-section__header">
            <div class="movie-section__rule"></div>
            <div>
              <p id="movie-selection-title" class="movie-section__title">{{ t('home.movieSelectionTitle') }}</p>
            </div>
            <div class="movie-section__rule"></div>
          </div>

          @if (loadingMovies()) {
            <div class="movie-grid movie-grid--loading" aria-hidden="true">
              @for (slot of loadingSlots; track slot) {
                <article class="poster-card poster-card--loading">
                  <div class="poster-card__poster"></div>
                  <div class="poster-card__overlay poster-card__overlay--visible">
                    <div class="poster-card__meta-row">
                      <span class="poster-card__chip poster-card__chip--ghost"></span>
                      <span class="poster-card__chip poster-card__chip--ghost"></span>
                    </div>
                    <div class="poster-card__line poster-card__line--title"></div>
                    <div class="poster-card__line poster-card__line--body"></div>
                    <div class="poster-card__actions">
                      <span class="poster-card__button poster-card__button--ghost"></span>
                      <span class="poster-card__button poster-card__button--ghost"></span>
                      <span class="poster-card__button poster-card__button--ghost"></span>
                    </div>
                  </div>
                </article>
              }
            </div>
          } @else if (movieCards().length > 0) {
            <div class="movie-grid">
              @for (movie of movieCards(); track movie.id) {
                <article class="poster-card" tabindex="0">
                  <div class="poster-card__poster">
                    <img class="poster-card__image" [src]="movieImage(movie)" [alt]="movie.title" loading="lazy" />
                    <div class="poster-card__shade"></div>
                    <span class="poster-card__rating">{{ movieRating(movie) }}</span>
                  </div>

                  <div class="poster-card__overlay">
                    <span class="poster-card__genre">{{ movieGenre(movie) }}</span>
                    <h3 class="poster-card__title">{{ movie.title }}</h3>
                    <p class="poster-card__description">{{ movie.description }}</p>

                    <div class="poster-card__meta-row">
                      @if (movie.durationMinutes) {
                        <span class="poster-card__chip">{{ movie.durationMinutes }} MIN</span>
                      }
                      @if (movie.releaseDate) {
                        <span class="poster-card__chip">{{ movie.releaseDate }}</span>
                      }
                      @if (movie.ageRating) {
                        <span class="poster-card__chip">{{ movie.ageRating }}</span>
                      }
                    </div>

                    <div class="poster-card__actions">
                      <a routerLink="/movies" class="poster-card__button poster-card__button--solid">{{ t('home.movieActionDetails') }}</a>
                      <a routerLink="/booking" class="poster-card__button poster-card__button--solid">{{ t('home.movieActionBook') }}</a>
                      <a routerLink="/movies" class="poster-card__button">{{ t('home.movieActionTrailer') }}</a>
                    </div>
                  </div>
                </article>
              }
            </div>
          } @else {
            <div class="movie-grid__empty">
              <p>{{ t('home.movieEmptyTitle') }}</p>
              <span>{{ t('home.movieEmptyDescription') }}</span>
            </div>
          }
        </section>

        <section class="category-grid" aria-label="{{ t('home.categoriesTitle') }}">
          <div class="category-grid__header">
            <h2 class="category-grid__title">{{ t('home.categoriesTitle') }}</h2>
            <span class="category-grid__subtitle">{{ t('home.categoriesSubtitle') }}</span>
          </div>

          <div class="category-grid__items">
            <article class="category-card">
              <h3>{{ t('home.nowShowingTitle') }}</h3>
              <p>{{ t('home.nowShowingDescription') }}</p>
            </article>
            <article class="category-card">
              <h3>{{ t('home.comingSoonTitle') }}</h3>
              <p>{{ t('home.comingSoonDescription') }}</p>
            </article>
            <article class="category-card">
              <h3>{{ t('home.theatersTitle') }}</h3>
              <p>{{ t('home.theatersDescription') }}</p>
            </article>
          </div>
        </section>
      </div>
    </section>
  `,
  styles: `
    :host {
      display: block;
    }

    .home-shell {
      background:
        radial-gradient(circle at top left, rgba(214, 47, 31, 0.1), transparent 28%),
        radial-gradient(circle at top right, rgba(255, 181, 92, 0.16), transparent 24%),
        linear-gradient(180deg, #f6f0df 0%, #f8f4e7 48%, #f4ecd7 100%);
      overflow: hidden;
      position: relative;
    }

    .home-shell::before,
    .home-shell::after {
      background: repeating-linear-gradient(
        90deg,
        rgba(214, 47, 31, 0.08) 0 1.2rem,
        transparent 1.2rem 2.4rem
      );
      content: '';
      inset-inline: 0;
      height: 0.5rem;
      position: absolute;
      z-index: 0;
    }

    .home-shell::before {
      top: 0;
    }

    .home-shell::after {
      bottom: 0;
    }

    .home-shell__glow {
      background: radial-gradient(circle at center, rgba(255, 237, 190, 0.55), transparent 58%);
      inset: 0;
      pointer-events: none;
      position: absolute;
      z-index: 0;
    }

    .quick-links-grid,
    .movie-section,
    .category-grid {
      position: relative;
      z-index: 1;
    }

    .quick-links-grid {
      display: grid;
      gap: 0.85rem;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      margin-bottom: 1.1rem;
    }

    .quick-link-card {
      align-items: center;
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.95), rgba(255, 246, 229, 0.95));
      border: 1px solid rgba(97, 72, 46, 0.16);
      border-radius: 1.1rem;
      box-shadow: 0 0.6rem 1.2rem rgba(36, 22, 12, 0.08);
      color: #201b16;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      justify-content: center;
      min-height: 8.75rem;
      padding: 1.1rem 0.9rem;
      text-align: center;
      text-decoration: none;
      transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
    }

    .quick-link-card:hover {
      border-color: rgba(214, 47, 31, 0.34);
      box-shadow: 0 0.9rem 1.5rem rgba(36, 22, 12, 0.11);
      transform: translateY(-2px);
    }

    .quick-link-card__icon {
      font-size: 2rem;
      line-height: 1;
    }

    .quick-link-card__title {
      font-size: 0.95rem;
      font-weight: 900;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    .quick-link-card__subtitle {
      color: #6f5c49;
      font-size: 0.78rem;
      font-weight: 700;
    }

    .movie-section {
      margin-bottom: 1.4rem;
    }

    .movie-section__header {
      align-items: center;
      display: grid;
      gap: 0.9rem;
      grid-template-columns: 1fr auto 1fr;
      margin-bottom: 1rem;
    }

    .movie-section__rule {
      border-top: 2px solid rgba(49, 36, 25, 0.72);
      border-bottom: 2px solid rgba(49, 36, 25, 0.38);
      height: 0.35rem;
    }

    .movie-section__title {
      color: #201b16;
      font-size: clamp(2rem, 3.3vw, 3.4rem);
      font-weight: 900;
      letter-spacing: 0.06em;
      line-height: 1;
      margin: 0;
      text-align: center;
      text-transform: uppercase;
    }

    .movie-section__subtitle {
      color: #6f5c49;
      font-size: 0.9rem;
      font-weight: 700;
      margin: 0.45rem 0 0;
      text-align: center;
    }

    .movie-grid {
      display: grid;
      gap: 1rem;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      margin-top: 0.15rem;
    }

    .movie-grid--loading {
      pointer-events: none;
    }

    .movie-grid__empty {
      align-items: center;
      border: 1px dashed rgba(97, 72, 46, 0.2);
      border-radius: 1.2rem;
      color: #6f5c49;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      justify-content: center;
      min-height: 22rem;
      text-align: center;
    }

    .movie-grid__empty p {
      color: #201b16;
      font-size: 1.05rem;
      font-weight: 900;
      margin: 0;
      text-transform: uppercase;
    }

    .poster-card {
      border-radius: 1.1rem;
      overflow: hidden;
      position: relative;
      min-height: 27rem;
      background: #f7f0df;
      border: 1px solid rgba(97, 72, 46, 0.14);
      box-shadow: 0 0.95rem 1.7rem rgba(36, 22, 12, 0.09);
      transition: transform 180ms ease, box-shadow 180ms ease;
    }

    .poster-card:hover,
    .poster-card:focus-within {
      box-shadow: 0 1.2rem 2rem rgba(36, 22, 12, 0.14);
      transform: translateY(-3px);
    }

    .poster-card__poster {
      aspect-ratio: 2 / 3;
      overflow: hidden;
      position: relative;
      width: 100%;
      background: linear-gradient(180deg, #f4e6c8, #d6c09a);
    }

    .poster-card__image {
      height: 100%;
      left: 0;
      object-fit: cover;
      position: absolute;
      top: 0;
      transition: transform 220ms ease, filter 220ms ease;
      width: 100%;
    }

    .poster-card:hover .poster-card__image,
    .poster-card:focus-within .poster-card__image {
      filter: saturate(1.05) contrast(1.02);
      transform: scale(1.04);
    }

    .poster-card__shade {
      background: linear-gradient(180deg, rgba(8, 8, 10, 0.12) 0%, rgba(8, 8, 10, 0.18) 45%, rgba(12, 10, 8, 0.85) 100%);
      inset: 0;
      position: absolute;
    }

    .poster-card__rating {
      background: #f2b11d;
      border-radius: 0.35rem;
      color: #fffaf1;
      font-size: 0.72rem;
      font-weight: 900;
      left: 0.85rem;
      letter-spacing: 0.04em;
      line-height: 1;
      padding: 0.35rem 0.45rem;
      position: absolute;
      top: 0.85rem;
      z-index: 1;
    }

    .poster-card__overlay {
      background: linear-gradient(180deg, rgba(255, 248, 238, 0.03), rgba(17, 12, 9, 0.95));
      bottom: 0;
      color: #fff8ef;
      display: flex;
      flex-direction: column;
      gap: 0.7rem;
      left: 0;
      opacity: 0;
      padding: 1rem;
      position: absolute;
      right: 0;
      top: 0;
      transform: translateY(12px);
      transition: opacity 200ms ease, transform 200ms ease;
    }

    .poster-card:hover .poster-card__overlay,
    .poster-card:focus-within .poster-card__overlay,
    .poster-card__overlay--visible {
      opacity: 1;
      transform: translateY(0);
    }

    .poster-card__genre {
      align-self: flex-start;
      color: #ffb748;
      font-size: 0.72rem;
      font-weight: 900;
      letter-spacing: 0.16em;
      text-transform: uppercase;
    }

    .poster-card__title {
      color: #fffaf2;
      font-size: clamp(1.2rem, 2.3vw, 1.75rem);
      font-weight: 900;
      letter-spacing: 0.02em;
      line-height: 1.02;
      margin: 0;
      text-transform: uppercase;
    }

    .poster-card__description {
      color: rgba(255, 247, 236, 0.85);
      flex: 1;
      font-size: 0.9rem;
      line-height: 1.6;
      margin: 0;
    }

    .poster-card__meta-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .poster-card__chip {
      align-items: center;
      background: rgba(255, 248, 239, 0.12);
      border: 1px solid rgba(255, 248, 239, 0.18);
      border-radius: 999px;
      color: #fff8ef;
      display: inline-flex;
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      min-height: 1.9rem;
      padding: 0.35rem 0.7rem;
      text-transform: uppercase;
    }

    .poster-card__chip--ghost {
      width: 4.25rem;
    }

    .poster-card__line {
      background: rgba(255, 248, 239, 0.2);
      border-radius: 999px;
      opacity: 0.7;
    }

    .poster-card__line--title {
      height: 1.5rem;
      margin-top: auto;
      width: 78%;
    }

    .poster-card__line--body {
      height: 0.8rem;
      width: 92%;
    }

    .poster-card__actions {
      display: grid;
      gap: 0.45rem;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      margin-top: auto;
    }

    .poster-card__button {
      align-items: center;
      border: 1px solid rgba(255, 248, 239, 0.42);
      border-radius: 0.72rem;
      color: #fff8ef;
      display: inline-flex;
      font-size: 0.76rem;
      font-weight: 900;
      justify-content: center;
      min-height: 2.55rem;
      padding: 0.45rem 0.65rem;
      text-decoration: none;
      text-transform: uppercase;
      transition: transform 180ms ease, background 180ms ease, border-color 180ms ease;
    }

    .poster-card__button:hover {
      background: rgba(255, 248, 239, 0.12);
      border-color: rgba(255, 248, 239, 0.56);
      transform: translateY(-1px);
    }

    .poster-card__button--solid {
      background: #ea2e1e;
      border-color: #ea2e1e;
      box-shadow: 0 0.55rem 1rem rgba(214, 47, 31, 0.18);
    }

    .poster-card__button--solid:hover {
      background: #d62f1f;
      border-color: #d62f1f;
    }

    .poster-card--loading {
      overflow: hidden;
    }

    .poster-card--loading .poster-card__poster {
      background: linear-gradient(90deg, #f0e4cd 0%, #e4d4b7 50%, #f0e4cd 100%);
      background-size: 200% 100%;
      animation: loadingPulse 1.2s linear infinite;
    }

    .poster-card--loading .poster-card__overlay {
      gap: 0.75rem;
      justify-content: flex-end;
    }

    .poster-card__button--ghost {
      background: rgba(255, 248, 239, 0.16);
      border-color: transparent;
      min-height: 2.4rem;
    }

    .category-grid {
      margin-top: 0.5rem;
    }

    .category-grid__header {
      align-items: baseline;
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 0.8rem;
    }

    .category-grid__title {
      color: #201b16;
      font-size: 1.15rem;
      font-weight: 900;
      letter-spacing: 0.04em;
      margin: 0;
      text-transform: uppercase;
    }

    .category-grid__subtitle {
      color: #6f5c49;
      font-size: 0.88rem;
      font-weight: 700;
    }

    .category-grid__items {
      display: grid;
      gap: 0.9rem;
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .category-card {
      background: rgba(255, 249, 238, 0.95);
      border: 1px solid rgba(97, 72, 46, 0.16);
      border-radius: 1rem;
      box-shadow: 0 0.6rem 1.2rem rgba(36, 22, 12, 0.06);
      min-height: 8.25rem;
      padding: 1.1rem;
    }

    .category-card h3 {
      color: #201b16;
      font-size: 1rem;
      margin: 0 0 0.5rem;
      text-transform: uppercase;
    }

    .category-card p {
      color: #6f5c49;
      line-height: 1.65;
      margin: 0;
    }

    @media (max-width: 900px) {
      .quick-links-grid,
      .category-grid__items {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .movie-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .poster-card {
        min-height: 24rem;
      }

      .movie-section__header {
        grid-template-columns: 1fr;
      }

      .movie-section__rule {
        display: none;
      }
    }

    @media (max-width: 640px) {
      .quick-links-grid,
      .category-grid__items {
        grid-template-columns: 1fr;
      }

      .movie-grid {
        grid-template-columns: 1fr;
      }

      .poster-card {
        min-height: 22rem;
      }

      .poster-card__actions {
        grid-template-columns: 1fr;
      }

      .poster-card__overlay {
        opacity: 1;
        transform: none;
      }

      .poster-card__description {
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 3;
        overflow: hidden;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .quick-link-card,
      .poster-card,
      .poster-card__image,
      .poster-card__overlay,
      .poster-card__button {
        transition: none;
      }

      .poster-card--loading .poster-card__poster {
        animation: none;
      }
    }

    @keyframes loadingPulse {
      0% {
        background-position: 0% 50%;
      }

      100% {
        background-position: 200% 50%;
      }
    }
  `
})
export class HomeComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly movieService = inject(MovieService);
  protected readonly language = inject(LanguageService);
  protected readonly t = this.language.t.bind(this.language);
  protected readonly movieCards = signal<Movie[]>([]);
  protected readonly loadingMovies = signal(true);
  protected readonly loadingSlots = Array.from({ length: 8 }, (_, index) => index);

  protected readonly quickLinks = [
    { id: 'theaters', icon: '🎬', titleKey: 'home.ctaHub', subtitleKey: 'home.ctaHubSub', href: '/booking' },
    { id: 'movies', icon: '🍿', titleKey: 'home.ctaMovies', subtitleKey: 'home.ctaMoviesSub', href: '/movies' },
    { id: 'special', icon: '⭐', titleKey: 'home.ctaSpecial', subtitleKey: 'home.ctaSpecialSub', href: '/movies' },
    { id: 'register', icon: '🎟️', titleKey: 'home.ctaRegister', subtitleKey: 'home.ctaRegisterSub', href: '/auth' }
  ] as const;

  constructor() {
    this.movieService
      .getHomeMovies()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((movies) => {
        this.movieCards.set(movies);
        this.loadingMovies.set(false);
      });
  }

  protected movieImage(movie: Movie): string {
    return movie.posterUrl || movie.backdropUrl || this.buildFallbackPoster(movie.title);
  }

  protected movieGenre(movie: Movie): string {
    return movie.genre?.trim() || 'MOVIE';
  }

  protected movieRating(movie: Movie): string {
    return movie.ageRating?.trim() || 'P';
  }

  private buildFallbackPoster(title: string): string {
    const safeTitle = title.trim() || 'CineGo';
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 900">
        <defs>
          <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#efe0bd" />
            <stop offset="55%" stop-color="#d4b57b" />
            <stop offset="100%" stop-color="#5f4327" />
          </linearGradient>
          <linearGradient id="band" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="rgba(255,255,255,0.32)" />
            <stop offset="100%" stop-color="rgba(255,255,255,0.05)" />
          </linearGradient>
        </defs>
        <rect width="600" height="900" fill="url(#bg)" />
        <rect x="52" y="56" width="496" height="788" rx="42" fill="url(#band)" />
        <circle cx="468" cy="135" r="62" fill="rgba(255,255,255,0.22)" />
        <text x="50%" y="54%" text-anchor="middle" font-family="Arial, sans-serif" font-size="34" font-weight="700" fill="#fff8ef">${safeTitle}</text>
        <text x="50%" y="61%" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="600" fill="#fff3de">Now showing</text>
      </svg>
    `;

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }
}