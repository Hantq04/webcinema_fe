import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../../core/services/language.service';
import { OverviewService } from '../../../core/services/overview.service';
import { OverviewResponse, RevenueTimePoint } from '../../../core/models/overview.model';

@Component({
  selector: 'app-management-dashboard',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="dashboard-wrapper">
      <div class="page-header">
        <h1 class="page-title">{{ t('management.dashboardOverview') }}</h1>
        <div class="date-filter">
          <span class="current-date">{{ t('management.today') }}: {{ (overview()?.date | date:'dd/MM/yyyy') || '--' }}</span>
        </div>
      </div>

      <!-- Stats Row -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-title">{{ t('management.revenueToday') }}</span>
            <div class="stat-icon revenue-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
          </div>
          <div class="stat-value">{{ formatCurrency(overview()?.todayRevenue || 0) }}</div>
          <div class="stat-trend" [ngClass]="getTrendClass(overview()?.todayRevenueChangePercent)">
            <svg *ngIf="(overview()?.todayRevenueChangePercent || 0) > 0" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
            <svg *ngIf="(overview()?.todayRevenueChangePercent || 0) < 0" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></svg>
            <span>{{ formatPercent(overview()?.todayRevenueChangePercent) }}</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-title">{{ t('management.ticketsSold') }}</span>
            <div class="stat-icon tickets-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/></svg>
            </div>
          </div>
          <div class="stat-value">{{ (overview()?.todayTicketCount || 0) | number }}</div>
          <div class="stat-trend" [ngClass]="getTrendClass(overview()?.todayTicketCountChangePercent)">
            <svg *ngIf="(overview()?.todayTicketCountChangePercent || 0) > 0" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
            <svg *ngIf="(overview()?.todayTicketCountChangePercent || 0) < 0" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></svg>
            <span>{{ formatPercent(overview()?.todayTicketCountChangePercent) }}</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-title">{{ t('management.activeMovies') }}</span>
            <div class="stat-icon movies-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18"/><path d="M17 3v18"/><path d="M3 9h18"/><path d="M3 15h18"/></svg>
            </div>
          </div>
          <div class="stat-value">{{ overview()?.nowShowingMovieCount || 0 }}</div>
          <div class="stat-trend neutral">
            <!-- Hidden by request: cho % nhỏ hiện 3 mục trừ phim đang chiếu ra -->
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-title">{{ t('management.seatOccupancy') }}</span>
            <div class="stat-icon occupancy-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 16v-3a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3"/><path d="M4 20h16"/><path d="M7 11V7a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v4"/><rect width="12" height="4" x="6" y="16" rx="1"/></svg>
            </div>
          </div>
          <div class="stat-value">{{ (overview()?.seatOccupancyRate || 0) }}%</div>
          <div class="stat-trend" [ngClass]="getTrendClass(overview()?.seatOccupancyRateChangePercent)">
            <svg *ngIf="(overview()?.seatOccupancyRateChangePercent || 0) > 0" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
            <svg *ngIf="(overview()?.seatOccupancyRateChangePercent || 0) < 0" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></svg>
            <span>{{ formatPercent(overview()?.seatOccupancyRateChangePercent) }}</span>
          </div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="charts-row">
        <!-- Revenue Chart -->
        <div class="card chart-card">
          <div class="card-header">
            <h2 class="card-title">{{ t('management.revenueLast7Days') }}</h2>
          </div>
          <div class="card-body">
            <div class="mock-chart">
              <div class="chart-y-axis">
                <span>20M</span>
                <span>10M</span>
                <span>0</span>
              </div>
              <div class="chart-bars">
                <div *ngFor="let day of revenuePoints(); let last = last" class="bar-group">
                  <div class="bar" [style.height]="(day.totalRevenue / 20000000 * 100) + '%'" [style.backgroundColor]="last ? '#d62f1f' : ''">
                    <div class="bar-tooltip">{{ formatCurrency(day.totalRevenue) }}</div>
                  </div>
                  <span class="bar-label" [style.color]="last ? '#d62f1f' : ''" [style.fontWeight]="last ? '600' : ''">
                    {{ day.period | date:'dd/MM' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Top Movies -->
        <div class="card top-movies-card">
          <div class="card-header">
            <h2 class="card-title">{{ t('management.topSellingMovies') }}</h2>
            <button class="view-all-btn" (click)="toggleShowAllMovies()">{{ t('management.viewAll') }}</button>
          </div>
          <div class="card-body">
            <ul class="movie-list">
              <li *ngFor="let movie of topMoviesDisplay(); let i = index" class="movie-item">
                <div class="movie-rank">{{ i + 1 }}</div>
                <div class="movie-info">
                  <div class="movie-name">{{ language.currentLanguage() === 'vi' ? movie.name : movie.nameEn }}</div>
                  <div class="movie-meta">{{ language.currentLanguage() === 'vi' ? movie.movieTypeName : movie.movieTypeNameEn }}</div>
                </div>
                <div class="movie-sales">
                  <div class="sales-value">{{ movie.totalTicketsBooked || 0 }}</div>
                  <div class="sales-label">{{ t('management.tickets') }}</div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Full Movies Modal -->
      <div class="modal-overlay" *ngIf="showAllMovies()" (click)="toggleShowAllMovies()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2 class="modal-title">{{ t('management.topSellingMovies') }}</h2>
            <button class="modal-close" (click)="toggleShowAllMovies()">&times;</button>
          </div>
          <div class="modal-body">
            <ul class="movie-list full-list">
              <li *ngFor="let movie of overview()?.topMovies; let i = index" class="movie-item">
                <div class="movie-rank" [class.top-1]="i === 0" [class.top-2]="i === 1" [class.top-3]="i === 2">{{ i + 1 }}</div>
                <div class="movie-info">
                  <div class="movie-name">{{ language.currentLanguage() === 'vi' ? movie.name : movie.nameEn }}</div>
                  <div class="movie-meta">{{ language.currentLanguage() === 'vi' ? movie.movieTypeName : movie.movieTypeNameEn }}</div>
                </div>
                <div class="movie-sales">
                  <div class="sales-value">{{ movie.totalTicketsBooked || 0 }}</div>
                  <div class="sales-label">{{ t('management.tickets') }}</div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Details Row -->
      <div class="details-row">
        <!-- Recent Bookings -->
        <div class="card table-card">
          <div class="card-header">
            <h2 class="card-title">{{ t('management.recentBookings') }}</h2>
          </div>
          <div class="card-body no-padding">
            <div class="overflow-x-auto">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>{{ t('management.customer') }}</th>
                    <th>{{ t('management.movie') }}</th>
                    <th>{{ t('management.dateAndTime') }}</th>
                    <th>{{ t('management.seats') }}</th>
                    <th>{{ t('management.total') }}</th>
                    <th>{{ t('management.status') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let booking of overview()?.recentBookings">
                    <td class="font-mono text-xs">{{ booking.tradingCode }}</td>
                    <td>{{ booking.customerName }}</td>
                    <td>{{ booking.movieName || '--' }}</td>
                    <td>{{ booking.createTime | date:'dd/MM HH:mm' }}</td>
                    <td>{{ booking.seatCodes || '--' }}</td>
                    <td>{{ formatCurrency(booking.totalMoney) }}</td>
                    <td>
                      <span class="status" [ngClass]="getBookingStatus(booking.billStatus).class">
                        {{ getBookingStatus(booking.billStatus).label }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="side-cards">
          <!-- Food Sales -->
          <div class="card food-sales-card">
            <div class="card-header">
              <h2 class="card-title">{{ t('management.foodBeverage7Days') }}</h2>
            </div>
            <div class="card-body">
              <div class="fb-total">
                <div class="fb-value">{{ formatCurrency(getTotalFoodRevenue()) }}</div>
                <div class="fb-label">{{ t('management.totalRevenue') }}</div>
              </div>
              <ul class="fb-list">
                <li *ngFor="let food of overview()?.foodRevenueLast7Days" class="fb-item">
                  <div class="fb-name">{{ food.nameOfFood }}</div>
                  <div class="fb-count">{{ food.totalQuantity }} {{ t('management.sold') }}</div>
                </li>
              </ul>
            </div>
          </div>

          <!-- Active Promotions -->
          <div class="card promotions-card">
            <div class="card-header">
              <h2 class="card-title">{{ t('management.activePromotions') }}</h2>
            </div>
            <div class="card-body">
              <ul class="promo-list">
                <li *ngFor="let promo of overview()?.activePromotions" class="promo-item">
                  <div class="promo-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.44 11.05-9.19 9.19a2 2 0 0 1-2.83 0l-8.97-8.97a2 2 0 0 1 0-2.82l9.19-9.19a2 2 0 0 1 2.82 0l8.98 8.97a2 2 0 0 1 0 2.82z"/><path d="M7 7h.01"/></svg>
                  </div>
                  <div class="promo-info">
                    <div class="promo-code">{{ promo.code }}</div>
                    <div class="promo-desc">{{ promo.description }} ({{ promo.percent }}%)</div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./management-dashboard.component.css']
})
export class ManagementDashboardComponent implements OnInit {
  protected readonly language = inject(LanguageService);
  protected readonly overviewService = inject(OverviewService);
  protected readonly t = this.language.t.bind(this.language);

  overview = signal<OverviewResponse | null>(null);
  showAllMovies = signal(false);
  
  topMoviesDisplay = computed(() => {
    return this.overview()?.topMovies.slice(0, 5) || [];
  });
  
  revenuePoints = computed<RevenueTimePoint[]>(() => {
    const raw = this.overview()?.revenueLast7Days || [];
    const points: RevenueTimePoint[] = [];
    
    // Generate last 7 days including today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      
      // Try to find matching data point
      // Note: period might be "2024-05-07" or similar
      const found = raw.find(p => {
        if (!p.period) return false;
        const pDate = new Date(p.period);
        return pDate.getFullYear() === d.getFullYear() && 
               pDate.getMonth() === d.getMonth() && 
               pDate.getDate() === d.getDate();
      });
      
      if (found) {
        points.push(found);
      } else {
        points.push({
          period: d.toISOString(),
          totalRevenue: 0,
          ticketRevenue: 0,
          foodRevenue: 0,
          ticketCount: 0
        });
      }
    }
    
    return points;
  });

  ngOnInit(): void {
    this.loadOverview();
  }

  toggleShowAllMovies() {
    this.showAllMovies.update(v => !v);
  }

  loadOverview() {
    this.overviewService.getOverview().subscribe({
      next: (data) => this.overview.set(data),
      error: (err) => console.error('Error loading overview', err)
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(value);
  }

  getTotalFoodRevenue(): number {
    return this.overview()?.revenueLast7Days.reduce((acc, day) => acc + (day.foodRevenue || 0), 0) || 0;
  }

  getBookingStatus(status: string): { label: string, class: string } {
    const s = (status || '').toLowerCase();
    const isVi = this.language.currentLanguage() === 'vi';

    switch (s) {
      case 'success':
        return { label: isVi ? 'Thành công' : 'Success', class: 'badge-success' };
      case 'pending':
        return { label: isVi ? 'Chờ thanh toán' : 'Pending', class: 'badge-warning' };
      case 'fail':
      case 'failure':
        return { label: isVi ? 'Thất bại' : 'Failure', class: 'badge-danger' };
      case 'expired':
        return { label: isVi ? 'Hết hạn' : 'Expired', class: 'badge-muted' };
      case 'cancel':
      case 'cancelled':
        return { label: isVi ? 'Đã hủy' : 'Cancelled', class: 'badge-danger' };
      default:
        return { label: status, class: '' };
    }
  }

  formatPercent(value: number | undefined): string {
    if (value === undefined || value === null) return '--';
    const sign = value > 0 ? '+' : '';
    return `${sign}${value}%`;
  }

  getTrendClass(value: number | undefined): string {
    if (value === undefined || value === null || value === 0) return 'neutral';
    return value > 0 ? 'positive' : 'negative';
  }
}
