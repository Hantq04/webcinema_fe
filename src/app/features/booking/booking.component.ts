import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { DecimalPipe, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { LanguageService } from '../../core/services/language.service';
import { BookingService } from '../../core/services/booking.service';
import { SeatItem, SeatScheduleData } from '../../core/models/seat.model';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './booking.component.css',
  template: `
    <div class="booking-container">
      @if (loading()) {
        <div class="loading-spinner">{{ t('shared.loading') }}...</div>
      } @else if (seatData()) {
        <div class="booking-header">
          <h2>BOOKING ONLINE</h2>
          <div class="booking-info-bar">
            <span>{{ seatData()?.cinema }} | {{ t('booking.roomLabel') }} {{ seatData()?.room }} | {{ t('booking.seatLabel') }} ({{ seatData()?.remainSeats }}/{{ seatData()?.capacity }})</span>
            <br>
            <span>{{ seatData()?.startAt }} ~ {{ seatData()?.endAt }}</span>
          </div>
        </div>

        <div class="booking-content">
          <div class="booking-step-title">{{ t('booking.personSeat') }}</div>
          
          <div class="screen-area">
            <div class="screen-curve">{{ t('booking.screen') }}</div>
          </div>

          <div class="seat-map">
            @for (row of seatRows(); track row.line) {
              <div class="seat-row">
                <div class="seat-row-seats">
                  @for (seat of row.seats; track seat.id) {
                    <button type="button" 
                            class="seat-btn"
                            [class.seat-btn--standard]="seat.seatType === 'Standard'"
                            [class.seat-btn--vip]="seat.seatType === 'VIP'"
                            [class.seat-btn--sweetbox]="seat.seatType === 'Sweet Box'"
                            [class.seat-btn--booked]="seat.status !== 'AVAILABLE'"
                            [class.seat-btn--selected]="isSeatSelected(seat)"
                            (click)="toggleSeat(seat)"
                            [disabled]="seat.status !== 'AVAILABLE'"
                            >
                      <span class="seat-number">{{ seat.line }}{{ seat.number }}</span>
                    </button>
                  }
                </div>
              </div>
            }
          </div>

          <div class="seat-legend">
            <div class="legend-item"><span class="legend-color legend-checked"></span> Checked</div>
            <div class="legend-item"><span class="legend-color legend-booked"></span> {{ t('booking.legendSelected') }}</div>
            <div class="legend-item"><span class="legend-color legend-unavailable"></span> {{ t('booking.legendUnavailable') }}</div>
            <div class="legend-item"><span class="legend-color legend-standard"></span> {{ t('booking.legendStandard') }}</div>
            <div class="legend-item"><span class="legend-color legend-vip"></span> {{ t('booking.legendVip') }}</div>
            <div class="legend-item"><span class="legend-color legend-sweetbox"></span> {{ t('booking.legendSweetbox') }}</div>
          </div>
        </div>

        <div class="booking-footer">
          <button class="btn-previous" (click)="goBack()">
            <span class="icon">&larr;</span> PREVIOUS
          </button>

          <div class="booking-summary">
            @if (bookingContext(); as ctx) {
              <div class="summary-movie-info">
                @if (ctx.moviePoster) {
                  <img [src]="ctx.moviePoster" alt="Poster" class="summary-poster">
                }
                <div class="summary-movie-text">
                  <strong class="summary-movie-title">{{ ctx.movieTitle }}</strong>
                  <span class="summary-movie-room-type">{{ ctx.roomType }}</span>
                  <span class="summary-movie-rate">{{ ctx.movieRate }}</span>
                </div>
              </div>
            }

            <div class="summary-details">
              <div class="summary-col">
                <div class="summary-row"><span class="label">{{ t('booking.cinemaLabel') }}</span> <strong>{{ seatData()?.cinema }}</strong></div>
                <div class="summary-row"><span class="label">{{ t('booking.showtime') }}</span> <strong>{{ seatData()?.startAt }}</strong></div>
                <div class="summary-row"><span class="label">{{ t('booking.roomLabel') }}</span> <strong>{{ seatData()?.room }}</strong></div>
                @if (selectedSeats().length > 0) {
                  <div class="summary-row"><span class="label">{{ t('booking.seatLabel') }}</span> 
                    <div style="display: flex; flex-direction: column;">
                      <strong>{{ getSelectedSeatType() }}</strong>
                      <strong>{{ getSelectedSeatNumbers() }}</strong>
                    </div>
                  </div>
                }
              </div>
              <div class="summary-col">
                <div class="summary-row"><span class="label">{{ t('booking.movieLabel') }}</span> <strong>{{ totalPrice() | number:'1.0-0' }} ₫</strong></div>
                <div class="summary-row"><span class="label">Combo</span> <strong>0,00 ₫</strong></div>
                <div class="summary-row"><span class="label">{{ t('booking.totalLabel') }}</span> <strong class="total-price">{{ totalPrice() | number:'1.0-0' }} ₫</strong></div>
              </div>
            </div>
          </div>

          <button class="btn-next" [disabled]="selectedSeats().length === 0">
            NEXT <span class="icon">&rarr;</span>
          </button>
        </div>
      } @else {
        <div class="error-state">
          <p>{{ t('booking.noShowtimes') }}</p>
          <button class="btn-previous" (click)="goBack()">{{ t('header.allCinemas') }}</button>
        </div>
      }
    </div>
  `
})
export class BookingComponent {
  protected readonly language = inject(LanguageService);
  protected readonly t = this.language.t.bind(this.language);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly bookingService = inject(BookingService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly loading = signal(true);
  protected readonly seatData = signal<SeatScheduleData | null>(null);
  protected readonly selectedSeats = signal<SeatItem[]>([]);
  protected readonly bookingContext = signal<{ movieTitle?: string; moviePoster?: string; movieRate?: string; roomType?: string } | null>(null);

  protected readonly totalPrice = computed(() => {
    return this.selectedSeats().reduce((sum, seat) => sum + (seat.priceTicket || 0), 0);
  });

  protected readonly seatRows = computed(() => {
    const data = this.seatData();
    if (!data) return [];

    const rows = new Map<string, SeatItem[]>();
    data.seats.forEach(seat => {
      const line = seat.line;
      if (!rows.has(line)) {
        rows.set(line, []);
      }
      rows.get(line)!.push(seat);
    });

    // Sort rows alphabetically and seats by number
    return Array.from(rows.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([line, seats]) => ({
        line,
        seats: seats.sort((a, b) => a.number - b.number)
      }));
  });

  constructor() {
    const savedContext = sessionStorage.getItem('bookingContext');
    if (savedContext) {
      try {
        this.bookingContext.set(JSON.parse(savedContext));
      } catch (e) {
        console.error('Failed to parse booking context', e);
      }
    }

    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      const scheduleCode = params.get('scheduleCode');
      if (scheduleCode) {
        this.loading.set(true);
        this.bookingService.getSeatsBySchedule(scheduleCode).subscribe(data => {
          this.seatData.set(data);
          this.loading.set(false);
        });
      } else {
        this.loading.set(false);
      }
    });
  }

  protected toggleSeat(seat: SeatItem): void {
    if (seat.status !== 'AVAILABLE') return;

    let seatsToToggle = [seat];
    if (seat.seatType === 'Sweet Box' && seat.pairIndex !== undefined) {
      const data = this.seatData();
      if (data) {
        const paired = data.seats.find(s => s.seatType === 'Sweet Box' && s.pairIndex === seat.pairIndex && s.id !== seat.id);
        if (paired && paired.status === 'AVAILABLE') {
          seatsToToggle.push(paired);
        }
      }
    }

    const isSelected = this.selectedSeats().find(s => s.id === seat.id);
    if (isSelected) {
      const idsToRemove = seatsToToggle.map(s => s.id);
      this.selectedSeats.update(seats => seats.filter(s => !idsToRemove.includes(s.id)));
    } else {
      if (this.selectedSeats().length > 0) {
        const currentType = this.selectedSeats()[0].seatType;
        if (seat.seatType !== currentType) {
          alert('Vui lòng chọn tất cả ghế cùng loại');
          return;
        }
      }
      if (this.selectedSeats().length + seatsToToggle.length > 8) {
        alert('Bạn chỉ có thể chọn tối đa 8 ghế.');
        return;
      }
      this.selectedSeats.update(seats => [...seats, ...seatsToToggle]);
    }
  }

  protected isSeatSelected(seat: SeatItem): boolean {
    return !!this.selectedSeats().find(s => s.id === seat.id);
  }

  protected getSelectedSeatType(): string {
    if (this.selectedSeats().length === 0) return '';
    const type = this.selectedSeats()[0].seatType;
    return type === 'Standard' ? 'Thường' : type;
  }

  protected getSelectedSeatNumbers(): string {
    return [...this.selectedSeats()]
      .sort((a, b) => {
        if (a.line === b.line) {
          return a.number - b.number;
        }
        return a.line.localeCompare(b.line);
      })
      .map(s => `${s.line}${s.number}`)
      .join(', ');
  }

  protected goBack(): void {
    this.location.back();
  }
}