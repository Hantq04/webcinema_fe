import { ChangeDetectionStrategy, Component, inject, signal, effect, computed } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { AuthService, UserProfile } from '../../core/services/auth.service';
import { LanguageService } from '../../core/services/language.service';
import { LocationService, Province, District } from '../../core/services/location.service';
import { ManagementBillService } from '../../core/services/management-bill.service';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';

export type AccountView = 'general' | 'details' | 'history' | 'coupon';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [DecimalPipe, FormsModule],
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
              <a href="javascript:void(0)" (click)="setView('details')" class="nav-item" [class.active]="activeView() === 'details'">{{ t('account.details') }}</a>
              <a href="javascript:void(0)" (click)="onDevelop()" class="nav-item">{{ t('account.paymentSettings') }}</a>
              <a href="javascript:void(0)" (click)="onDevelop()" class="nav-item">{{ t('account.memberCard') }}</a>
              <a href="javascript:void(0)" (click)="onDevelop()" class="nav-item">{{ t('account.rewardPoints') }}</a>
              <a href="javascript:void(0)" (click)="onDevelop()" class="nav-item">{{ t('account.giftCards') }}</a>
              <a href="javascript:void(0)" (click)="onDevelop()" class="nav-item">{{ t('account.voucher') }}</a>
              <a href="javascript:void(0)" (click)="setView('coupon')" class="nav-item" [class.active]="activeView() === 'coupon'">{{ t('account.coupon') }}</a>
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
                      @if (avatarPreview() || profile()?.avatarUrl) {
                        <img [src]="avatarPreview() || profile()?.avatarUrl" alt="Avatar" class="avatar-img">
                      } @else {
                        <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="#888"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                      }
                    </div>
                    <input type="file" #avatarInput (change)="onAvatarSelected($event)" style="display: none" accept="image/*">
                    <button class="change-btn" (click)="avatarInput.click()">{{ t('account.change') }}</button>
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
                      <div class="detail-row"><span>{{ t('account.cgvPoints') }}</span> <span>{{ currentPoints() | number }} P</span></div>
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
                    <span class="stat-count">{{ coupons().length }}</span>
                    <button class="view-btn" (click)="setView('coupon')">{{ t('account.view') }}</button>
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
            } @else if (activeView() === 'details') {
              <div class="content-header black-header">
                {{ t('account.changeInfoTitle') }}
              </div>
              
              <form class="details-form">
                <div class="form-grid">
                  <div class="form-col">
                    <div class="form-group">
                      <label>{{ t('account.nameLabel').replace(' :', '') }} <span class="required">*</span></label>
                      <input type="text" [(ngModel)]="editProfile.name" name="name">
                    </div>
                    <div class="form-group">
                      <label>{{ t('account.phoneLabel').replace(' :', '') }} <span class="required">*</span></label>
                      <input type="text" [(ngModel)]="editProfile.phoneNumber" name="phoneNumber">
                    </div>
                    <div class="form-group">
                      <label>{{ t('auth.gender') }} <span class="required">*</span></label>
                      <div class="radio-group">
                        <label><input type="radio" name="gender" value="Nam" [(ngModel)]="editProfile.gender"> {{ t('auth.male') }}</label>
                        <label><input type="radio" name="gender" value="Nữ" [(ngModel)]="editProfile.gender"> {{ t('auth.female') }}</label>
                        <label><input type="radio" name="gender" value="None" [(ngModel)]="editProfile.gender"> None</label>
                      </div>
                    </div>
                    <div class="form-group">
                      <label>{{ t('auth.birthDate') }}</label>
                      <div class="birth-info">{{ formatBirthDate(profile()?.birthDate) }}</div>
                    </div>
                    <div class="form-group">
                      <label>{{ t('account.emailLabel').replace(' :', '') }} <span class="required">*</span></label>
                      <input type="email" [(ngModel)]="editProfile.email" name="email">
                    </div>
                    <div class="form-group checkbox-group">
                      <label>
                        <input type="checkbox" (change)="toggleChangePassword()" [checked]="wantsChangePassword()"> {{ t('account.changePasswordToggle') }}
                      </label>
                    </div>
 
                    @if (wantsChangePassword()) {
                      <div class="form-group">
                        <label>{{ t('auth.newPassword') }} <span class="required">*</span></label>
                        <input type="password" [(ngModel)]="passwordChange.newPassword" name="newPassword">
                      </div>
                      <div class="form-group">
                        <label>{{ t('auth.confirmNewPassword') }} <span class="required">*</span></label>
                        <input type="password" [(ngModel)]="passwordChange.confirmPassword" name="confirmPassword">
                      </div>
                    }
                  </div>

                  <div class="form-col">
                    <div class="form-group">
                      <label>{{ t('account.cityLabel') }} <span class="required">*</span></label>
                      <select name="city" (change)="onProvinceChange($event)">
                        <option [value]="null">Vui lòng chọn...</option>
                        @for (p of provinces(); track p.code) {
                          <option [value]="p.code" [selected]="isProvinceSelected(p)">{{ p.name }}</option>
                        }
                      </select>
                    </div>
                    <div class="form-group">
                      <label>{{ t('account.districtLabel') }} <span class="required">*</span></label>
                      <select name="district" (change)="onDistrictChange($event)">
                        <option [value]="null">Vui lòng chọn...</option>
                        @for (d of districts(); track d.code) {
                          <option [value]="d.code" [selected]="isDistrictSelected(d)">{{ d.name }}</option>
                        }
                      </select>
                    </div>
                    <div class="form-group">
                      <label>{{ t('account.addressLabel') }} <span class="required">*</span></label>
                      <input type="text" [(ngModel)]="editProfile.address" name="address">
                    </div>
                    <div class="form-group">
                      <label>{{ t('account.oldPasswordLabel') }} <span class="required">*</span></label>
                      <input type="password" [(ngModel)]="passwordChange.oldPassword" name="oldPassword">
                    </div>
                  </div>
                </div>

                <div class="form-footer">
                  <button type="button" class="save-btn" (click)="onSave()">{{ t('account.saveButton') }}</button>
                  <p class="required-hint">{{ t('account.requiredHint') }}</p>
                </div>
              </form>
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
                <span class="results-count">{{ t('account.productsCount').replace('{{count}}', historyTotal().toString()) }}</span>
                <div class="display-filter">
                  <label>{{ t('account.displayLabel') }}</label>
                  <select [ngModel]="historyPageSize()" (ngModelChange)="historyPageSize.set(+$event); historyPage.set(0); loadTransactionHistory()">
                    <option [value]="5">5</option>
                    <option [value]="10">10</option>
                    <option [value]="20">20</option>
                  </select>
                </div>
              </div>

              <div class="history-list">
                @for (item of historyList(); track item.billCode) {
                  <div class="history-item">
                    <div class="item-header">
                      {{ t('account.bookingCode') }} <strong>{{ item.billCode }}</strong>
                      <span class="status">({{ t('account.statusLabel') }} 
                        <span class="completed" [style.color]="item.status === 'success' ? 'green' : 'red'">
                          {{ item.status === 'success' ? t('account.statusCompleted') : item.status }}
                        </span>)
                      </span>
                      <svg class="phone-icon" viewBox="0 0 24 24" width="16" height="16" fill="red"><path d="M17 2H7c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-5 18c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm5-4H7V6h10v10z"/></svg>
                    </div>
                    <div class="item-body">
                      <img [src]="item.image || '/movie/default.jpg'" [alt]="item.movieName" class="movie-poster">
                      <div class="item-details">
                        <h4 class="movie-title">{{ item.movieName }}</h4>
                        <span [class]="'rating-badge ' + getRateClass(item.rate)">{{ movieRateCode(item.rate) || 'K' }}</span>
                        <p class="movie-date">{{ item.showDate }}</p>
                        <p class="movie-time">Từ {{ item.startAt }} ~ Đến {{ item.endAt }}</p>
                        <p class="cinema-name">{{ item.cinemaName }}</p>
                        <p class="seats-info">{{ item.roomCode }}{{ item.seat ? ' (' + item.seat + ')' : '' }}</p>
                        <p class="total-price">{{ item.totalMoney | number }} đ</p>
                        <button class="view-item-btn" (click)="printTicket(item.billCode)">{{ t('account.printTicketBtn') }}</button>
                      </div>
                    </div>
                  </div>
                } @empty {
                  @if (isLoadingHistory()) {
                    <div class="loading-history" style="display: flex; justify-content: center; padding: 2rem;">
                      <div class="spinner" style="border: 4px solid #f3f3f3; border-top: 4px solid #e71a0f; border-radius: 50%; width: 30px; height: 30px; animation: spin 1s linear infinite;"></div>
                    </div>
                    <style>
                      @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                      }
                    </style>
                  } @else {
                    <div class="no-history" style="text-align: center; padding: 2rem; color: #888; font-style: italic; font-weight: 600;">
                      Bạn chưa có giao dịch nào
                    </div>
                  }
                }
              </div>

              <div class="history-toolbar bottom">
                <span class="results-count">{{ t('account.productsCount').replace('{{count}}', historyTotal().toString()) }}</span>
                <div class="display-filter">
                  <label>{{ t('account.displayLabel') }}</label>
                  <select [ngModel]="historyPageSize()" (ngModelChange)="historyPageSize.set(+$event); historyPage.set(0); loadTransactionHistory()">
                    <option [value]="5">5</option>
                    <option [value]="10">10</option>
                    <option [value]="20">20</option>
                  </select>
                </div>
              </div>
            } @else if (activeView() === 'coupon') {
              <div class="content-header black-header">
                COUPON
              </div>
              
              <div class="coupon-register-card">
                <div class="coupon-register-form">
                  <h4 class="coupon-title-lg">{{ t('account.couponRegisterTitle') }}</h4>
                  <div class="coupon-form-group">
                    <label>{{ t('account.couponCodeLabel') }} <span class="required">*</span></label>
                    <div class="coupon-input-wrapper">
                      <input type="text" [(ngModel)]="couponCodeInput" name="couponCodeInput">
                    </div>
                    <button class="coupon-black-submit-btn" (click)="registerCouponCode()">{{ t('account.registerBtn') }}</button>
                  </div>
                </div>
                
                <div class="coupon-register-illustration">
                  <img src="/coupon_promo_banner.png" alt="Coupon Promo Banner">
                </div>
              </div>

              <div class="coupon-list-section">
                <h4 class="coupon-title-lg">{{ t('account.myCouponsTitle') }}</h4>
                
                <div class="coupon-filters-bar">
                  <div class="filter-item search-quick">
                    <span class="filter-label">{{ t('account.quickSearch') }}</span>
                    <div class="btn-group">
                      <button type="button" [class.active]="filterQuickTime() === '1week'" (click)="setQuickTime('1week')">{{ t('account.oneWeek') }}</button>
                      <button type="button" [class.active]="filterQuickTime() === '1month'" (click)="setQuickTime('1month')">{{ t('account.oneMonth') }}</button>
                      <button type="button" [class.active]="filterQuickTime() === '3months'" (click)="setQuickTime('3months')">{{ t('account.threeMonths') }}</button>
                    </div>
                  </div>
                  
                  <div class="filter-item date-range">
                    <input type="date" [(ngModel)]="searchFromDate" name="fromDate">
                    <span class="range-separator">~</span>
                    <input type="date" [(ngModel)]="searchToDate" name="toDate">
                    <button type="button" class="coupon-gray-search-btn" (click)="searchAll()">{{ t('account.searchBtn') }}</button>
                  </div>
                </div>

                <div class="coupon-filters-bar secondary">
                  <div class="filter-item btn-group">
                    <button type="button" class="category-btn" [class.active]="searchType === 'all'" (click)="toggleSearchType('all')">Tất cả</button>
                    <button type="button" class="category-btn" [class.active]="searchType === 'Ticket'" (click)="toggleSearchType('Ticket')">{{ t('account.movieNameBtn') }}</button>
                    <button type="button" class="category-btn" [class.active]="searchType === 'Food'" (click)="toggleSearchType('Food')">{{ t('account.popcornDrinkBtn') }}</button>
                  </div>

                  <div class="filter-item dropdown-select-row">
                    <select [ngModel]="searchStatus" (ngModelChange)="searchStatus = $event; filterStatus.set($event)">
                      <option value="Tất cả">{{ t('account.allOption') }}</option>
                      <option value="Chưa sử dụng">{{ t('account.unusedOption') }}</option>
                      <option value="Đã sử dụng">{{ t('account.usedOption') }}</option>
                      <option value="Hết hạn">{{ t('account.expiredOption') }}</option>
                    </select>
                  </div>
                </div>

                <div class="coupon-table-container">
                  <table class="coupon-table">
                    <thead>
                      <tr>
                        <th style="width: 35%">{{ t('account.colCoupon') }}</th>
                        <th style="width: 20%">{{ t('account.colCouponCode') }}</th>
                        <th style="width: 15%">{{ t('account.colRegDate') }}</th>
                        <th style="width: 15%">{{ t('account.colExpDate') }}</th>
                        <th style="width: 15%">{{ t('account.colStatus') }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (c of filteredCoupons(); track c.code) {
                        <tr>
                          <td class="coupon-name">
                            {{ c.name }}
                          </td>
                          <td class="coupon-code">{{ c.code }}</td>
                          <td>{{ formatBirthDate(c.regDate) }}</td>
                          <td>{{ formatBirthDate(c.expDate) }}</td>
                          <td>
                            <span class="status-badge" [class.unused]="c.status === 'Chưa sử dụng'" [class.used]="c.status === 'Đã sử dụng'">
                              {{ c.status === 'Chưa sử dụng' ? t('account.unusedOption') : 
                                 c.status === 'Đã sử dụng' ? t('account.usedOption') : 
                                 c.status === 'Hết hạn' ? t('account.expiredOption') : c.status }}
                            </span>
                          </td>
                        </tr>
                      } @empty {
                        <tr>
                          <td colspan="5" class="no-coupons">{{ t('account.noCouponData') }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            }
          </main>
        </div>
      </div>
    </section>

    @if (isCropperOpen()) {
      <div class="cropper-modal-overlay">
        <div class="cropper-modal-content">
          <div class="cropper-modal-header">
            <h3>{{ t('account.cropAvatarTitle') }}</h3>
            <button class="close-btn" (click)="cancelCrop()">&times;</button>
          </div>
          
          <div class="cropper-viewport-container">
            <div class="cropper-crop-box" 
                 (mousedown)="startDrag($event)" 
                 (mousemove)="drag($event)" 
                 (mouseup)="endDrag()" 
                 (mouseleave)="endDrag()"
                 (touchstart)="startDrag($event)"
                 (touchmove)="drag($event)"
                 (touchend)="endDrag()"
                 (wheel)="onWheel($event)">
                 
              <img [src]="cropperImageSrc()" 
                   [style.transform]="'translate(-50%, -50%) translate(' + panX() + 'px, ' + panY() + 'px) scale(' + zoom() + ') rotate(' + rotation() + 'deg)'"
                   class="cropper-image"
                   (load)="onCropperImageLoaded($event)">
            </div>
          </div>

          <div class="cropper-hint">
            <span>💡 Cuộn chuột (hoặc vuốt) để Zoom. Kéo thả để Căn góc.</span>
          </div>
          
          <div class="cropper-footer">
            <button class="btn-cancel" (click)="cancelCrop()">{{ t('account.cancel') }}</button>
            <button class="btn-apply" (click)="applyCrop()">{{ t('account.apply') }}</button>
          </div>
        </div>
      </div>
    }
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
      background: #1a1a1a;
      color: white;
      padding: 0.5rem 1rem;
      font-weight: 800;
      text-align: center;
      margin-bottom: 1.5rem;
      font-size: 0.95rem;
      text-transform: uppercase;
    }
    .black-header {
      background: #1a1a1a !important;
    }
    .details-form {
      background: transparent;
      padding: 0.5rem 0;
    }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3rem;
      margin-bottom: 2rem;
    }
    .form-group {
      margin-bottom: 1.25rem;
    }
    .form-group label {
      display: block;
      font-size: 0.85rem;
      font-weight: 700;
      margin-bottom: 0.4rem;
      color: #333;
    }
    .form-group label .required {
      color: #d62f1f;
    }
    .form-group input[type="text"],
    .form-group input[type="password"],
    .form-group select {
      width: 100%;
      padding: 0.45rem 0.75rem;
      border: 1px solid #ccc;
      border-radius: 2px;
      font-size: 0.9rem;
      background: white;
      font-family: inherit;
    }
    .radio-group {
      display: flex;
      gap: 1rem;
      font-size: 0.85rem;
      font-weight: 600;
    }
    .radio-group label {
      display: flex;
      align-items: center;
      gap: 0.3rem;
      margin-bottom: 0;
      font-weight: 600;
    }
    .birth-info, .email-info, .card-info {
      font-size: 0.85rem;
      color: #333;
      font-weight: 600;
    }
    .checkbox-group label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 600;
    }
    .section-title-alt {
      font-size: 1rem;
      font-weight: 800;
      margin-bottom: 1.5rem;
      border-bottom: 1px solid #333;
      padding-bottom: 0.25rem;
    }
    .form-footer {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      margin-top: 2rem;
    }
    .save-btn {
      background: #e71a0f;
      color: white;
      border: none;
      padding: 0.6rem 2.5rem;
      font-weight: 800;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.95rem;
      text-transform: uppercase;
    }
    .required-hint {
      color: #d62f1f;
      font-size: 0.8rem;
      font-weight: 700;
      align-self: flex-start;
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
      font-weight: 600;
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
      text-transform: uppercase;
    }
    .rating-badge.rate-g { background-color: #2f9d44 !important; }
    .rating-badge.rate-pg { background-color: #f39c12 !important; }
    .rating-badge.rate-pg13 { background-color: #6d5bd0 !important; }
    .rating-badge.rate-r { background-color: #e03a2f !important; }
    .rating-badge.rate-nc17 { background-color: #1f8bd6 !important; }
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

    .avatar-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    /* CROPPER MODAL STYLES */
    .cropper-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      animation: fadeIn 0.25s ease-out;
    }

    .cropper-modal-content {
      background: #ffffff;
      border-radius: 16px;
      width: 90%;
      max-width: 440px;
      padding: 1.5rem;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .cropper-modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #f0f0f0;
      padding-bottom: 0.75rem;
    }

    .cropper-modal-header h3 {
      font-size: 1.15rem;
      font-weight: 800;
      color: #1a1a1a;
      margin: 0;
      font-family: inherit;
    }

    .cropper-modal-header .close-btn {
      background: transparent;
      border: none;
      font-size: 1.5rem;
      color: #888;
      cursor: pointer;
      padding: 0 0.5rem;
      line-height: 1;
      transition: color 0.2s;
    }

    .cropper-modal-header .close-btn:hover {
      color: #333;
    }

    .cropper-viewport-container {
      display: flex;
      justify-content: center;
      align-items: center;
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 12px;
      border: 1px dashed #e2e8f0;
      overflow: hidden;
      position: relative;
    }

    .cropper-crop-box {
      width: 250px;
      height: 250px;
      position: relative;
      overflow: hidden;
      cursor: move;
      user-select: none;
      background: #000;
      border-radius: 50%;
      border: 2px solid #ffffff;
      box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.4);
    }

    .cropper-image {
      position: absolute;
      top: 50%;
      left: 50%;
      transform-origin: center center;
      max-width: none;
      max-height: none;
      pointer-events: none;
    }

    .cropper-hint {
      text-align: center;
      font-size: 0.82rem;
      color: #64748b;
      background: #f8fafc;
      padding: 0.5rem;
      border-radius: 8px;
      font-weight: 600;
      border: 1px solid #e2e8f0;
      margin: 0.25rem 0;
    }

    .cropper-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      border-top: 1px solid #f0f0f0;
      padding-top: 1rem;
    }

    .btn-cancel {
      background: #f1f5f9;
      color: #475569;
      border: 1px solid #e2e8f0;
      padding: 0.55rem 1.25rem;
      border-radius: 6px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-cancel:hover {
      background: #e2e8f0;
      color: #334155;
    }

    .btn-apply {
      background: #e71a0f;
      color: white;
      border: none;
      padding: 0.55rem 1.5rem;
      border-radius: 6px;
      font-weight: 800;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-apply:hover {
      background: #c51208;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    /* COUPON STYLES */
    .coupon-register-card {
      background: #fdf5e1;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 1.5rem 2rem;
      display: grid;
      grid-template-columns: 1fr 300px;
      gap: 2rem;
      margin-bottom: 2.5rem;
      align-items: center;
    }

    .coupon-title-lg {
      color: #333;
      font-size: 1.15rem;
      font-weight: 800;
      margin-bottom: 1rem;
      text-transform: uppercase;
      letter-spacing: -0.01em;
    }

    .coupon-subtitle-italic {
      font-size: 0.82rem;
      color: #777;
      font-style: italic;
      margin-bottom: 0.5rem;
    }

    .coupon-form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      align-items: flex-start;
      width: 100%;
    }

    .coupon-form-group label {
      display: block;
      font-size: 0.85rem;
      font-weight: 700;
      color: #333;
    }

    .coupon-form-group label .required {
      color: #e71a0f;
    }

    .coupon-input-wrapper {
      width: 100%;
      max-width: 320px;
    }

    .coupon-input-wrapper input {
      width: 100%;
      padding: 0.45rem 0.75rem;
      border: 1px solid #cbd5e1;
      border-left: 3px solid #e71a0f;
      border-radius: 4px;
      font-size: 0.95rem;
      outline: none;
      font-family: inherit;
      background: white;
    }

    .coupon-input-wrapper input:focus {
      border-color: #cbd5e1;
    }

    .coupon-black-submit-btn {
      background: #1a1a1a;
      color: white;
      border: none;
      padding: 0.45rem 2.2rem;
      font-size: 0.85rem;
      font-weight: 800;
      border-radius: 6px;
      cursor: pointer;
      text-transform: uppercase;
      transition: background 0.15s;
      align-self: flex-start;
      margin-top: 0.4rem;
    }

    .coupon-black-submit-btn:hover {
      background: #000000;
    }

    .coupon-register-illustration {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 180px;
    }

    .coupon-register-illustration img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      border-radius: 6px;
    }

    .coupon-list-section {
      background: transparent;
    }

    .coupon-filters-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f8fafc;
      padding: 0.75rem 1rem;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
      margin-bottom: 0.75rem;
    }

    .coupon-filters-bar.secondary {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: transparent;
      border: none;
      padding: 0;
      margin-bottom: 1.5rem;
    }

    .filter-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .filter-label {
      font-size: 0.82rem;
      font-weight: 800;
      color: #334155;
    }

    .filter-item .btn-group {
      display: flex;
      gap: 4px;
    }

    .filter-item .btn-group button {
      background: #7a7a7a;
      color: white;
      border: none;
      padding: 0.35rem 0.85rem;
      font-size: 0.75rem;
      font-weight: 800;
      cursor: pointer;
      border-radius: 4px;
      text-transform: uppercase;
      transition: background 0.15s;
    }

    .filter-item .btn-group button:hover {
      background: #5a5a5a;
    }

    .filter-item .btn-group button.active {
      background: #e71a0f;
    }

    .date-range {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .date-range input[type="date"] {
      padding: 0.3rem 0.5rem;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      font-size: 0.8rem;
      font-family: inherit;
      outline: none;
    }

    .range-separator {
      color: #64748b;
      font-weight: 800;
    }

    .dropdown-select-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .dropdown-select-row select {
      padding: 0.35rem 0.75rem;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      font-size: 0.8rem;
      font-family: inherit;
      outline: none;
      background: white;
    }

    .coupon-gray-search-btn {
      background: #7a7a7a;
      color: white;
      border: none;
      padding: 0.35rem 1rem;
      font-size: 0.8rem;
      font-weight: 800;
      cursor: pointer;
      border-radius: 4px;
      transition: background 0.15s;
    }

    .coupon-gray-search-btn:hover {
      background: #5a5a5a;
    }

    .category-btn {
      background: #7a7a7a;
      color: white;
      border: none;
      padding: 0.35rem 0.85rem;
      font-size: 0.75rem;
      font-weight: 800;
      cursor: pointer;
      border-radius: 4px;
      text-transform: uppercase;
      transition: background 0.15s;
    }

    .category-btn:hover {
      background: #5a5a5a;
    }

    .category-btn.active {
      background: #e71a0f;
    }

    .coupon-table-container {
      background: white;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }

    .coupon-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.85rem;
    }

    .coupon-table th {
      background: #2d2d2d;
      color: white;
      font-weight: 800;
      padding: 0.65rem 1rem;
      text-transform: uppercase;
      font-size: 0.78rem;
      border-bottom: 2px solid #e71a0f;
    }

    .coupon-table td {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid #e2e8f0;
      color: #334155;
      font-weight: 600;
    }

    .coupon-table tr:last-child td {
      border-bottom: none;
    }

    .coupon-name {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 600 !important;
      color: #1e293b !important;
    }

    .coupon-code {
      font-family: monospace;
      font-size: 0.85rem;
      color: #475569;
      font-weight: 700;
    }

    .coupon-type-badge {
      font-size: 0.68rem;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 3px;
      text-transform: uppercase;
    }

    .coupon-type-badge.ticket-badge {
      background: #fee2e2;
      color: #e71a0f;
      border: 1px solid #fca5a5;
    }

    .coupon-type-badge.food-badge {
      background: #fef3c7;
      color: #d97706;
      border: 1px solid #fcd34d;
    }

    .status-badge {
      font-size: 0.75rem;
      font-weight: 800;
    }

    .status-badge.unused {
      color: #10b981;
    }

    .status-badge.used {
      color: #64748b;
      text-decoration: line-through;
    }

    .no-coupons {
      text-align: center;
      padding: 2rem !important;
      color: #94a3b8 !important;
      font-style: italic;
    }

    @media (max-width: 768px) {
      .coupon-register-card {
        grid-template-columns: 1fr;
      }
      .coupon-register-illustration {
        display: none;
      }
      .coupon-filters-bar {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75rem;
      }
    }
  `
})
export class AccountComponent {
  private readonly auth = inject(AuthService);
  private readonly locationService = inject(LocationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly language = inject(LanguageService);
  private readonly title = inject(Title);
  private readonly billService = inject(ManagementBillService);
  protected readonly t = this.language.t.bind(this.language);

  protected readonly activeView = signal<AccountView>('general');
  protected readonly wantsChangePassword = signal(false);

  // Transaction history signals
  protected readonly historyList = signal<any[]>([]);
  protected readonly historyPage = signal(0);
  protected readonly historyPageSize = signal(5);
  protected readonly historyTotal = signal(0);
  protected readonly isLoadingHistory = signal(false);
  protected readonly profile = signal<UserProfile | null>(null);
  protected readonly provinces = signal<Province[]>([]);
  protected readonly districts = signal<District[]>([]);

  // Avatar cropping signals
  protected readonly isCropperOpen = signal(false);
  protected readonly cropperImageSrc = signal<string | null>(null);
  protected readonly avatarPreview = signal<string | null>(null);
  protected readonly zoom = signal(1);
  protected readonly minZoom = signal(0.1);
  protected readonly maxZoom = signal(5);
  protected readonly rotation = signal(0);
  protected readonly panX = signal(0);
  protected readonly panY = signal(0);

  private isDragging = false;
  private startX = 0;
  private startY = 0;
  private startPanX = 0;
  private startPanY = 0;
  private cropperImageElement: HTMLImageElement | null = null;
  private originalFileName = 'avatar.jpg';
  private originalFileType = 'image/jpeg';

  // Coupon signals and data
  protected readonly coupons = signal<Array<{ name: string; code: string; regDate: string; expDate: string; status: string; type: 'Ticket' | 'Food' }>>([
    { name: 'Vé xem phim miễn phí (CineGo Welcome)', code: 'CGWELCOME2026', regDate: '2026-05-20', expDate: '2026-08-20', status: 'Chưa sử dụng', type: 'Ticket' },
    { name: 'Giảm 50% Combo Bắp nước CineGo', code: 'CGCOMBO50', regDate: '2026-05-15', expDate: '2026-06-15', status: 'Chưa sử dụng', type: 'Food' }
  ]);

  protected readonly filterQuickTime = signal<'all' | '1week' | '1month' | '3months'>('all');
  protected readonly filterFromDate = signal<string>('');
  protected readonly filterToDate = signal<string>('');
  protected readonly filterType = signal<'all' | 'Ticket' | 'Food'>('all');
  protected readonly filterStatus = signal<string>('Tất cả');

  protected couponCodeInput = '';

  protected searchFromDate = '';
  protected searchToDate = '';
  protected searchType: 'all' | 'Ticket' | 'Food' = 'all';
  protected searchStatus = 'Tất cả';

  protected setQuickTime(time: 'all' | '1week' | '1month' | '3months'): void {
    this.filterQuickTime.set(time);
    this.searchFromDate = '';
    this.searchToDate = '';
    this.filterFromDate.set('');
    this.filterToDate.set('');
    this.filterType.set(this.searchType);
    this.filterStatus.set(this.searchStatus);
  }

  protected searchAll(): void {
    this.filterQuickTime.set('all');
    this.filterFromDate.set(this.searchFromDate);
    this.filterToDate.set(this.searchToDate);
    this.filterType.set(this.searchType);
    this.filterStatus.set(this.searchStatus);
  }

  protected toggleSearchType(type: 'all' | 'Ticket' | 'Food'): void {
    this.searchType = type;
    this.filterType.set(type);
  }

  protected readonly filteredCoupons = computed(() => {
    const list = this.coupons();
    const quickTime = this.filterQuickTime();
    const from = this.filterFromDate();
    const to = this.filterToDate();
    const type = this.filterType();
    const status = this.filterStatus();

    return list.filter(item => {
      const itemDate = new Date(item.regDate);

      if (quickTime !== 'all') {
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - itemDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (quickTime === '1week' && diffDays > 7) return false;
        if (quickTime === '1month' && diffDays > 30) return false;
        if (quickTime === '3months' && diffDays > 90) return false;
      }

      if (from) {
        const fromDate = new Date(from);
        fromDate.setHours(0, 0, 0, 0);
        if (itemDate < fromDate) return false;
      }

      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        if (itemDate > toDate) return false;
      }

      if (type !== 'all' && item.type !== type) return false;
      if (status !== 'Tất cả' && item.status !== status) return false;

      return true;
    });
  });

  protected registerCouponCode(): void {
    const code = this.couponCodeInput.trim().toUpperCase();
    if (!code) {
      alert('Vui lòng nhập số Coupon!');
      return;
    }

    const exists = this.coupons().some(c => c.code === code);
    if (exists) {
      alert('Mã Coupon này đã được đăng ký trước đó!');
      return;
    }

    let couponName = '';
    let couponType: 'Ticket' | 'Food' = 'Ticket';
    let durationMonths = 3;

    if (code === 'CINEGO100' || code === 'FREEVET') {
      couponName = 'Vé 2D miễn phí tri ân khách hàng';
      couponType = 'Ticket';
    } else if (code === 'POPCONN' || code === 'BAPNUOC') {
      couponName = 'Miễn phí 1 Bắp ngọt lớn + 1 Nước ngọt';
      couponType = 'Food';
      durationMonths = 1;
    } else if (code === 'CGWELCOME2026') {
      couponName = 'Vé xem phim miễn phí (CineGo Welcome)';
      couponType = 'Ticket';
    } else if (code === 'CGCOMBO50') {
      couponName = 'Giảm 50% Combo Bắp nước CineGo';
      couponType = 'Food';
      durationMonths = 1;
    } else if (code.startsWith('CG') && code.length >= 6) {
      couponName = 'Mã ưu đãi giảm giá thành viên ' + code;
      couponType = 'Ticket';
    } else {
      alert('Mã Coupon không hợp lệ hoặc đã hết hạn!');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const expDate = new Date();
    expDate.setMonth(expDate.getMonth() + durationMonths);
    const expDateStr = expDate.toISOString().split('T')[0];

    const newCoupon = {
      name: couponName,
      code: code,
      regDate: todayStr,
      expDate: expDateStr,
      status: 'Chưa sử dụng',
      type: couponType
    };

    this.coupons.update(list => [newCoupon, ...list]);
    this.couponCodeInput = '';
    alert('Đăng ký Coupon thành công!');
  }

  protected editProfile = {
    name: '',
    phoneNumber: '',
    email: '',
    address: '',
    city: '',
    district: '',
    gender: 'None',
    birthDate: ''
  };

  protected passwordChange = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  private selectedAvatar: File | null = null;

  constructor() {
    this.locationService.getProvinces().subscribe(data => this.provinces.set(data));

    const userName = this.auth.currentUserName();
    if (userName) {
      this.auth.getUserProfile(userName).subscribe(p => {
        this.profile.set(p);
        this.syncEditProfile(p);
        this.loadInitialDistricts(p);
      });
    }
    this.route.queryParamMap.subscribe(params => {
      const view = params.get('view') as AccountView;
      if (view) {
        this.activeView.set(view);
      }
    });

    effect(() => {
      const currentView = this.activeView();
      let viewTitle = '';
      if (currentView === 'general') viewTitle = this.t('account.infoGeneral');
      else if (currentView === 'details') viewTitle = this.t('account.details');
      else if (currentView === 'coupon') viewTitle = this.t('account.couponManageTitle');
      else {
        viewTitle = this.t('account.history');
        this.loadTransactionHistory();
      }

      this.title.setTitle(viewTitle);
    });
  }

  protected loadTransactionHistory(): void {
    this.isLoadingHistory.set(true);
    this.billService.getTransactionHistory(this.historyPage(), this.historyPageSize()).subscribe({
      next: (res: any) => {
        const data = res?.data || res;
        let contentList = [];
        let total = 0;

        if (data?.content) {
          contentList = data.content;
          total = data.totalElements ?? contentList.length;
        } else if (Array.isArray(data)) {
          contentList = data;
          total = contentList.length;
        } else if (res?.content) {
          contentList = res.content;
          total = res.totalElements ?? contentList.length;
        }

        this.historyList.set(contentList);
        this.historyTotal.set(total);
        this.isLoadingHistory.set(false);
      },
      error: (err) => {
        console.error('Error loading transaction history', err);
        this.isLoadingHistory.set(false);
      }
    });
  }

  protected currentName(): string {
    return this.profile()?.name || this.auth.currentUserName() || this.t('header.member');
  }

  protected currentEmail(): string {
    return this.profile()?.email || this.auth.currentUserEmail() || 'N/A';
  }

  protected currentPhone(): string {
    return this.profile()?.phoneNumber || this.auth.currentUserPhone() || 'N/A';
  }

  protected movieRateCode(rate: string | null | undefined): string {
    const r = (rate || '').toUpperCase();
    if (r.includes('PG-13')) return 'PG-13';
    if (r.includes('NC-17')) return 'NC-17';
    if (r.startsWith('PG')) return 'PG';
    if (r.startsWith('G')) return 'G';
    if (r.startsWith('R')) return 'R';
    if (r.startsWith('P')) return 'P';
    if (r.startsWith('K')) return 'K';
    if (r.startsWith('C13') || r.startsWith('T13')) return 'T13';
    if (r.startsWith('C16') || r.startsWith('T16')) return 'T16';
    if (r.startsWith('C18') || r.startsWith('T18')) return 'T18';
    return (r.split(/[\s-]/)[0] || '').trim();
  }

  protected getRateClass(rate: string | null | undefined): string {
    const r = this.movieRateCode(rate);
    if (r === 'G' || r === 'P') return 'rate-g';
    if (r === 'PG' || r === 'K') return 'rate-pg';
    if (r === 'PG-13' || r === 'T13') return 'rate-pg13';
    if (r === 'R' || r === 'T16') return 'rate-r';
    if (r === 'NC-17' || r === 'T18') return 'rate-nc17';
    return '';
  }

  protected printTicket(billCode: string): void {
    if (!billCode) return;
    const url = this.billService.getPrintTicketPdfUrl(billCode) + '#print';
    window.open(url, '_blank');
  }

  protected currentPoints(): number {
    return this.profile()?.point || 0;
  }

  protected formatBirthDate(date: string | null | undefined): string {
    if (!date) return 'N/A';
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return date;
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
    } catch {
      return date;
    }
  }

  protected logout(): void {
    this.auth.logout();
    void this.router.navigateByUrl('/customer/account/login');
  }

  protected onProvinceChange(event: Event): void {
    const code = Number((event.target as HTMLSelectElement).value);
    if (code) {
      this.locationService.getDistricts(code).subscribe(data => this.districts.set(data));
    } else {
      this.districts.set([]);
    }
  }

  protected onDistrictChange(event: Event): void {
    // Logic for district change if needed
  }

  protected isProvinceSelected(p: Province): boolean {
    const city = this.profile()?.city;
    if (!city) return false;
    return p.name.includes(city) || city.includes(p.name);
  }

  protected isDistrictSelected(d: District): boolean {
    const dist = this.profile()?.district;
    if (!dist) return false;
    return d.name.includes(dist) || dist.includes(d.name);
  }

  private loadInitialDistricts(p: UserProfile): void {
    if (p.city) {
      // Find province code by name
      const province = this.provinces().find(prov =>
        prov.name.includes(p.city!) || p.city!.includes(prov.name)
      );
      if (province) {
        this.locationService.getDistricts(province.code).subscribe(data => this.districts.set(data));
      }
    }
  }

  protected setView(view: AccountView): void {
    this.activeView.set(view);
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { view: view },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  protected toggleChangePassword(): void {
    this.wantsChangePassword.update(v => !v);
  }

  protected onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.originalFileName = file.name;
      this.originalFileType = file.type;

      const reader = new FileReader();
      reader.onload = (e) => {
        this.cropperImageSrc.set(e.target?.result as string);
        this.isCropperOpen.set(true);
        // Reset file input value so selecting the same file again triggers change event
        input.value = '';
      };
      reader.readAsDataURL(file);
    }
  }

  protected onCropperImageLoaded(event: Event): void {
    const img = event.target as HTMLImageElement;
    this.cropperImageElement = img;
    const W_nat = img.naturalWidth;
    const H_nat = img.naturalHeight;
    const D_view = 250;

    const base = Math.max(D_view / W_nat, D_view / H_nat);
    this.minZoom.set(base * 0.2); // Cho phép thu nhỏ thêm đến 20% kích thước cơ sở
    this.maxZoom.set(base * 5);
    this.zoom.set(base);
    this.panX.set(0);
    this.panY.set(0);
    this.rotation.set(0);
  }

  protected startDrag(event: MouseEvent | TouchEvent): void {
    event.preventDefault();
    this.isDragging = true;

    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

    this.startX = clientX;
    this.startY = clientY;
    this.startPanX = this.panX();
    this.startPanY = this.panY();
  }

  protected drag(event: MouseEvent | TouchEvent): void {
    if (!this.isDragging) return;
    event.preventDefault();

    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

    const deltaX = clientX - this.startX;
    const deltaY = clientY - this.startY;

    this.panX.set(this.startPanX + deltaX);
    this.panY.set(this.startPanY + deltaY);
  }

  protected endDrag(): void {
    this.isDragging = false;
  }

  protected onWheel(event: WheelEvent): void {
    event.preventDefault();
    const zoomStep = 0.03;
    const direction = event.deltaY < 0 ? 1 : -1;
    const currentZoom = this.zoom();
    const newZoom = Math.min(Math.max(currentZoom + direction * zoomStep, this.minZoom()), this.maxZoom());
    this.zoom.set(newZoom);
  }

  protected cancelCrop(): void {
    this.isCropperOpen.set(false);
    this.cropperImageSrc.set(null);
  }

  protected applyCrop(): void {
    if (!this.cropperImageElement) return;

    const img = this.cropperImageElement;
    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;

    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 400, 400);

      ctx.translate(200, 200);

      const scaleFactor = 400 / 250;
      ctx.translate(this.panX() * scaleFactor, this.panY() * scaleFactor);

      ctx.rotate(this.rotation() * Math.PI / 180);

      const drawScale = this.zoom() * scaleFactor;
      ctx.scale(drawScale, drawScale);

      ctx.drawImage(img, -naturalWidth / 2, -naturalHeight / 2, naturalWidth, naturalHeight);

      canvas.toBlob((blob) => {
        if (blob) {
          const croppedFile = new File([blob], this.originalFileName, { type: this.originalFileType });
          this.selectedAvatar = croppedFile;

          const previewUrl = URL.createObjectURL(blob);
          const oldPreview = this.avatarPreview();
          if (oldPreview) {
            URL.revokeObjectURL(oldPreview);
          }
          this.avatarPreview.set(previewUrl);
        }
        this.isCropperOpen.set(false);
        this.cropperImageSrc.set(null);
      }, this.originalFileType, 0.9);
    }
  }

  protected onSave(): void {
    const formData = new FormData();
    formData.append('email', this.editProfile.email);
    formData.append('name', this.editProfile.name);
    formData.append('phoneNumber', this.editProfile.phoneNumber);
    formData.append('address', this.editProfile.address);
    formData.append('city', this.editProfile.city);
    formData.append('district', this.editProfile.district);
    formData.append('gender', this.editProfile.gender);
    formData.append('birthDate', this.editProfile.birthDate);

    if (this.selectedAvatar) {
      formData.append('file', this.selectedAvatar);
    }

    this.auth.updateProfile(formData).subscribe({
      next: () => {
        const oldPreview = this.avatarPreview();
        if (oldPreview) {
          URL.revokeObjectURL(oldPreview);
          this.avatarPreview.set(null);
        }

        if (this.wantsChangePassword()) {
          this.auth.changeUserPassword(this.passwordChange).subscribe({
            next: () => {
              alert(this.t('account.updatedSuccessfully'));
              this.refreshProfile();
            },
            error: (err) => alert(err.error?.message || this.t('account.errorUpdatingPassword'))
          });
        } else {
          alert(this.t('account.updatedSuccessfully'));
          this.refreshProfile();
        }
      },
      error: (err) => alert(err.error?.message || this.t('account.errorUpdatingProfile'))
    });
  }

  private syncEditProfile(p: UserProfile): void {
    let normalizedGender = 'None';
    if (p.gender) {
      const g = p.gender.toLowerCase();
      if (g === 'nam' || g === 'male') normalizedGender = 'Nam';
      else if (g === 'nữ' || g === 'female') normalizedGender = 'Nữ';
    }

    this.editProfile = {
      name: p.name || '',
      phoneNumber: p.phoneNumber || '',
      email: p.email || '',
      address: p.address || '',
      city: p.city || '',
      district: p.district || '',
      gender: normalizedGender,
      birthDate: p.birthDate || ''
    };
  }

  private refreshProfile(): void {
    const userName = this.auth.currentUserName();
    if (userName) {
      this.auth.getUserProfile(userName).subscribe(p => {
        this.profile.set(p);
        this.syncEditProfile(p);
      });
    }
  }

  protected onDevelop(): void {
    alert(this.t('account.devMessage'));
  }
}