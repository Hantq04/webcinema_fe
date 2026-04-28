import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal, viewChild, ElementRef, effect } from '@angular/core';
import { DomSanitizer, SafeResourceUrl, Title } from '@angular/platform-browser';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Movie } from '../../core/models/movie.model';
import { MovieService } from '../../core/services/movie.service';
import { EventService } from '../../core/services/event.service';
import { LanguageService } from '../../core/services/language.service';
import { MovieScheduleModalComponent } from '../../shared/components/movie-schedule-modal/movie-schedule-modal.component';

type EventCardAccent = 'crimson' | 'navy' | 'rose' | 'gold';

interface EventCard {
  id: string;
  imageUrl: string;
  href: string;
}

@Component({
  selector: 'app-home',
  imports: [RouterLink, MovieScheduleModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="home-shell">
      <div class="home-shell__glow" aria-hidden="true"></div>

      <!-- EVENT BANNER - CGV style slider -->
      <section class="event-banner" aria-label="Event banner">
        <div class="event-banner__wrap">
          <div class="event-banner__stage">
            @if (eventBannerSlides().length > 0) {
              <div class="event-banner__track" [style.transform]="'translateX(-' + (eventBannerIndex() * 100) + '%)'">
                @for (slide of eventBannerSlides(); track slide.id) {
                  <a href="javascript:void(0)" (click)="onEventClick(slide)" class="event-banner__link">
                    <img
                      class="event-banner__image"
                      [src]="slide.imageUrl"
                      [alt]="slide.title || 'Event'"
                      loading="eager"
                    />
                  </a>
                }
              </div>
              <button type="button" class="event-banner__nav event-banner__nav--prev" (click)="previousEventSlide()" aria-label="Previous event">
                &#8249;
              </button>
              <button type="button" class="event-banner__nav event-banner__nav--next" (click)="nextEventSlide()" aria-label="Next event">
                &#8250;
              </button>
              <div class="event-banner__dots" role="tablist">
                @for (dot of visibleEventDots(); track dot.index) {
                  <button
                    type="button"
                    class="event-banner__dot"
                    [class.event-banner__dot--active]="dot.index === eventBannerIndex()"
                    (click)="goToEventSlide(dot.index)"
                    [attr.aria-label]="'Event ' + (dot.index + 1)"
                  ></button>
                }
              </div>
            } @else {
              <!-- Placeholder when no event images yet -->
              <div class="event-banner__placeholder" aria-hidden="true">
                <div class="event-banner__dots">
                  @for (dot of [0,1,2,3,4]; track dot) {
                    <span class="event-banner__dot event-banner__dot--placeholder"></span>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      </section>

      <div class="mx-auto max-w-7xl px-4 pb-12 pt-6 max-[640px]:pb-10 max-[640px]:pt-4">

        <section class="movie-section" aria-labelledby="movie-selection-title">
          <div class="movie-section__header">
            <div class="movie-section__rule"></div>
            <div>
              <p id="movie-selection-title" class="movie-section__title">{{ t('home.movieSelectionTitle') }}</p>
            </div>
            <div class="movie-section__rule"></div>
          </div>

          @if (loadingMovies()) {
            <div class="movie-carousel__track movie-carousel__track--loading" aria-hidden="true">
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
            <div class="movie-carousel">
              @if (canScrollLeft()) {
                <button type="button" class="movie-carousel__nav movie-carousel__nav--prev" (click)="scrollMovies(-1)" aria-label="Previous movies">
                  &#10094;
                </button>
              }
              
              <div class="movie-carousel__track" #movieTrack (scroll)="updateScrollState()">
                @for (movie of movieCards(); track movie.id) {
                <article class="poster-card" tabindex="0">
                  <div class="poster-card__poster">
                    <img class="poster-card__image" [src]="movieImage(movie)" [alt]="movie.title" loading="lazy" />
                    <div class="poster-card__shade"></div>
                    <span
                      class="poster-card__rate"
                      [class.poster-card__rate--g]="movieRateCode(movie) === 'G'"
                      [class.poster-card__rate--pg]="movieRateCode(movie) === 'PG'"
                      [class.poster-card__rate--pg13]="movieRateCode(movie) === 'PG-13'"
                      [class.poster-card__rate--r]="movieRateCode(movie) === 'R'"
                      [class.poster-card__rate--nc17]="movieRateCode(movie) === 'NC-17'"
                    >
                      {{ movieRate(movie) }}
                    </span>
                    @if (movieTrailer(movie)) {
                      <button
                        type="button"
                        class="poster-card__trailer-center"
                        (click)="openTrailer(movie)"
                      >
                        {{ t('home.movieActionTrailer') }}
                      </button>
                    } @else {
                      <a routerLink="/movies" class="poster-card__trailer-center">{{ t('home.movieActionTrailer') }}</a>
                    }
                  </div>

                  <div class="poster-card__overlay">
                    <h3 class="poster-card__title">{{ getTitle(movie) }}</h3>
                    <p class="poster-card__description">{{ getDescription(movie) }}</p>

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
                      <a [routerLink]="['/movies', movie.code || movie.id]" class="poster-card__button poster-card__button--solid">{{ t('home.movieActionDetails') }}</a>
                      <button type="button" (click)="openSchedule(movie)" class="poster-card__button poster-card__button--solid">
                        <span style="font-weight: 900; font-size: 1.1rem; margin-right: 6px; line-height: 1; transform: translateY(-1px);">»</span>
                        {{ t('home.movieActionBook') }}
                      </button>
                    </div>
                  </div>
                </article>
                }
              </div>

              @if (canScrollRight()) {
                <button type="button" class="movie-carousel__nav movie-carousel__nav--next" (click)="scrollMovies(1)" aria-label="Next movies">
                  &#10095;
                </button>
              }
            </div>
          } @else {
            <div class="movie-grid__empty">
              <p>{{ t('home.movieEmptyTitle') }}</p>
              <span>{{ t('home.movieEmptyDescription') }}</span>
            </div>
          }
        </section>

        <section class="event-section" aria-labelledby="event-section-title">
          <div class="event-section__header">
            <div class="event-section__line"></div>
            <p id="event-section-title" class="event-section__title">EVENT</p>
            <div class="event-section__line"></div>
          </div>

          <div class="event-section__banner">
            <div class="event-banner-ribbon">
              <span class="event-banner-ribbon__icon">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 12l-6-6v4H4v4h10v4l6-6z"/></svg>
              </span>
              <span class="event-banner-ribbon__text">Thành Viên CGV | Tin Mới & Ưu Đãi</span>
            </div>
          </div>

          <div class="event-section__row-wrapper">
            <div class="event-section__grid event-section__grid--top">
              @for (card of eventTopCards; track card.id) {
                <div class="event-card-frame">
                  <a href="javascript:void(0)" (click)="onEventClick()" class="event-card-img">
                    <img [src]="card.imageUrl" [alt]="card.id" loading="lazy" />
                  </a>
                </div>
              }
            </div>
          </div>

          <div class="event-section__divider"></div>

          <div class="event-section__grid event-section__grid--bottom">
            @for (card of eventBottomCards; track card.id) {
              <div class="event-card-frame">
                <a href="javascript:void(0)" (click)="onEventClick()" class="event-card-img" [class.event-card-img--wide]="card.id === 'b2'">
                  <img [src]="card.imageUrl" [alt]="card.id" loading="lazy" />
                </a>
              </div>
            }
          </div>

          <div class="event-section__divider"></div>
        </section>

        @if (trailerPreview()) {
          <div class="trailer-modal" role="dialog" aria-modal="true" aria-labelledby="trailer-modal-title" (click)="closeTrailer()" (keydown.escape)="closeTrailer()" tabindex="-1">
            <div class="trailer-modal__panel" (click)="$event.stopPropagation()">
              <div class="trailer-modal__header">
                <div class="trailer-modal__title-wrap">
                  <h3 id="trailer-modal-title" class="trailer-modal__title">{{ trailerPreview()?.title }}</h3>
                  <span class="trailer-modal__subtitle">{{ t('home.movieActionTrailer') }}</span>
                </div>

                <button type="button" class="trailer-modal__close" (click)="closeTrailer()" aria-label="Close trailer preview">
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


        @if (selectedMovieForSchedule(); as m) {
          <app-movie-schedule-modal
            [movieId]="m.id"
            [movieTitle]="m.title"
            [moviePoster]="movieImage(m)"
            [movieRate]="movieRate(m)"
            (close)="closeSchedule()"
          />
        }
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



    .home-shell__glow {
      background: radial-gradient(circle at center, rgba(255, 237, 190, 0.55), transparent 58%);
      inset: 0;
      pointer-events: none;
      position: absolute;
      z-index: 0;
    }

    /* ── EVENT BANNER (VenusCinema-style full-width) ───────────────────── */
    .event-banner {
      position: relative;
      z-index: 1;
      width: 100%;
      padding: 0;
      background: #0d0a08;
    }

    .event-banner__wrap {
      width: 100%;
    }

    .event-banner__stage {
      position: relative;
      width: 100%;
      /* Tỷ lệ rộng và cao kiểu VenusCinema: ~16:7 */
      aspect-ratio: 16 / 6;
      overflow: hidden;
      border-radius: 0;
      box-shadow: none;
      background: #0d0a08;
    }

    .event-banner__track {
      display: flex;
      width: 100%;
      height: 100%;
      transition: transform 600ms cubic-bezier(0.4, 0, 0.2, 1);
      will-change: transform;
    }

    .event-banner__link {
      flex: 0 0 100%;
      width: 100%;
      height: 100%;
      display: block;
      cursor: pointer;
    }

    .event-banner__image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .event-banner__placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      padding-bottom: 1rem;
      background: linear-gradient(135deg, #23100a 0%, #3a1a0c 50%, #23100a 100%);
    }

    .event-banner__nav {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      z-index: 2;
      background: rgba(0, 0, 0, 0.25);
      border: none;
      border-radius: 0;
      color: #fff;
      cursor: pointer;
      font-size: 3rem;
      width: 3rem;
      height: 5rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: background 160ms ease;
      padding: 0;
      line-height: 1;
    }

    .event-banner__nav:hover {
      background: rgba(0, 0, 0, 0.42);
    }

    .event-banner__nav--prev {
      left: 0;
    }

    .event-banner__nav--next {
      right: 0;
    }

    .event-banner__dots {
      position: absolute;
      bottom: 0.75rem;
      left: 0;
      right: 0;
      display: flex;
      justify-content: center;
      gap: 0.4rem;
      z-index: 2;
    }

    .event-banner__dot {
      background: rgba(255, 248, 239, 0.35);
      border: 0;
      border-radius: 999px;
      cursor: pointer;
      height: 0.55rem;
      width: 0.55rem;
      padding: 0;
      transition: width 220ms ease, background 220ms ease;
    }

    .event-banner__dot--active {
      background: #ea2e1e;
      width: 1.4rem;
    }

    .event-banner__dot--placeholder {
      background: rgba(255, 248, 239, 0.2);
      cursor: default;
    }

    /* ── END EVENT BANNER ──────────────────────────────────────────────────── */

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

    .event-section {
      margin: 0 auto 1.8rem;
      max-width: 1200px;
      padding: 0 2rem;
    }

    .event-section__header {
      align-items: center;
      display: grid;
      gap: 0.9rem;
      grid-template-columns: 1fr auto 1fr;
      margin-bottom: 0.85rem;
    }

    .event-section__line {
      border-top: 2px solid #111;
      border-bottom: 2px solid #111;
      height: 8px;
    }

    .event-section__title {
      color: #000;
      display: inline-block;
      font-size: clamp(2rem, 3.3vw, 3.4rem);
      font-weight: 900;
      letter-spacing: 0.06em;
      line-height: 1;
      margin: 0;
      text-align: center;
      text-shadow: 0.5px 0.5px 0px rgba(0, 0, 0, 0.15);
      text-transform: uppercase;
      margin: 0 1.5rem;
    }

    .event-section__banner {
      display: flex;
      justify-content: center;
      margin-bottom: 1.5rem;
      margin-top: 0.5rem;
    }

    .event-banner-ribbon {
      background: #e71a0f;
      color: #fff;
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.5rem 3.5rem;
      font-size: 0.95rem;
      font-weight: 700;
      clip-path: polygon(0 0, 18px 50%, 0 100%, 100% 100%, calc(100% - 18px) 50%, 100% 0);
      position: relative;
      z-index: 10;
    }

    .event-banner-ribbon__icon {
      width: 1.4rem;
      height: 1.4rem;
    }

    .event-section__row-wrapper {
      position: relative;
      margin-bottom: 1.5rem;
    }



    .event-section__divider {
      height: 2px;
      background: #111;
      margin: 1.5rem 0;
      width: 100%;
    }

    .event-card-frame {
      display: flex;
    }

    .event-section__grid {
      display: grid;
      gap: 1.25rem;
    }

    .event-section__grid--top {
      grid-template-columns: repeat(4, 1fr);
    }

    .event-section__grid--bottom {
      grid-template-columns: 1.2fr 3fr 1.2fr;
      align-items: center;
    }

    .event-section__grid--top .event-card-frame {
      border: none;
      padding: 0;
      height: auto;
    }

    .event-section__grid--top .event-card-img {
      border: none;
      border-radius: 0;
    }

    .event-section__grid--bottom .event-card-frame {
      border: 2px solid #222;
      padding: 3px;
      height: auto;
      background: #fff;
    }

    .event-section__grid--bottom .event-card-frame:nth-child(odd) {
      aspect-ratio: 1 / 1;
    }

    .event-section__grid--bottom .event-card-img {
      border: 1px solid #222;
    }

    .event-card-img {
      display: flex;
      overflow: hidden;
      width: 100%;
      height: 100%;
      transition: transform 0.2s ease;
      background: #fff;
    }

    .event-card-img:hover {
      transform: scale(1.015);
    }

    .event-card-img img {
      width: 100%;
      height: auto;
      display: block;
      object-fit: contain;
    }

    /* Side images in bottom row should fill the square frame */
    .event-section__grid--bottom .event-card-frame:nth-child(odd) .event-card-img img {
      height: 100% !important;
      object-fit: cover !important;
    }

    .movie-section__header {
      align-items: center;
      display: grid;
      gap: 0.9rem;
      grid-template-columns: 1fr auto 1fr;
      margin-bottom: 1rem;
    }

    .movie-section__rule {
      border-top: 2px solid #000;
      border-bottom: 2px solid rgba(0, 0, 0, 0.4);
      height: 0.35rem;
    }

    .movie-section__title {
      color: #000;
      display: inline-block;
      font-size: clamp(2rem, 3.3vw, 3.4rem);
      font-weight: 900;
      letter-spacing: 0.06em;
      line-height: 1;
      margin: 0;
      text-align: center;
      text-shadow: 0.5px 0.5px 0px rgba(0, 0, 0, 0.15);
      text-transform: uppercase;
    }

    .movie-section__subtitle {
      color: #6f5c49;
      font-size: 0.9rem;
      font-weight: 700;
      margin: 0.45rem 0 0;
      text-align: center;
    }

    .movie-carousel {
      position: relative;
      width: 100%;
      margin-top: 0.15rem;
    }

    .movie-carousel__track {
      display: flex;
      gap: 1rem;
      overflow-x: auto;
      scroll-behavior: smooth;
      scroll-snap-type: x mandatory;
      scrollbar-width: none; /* Firefox */
      padding-bottom: 0.5rem;
    }

    .movie-carousel__track::-webkit-scrollbar {
      display: none; /* Chrome/Safari */
    }

    .movie-carousel__track--loading {
      pointer-events: none;
    }

    .movie-carousel__track .poster-card {
      flex: 0 0 calc(25% - 0.75rem);
      scroll-snap-align: start;
    }

    @media (max-width: 1024px) {
      .movie-carousel__track .poster-card {
        flex: 0 0 calc(33.333% - 0.666rem);
      }
    }

    @media (max-width: 768px) {
      .movie-carousel__track .poster-card {
        flex: 0 0 calc(50% - 0.5rem);
      }
    }

    @media (max-width: 480px) {
      .movie-carousel__track .poster-card {
        flex: 0 0 100%;
      }
    }

    .movie-carousel__nav {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      z-index: 10;
      background: rgba(226, 33, 20, 0.95);
      border: none;
      color: #fff;
      cursor: pointer;
      font-size: 1.6rem;
      width: 2rem;
      height: 4rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      transition: background 160ms ease, transform 160ms ease;
    }

    .movie-carousel__nav:hover {
      background: #f01919;
      transform: translateY(-50%) scale(1.05);
    }

    .movie-carousel__nav--prev {
      left: -2rem;
      border-radius: 4rem 0 0 4rem;
      padding-right: 0.2rem;
    }

    .movie-carousel__nav--next {
      right: -2rem;
      border-radius: 0 4rem 4rem 0;
      padding-left: 0.2rem;
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
      display: flex;
      flex-direction: column;
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
      flex: 1;
      min-height: 0;
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

    .poster-card__trailer-center {
      align-items: center;
      background: rgba(37, 28, 24, 0.7);
      border: 1px solid rgba(255, 248, 239, 0.28);
      border-radius: 999px;
      cursor: pointer;
      color: #fff8ef;
      display: inline-flex;
      font-size: 0.82rem;
      font-weight: 900;
      justify-content: center;
      left: 50%;
      letter-spacing: 0.08em;
      min-height: 3rem;
      min-width: 8.75rem;
      opacity: 0;
      padding: 0.55rem 1rem;
      position: absolute;
      text-decoration: none;
      text-transform: uppercase;
      top: 50%;
      transform: translate(-50%, -50%);
      transition: opacity 180ms ease, transform 180ms ease, background 180ms ease, border-color 180ms ease;
      pointer-events: none;
      z-index: 2;
    }

    .poster-card__trailer-center:hover {
      background: rgba(37, 28, 24, 0.82);
      border-color: rgba(255, 248, 239, 0.45);
    }

    .poster-card:hover .poster-card__trailer-center {
      opacity: 1;
      pointer-events: auto;
    }

    .trailer-modal {
      align-items: center;
      background: rgba(10, 8, 7, 0.9);
      bottom: 0;
      backdrop-filter: blur(8px);
      display: flex;
      justify-content: center;
      left: 0;
      padding: 1.5rem;
      position: fixed;
      right: 0;
      top: 0;
      z-index: 60;
    }

    .trailer-modal__panel {
      background: rgba(14, 12, 10, 0.98);
      border: 4px solid #f4efe3;
      box-shadow: 0 1.5rem 3rem rgba(0, 0, 0, 0.5);
      max-width: 72rem;
      padding: 0.75rem;
      width: min(100%, 62rem);
    }

    .trailer-modal__header {
      align-items: flex-start;
      display: flex;
      gap: 1rem;
      justify-content: space-between;
      margin-bottom: 0.65rem;
    }

    .trailer-modal__title-wrap {
      min-width: 0;
    }

    .trailer-modal__title {
      color: #fff8ef;
      font-size: clamp(1.15rem, 2vw, 1.85rem);
      font-weight: 900;
      letter-spacing: 0.02em;
      line-height: 1.15;
      margin: 0;
      text-transform: uppercase;
    }

    .trailer-modal__subtitle {
      color: rgba(255, 248, 239, 0.72);
      display: block;
      font-size: 0.85rem;
      font-weight: 700;
      margin-top: 0.2rem;
    }

    .trailer-modal__close {
      background: transparent;
      border: none;
      color: #888;
      cursor: pointer;
      font-size: 2rem;
      line-height: 1;
      padding: 0 0.5rem;
      transition: color 0.2s;
    }

    .trailer-modal__close:hover {
      color: #fff;
    }

    .trailer-modal__frame-shell {
      background: #000;
      aspect-ratio: 16 / 9;
      overflow: hidden;
      width: 100%;
    }

    .trailer-modal__frame {
      border: 0;
      display: block;
      height: 100%;
      width: 100%;
    }

    .poster-card__rate {
      background: #f2b11d;
      border-radius: 999px;
      color: #fffaf1;
      font-size: 0.72rem;
      font-weight: 900;
      letter-spacing: 0.08em;
      line-height: 1;
      pointer-events: none;
      padding: 0.4rem 0.65rem;
      position: absolute;
      left: 0.85rem;
      top: 0.85rem;
      z-index: 3;
    }

    .poster-card__rate--g {
      background: #2f9d44;
    }

    .poster-card__rate--pg {
      background: #f39c12;
    }

    .poster-card__rate--pg13 {
      background: #6d5bd0;
    }

    .poster-card__rate--r {
      background: #e03a2f;
    }

    .poster-card__rate--nc17 {
      background: #1f8bd6;
    }

    .poster-card__overlay {
      background: linear-gradient(180deg, rgba(255, 248, 238, 0.03), rgba(17, 12, 9, 0.95));
      bottom: 0;
      color: #fff8ef;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      gap: 0.7rem;
      left: 0;
      opacity: 0;
      padding: 0.95rem;
      position: absolute;
      right: 0;
      top: 0;
      transform: translateY(12px);
      transition: opacity 200ms ease, transform 200ms ease;
      z-index: 1;
    }

    .poster-card:hover .poster-card__overlay,
    .poster-card__overlay--visible {
      opacity: 1;
      transform: translateY(0);
    }

    .poster-card__title {
      color: #fffaf2;
      font-size: clamp(1.2rem, 2.3vw, 1.75rem);
      font-weight: 900;
      letter-spacing: 0.02em;
      line-height: 1.02;
      margin: 0 0 0 auto;
      min-width: 0;
      max-width: calc(100% - 4.8rem);
      text-transform: uppercase;
      text-align: right;
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
      flex: 0 0 auto;
      margin-top: 0.1rem;
      font-weight: 800;
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
      grid-template-columns: repeat(2, minmax(0, 1fr));
      margin-top: auto;
      align-items: end;
    }

    .poster-card__button {
      align-items: center;
      border: 1px solid rgba(255, 248, 239, 0.42);
      border-radius: 1.25rem;
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
      border-radius: 1.25rem;
      width: 100%;
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


    @media (max-width: 900px) {
      .quick-links-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .event-banner__stage {
        aspect-ratio: 16 / 8;
      }

      .event-banner__nav {
        font-size: 2.5rem;
        width: 2.5rem;
        height: 4rem;
      }

      .movie-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .event-section__grid--top {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .event-section__grid--bottom {
        grid-template-columns: 1fr;
      }

      .event-card--compact,
      .event-card--feature {
        min-height: 11rem;
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
      .quick-links-grid {
        grid-template-columns: 1fr;
      }

      .event-banner__stage {
        aspect-ratio: 16 / 9;
      }

      .event-banner__nav {
        font-size: 2rem;
        width: 2rem;
        height: 3rem;
      }

      .event-banner__nav--next {
        right: 0;
      }

      .movie-grid {
        grid-template-columns: 1fr;
      }

      .event-section__header {
        grid-template-columns: 1fr;
      }

      .event-section__line {
        display: none;
      }

      .event-section__grid--top {
        grid-template-columns: 1fr;
      }

      .event-section__badge {
        font-size: 0.75rem;
        text-align: center;
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

      .poster-card__trailer-center {
        opacity: 1;
        pointer-events: auto;
      }

      .poster-card__description {
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 3;
        overflow: hidden;
      }

      .trailer-modal {
        padding: 0.75rem;
      }

      .trailer-modal__panel {
        padding: 0.6rem;
      }

      .trailer-modal__header {
        align-items: center;
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
  private readonly eventService = inject(EventService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly titleService = inject(Title);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly language = inject(LanguageService);
  protected readonly t = this.language.t.bind(this.language);
  protected readonly movieCards = signal<Movie[]>([]);
  protected readonly selectedMovieForSchedule = signal<Movie | null>(null);
  protected readonly loadingMovies = signal(true);
  protected readonly carouselIndex = signal(0);
  protected readonly carouselSlides = computed(() => this.movieCards().slice(0, 5));

  // TODO: Xóa dữ liệu fake này khi có API event thật
  protected readonly eventBannerSlides = signal<Array<{ id: string | number; imageUrl: string; title?: string; link?: string }>>([]);
  protected readonly eventBannerIndex = signal(0);
  // Giới hạn tối đa 6 dots
  protected readonly visibleEventDots = computed(() =>
    this.eventBannerSlides()
      .slice(0, 6)
      .map((_, i) => ({ index: i }))
  );
  protected readonly activeCarouselSlide = computed(() => {
    const slides = this.carouselSlides();

    if (slides.length === 0) {
      return null;
    }

    return slides[this.carouselIndex() % slides.length] ?? slides[0] ?? null;
  });
  protected readonly eventTopCards: readonly EventCard[] = [
    { id: '1', imageUrl: '/event/qua_tang.png', href: '/customer/account/login' },
    { id: '2', imageUrl: '/event/dong_gia.png', href: '/booking' },
    { id: '3', imageUrl: '/event/hoan_ve.jpg', href: '/refund' },
    { id: '4', imageUrl: '/event/birthday_popcorn.png', href: '/account' }
  ];
  protected readonly eventBottomCards: readonly EventCard[] = [
    { id: 'b1', imageUrl: '/event/qua_keo_li.png', href: '/customer/account/login' },
    { id: 'b2', imageUrl: '/event/kh_23.png', href: '/movies' },
    { id: 'b3', imageUrl: '/event/thue_rap.png', href: '/booking' }
  ];
  protected readonly trailerPreview = signal<{ title: string; embedUrl: SafeResourceUrl } | null>(null);
  protected readonly loadingSlots = Array.from({ length: 8 }, (_, index) => index);

  protected readonly quickLinks = [
    { id: 'theaters', icon: '🎬', titleKey: 'home.ctaHub', subtitleKey: 'home.ctaHubSub', href: '/booking' },
    { id: 'movies', icon: '🍿', titleKey: 'home.ctaMovies', subtitleKey: 'home.ctaMoviesSub', href: '/movies' },
    { id: 'special', icon: '⭐', titleKey: 'home.ctaSpecial', subtitleKey: 'home.ctaSpecialSub', href: '/movies' },
    { id: 'register', icon: '🎟️', titleKey: 'home.ctaRegister', subtitleKey: 'home.ctaRegisterSub', href: '/customer/account/login' }
  ] as const;

  protected readonly movieTrack = viewChild<ElementRef<HTMLElement>>('movieTrack');
  protected readonly canScrollLeft = signal(false);
  protected readonly canScrollRight = signal(true);

  constructor() {
    effect(() => {
      this.language.currentLanguage();
      this.titleService.setTitle(this.t('titles.home'));
    });

    const carouselTimer = setInterval(() => this.nextCarouselSlide(), 8000);
    const eventTimer = setInterval(() => this.nextEventSlide(), 8000);

    this.destroyRef.onDestroy(() => {
      clearInterval(carouselTimer);
      clearInterval(eventTimer);
    });

    this.movieService
      .getNowShowingMovies()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((movies) => {
        const validMovies = movies.filter(m => m.title && m.posterUrl);
        this.movieCards.set(validMovies);
        this.syncCarouselIndex(validMovies.length);
        this.loadingMovies.set(false);
        setTimeout(() => this.updateScrollState(), 50);
      });

    this.eventService
      .getEvents()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((events) => {
        const slides = events
          .filter(e => e.isActive && e.imageUrl)
          .map((e, index) => ({
            id: e.name || index,
            imageUrl: e.imageUrl,
            title: e.name
          }));
        this.eventBannerSlides.set(slides);
      });

    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        const status = params['paymentStatus'];
        if (status) {
          let message = '';
          if (status === 'success') {
            message = 'Thanh toán thành công';
          } else if (status === 'cancel') {
            message = 'Hủy thanh toán thành công';
          } else if (status === 'fail') {
            message = 'Thanh toán thất bại';
          }

          if (message) {
            alert(message);
            this.router.navigate([], {
              relativeTo: this.route,
              queryParams: { paymentStatus: null },
              queryParamsHandling: 'merge',
              replaceUrl: true
            });
          }
        }
      });
  }

  protected onEventClick(slide?: any): void {
    if (slide && slide.title) {
      void this.router.navigate(['/movies', slide.title]);
    } else {
      alert('Thông tin đang được cập nhật');
    }
  }

  protected updateScrollState(): void {
    const track = this.movieTrack()?.nativeElement;
    if (track) {
      this.canScrollLeft.set(track.scrollLeft > 1);
      this.canScrollRight.set(track.scrollLeft + track.clientWidth < track.scrollWidth - 1);
    }
  }

  protected openSchedule(movie: Movie): void {
    this.selectedMovieForSchedule.set(movie);
  }

  protected closeSchedule(): void {
    this.selectedMovieForSchedule.set(null);
  }

  protected scrollMovies(direction: number): void {
    const track = this.movieTrack()?.nativeElement;
    if (track) {
      const scrollAmount = track.clientWidth * 0.75; // Scroll by 75% of container width
      track.scrollBy({ left: scrollAmount * direction, behavior: 'smooth' });
    }
  }

  protected movieImage(movie: Movie): string {
    return movie.posterUrl || movie.backdropUrl || this.buildFallbackPoster(movie.title);
  }

  protected isEn(): boolean {
    return this.language.currentLanguage() === 'en';
  }

  protected getTitle(m: Movie): string {
    return (this.isEn() ? m.titleEn : m.title) || m.title;
  }

  protected getDescription(m: Movie): string {
    return (this.isEn() ? m.descriptionEn : m.description) || m.description || '';
  }

  protected movieGenre(movie: Movie): string {
    const genre = this.isEn() ? (movie.genreEn ?? movie.genre) : movie.genre;
    if (Array.isArray(genre)) {
      return genre.join(', ') || 'MOVIE';
    }
    return (genre as string)?.trim() || 'MOVIE';
  }

  protected movieRating(movie: Movie): string {
    return movie.ageRating?.trim() || 'P';
  }

  protected movieRate(movie: Movie): string {
    return this.movieRateCode(movie) || this.movieRating(movie);
  }

  protected movieRateCode(movie: Movie): string {
    return (movie.rate?.trim() || movie.ageRating?.trim() || '').toUpperCase();
  }

  protected movieTrailer(movie: Movie): string {
    return movie.trailerUrl?.trim() || '';
  }

  protected previousCarouselSlide(): void {
    const slides = this.carouselSlides();

    if (slides.length === 0) {
      return;
    }

    this.carouselIndex.update((currentIndex) => (currentIndex - 1 + slides.length) % slides.length);
  }

  protected nextCarouselSlide(): void {
    const slides = this.carouselSlides();

    if (slides.length === 0) {
      return;
    }

    this.carouselIndex.update((currentIndex) => (currentIndex + 1) % slides.length);
  }

  protected goToCarouselSlide(index: number): void {
    const slides = this.carouselSlides();

    if (index < 0 || index >= slides.length) {
      return;
    }

    this.carouselIndex.set(index);
  }

  protected previousEventSlide(): void {
    const slides = this.eventBannerSlides();

    if (slides.length === 0) return;

    this.eventBannerIndex.update((i) => (i - 1 + slides.length) % slides.length);
  }

  protected nextEventSlide(): void {
    const slides = this.eventBannerSlides();

    if (slides.length === 0) return;

    this.eventBannerIndex.update((i) => (i + 1) % slides.length);
  }

  protected goToEventSlide(index: number): void {
    const slides = this.eventBannerSlides();

    if (index < 0 || index >= slides.length) return;

    this.eventBannerIndex.set(index);
  }

  protected openTrailer(movie: Movie): void {
    const trailerUrl = this.movieTrailer(movie);

    if (!trailerUrl) {
      return;
    }

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

  protected onDevelop(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    alert('Tính năng đang được phát triển. Vui lòng quay lại sau!');
  }

  private syncCarouselIndex(movieCount: number): void {
    const slides = this.carouselSlides();

    if (slides.length === 0) {
      this.carouselIndex.set(0);
      return;
    }

    if (this.carouselIndex() >= slides.length || movieCount < slides.length) {
      this.carouselIndex.set(0);
    }
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