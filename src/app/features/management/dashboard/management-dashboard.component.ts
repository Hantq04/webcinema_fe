import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../../core/services/language.service';

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
          <span class="current-date">{{ t('management.today') }}: 29 Apr 2026</span>
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
          <div class="stat-value">124,500,000 ₫</div>
          <div class="stat-trend positive">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
            <span>+12.5%</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-title">{{ t('management.ticketsSold') }}</span>
            <div class="stat-icon tickets-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/></svg>
            </div>
          </div>
          <div class="stat-value">1,452</div>
          <div class="stat-trend positive">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
            <span>+5.2%</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-title">{{ t('management.activeMovies') }}</span>
            <div class="stat-icon movies-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18"/><path d="M17 3v18"/><path d="M3 9h18"/><path d="M3 15h18"/></svg>
            </div>
          </div>
          <div class="stat-value">24</div>
          <div class="stat-trend neutral">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" x2="19" y1="12" y2="12"/></svg>
            <span>--</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-title">{{ t('management.seatOccupancy') }}</span>
            <div class="stat-icon occupancy-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 16v-3a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3"/><path d="M4 20h16"/><path d="M7 11V7a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v4"/><rect width="12" height="4" x="6" y="16" rx="1"/></svg>
            </div>
          </div>
          <div class="stat-value">68.5%</div>
          <div class="stat-trend negative">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></svg>
            <span>-2.4%</span>
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
                <span>150M</span>
                <span>100M</span>
                <span>50M</span>
                <span>0</span>
              </div>
              <div class="chart-bars">
                <div class="bar-group"><div class="bar" style="height: 60%"></div><span class="bar-label">Thu</span></div>
                <div class="bar-group"><div class="bar" style="height: 75%"></div><span class="bar-label">Fri</span></div>
                <div class="bar-group"><div class="bar" style="height: 95%"></div><span class="bar-label">Sat</span></div>
                <div class="bar-group"><div class="bar" style="height: 100%"></div><span class="bar-label">Sun</span></div>
                <div class="bar-group"><div class="bar" style="height: 45%"></div><span class="bar-label">Mon</span></div>
                <div class="bar-group"><div class="bar" style="height: 50%"></div><span class="bar-label">Tue</span></div>
                <div class="bar-group"><div class="bar" style="height: 65%; background-color: #d62f1f;"></div><span class="bar-label">Wed</span></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Top Movies -->
        <div class="card top-movies-card">
          <div class="card-header">
            <h2 class="card-title">{{ t('management.topSellingMovies') }}</h2>
            <button class="view-all-btn">{{ t('management.viewAll') }}</button>
          </div>
          <div class="card-body">
            <ul class="movie-list">
              <li class="movie-item">
                <div class="movie-rank">1</div>
                <div class="movie-info">
                  <div class="movie-name">Mai</div>
                  <div class="movie-meta">Romance, Drama</div>
                </div>
                <div class="movie-sales">
                  <div class="sales-value">520</div>
                  <div class="sales-label">{{ t('management.tickets') }}</div>
                </div>
              </li>
              <li class="movie-item">
                <div class="movie-rank">2</div>
                <div class="movie-info">
                  <div class="movie-name">Dune: Part Two</div>
                  <div class="movie-meta">Sci-Fi, Action</div>
                </div>
                <div class="movie-sales">
                  <div class="sales-value">415</div>
                  <div class="sales-label">{{ t('management.tickets') }}</div>
                </div>
              </li>
              <li class="movie-item">
                <div class="movie-rank">3</div>
                <div class="movie-info">
                  <div class="movie-name">Kung Fu Panda 4</div>
                  <div class="movie-meta">Animation, Comedy</div>
                </div>
                <div class="movie-sales">
                  <div class="sales-value">380</div>
                  <div class="sales-label">{{ t('management.tickets') }}</div>
                </div>
              </li>
              <li class="movie-item">
                <div class="movie-rank">4</div>
                <div class="movie-info">
                  <div class="movie-name">Exhuma</div>
                  <div class="movie-meta">Horror, Mystery</div>
                </div>
                <div class="movie-sales">
                  <div class="sales-value">290</div>
                  <div class="sales-label">{{ t('management.tickets') }}</div>
                </div>
              </li>
              <li class="movie-item">
                <div class="movie-rank">5</div>
                <div class="movie-info">
                  <div class="movie-name">Godzilla x Kong</div>
                  <div class="movie-meta">Action, Sci-Fi</div>
                </div>
                <div class="movie-sales">
                  <div class="sales-value">245</div>
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
                <tr>
                  <td>#BK-7829</td>
                  <td>Nguyen Van A</td>
                  <td>Mai</td>
                  <td>Today, 19:30</td>
                  <td>G4, G5</td>
                  <td>220,000 ₫</td>
                  <td><span class="status badge-success">{{ t('management.paid') }}</span></td>
                </tr>
                <tr>
                  <td>#BK-7828</td>
                  <td>Tran Thi B</td>
                  <td>Dune: Part Two</td>
                  <td>Today, 20:15</td>
                  <td>H8, H9, H10</td>
                  <td>390,000 ₫</td>
                  <td><span class="status badge-success">{{ t('management.paid') }}</span></td>
                </tr>
                <tr>
                  <td>#BK-7827</td>
                  <td>Le Van C</td>
                  <td>Kung Fu Panda 4</td>
                  <td>Today, 18:00</td>
                  <td>E5</td>
                  <td>90,000 ₫</td>
                  <td><span class="status badge-warning">{{ t('management.pending') }}</span></td>
                </tr>
                <tr>
                  <td>#BK-7826</td>
                  <td>Hoang Thu D</td>
                  <td>Exhuma</td>
                  <td>Today, 22:00</td>
                  <td>J12, J13</td>
                  <td>260,000 ₫</td>
                  <td><span class="status badge-success">{{ t('management.paid') }}</span></td>
                </tr>
                <tr>
                  <td>#BK-7825</td>
                  <td>Pham Quang E</td>
                  <td>Mai</td>
                  <td>Today, 19:30</td>
                  <td>F6, F7</td>
                  <td>220,000 ₫</td>
                  <td><span class="status badge-danger">{{ t('management.cancelled') }}</span></td>
                </tr>
              </tbody>
            </table>
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
                <div class="fb-value">48,250,000 ₫</div>
                <div class="fb-label">{{ t('management.totalRevenue') }}</div>
              </div>
              <ul class="fb-list">
                <li class="fb-item">
                  <div class="fb-name">Combo 2 Popcorn & 2 Coke</div>
                  <div class="fb-count">420 {{ t('management.sold') }}</div>
                </li>
                <li class="fb-item">
                  <div class="fb-name">Large Popcorn (Sweet)</div>
                  <div class="fb-count">315 {{ t('management.sold') }}</div>
                </li>
                <li class="fb-item">
                  <div class="fb-name">Large Coke</div>
                  <div class="fb-count">280 {{ t('management.sold') }}</div>
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
                <li class="promo-item">
                  <div class="promo-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.44 11.05-9.19 9.19a2 2 0 0 1-2.83 0l-8.97-8.97a2 2 0 0 1 0-2.82l9.19-9.19a2 2 0 0 1 2.82 0l8.98 8.97a2 2 0 0 1 0 2.82z"/><path d="M7 7h.01"/></svg>
                  </div>
                  <div class="promo-info">
                    <div class="promo-code">VNPAY50K</div>
                    <div class="promo-desc">Discount 50K for VNPAY users</div>
                  </div>
                </li>
                <li class="promo-item">
                  <div class="promo-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.44 11.05-9.19 9.19a2 2 0 0 1-2.83 0l-8.97-8.97a2 2 0 0 1 0-2.82l9.19-9.19a2 2 0 0 1 2.82 0l8.98 8.97a2 2 0 0 1 0 2.82z"/><path d="M7 7h.01"/></svg>
                  </div>
                  <div class="promo-info">
                    <div class="promo-code">STUDENT20</div>
                    <div class="promo-desc">20% off for students (with ID)</div>
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
export class ManagementDashboardComponent {
  protected readonly language = inject(LanguageService);
  protected readonly t = this.language.t.bind(this.language);
}
