import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal, effect, OnDestroy } from '@angular/core';
import { DecimalPipe, Location, CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { LanguageService } from '../../core/services/language.service';
import { BookingService } from '../../core/services/booking.service';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { SeatItem, SeatScheduleData } from '../../core/models/seat.model';
import { finalize, switchMap } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [DecimalPipe, CommonModule],
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
          @if (bookingStep() === 1) {
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
                              [class.seat-btn--booked]="seat.status === 'BOOKED' || seat.status === 'OCCUPIED'"
                              [class.seat-btn--unavailable]="seat.status === 'UNAVAILABLE'"
                              [class.seat-btn--selected]="isSeatSelected(seat)"
                              (click)="toggleSeat(seat)"
                              [disabled]="seat.status !== 'AVAILABLE'"
                              >
                        @if (seat.status === 'UNAVAILABLE') {
                          <svg xmlns="http://www.w3.org/2000/svg" class="seat-x-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        } @else {
                          <span class="seat-number">{{ seat.line }}{{ seat.number }}</span>
                        }
                      </button>
                    }
                  </div>
                </div>
              }
            </div>

            <div class="seat-legend">
              <div class="legend-item"><span class="legend-color legend-checked"></span> {{ t('booking.legendSelected') }}</div>
              <div class="legend-item"><span class="legend-color legend-booked"></span> {{ t('booking.legendBooked') || 'Đã đặt' }}</div>
              <div class="legend-item">
                <span class="legend-color legend-unavailable">
                  <svg xmlns="http://www.w3.org/2000/svg" style="width:10px; height:10px; color:#999;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </span> 
                {{ t('booking.legendUnavailable') }}
              </div>
              <div class="legend-item"><span class="legend-color legend-standard"></span> {{ t('booking.legendStandard') }}</div>
              <div class="legend-item"><span class="legend-color legend-vip"></span> {{ t('booking.legendVip') }}</div>
              <div class="legend-item"><span class="legend-color legend-sweetbox"></span> {{ t('booking.legendSweetbox') }}</div>
            </div>
          } @else if (bookingStep() === 2) {
            <div class="booking-step-title">Bắp Nước</div>
            
            <div class="food-selection">
              <div class="food-grid">
                @for (item of foodItems(); track item.id) {
                  <div class="food-card">
                    <div class="food-card__image-box">
                      <img [src]="item.imageUrl" [alt]="item.name" class="food-card__img">
                    </div>
                    <div class="food-card__info">
                      <h4 class="food-card__name">{{ item.name }}</h4>
                      <p class="food-card__desc">{{ item.description }}</p>
                      <div class="food-card__price-row">
                        <span class="food-card__price">Giá: <strong>{{ item.price | number:'1.0-0' }} ₫</strong></span>
                        <div class="food-qty">
                          <button type="button" class="food-qty__btn" (click)="updateFoodQty(item.id, -1)" [disabled]="item.quantity <= 0">-</button>
                          <span class="food-qty__val">{{ item.quantity }}</span>
                          <button type="button" class="food-qty__btn" (click)="updateFoodQty(item.id, 1)">+</button>
                        </div>
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>
          } @else if (bookingStep() === 3) {
            <div class="booking-step-title" style="background: #222;">THANH TOÁN</div>
            
            <div class="payment-selection">
              <div class="payment-main">
                <div class="payment-section">
                  <div class="payment-section__header">Bước 1: GIẢM GIÁ</div>
                  <div class="payment-option-list">
                    <div class="payment-option" (click)="onDevelop()">CGV Voucher</div>
                    <div class="payment-option" (click)="onDevelop()">Mã giảm giá</div>
                    <div class="payment-option" (click)="onDevelop()">Điểm CGV</div>
                    <div class="payment-option" (click)="onDevelop()">Đối tác</div>
                  </div>
                </div>

                <div class="payment-section">
                  <div class="payment-section__header">Bước 2: HÌNH THỨC THANH TOÁN</div>
                  <div class="payment-methods">
                    <label class="method-item">
                      <input type="radio" name="payment" value="atm" disabled>
                      <span class="method-icon atm"></span>
                      <span class="method-name">ATM card (Thẻ nội địa) <small>(Chưa hỗ trợ)</small></span>
                    </label>
                    <label class="method-item">
                      <input type="radio" name="payment" value="visa" disabled>
                      <span class="method-icon visa"></span>
                      <span class="method-name">Thẻ quốc tế (Visa, Master...) <small>(Chưa hỗ trợ)</small></span>
                    </label>
                    <label class="method-item">
                      <input type="radio" name="payment" value="momo" disabled>
                      <span class="method-icon momo"></span>
                      <span class="method-name">MoMo <small>(Chưa hỗ trợ)</small></span>
                    </label>
                    <label class="method-item" (click)="$event.preventDefault(); togglePaymentMethod('vnpay')">
                      <input type="radio" name="payment" value="vnpay" 
                             [checked]="selectedPaymentMethod() === 'vnpay'">
                      <span class="method-icon vnpay"></span>
                      <span class="method-name">VNPAY</span>
                    </label>
                    <label class="method-item">
                      <input type="radio" name="payment" value="shopeepay" disabled>
                      <span class="method-icon shopeepay"></span>
                      <span class="method-name">ShopeePay <small>(Chưa hỗ trợ)</small></span>
                    </label>
                  </div>
                </div>
              </div>

              <div class="payment-sidebar">
                <div class="side-box">
                  <div class="side-box__title">Tổng cộng</div>
                  <div class="side-box__val">{{ totalPrice() | number:'1.0-0' }} ₫</div>
                </div>
                <div class="side-box">
                  <div class="side-box__title">Khuyến mãi</div>
                  <div class="side-box__val">0 ₫</div>
                </div>
                <div class="side-box side-box--total">
                  <div class="side-box__title">Tổng số tiền thanh toán</div>
                  <div class="side-box__val">{{ totalPrice() | number:'1.0-0' }} ₫</div>
                </div>
                
                <div class="timer-box">
                  <p>Countdown Clock</p>
                  <div class="timer-display">
                    <div class="timer-unit">
                      <span class="timer-num">{{ formatMinutes(remainingSeconds()) }}</span>
                      <span class="timer-label">Minutes</span>
                    </div>
                    <div class="timer-unit">
                      <span class="timer-num">{{ formatSeconds(remainingSeconds()) }}</span>
                      <span class="timer-label">Seconds</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }
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
                <div class="summary-row"><span class="label">{{ t('booking.movieLabel') }}</span> <strong>{{ (totalPrice() - totalFoodPrice()) | number:'1.0-0' }} ₫</strong></div>
                <div class="summary-row"><span class="label">Combo</span> <strong>{{ totalFoodPrice() | number:'1.0-0' }} ₫</strong></div>
                <div class="summary-row"><span class="label">{{ t('booking.totalLabel') }}</span> <strong class="total-price">{{ totalPrice() | number:'1.0-0' }} ₫</strong></div>
              </div>
            </div>
          </div>

          <button class="btn-next" 
                  [class.btn-next--payment]="bookingStep() === 3" 
                  [disabled]="selectedSeats().length === 0 || (bookingStep() === 3 && !selectedPaymentMethod())"
                  (click)="onNext()">
            @if (bookingStep() === 3) {
              PAYMENT <span class="icon">&#128179;</span>
            } @else {
              NEXT <span class="icon">&rarr;</span>
            }
          </button>
        </div>

        @if (showConfirmModal()) {
          <div class="modal-overlay" (click)="showConfirmModal.set(false)">
            <div class="modal-panel" (click)="$event.stopPropagation()">
              <div class="modal-header">
                <h3>Thông tin vé</h3>
              </div>
              <div class="modal-body">
                @if (bookingContext(); as ctx) {
                  <p [innerHTML]="getRateConfirmMessage(ctx.movieRate || '')"></p>
                }
              </div>
              <div class="modal-footer">
                <button class="btn-modal-cancel" (click)="showConfirmModal.set(false)">Hủy</button>
                <button class="btn-modal-confirm" (click)="confirmBooking()">Đồng Ý</button>
              </div>
            </div>
          </div>
        }
      } @else {
        <div class="error-state">
          <p>{{ t('booking.noShowtimes') }}</p>
          <button class="btn-previous" (click)="goBack()">{{ t('header.allCinemas') }}</button>
        </div>
      }
    </div>
  `
})
export class BookingComponent implements OnDestroy {
  protected readonly language = inject(LanguageService);
  protected readonly t = this.language.t.bind(this.language);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly bookingService = inject(BookingService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly title = inject(Title);
  private readonly apiService = inject(ApiService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly loading = signal(true);
  protected readonly seatData = signal<SeatScheduleData | null>(null);
  protected readonly selectedSeats = signal<SeatItem[]>([]);
  protected readonly bookingContext = signal<{ movieTitle?: string; moviePoster?: string; movieRate?: string; roomType?: string } | null>(null);
  protected readonly showConfirmModal = signal(false);
  protected readonly bookingStep = signal(1); // 1: Seats, 2: Food, 3: Payment
  protected readonly selectedPaymentMethod = signal<string>('');
  protected readonly remainingSeconds = signal(0);
  protected readonly currentTicketCodes = signal<string[]>([]);
  private timerInterval: any;

  protected readonly foodItems = signal<Array<{ id: string; name: string; description: string; price: number; imageUrl: string; quantity: number }>>([]);

  protected readonly totalFoodPrice = computed(() => {
    return this.foodItems().reduce((sum, item) => sum + (item.price * item.quantity), 0);
  });

  protected readonly totalPrice = computed(() => {
    const seatPrice = this.selectedSeats().reduce((sum, seat) => sum + (seat.priceTicket || 0), 0);
    return seatPrice + this.totalFoodPrice();
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
    effect(() => {
      const step = this.bookingStep();
      this.language.currentLanguage();
      window.scrollTo(0, 0);
      if (step === 1) {
        this.title.setTitle(this.t('titles.bookingTicket'));
      } else if (step === 2) {
        this.title.setTitle(this.t('titles.bookingCorn'));
      } else if (step === 3) {
        this.title.setTitle(this.t('titles.bookingPayment'));
      }
    });

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

  ngOnDestroy(): void {
    this.stopTimer();
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
          alert(this.t('booking.selectSameSeatType'));
          return;
        }
      }
      if (this.selectedSeats().length + seatsToToggle.length > 8) {
        alert(this.t('booking.maxSeatsLimit'));
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
    if (this.bookingStep() === 3) {
      const codes = this.currentTicketCodes();
      if (codes.length > 0) {
        this.bookingService.cancelTicket({ ticketCodes: codes }).subscribe({
          error: (err) => console.error('Error canceling ticket', err)
        });
      }
      this.currentTicketCodes.set([]);
    }

    if (this.bookingStep() === 3 || this.bookingStep() === 2) {
      this.loading.set(true);

      setTimeout(() => {
        this.stopTimer();
        // Clear selected items when returning to seat selection
        this.selectedSeats.set([]);
        this.foodItems.update(items => items.map(item => ({ ...item, quantity: 0 })));
        this.selectedPaymentMethod.set('');
        this.bookingStep.set(1);
        this.loading.set(false);
      }, 300);
    } else {
      this.location.back();
    }
  }

  protected onNext(): void {
    if (this.selectedSeats().length === 0) return;

    if (this.bookingStep() === 1) {
      const data = this.seatData();
      if (data) {
        const selectedIds = new Set(this.selectedSeats().map(s => s.id));
        const affectedRows = new Set(this.selectedSeats().map(s => s.line));

        let hasGap = false;
        for (const line of affectedRows) {
          const rowSeats = data.seats
            .filter(s => s.line === line)
            .sort((a, b) => a.number - b.number);

          const states = rowSeats.map(s => (s.status !== 'AVAILABLE' || selectedIds.has(s.id)) ? 0 : 1);

          for (let i = 0; i < states.length; i++) {
            if (states[i] === 1) { // Current seat is empty
              const leftOccupied = i === 0 || states[i - 1] === 0;
              const rightOccupied = i === states.length - 1 || states[i + 1] === 0;

              if (leftOccupied && rightOccupied) {
                hasGap = true;
                break;
              }
            }
          }
          if (hasGap) break;
        }

        if (hasGap) {
          alert(this.t('booking.seatGapWarning'));
          return;
        }
      }
      this.showConfirmModal.set(true);
    } else if (this.bookingStep() === 2) {
      const data = this.seatData();
      if (!data) return;

      const payload = {
        roomName: data.cinema,
        roomCode: data.room,
        startTime: data.startAt,
        seats: this.selectedSeats().map(s => `${s.line}${s.number}`)
      };

      this.loading.set(true);
      this.bookingService.createTicket(payload).subscribe({
        next: (res) => {
          if (res.status === 200 || res.status === 'SUCCESS' || res.status === 'success' || res.status === 201 || res.code === 200 || res.code === 201) {
            this.currentTicketCodes.set(res.data.ticketCodes || []);
            this.remainingSeconds.set(res.data.remainingSeconds || 600);
            this.startTimer();
            this.bookingStep.set(3);
          } else {
            alert(res.message || this.t('booking.holdSeatsError'));
          }
          this.loading.set(false);
        },
        error: (err) => {
          console.error(err);
          alert(this.t('booking.holdSeatsConnectionError'));
          this.loading.set(false);
        }
      });
    } else {
      // Step 3 Next: Final Payment
      const customerName = this.authService.currentUserName() || 'guest';
      const foods = this.foodItems()
        .filter(f => f.quantity > 0)
        .map(f => ({ name: f.name, quantity: f.quantity }));
      const tickets = this.currentTicketCodes();

      this.loading.set(true);
      this.bookingService.createBill({
        customerName,
        foods,
        tickets,
        promotionCode: ""
      }).pipe(
        switchMap(res => {
          if (res.status === 200 || res.status === 'SUCCESS' || res.status === 'success' || res.status === 201 || res.code === 200 || res.code === 201) {
            const tradingCode = res.data.tradingCode;
            return this.bookingService.submitPayment(tradingCode);
          }
          throw new Error(res.message || 'Lỗi khi tạo hóa đơn');
        }),
        finalize(() => this.loading.set(false))
      ).subscribe({
        next: (paymentUrl) => {
          if (paymentUrl) {
            window.location.href = paymentUrl;
          } else {
            alert(this.t('booking.cannotRetrievePaymentLink'));
          }
        },
        error: (err: any) => {
          console.error(err);
          alert(err.message || this.t('booking.paymentProcessingError'));
        }
      });
    }
  }

  private startTimer(): void {
    this.stopTimer();
    this.timerInterval = setInterval(() => {
      this.remainingSeconds.update(s => {
        if (s <= 1) {
          this.stopTimer();
          alert(this.t('booking.seatHoldExpired'));
          this.goBackToSeats();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private goBackToSeats(): void {
    this.loading.set(true);
    this.stopTimer();
    this.currentTicketCodes.set([]);
    this.selectedSeats.set([]);
    this.foodItems.update(items => items.map(item => ({ ...item, quantity: 0 })));
    this.selectedPaymentMethod.set('');
    this.bookingStep.set(1);
    this.loading.set(false);
  }

  protected formatMinutes(totalSeconds: number): string {
    const mins = Math.floor(totalSeconds / 60);
    return mins.toString().padStart(2, '0');
  }

  protected formatSeconds(totalSeconds: number): string {
    const secs = totalSeconds % 60;
    return secs.toString().padStart(2, '0');
  }

  protected confirmBooking(): void {
    this.showConfirmModal.set(false);
    this.loading.set(true);
    this.bookingService.getAllFood().subscribe((data: any[]) => {
      const mapped = data.map((item: any) => ({
        id: item.id.toString(),
        name: item.nameOfFood,
        description: item.description,
        price: item.price,
        imageUrl: this.apiService.apiUrl('/' + item.image),
        quantity: 0
      }));
      this.foodItems.set(mapped);
      this.bookingStep.set(2);
      this.loading.set(false);
    });
  }

  protected updateFoodQty(id: string, delta: number): void {
    this.foodItems.update(items => items.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  }

  protected getRateConfirmMessage(rate: string): string {
    const r = rate.toUpperCase();
    let message = '';

    if (r === 'PG-13' || r === 'K') {
      message = 'Tôi xác nhận phim thể loại K yêu cầu người xem dưới 13 tuổi phải có người bảo hộ (bố, mẹ hoặc người thân) đi kèm, tham khảo <a href="javascript:void(0)" style="color: #e71a0f; text-decoration: underline;">quy định</a> của Bộ Văn Hóa, Thể Thao và Du Lịch, CGV không được phép phục vụ khách hàng dưới 13 tuổi cho các suất chiếu kết thúc sau 22:00 và 16 tuổi cho các suất chiếu kết thúc sau 23:00. CGV sẽ không hoàn tiền nếu người xem không đáp ứng đủ điều kiện.';
    } else if (r === 'NC-17' || r === 'T18') {
      message = 'Tôi xác nhận mua vé cho người xem từ đủ 18 tuổi trở lên và đồng ý cung cấp giấy tờ tùy thân để xác thực độ tuổi người xem, tham khảo <a href="javascript:void(0)" style="color: #e71a0f; text-decoration: underline;">quy định</a> của Bộ Văn Hóa, Thể Thao và Du Lịch. CGV sẽ không hoàn tiền nếu người xem không đáp ứng đủ điều kiện.';
    } else if (r === 'G' || r === 'P') {
      message = 'Phim dành cho mọi độ tuổi. CGV không được phép phục vụ khách hàng dưới 13 tuổi cho các suất chiếu kết thúc sau 22:00 và 16 tuổi cho các suất chiếu kết thúc sau 23:00, tham khảo <a href="javascript:void(0)" style="color: #e71a0f; text-decoration: underline;">quy định</a> của Bộ Văn Hóa, Thể Thao và Du Lịch. CGV sẽ không hoàn tiền nếu người xem không đáp ứng đủ điều kiện.';
    } else if (r === 'R' || r === 'T16') {
      message = 'Tôi xác nhận mua vé cho người xem từ đủ 16 tuổi trở lên và đồng ý cung cấp giấy tờ tùy thân để xác thực độ tuổi người xem, tham khảo <a href="javascript:void(0)" style="color: #e71a0f; text-decoration: underline;">quy định</a> của Bộ Văn Hóa, Thể Thao và Du Lịch. CGV sẽ không hoàn tiền nếu người xem không đáp ứng đủ điều kiện.';
    } else {
      message = 'Tôi xác nhận mua vé và đồng ý với các quy định của rạp. CGV sẽ không hoàn tiền nếu người xem không đáp ứng đủ điều kiện.';
    }

    return message;
  }

  protected togglePaymentMethod(method: string): void {
    if (this.selectedPaymentMethod() === method) {
      this.selectedPaymentMethod.set('');
    } else {
      this.selectedPaymentMethod.set(method);
    }
  }

  protected onDevelop(): void {
    alert(this.t('account.devMessage'));
  }
}