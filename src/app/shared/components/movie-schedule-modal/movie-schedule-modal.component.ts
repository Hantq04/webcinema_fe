import { ChangeDetectionStrategy, Component, inject, signal, effect, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MovieService } from '../../../core/services/movie.service';
import { AuthService } from '../../../core/services/auth.service';
import { LanguageService } from '../../../core/services/language.service';
import { DailySchedule } from '../../../core/models/movie.model';

@Component({
  selector: 'app-movie-schedule-modal',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="schedule-modal" role="dialog" aria-modal="true" (click)="close.emit()">
      <div class="schedule-modal__panel" (click)="$event.stopPropagation()">
        <button type="button" class="schedule-modal__close" (click)="close.emit()" [attr.aria-label]="t('shared.close')">×</button>
        
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
            <button type="button" class="schedule-filter-btn" 
                    [class.schedule-filter-btn--active]="scheduleAddress() === 'Hồ Chí Minh'"
                    (click)="setScheduleAddress('Hồ Chí Minh')">{{ t('booking.cityHcm') }}</button>
            <button type="button" class="schedule-filter-btn" 
                    [class.schedule-filter-btn--active]="scheduleAddress() === 'Hà Nội'"
                    (click)="setScheduleAddress('Hà Nội')">{{ t('booking.cityHn') }}</button>
            <button type="button" class="schedule-filter-btn" 
                    [class.schedule-filter-btn--active]="scheduleAddress() === 'Đà Nẵng'"
                    (click)="setScheduleAddress('Đà Nẵng')">{{ t('booking.cityDn') }}</button>
          </div>
          <div class="schedule-rooms">
            <button type="button" class="schedule-filter-btn" 
                    [class.schedule-filter-btn--active]="scheduleRoom() === 'STANDARD'"
                    (click)="setScheduleRoom('STANDARD')">{{ t('booking.roomStandard') }}</button>
            <button type="button" class="schedule-filter-btn" 
                    [class.schedule-filter-btn--active]="scheduleRoom() === 'IMAX'"
                    (click)="setScheduleRoom('IMAX')">{{ t('booking.roomImax') }}</button>
          </div>
        </div>

        <div class="schedule-modal__content" [class.schedule-modal__content--loading]="loadingSchedule()">
          @if (loadingSchedule()) {
            <div class="schedule-loading-overlay">
              <div class="schedule-spinner-box">
                <div class="spinner-icon"></div>
                <p class="spinner-text">{{ t('booking.loadingSchedule') }}</p>
              </div>
            </div>
          }
          @if (displayedCinemas().length === 0 && !loadingSchedule()) {
            <p class="schedule-modal__empty">{{ t('booking.noShowtimes') }}</p>
          } @else {
            <div class="schedule-cinemas">
              @for (cinema of displayedCinemas(); track cinema.cinemaId) {
                <div class="schedule-cinema">
                  <h3 class="schedule-cinema__name">{{ cinema.cinemaName }}</h3>
                  <div class="schedule-cinema__room">{{ t('booking.cinemaLabel') }} {{ cinema.roomType === 'STANDARD' ? '2D' : cinema.roomType }}</div>
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
  `,
  styles: [`
    .schedule-modal {
      align-items: center;
      background: rgba(0, 0, 0, 0.85);
      bottom: 0;
      display: flex;
      justify-content: center;
      left: 0;
      padding: 1rem;
      position: fixed;
      right: 0;
      top: 0;
      z-index: 1000;
      backdrop-filter: blur(4px);
    }

    .schedule-modal__panel {
      background: #fdfcf0;
      border: 4px solid #f4efe3;
      box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.6);
      display: flex;
      flex-direction: column;
      max-height: 95vh;
      max-width: 1200px;
      width: 95%;
      position: relative;
      animation: modalFadeIn 0.3s ease;
      overflow: hidden;
    }

    @keyframes modalFadeIn {
      from { opacity: 0; transform: translateY(20px) scale(0.95); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    .schedule-modal__close {
      background: #333;
      border: none;
      color: #fff;
      cursor: pointer;
      font-size: 1.5rem;
      height: 30px;
      width: 30px;
      line-height: 1;
      position: absolute;
      right: 0;
      top: 0;
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .schedule-modal__close:hover {
      background: #e71a0f;
    }

    .schedule-modal__header {
      border-bottom: 2px solid #222;
      padding: 2rem 2rem 1rem;
    }

    .schedule-dates {
      display: flex;
      gap: 0.5rem;
      overflow-x: auto;
      padding-bottom: 0.5rem;
    }

    .schedule-date-btn {
      background: transparent;
      border: 1px solid #ddd;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0.5rem;
      min-width: 60px;
      transition: all 0.2s;
    }

    .schedule-date-btn:hover {
      background: #fff;
      border-color: #999;
    }

    .schedule-date-btn--active {
      background: #fff;
      border: 2px solid #222;
      padding: 0.4rem;
    }

    .schedule-date-btn__month,
    .schedule-date-btn__weekday {
      font-size: 0.75rem;
      color: #666;
      text-transform: uppercase;
    }

    .schedule-date-btn__day {
      font-size: 1.5rem;
      font-weight: bold;
      color: #222;
      line-height: 1.2;
    }

    .schedule-modal__filters {
      border-bottom: 2px solid #ddd;
      padding: 1rem 2rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .schedule-locations,
    .schedule-rooms {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .schedule-filter-btn {
      background: transparent;
      border: 1px solid #ccc;
      border-radius: 3px;
      color: #444;
      cursor: pointer;
      font-size: 0.9rem;
      padding: 0.4rem 0.8rem;
      transition: all 0.2s;
    }

    .schedule-filter-btn:hover {
      border-color: #666;
      color: #222;
    }

    .schedule-filter-btn--active {
      background: #fff;
      border: 2px solid #222;
      color: #222;
      font-weight: bold;
    }

    .schedule-modal__content {
      flex: 1;
      overflow-y: auto;
      padding: 1.5rem 2rem;
      min-height: 200px;
      position: relative;
    }

    .schedule-modal__content--loading {
      pointer-events: none;
    }

    .schedule-loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(253, 252, 240, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
      backdrop-filter: blur(2px);
    }

    .schedule-spinner-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      background: white;
      padding: 2rem 3rem;
      border-radius: 4px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }

    .spinner-icon {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #e71a0f;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .spinner-text {
      color: #b36815;
      font-weight: bold;
      font-size: 1rem;
      margin: 0;
    }

    .schedule-modal__empty {
      text-align: center;
      color: #888;
      font-size: 1.1rem;
      padding: 3rem 0;
    }

    .schedule-cinemas {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .schedule-cinema {
      border-bottom: 1px solid #eaeaea;
      padding-bottom: 1.5rem;
    }

    .schedule-cinema:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }

    .schedule-cinema__name {
      font-size: 1.3rem;
      color: #555;
      margin: 0 0 1rem;
      font-weight: normal;
    }

    .schedule-cinema__room {
      font-size: 1rem;
      color: #333;
      margin-bottom: 0.8rem;
    }

    .schedule-cinema__times {
      display: flex;
      flex-wrap: wrap;
      gap: 0.8rem;
    }

    .schedule-time-btn {
      background: #fcfcfc;
      border: 1px solid #ddd;
      color: #222;
      cursor: pointer;
      font-size: 1.1rem;
      padding: 0.5rem 1.2rem;
      text-decoration: none;
      transition: all 0.2s;
    }

    .schedule-time-btn:hover {
      background: #e71a0f;
      border-color: #e71a0f;
      color: #fff;
    }
  `]
})
export class MovieScheduleModalComponent {
  private readonly movieService = inject(MovieService);
  private readonly authService = inject(AuthService);
  private readonly languageService = inject(LanguageService);
  private readonly router = inject(Router);

  protected readonly t = this.languageService.t.bind(this.languageService);

  // Inputs
  movieId = input.required<string>();
  movieTitle = input<string>('');
  moviePoster = input<string>('');
  movieRate = input<string>('');

  // Outputs
  close = output<void>();

  protected readonly scheduleAddress = signal('Hồ Chí Minh');
  protected readonly scheduleRoom = signal('STANDARD');
  protected readonly scheduleDate = signal('');
  protected readonly scheduleData = signal<DailySchedule[]>([]);
  protected readonly loadingSchedule = signal(false);
  private isDateChanging = false;

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
    effect(() => {
      const movieId = this.movieId();
      const address = this.scheduleAddress();
      const roomType = this.scheduleRoom();

      if (movieId) {
        if (this.isDateChanging) {
          this.loadingSchedule.set(true);
        }

        this.movieService.getMovieSchedule(movieId, address, roomType).subscribe(data => {
          const finalize = () => {
            this.scheduleData.set(data);
            if (data.length > 0 && !this.scheduleDate()) {
              this.scheduleDate.set(data[0].date);
            }
            this.loadingSchedule.set(false);
            this.isDateChanging = false;
          };

          if (this.isDateChanging) {
            // Artificial delay: Reduced to 500ms as requested
            setTimeout(finalize, 500);
          } else {
            finalize();
          }
        });
      }
    });
  }

  protected setScheduleAddress(address: string): void {
    this.scheduleAddress.set(address);
  }

  protected setScheduleRoom(roomType: string): void {
    this.scheduleRoom.set(roomType);
  }

  protected setScheduleDate(date: string): void {
    this.isDateChanging = true;
    this.scheduleDate.set(date);
    this.scheduleAddress.set('Hồ Chí Minh');
    this.scheduleRoom.set('STANDARD');
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

    sessionStorage.setItem('bookingContext', JSON.stringify({
      movieTitle: this.movieTitle(),
      moviePoster: this.moviePoster(),
      movieRate: this.movieRate(),
      roomType: this.scheduleRoom() === 'STANDARD' ? '2D' : this.scheduleRoom()
    }));

    void this.router.navigate(['/booking', st.scheduleCode]);
  }
}
