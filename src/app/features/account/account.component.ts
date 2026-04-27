import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { LanguageService } from '../../core/services/language.service';

export type AccountView = 'general' | 'history';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="account-page">
      <div class="account-shell mx-auto max-w-7xl px-4 py-8">
        <div class="account-layout">
          <!-- Sidebar Menu -->
          <aside class="account-sidebar">
            <h2 class="sidebar-title">{{ t('account.sidebarTitle') }}</h2>
            <nav class="sidebar-nav">
              <a href="javascript:void(0)" (click)="setView('general')" class="nav-item" [class.active]="activeView() === 'general'">{{ t('account.infoGeneral') }}</a>
              <a href="javascript:void(0)" (click)="onDevelop()" class="nav-item">{{ t('account.details') }}</a>
              <a href="javascript:void(0)" (click)="onDevelop()" class="nav-item">{{ t('account.paymentSettings') }}</a>
              <a href="javascript:void(0)" (click)="onDevelop()" class="nav-item">{{ t('account.memberCard') }}</a>
              <a href="javascript:void(0)" (click)="onDevelop()" class="nav-item">{{ t('account.rewardPoints') }}</a>
              <a href="javascript:void(0)" (click)="onDevelop()" class="nav-item">{{ t('account.giftCards') }}</a>
              <a href="javascript:void(0)" (click)="onDevelop()" class="nav-item">{{ t('account.voucher') }}</a>
              <a href="javascript:void(0)" (click)="onDevelop()" class="nav-item">{{ t('account.coupon') }}</a>
              <a href="javascript:void(0)" (click)="setView('history')" class="nav-item" [class.active]="activeView() === 'history'">{{ t('account.history') }}</a>
            </nav>
          </aside>

          <!-- Main Content -->
          <main class="account-main">
            @if (activeView() === 'general') {
              <div class="content-header">
                {{ t('account.infoGeneral') }}
              </div>
              
              <div class="user-summary-card">
                <div class="user-profile-section">
                  <div class="avatar-container">
                    <div class="avatar-circle">
                      <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="#888"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                    </div>
                    <button class="change-btn" (click)="onDevelop()">{{ t('account.change') }}</button>
                  </div>
                  <div class="user-greeting">
                    <h3>{{ t('account.hello') }} {{ currentName() }},</h3>
                    <p>{{ t('account.manageIntro') }}</p>
                  </div>
                </div>

                <div class="stats-grid">
                  <div class="stat-box tier-box">
                    <span class="stat-label">{{ t('account.tierLabel') }}</span>
                    <div class="tier-info">
                      <span class="tier-icon">⭐</span>
                      <span class="tier-name">MEMBER</span>
                    </div>
                    <div class="stat-detail">
                      <div class="detail-row"><span>{{ t('account.totalSpend') }}</span> <span>0 đ</span></div>
                      <div class="detail-row"><span>{{ t('account.cgvPoints') }}</span> <span>0 P</span></div>
                    </div>
                  </div>
                  <div class="stat-box count-box">
                    <span class="stat-label">{{ t('account.giftCardLabel') }}</span>
                    <span class="stat-count">0 đ</span>
                    <button class="view-btn" (click)="onDevelop()">{{ t('account.view') }}</button>
                  </div>
                  <div class="stat-box count-box">
                    <span class="stat-label">{{ t('account.voucher') }}</span>
                    <span class="stat-count">0</span>
                    <button class="view-btn" (click)="onDevelop()">{{ t('account.view') }}</button>
                  </div>
                  <div class="stat-box count-box">
                    <span class="stat-label">{{ t('account.coupon') }}</span>
                    <span class="stat-count">1</span>
                    <button class="view-btn" (click)="onDevelop()">{{ t('account.view') }}</button>
                  </div>
                  <div class="stat-box count-box">
                    <span class="stat-label">{{ t('account.memberCard') }}</span>
                    <span class="stat-count">1</span>
                    <button class="view-btn" (click)="onDevelop()">{{ t('account.view') }}</button>
                  </div>
                </div>
              </div>

              <div class="account-details-section">
                <h4 class="section-title">{{ t('account.contactInfo') }}</h4>
                <div class="info-table">
                  <div class="table-header">
                    <span>{{ t('account.contactHeader') }}</span>
                    <button class="change-btn-sm" (click)="onDevelop()">{{ t('account.change') }}</button>
                  </div>
                  <div class="table-content">
                    <div class="info-row">
                      <span class="label">{{ t('account.nameLabel') }}</span>
                      <span class="value">{{ currentName() }}</span>
                    </div>
                    <div class="info-row">
                      <span class="label">{{ t('account.emailLabel') }}</span>
                      <span class="value">{{ currentEmail() }}</span>
                    </div>
                    <div class="info-row">
                      <span class="label">{{ t('account.phoneLabel') }}</span>
                      <span class="value">{{ currentPhone() }}</span>
                    </div>
                  </div>
                </div>
              </div>
            } @else if (activeView() === 'history') {
              <div class="content-header">
                {{ t('account.history') }}
              </div>

              <div class="history-tabs">
                <button class="history-tab active">{{ t('account.movieName') }}</button>
                <button class="history-tab" (click)="onDevelop()">{{ t('account.photoTicket') }}</button>
                <button class="history-tab" (click)="onDevelop()">{{ t('account.onlineStore') }}</button>
                <button class="history-tab" (click)="onDevelop()">{{ t('account.egift') }}</button>
              </div>

              <div class="history-toolbar">
                <span class="results-count">{{ t('account.productsCount').replace('{{count}}', '1') }}</span>
                <div class="display-filter">
                  <label>{{ t('account.displayLabel') }}</label>
                  <select>
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                  </select>
                </div>
              </div>

              <div class="history-list">
                <div class="history-item">
                  <div class="item-header">
                    {{ t('account.bookingCode') }} <strong>718372312</strong>
                    <span class="status">({{ t('account.statusLabel') }} <span class="completed">{{ t('account.statusCompleted') }}</span>)</span>
                    <svg class="phone-icon" viewBox="0 0 24 24" width="16" height="16" fill="red"><path d="M17 2H7c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-5 18c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm5-4H7V6h10v10z"/></svg>
                  </div>
                  <div class="item-body">
                    <img src="/movie/michael.jpg" alt="Michael" class="movie-poster">
                    <div class="item-details">
                      <h4 class="movie-title">MICHAEL</h4>
                      <span class="rating-badge">K</span>
                      <p class="movie-date">27/04/2026</p>
                      <p class="movie-time">{{ t('account.fromLabel') }} 08:45 AM ~ {{ t('account.toLabel') }} 11:07 AM</p>
                      <p class="cinema-name">CineGo Machinco</p>
                      <p class="seats-info">Cinema 3 (F6, F7)</p>
                      <p class="total-price">110.500,00 {{ t('account.totalAmount') }}</p>
                      <button class="view-item-btn" (click)="onDevelop()">Xem</button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="history-toolbar bottom">
                <span class="results-count">{{ t('account.productsCount').replace('{{count}}', '1') }}</span>
                <div class="display-filter">
                  <label>{{ t('account.displayLabel') }}</label>
                  <select>
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                  </select>
                </div>
              </div>
            }
          </main>
        </div>
      </div>
    </section>
  `,
  styles: `
    :host { display: block; }
    .account-page { background: #fdfaf0; min-height: 80vh; color: #333; }
    
    .account-layout {
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: 2.5rem;
      align-items: start;
    }

    /* SIDEBAR */
    .account-sidebar {
      background: transparent;
    }
    .sidebar-title {
      color: #d62f1f;
      font-size: 1.45rem;
      font-weight: 800;
      margin-bottom: 1.5rem;
      padding-left: 0.5rem;
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      letter-spacing: -0.01em;
      text-transform: uppercase;
      white-space: nowrap;
    }
    .sidebar-nav {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .nav-item {
      background: #e0e0e0;
      color: #555;
      padding: 0.55rem 1rem 0.55rem 1.6rem;
      text-decoration: none;
      font-weight: 800;
      font-size: 0.78rem;
      position: relative;
      transition: all 0.2s;
      cursor: pointer;
      text-transform: uppercase;
      clip-path: polygon(16px 50%, 0% 100%, 100% 100%, 100% 0%, 0% 0%);
      margin-bottom: 2px;
    }
    .nav-item:hover {
      background: #d0d0d0;
      color: #333;
    }
    .nav-item.active {
      background: #e71a0f;
      color: white;
    }
    .nav-item.active::after {
      content: '';
      position: absolute;
      right: -10px;
      top: 50%;
      transform: translateY(-50%);
      border-left: 10px solid #e71a0f;
      border-top: 10px solid transparent;
      border-bottom: 10px solid transparent;
      z-index: 10;
    }

    /* MAIN CONTENT */
    .account-main {
      background: transparent;
    }
    .content-header {
      background: #333;
      color: white;
      padding: 0.5rem 1rem;
      font-weight: 800;
      text-align: center;
      margin-bottom: 1.5rem;
      font-size: 0.95rem;
      text-transform: uppercase;
    }

    .user-summary-card {
      background: #fdf5e1;
      padding: 1.5rem;
      border-radius: 4px;
      margin-bottom: 2rem;
      border: 1px solid #eee;
    }

    .user-profile-section {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
      border-bottom: 1px solid #ddd;
      padding-bottom: 1.5rem;
    }

    .avatar-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }
    .avatar-circle {
      width: 100px;
      height: 100px;
      background: white;
      border-radius: 50%;
      border: 1px solid #ccc;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .change-btn {
      background: #aaa;
      color: white;
      border: none;
      padding: 2px 10px;
      font-size: 0.75rem;
      border-radius: 2px;
      cursor: pointer;
    }

    .user-greeting h3 {
      font-size: 1.1rem;
      font-weight: 800;
      margin-bottom: 0.25rem;
    }
    .user-greeting p {
      font-size: 0.85rem;
      color: #666;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: 1.2fr repeat(4, 1fr);
      gap: 0.5rem;
    }
    .stat-box {
      background: white;
      border: 1px solid #ddd;
      padding: 0.75rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      border-radius: 8px;
    }
    .stat-label {
      font-size: 0.7rem;
      font-weight: 700;
      color: #666;
      margin-bottom: 0.5rem;
      text-align: center;
    }
    .tier-info {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      color: #3498db;
      font-weight: 900;
      font-size: 1rem;
      margin-bottom: 0.5rem;
    }
    .stat-detail {
      width: 100%;
      font-size: 0.7rem;
      color: #555;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 2px;
    }
    .stat-count {
      font-size: 1rem;
      font-weight: 900;
      margin-bottom: 0.5rem;
    }
    .view-btn {
      background: #3498db;
      color: white;
      border: none;
      padding: 2px 15px;
      font-size: 0.7rem;
      border-radius: 4px;
      cursor: pointer;
      text-transform: uppercase;
      font-weight: 700;
    }

    .account-details-section {
      margin-top: 2rem;
    }
    .section-title {
      font-size: 1rem;
      font-weight: 800;
      margin-bottom: 1rem;
      border-bottom: 1px solid #ddd;
      padding-bottom: 0.5rem;
    }
    .info-table {
      border: 1px solid #eee;
    }
    .table-header {
      background: #f9f9f9;
      padding: 0.5rem 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #eee;
      font-size: 0.85rem;
      font-weight: 700;
      color: #555;
    }
    .change-btn-sm {
      background: #aaa;
      color: white;
      border: none;
      padding: 2px 10px;
      font-size: 0.7rem;
      border-radius: 2px;
      cursor: pointer;
    }
    .table-content {
      padding: 1rem;
    }
    .info-row {
      display: flex;
      gap: 1rem;
      margin-bottom: 0.5rem;
      font-size: 0.85rem;
    }
    .info-row .label {
      color: #666;
      width: 80px;
    }
    .info-row .value {
      font-weight: 600;
      color: #444;
    }

    /* HISTORY VIEW */
    .history-tabs {
      display: flex;
      gap: 10px;
      margin-bottom: 1.5rem;
    }
    .history-tab {
      background: #7a7a7a;
      color: white;
      border: none;
      padding: 0.45rem 1rem;
      font-weight: 800;
      font-size: 0.78rem;
      border-radius: 6px;
      cursor: pointer;
      text-transform: uppercase;
    }
    .history-tab.active {
      background: #e71a0f;
    }
    .history-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.75rem;
      font-weight: 700;
      color: #555;
      padding-bottom: 0.5rem;
      margin-bottom: 1rem;
    }
    .history-toolbar.bottom {
      border-top: 1px solid #ccc;
      padding-top: 1rem;
      margin-top: 2rem;
    }
    .display-filter {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .display-filter select {
      border: 1px solid #ccc;
      padding: 2px 5px;
      background: white;
    }

    .history-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .history-item {
      padding-bottom: 1.5rem;
    }
    .item-header {
      font-size: 0.85rem;
      font-weight: 700;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .item-header .completed {
      color: green;
      font-style: italic;
    }
    .item-header .status {
      font-weight: normal;
    }
    .item-body {
      display: flex;
      gap: 1.5rem;
    }
    .movie-poster {
      width: 140px;
      height: 200px;
      object-fit: cover;
      border: 1px solid #ddd;
    }
    .item-details {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      font-size: 0.85rem;
      color: #555;
      font-weight: 600;
    }
    .movie-title {
      font-size: 1rem;
      font-weight: 800;
      color: #333;
      margin: 0;
    }
    .rating-badge {
      display: inline-block;
      background: #3498db;
      color: white;
      padding: 1px 6px;
      font-size: 0.7rem;
      border-radius: 3px;
      width: fit-content;
      font-weight: 900;
    }
    .total-price {
      font-weight: 900;
      color: #333;
      margin-top: 0.5rem;
    }
    .view-item-btn {
      background: #3498db;
      color: white;
      border: none;
      padding: 0.4rem 1.2rem;
      font-size: 0.75rem;
      font-weight: 700;
      border-radius: 4px;
      cursor: pointer;
      width: fit-content;
      margin-top: 0.5rem;
    }

    @media (max-width: 900px) {
      .account-layout {
        grid-template-columns: 1fr;
      }
      .stats-grid {
        grid-template-columns: 1fr 1fr;
      }
      .item-body {
        flex-direction: column;
      }
    }
  `
})
export class AccountComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly language = inject(LanguageService);
  protected readonly t = this.language.t.bind(this.language);

  protected activeView = signal<AccountView>('general');

  constructor() {
    this.route.queryParamMap.subscribe(params => {
      const view = params.get('view') as AccountView;
      if (view) {
        this.activeView.set(view);
      }
    });
  }

  protected currentName(): string {
    return this.auth.currentUserName() || this.t('header.member');
  }

  protected currentEmail(): string {
    return this.auth.currentUserEmail() || 'N/A';
  }

  protected currentPhone(): string {
    return this.auth.currentUserPhone() || 'N/A';
  }

  protected logout(): void {
    this.auth.logout();
    void this.router.navigateByUrl('/customer/account/login');
  }

  protected setView(view: AccountView): void {
    this.activeView.set(view);
  }

  protected onDevelop(): void {
    alert(this.t('account.devMessage'));
  }
}