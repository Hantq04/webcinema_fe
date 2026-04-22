import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal, effect } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { MovieDetail, DailySchedule } from '../../../core/models/movie.model';
import { MovieService } from '../../../core/services/movie.service';
import { LanguageService } from '../../../core/services/language.service';
import { Title, DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-movie-detail',
  imports: [RouterLink, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="movie-detail-page">
      <div class="movie-detail-page__shell">
        <nav class="movies-breadcrumb" aria-label="Breadcrumb">
          <a routerLink="/home" class="movies-breadcrumb__home" [attr.aria-label]="t('header.homeAria')">
            <img src="/home.png" alt="" class="movies-breadcrumb__home-icon" aria-hidden="true" />
          </a>
          <span>›</span>
          <a routerLink="/movies" class="movies-breadcrumb__link">Phim</a>
          <span>›</span>
          <span class="movies-breadcrumb__current">{{ movie()?.title | uppercase }}</span>
        </nav>

        <div class="movie-detail-hero">
          <h1 class="movie-detail-hero__heading">Nội Dung Phim</h1>
          
          @if (movie(); as m) {
            <div class="movie-detail-content">
              <div class="movie-detail-content__left">
                <div class="movie-detail-poster">
                  <img class="movie-detail-poster__image" [src]="moviePoster(m)" [alt]="m.title" />
                </div>
              </div>
              
              <div class="movie-detail-content__right">
                <h2 class="movie-detail-info__title">{{ m.title | uppercase }}</h2>
                
                <div class="movie-detail-info__grid">
                  <div class="movie-detail-info__row">
                    <strong>Đạo diễn:</strong>
                    <span>{{ m.director || 'Đang cập nhật' }}</span>
                  </div>
                  <div class="movie-detail-info__row">
                    <strong>Diễn viên:</strong>
                    <span>{{ m.actor || 'Đang cập nhật' }}</span>
                  </div>
                  <div class="movie-detail-info__row">
                    <strong>Thể loại:</strong>
                    <span>{{ m.genre || 'Đang cập nhật' }}</span>
                  </div>
                  <div class="movie-detail-info__row">
                    <strong>Khởi chiếu:</strong>
                    <span>{{ formatDate(m.releaseDate) }}</span>
                  </div>
                  <div class="movie-detail-info__row">
                    <strong>Thời lượng:</strong>
                    <span>{{ m.durationMinutes ? m.durationMinutes + ' phút' : 'Đang cập nhật' }}</span>
                  </div>
                  <div class="movie-detail-info__row">
                    <strong>Ngôn ngữ:</strong>
                    <span>{{ m.language || 'Tiếng Việt' }}{{ m.movieSubtitle ? ' - Phụ đề ' + m.movieSubtitle : '' }}</span>
                  </div>
                  <div class="movie-detail-info__row movie-detail-info__row--rated">
                    <strong>Rated:</strong>
                    <span style="text-transform: uppercase; font-weight: bold;">{{ formatRate(m) }}</span>
                  </div>
                </div>

                <div class="movie-detail-formats">
                  @if (m.rate) {
                    <span class="movie-detail-badge movie-detail-badge--rate">{{ m.rate }}</span>
                  }
                  <span class="movie-detail-badge movie-detail-badge--format">4DX</span>
                  <span class="movie-detail-badge movie-detail-badge--format movie-detail-badge--starium">STARIUM</span>
                  <span class="movie-detail-badge movie-detail-badge--format">ULTRA 4DX</span>
                </div>

                <div class="movie-detail-actions">
                  <button type="button" (click)="openSchedule()" class="movie-detail-btn movie-detail-btn--buy">
                    MUA VÉ
                  </button>
                </div>
              </div>
            </div>

            <div class="movie-detail-tabs">
              <div class="movie-detail-tabs__header-container">
                <div class="movie-detail-tabs__ribbon">
                  <button type="button" class="movie-detail-tabs__btn movie-detail-tabs__btn--active">
                    Chi tiết
                  </button>
                  <span class="movie-detail-tabs__separator">|</span>
                  <button type="button" class="movie-detail-tabs__btn" (click)="openTrailer(m)">Trailer</button>
                </div>
              </div>
              <div class="movie-detail-tabs__content">
                <p class="movie-detail-desc">{{ m.description || 'Nội dung đang được cập nhật.' }}</p>
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
              <div class="schedule-modal" role="dialog" aria-modal="true" (click)="closeSchedule()">
                <div class="schedule-modal__panel" (click)="$event.stopPropagation()">
                  <button type="button" class="schedule-modal__close" (click)="closeSchedule()" aria-label="Đóng">×</button>
                  
                  <div class="schedule-modal__header">
                    <div class="schedule-dates">
                      @for (date of availableDates(); track date) {
                        <button type="button" class="schedule-date-btn" 
                                [class.schedule-date-btn--active]="scheduleDate() === date"
                                (click)="setScheduleDate(date)">
                          <span class="schedule-date-btn__month">{{ formatScheduleDateMonth(date) }}</span>
                          <span class="schedule-date-btn__weekday">{{ formatScheduleDateWeekday(date) }}</span>
                          <span class="schedule-date-btn__day">{{ formatScheduleDateDay(date) }}</span>
                        </button>
                      }
                    </div>
                  </div>

                  <div class="schedule-modal__filters">
                    <div class="schedule-locations">
                      @for (loc of ['Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng']; track loc) {
                        <button type="button" class="schedule-filter-btn" 
                                [class.schedule-filter-btn--active]="scheduleAddress() === loc"
                                (click)="setScheduleAddress(loc)">{{ loc }}</button>
                      }
                    </div>
                    <div class="schedule-rooms">
                      <button type="button" class="schedule-filter-btn" 
                              [class.schedule-filter-btn--active]="scheduleRoom() === 'STANDARD'"
                              (click)="setScheduleRoom('STANDARD')">2D Phụ Đề Việt</button>
                      <button type="button" class="schedule-filter-btn" 
                              [class.schedule-filter-btn--active]="scheduleRoom() === 'IMAX'"
                              (click)="setScheduleRoom('IMAX')">IMAX 2D Phụ Đề Việt</button>
                    </div>
                  </div>

                  <div class="schedule-modal__content" [class.schedule-modal__content--loading]="loadingSchedule()">
                    @if (displayedCinemas().length === 0 && !loadingSchedule()) {
                      <p class="schedule-modal__empty">Xin lỗi, không có suất chiếu vào ngày này, hãy chọn một ngày khác.</p>
                    } @else {
                      <div class="schedule-cinemas">
                        @for (cinema of displayedCinemas(); track cinema.cinemaId) {
                          <div class="schedule-cinema">
                            <h3 class="schedule-cinema__name">{{ cinema.cinemaName }}</h3>
                            <div class="schedule-cinema__room">Rạp {{ cinema.roomType === 'STANDARD' ? '2D' : cinema.roomType }}</div>
                            <div class="schedule-cinema__times">
                              @for (st of cinema.showtimes; track st.scheduleCode) {
                                <button type="button" class="schedule-time-btn" (click)="onSelectShowtime(st, cinema)">
                                  {{ st.time }}
                                </button>
                              }
                            </div>
                          </div>
                        }
                      </div>
                    }
                  </div>
                </div>
              </div>
            }
          } @else if (!loading()) {
            <div class="movie-detail-error">
              <p>Không tìm thấy thông tin phim.</p>
              <a routerLink="/movies" class="movie-detail-error__link">Quay lại danh sách phim</a>
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
  protected readonly movie = signal<MovieDetail | null>(null);
  protected readonly loading = signal(true);
  protected readonly trailerPreview = signal<{ title: string; embedUrl: SafeResourceUrl } | null>(null);

  protected readonly isScheduleOpen = signal(false);
  protected readonly scheduleAddress = signal('Hồ Chí Minh');
  protected readonly scheduleRoom = signal('STANDARD');
  protected readonly scheduleDate = signal('');
  protected readonly scheduleData = signal<DailySchedule[]>([]);
  protected readonly loadingSchedule = signal(false);

  protected readonly availableDates = computed(() => {
    const dates: string[] = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      dates.push(`${year}-${month}-${day}`);
    }
    return dates;
  });

  protected readonly displayedCinemas = computed(() => {
    const data = this.scheduleData();
    const date = this.scheduleDate();
    const schedule = data.find(d => d.date === date);
    return schedule ? schedule.cinemas : [];
  });

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const code = params.get('code');
      if (code) {
        this.loading.set(true);
        this.movieService.getMovieDetailByCode(code).subscribe((detail) => {
          this.movie.set(detail);
          this.loading.set(false);
          
          if (detail?.title) {
            this.titleService.setTitle(`${detail.title} - CineGo`);
          }
        });
      } else {
        this.loading.set(false);
      }
    });

    effect(() => {
      const movieId = this.movie()?.id;
      const isOpen = this.isScheduleOpen();
      const address = this.scheduleAddress();
      const roomType = this.scheduleRoom();

      if (isOpen && movieId) {
        this.loadingSchedule.set(true);
        this.movieService.getMovieSchedule(movieId, address, roomType).subscribe(data => {
          this.scheduleData.set(data);
          if (data.length > 0) {
            if (!data.find(d => d.date === this.scheduleDate())) {
              this.scheduleDate.set(data[0].date);
            }
          } else {
            this.scheduleDate.set('');
          }
          this.loadingSchedule.set(false);
        });
      }
    });
  }

  protected moviePoster(movie: MovieDetail): string {
    return movie.posterUrl || movie.backdropUrl || this.buildFallbackPoster(movie.title);
  }

  protected formatRate(movie: MovieDetail): string {
    if (movie.rate && movie.rateName) {
      return `${movie.rate} - ${movie.rateName}`;
    }
    return movie.rateName || movie.rate || 'P - Phù hợp với mọi lứa tuổi';
  }

  protected formatDate(dateString?: string): string {
    if (!dateString) return 'Đang cập nhật';
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

  protected setScheduleAddress(address: string): void {
    this.scheduleAddress.set(address);
  }

  protected setScheduleRoom(roomType: string): void {
    this.scheduleRoom.set(roomType);
  }

  protected setScheduleDate(date: string): void {
    this.scheduleDate.set(date);
  }

  protected formatScheduleDateMonth(dateStr: string): string {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    return parts.length === 3 ? parts[1] : '';
  }

  protected formatScheduleDateDay(dateStr: string): string {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    return parts.length === 3 ? parts[2] : '';
  }

  protected formatScheduleDateWeekday(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()] || '';
  }

  protected onSelectShowtime(st: { time: string; scheduleCode: string }, cinema: any): void {
    if (!this.authService.isAuthenticated()) {
      void this.router.navigate(['/auth']);
      return;
    }

    const m = this.movie();
    if (m) {
      sessionStorage.setItem('bookingContext', JSON.stringify({
        movieTitle: m.title,
        moviePoster: this.moviePoster(m),
        movieRate: m.rate?.split('-')[0].trim() || m.rate,
        roomType: this.scheduleRoom() === 'STANDARD' ? '2D' : this.scheduleRoom()
      }));
    }

    void this.router.navigate(['/booking', st.scheduleCode]);
  }
}
