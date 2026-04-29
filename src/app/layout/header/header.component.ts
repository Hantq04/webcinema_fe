import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Banner quảng cáo thay thế top-row -->
    <div class="ad-banner">
      <img src="/vnpay_qc.jpg" alt="Quảng cáo" class="ad-banner__img" />
    </div>

    <!-- Hàng tiện ích với nền trắng -->
    <div class="utility-wrapper">
      <div class="mx-auto max-w-7xl px-4 py-0.5">
        <div class="utility-row">
          <a href="javascript:void(0)" (click)="onDevelop()" class="utility-link inline-flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.586 2.586 2 13.172V22h8.828l10.586-10.586a2 2 0 0 0 0-2.828l-6.172-6.172a2 2 0 0 0-2.828 0z"/><path d="m9 13 4 4"/><circle cx="9" cy="17" r="0.5"/><circle cx="13" cy="13" r="0.5"/></svg>
            {{ t('header.news') }}
          </a>
          <a routerLink="/account" [queryParams]="{ view: 'history' }" class="utility-link inline-flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg>
            {{ t('header.myTickets') }}
          </a>
          @if (auth.isAuthenticated()) {
            <a routerLink="/account" class="utility-user utility-user--link inline-flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>
              {{ t('header.hello') }} {{ auth.currentUserName() || t('header.member') }}
            </a>
            <button type="button" class="utility-link utility-link--button" (click)="logout()">{{ t('header.logout') }}</button>
          } @else {
            <a routerLink="/customer/account/login" class="utility-link inline-flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>
              {{ t('header.loginRegister') }}
            </a>
          }
          <div class="lang-switch">
            <button type="button" class="lang-button" [class.active]="language.isActive('vi')" (click)="language.useLanguage('vi')">{{ t('header.vi') }}</button>
            <button type="button" class="lang-button" [class.active]="language.isActive('en')" (click)="language.useLanguage('en')">{{ t('header.en') }}</button>
          </div>
        </div>
      </div>
    </div>

    <header class="cinema-header">
      <!-- Dotline đỏ phân cách utility-row và phần brand-row/nav -->
      <div class="header-dotline"></div>
      <div class="mx-auto max-w-7xl px-4">
        <div class="brand-row">
          <a routerLink="/home" class="logo-link" [attr.aria-label]="t('header.homeAria')">
            <span class="logo-text">CINEGO</span>
          </a>
          <a routerLink="/movies" class="buy-ticket-link">
            <img src="/mua_ve_ngay.png" alt="{{ t('header.buyNow') }}" class="buy-ticket-img" />
            @if (isEn()) {
              <span class="buy-ticket-text--en">{{ t('header.buyNowShort') }}</span>
            } @else {
              <span class="buy-ticket-text--vi">{{ t('header.buyNowShort') }}</span>
            }
          </a>
        </div>

        <nav aria-label="Main navigation" class="main-nav grid grid-cols-4 gap-1 pt-2 pb-2 max-[900px]:grid-cols-2 max-[640px]:grid-cols-1">
          <!-- Phim -->
          <div class="nav-item group" [class.nav-item--open]="isMenuOpen('movies')" (mouseleave)="closeMenu()">
            <button type="button" class="nav-link" [attr.aria-expanded]="isMenuOpen('movies')" aria-haspopup="menu" (click)="toggleMenu('movies')">
              <span class="nav-link__label">{{ t('header.movie') }}</span>
            </button>
            <div class="dropdown-menu" [class.dropdown-menu--open]="isMenuOpen('movies')">
              <a routerLink="/movies" [queryParams]="{ tab: 'now-showing' }" class="dropdown-link">{{ t('movies.showing') }}</a>
              <a routerLink="/movies" [queryParams]="{ tab: 'coming-soon' }" class="dropdown-link">{{ t('movies.coming') }}</a>
            </div>
          </div>

          <!-- Rạp -->
          <div class="nav-item group" [class.nav-item--open]="isMenuOpen('booking')" (mouseleave)="closeMenu()">
            <button type="button" class="nav-link" [attr.aria-expanded]="isMenuOpen('booking')" aria-haspopup="menu" (click)="toggleMenu('booking')">
              <span class="nav-link__label">{{ t('header.cinema') }}</span>
            </button>
            <div class="dropdown-menu" [class.dropdown-menu--open]="isMenuOpen('booking')">
              <a routerLink="/cinox/site" class="dropdown-link">{{ t('header.allCinemas') }}</a>
              <a href="javascript:void(0)" (click)="onDevelop()" class="dropdown-link">{{ t('header.specialCinemas') }}</a>
            </div>
          </div>

          <!-- Thành viên -->
          <div class="nav-item group" [class.nav-item--open]="isMenuOpen('member')" (mouseleave)="closeMenu()">
            <button type="button" class="nav-link" [attr.aria-expanded]="isMenuOpen('member')" aria-haspopup="menu" (click)="toggleMenu('member')">
              <span class="nav-link__label">{{ t('header.member') }}</span>
            </button>
            <div class="dropdown-menu" [class.dropdown-menu--open]="isMenuOpen('member')">
              <a href="javascript:void(0)" (click)="onDevelop()" class="dropdown-link">{{ t('header.memberBenefits') }}</a>
              <a href="javascript:void(0)" (click)="onStaffClick($event)" class="dropdown-link">{{ t('header.forStaff') }}</a>
            </div>
          </div>

          <!-- Cultureplex -->
          <div class="nav-item group" [class.nav-item--open]="isMenuOpen('cultureplex')" (mouseleave)="closeMenu()">
            <button type="button" class="nav-link" [attr.aria-expanded]="isMenuOpen('cultureplex')" aria-haspopup="menu" (click)="toggleMenu('cultureplex')">
              <span class="nav-link__label">{{ t('header.cultureplex') }}</span>
            </button>
            <div class="dropdown-menu" [class.dropdown-menu--open]="isMenuOpen('cultureplex')">
              <a href="javascript:void(0)" (click)="onDevelop()" class="dropdown-link">{{ t('header.onlineStore') }}</a>
              <a href="javascript:void(0)" (click)="onDevelop()" class="dropdown-link">{{ t('header.groupBooking') }}</a>
              <a href="javascript:void(0)" (click)="onDevelop()" class="dropdown-link">{{ t('header.egift') }}</a>
              <a href="javascript:void(0)" (click)="onDevelop()" class="dropdown-link">{{ t('header.rules') }}</a>
            </div>
          </div>
        </nav>
      </div>

      <!-- Dotline đỏ phía dưới -->
      <div class="header-dotline"></div>
    </header>
  `,
  styles: `
    :host {
      display: block;
    }

    /* ===== Banner quảng cáo ===== */
    .ad-banner {
      display: flex;
      justify-content: center;
      background: #fdfaf0;
    }

    .ad-banner__img {
      display: block;
      width: auto;
      max-width: 100%;
      height: auto;
      max-height: 80px;
    }

    .utility-wrapper {
      background-color: #fdfaf0;
      position: relative;
      z-index: 31;
    }

    .cinema-header {
      background-color: #fdf5e1;
      background-image:
        radial-gradient(circle at 50% 0, rgba(214, 47, 31, 0.05), transparent 45%),
        linear-gradient(180deg, rgba(255, 255, 255, 0.5), rgba(255, 245, 223, 0.1)),
        repeating-linear-gradient(
          0deg,
          rgba(49, 36, 25, 0.18) 0 1px,
          transparent 1px 1.85rem
        );
      overflow: visible;
      position: relative;
      z-index: 30;
    }

    /* Dotline đỏ (dùng cả trên lẫn dưới) */
    .header-dotline {
      background: radial-gradient(circle, rgba(255,255,255,0.95) 0 0.13rem, transparent 0.14rem) 0 0 / 0.9rem 0.45rem repeat-x, #d62f1f;
      height: 0.45rem;
      position: relative;
      z-index: 1;
    }

    .utility-row,
    .brand-row {
      position: relative;
      z-index: 1;
    }

    .utility-row {
      align-items: center;
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 0;
      padding: 0.55rem 0 0.35rem;
    }

    .utility-link {
      color: #3b3127;
      font-size: 0.82rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-decoration: none;
      text-transform: uppercase;
    }

    .utility-link:hover {
      color: #d62f1f;
    }

    .utility-link--button {
      align-items: center;
      background: rgba(214, 47, 31, 0.08);
      border-radius: 999px;
      color: #d62f1f;
      display: inline-flex;
      justify-content: center;
      padding: 0.35rem 0.75rem;
    }

    .utility-link--button {
      border: 0;
      cursor: pointer;
      font-family: inherit;
    }

    .utility-user {
      color: #3b3127;
      font-size: 0.82rem;
      font-weight: 800;
      letter-spacing: 0.03em;
      text-transform: uppercase;
    }

    .utility-user--link {
      text-decoration: none;
    }

    .utility-user--link:hover {
      color: #d62f1f;
    }

    .brand-row {
      align-items: center;
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      padding: 0.5rem 0 0.1rem;
    }

    .logo-link {
      display: inline-flex;
      flex-shrink: 0;
      text-decoration: none;
    }

    .logo-text {
      color: #d62f1f;
      display: inline-block;
      font-size: clamp(2.9rem, 5.6vw, 5.4rem);
      font-weight: 900;
      letter-spacing: -0.05em;
      line-height: 1;
      text-transform: uppercase;
      text-shadow: 0 0.08rem 0 rgba(255, 255, 255, 0.6), 0 0.25rem 0.6rem rgba(214, 47, 31, 0.08);
    }

    .buy-ticket-link {
      display: inline-block;
      flex-shrink: 0;
      transition: transform 0.2s ease;
      z-index: 10;
      position: relative;
    }

    .buy-ticket-link:hover {
      transform: scale(1.05);
    }

    .buy-ticket-img {
      display: block;
      height: auto;
      max-height: 110px;
      width: auto;
    }

    .buy-ticket-text--vi,
    .buy-ticket-text--en {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      color: #fff;
      font-weight: 950;
      white-space: nowrap;
      pointer-events: none;
      text-shadow: 0 1px 2px rgba(0,0,0,0.4);
      text-align: center;
    }

    .buy-ticket-text--vi {
      bottom: 22%;
      font-size: 0.76rem;
      letter-spacing: -0.01em;
      width: 75%;
    }

    .buy-ticket-text--en {
      bottom: 22%;
      left: 52%;
      font-size: 0.85rem;
      letter-spacing: 0.05em;
      width: 80%;
    }

    .main-nav {
      position: relative;
      z-index: 10;
    }

    .nav-item {
      position: relative;
      z-index: 1;
    }

    .nav-item--open {
      z-index: 90;
    }

    .nav-link {
      align-items: center;
      background: transparent;
      border: 0;
      color: #231b14;
      display: flex;
      flex-direction: column;
      gap: 0;
      justify-content: center;
      min-height: 4rem;
      padding: 0.45rem 0.45rem 0.8rem;
      position: relative;
      text-decoration: none;
      transition: color 180ms ease, transform 180ms ease;
      z-index: 1;
      width: 100%;
    }

    .nav-link__label {
      color: #231b14;
      display: inline-block;
      font-size: 1.2rem;
      font-weight: 900;
      letter-spacing: 0.02em;
      line-height: 1.1;
      text-transform: uppercase;
    }

    .nav-link:hover {
      transform: translateY(-1px);
    }

    /* DROPDOWN MENU */
    .dropdown-menu {
      position: absolute;
      top: calc(100% + 0.35rem);
      left: 50%;
      min-width: 200px;
      background: #333333;
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 0;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
      padding: 0.5rem 0;
      opacity: 0;
      visibility: hidden;
      transform: translateX(-50%) translateY(10px);
      transition: opacity 200ms ease, transform 200ms ease, visibility 200ms;
      z-index: 80;
    }

    .nav-item:hover {
      z-index: 90;
    }

    .nav-item:hover .dropdown-menu {
      opacity: 1;
      visibility: visible;
      transform: translateX(-50%) translateY(0);
    }

    .nav-item::after {
      content: '';
      position: absolute;
      bottom: -15px;
      left: 0;
      right: 0;
      height: 15px;
      z-index: 79;
    }

    .dropdown-link {
      display: block;
      color: #e5e5e5;
      padding: 0.65rem 1.25rem;
      font-size: 0.85rem;
      font-weight: 700;
      text-decoration: none;
      transition: color 150ms ease, background 150ms ease;
    }

    .dropdown-link:hover {
      color: #ffffff;
      background: rgba(255, 255, 255, 0.1);
    }

    .dropdown-menu--open {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    .lang-switch {
      display: inline-flex;
      border-radius: 0.375rem;
      overflow: hidden;
      border: 1px solid rgba(0, 0, 0, 0.05);
    }

    .lang-button {
      background: #9d907d;
      border: 0;
      color: #fff;
      cursor: pointer;
      font-size: 0.78rem;
      font-weight: 700;
      padding: 0.25rem 0.6rem;
      min-width: 40px;
      text-align: center;
      transition: background 150ms ease;
    }

    .lang-button.active {
      background: #d62f1f;
    }

    .lang-button:not(.active):hover {
      background: #8e8578;
    }

    @media (max-width: 900px) {
      .top-row,
      .brand-row {
        flex-direction: column;
      }

      .utility-row {
        flex-wrap: wrap;
        justify-content: center;
      }

      .buy-ticket-chip {
        transform: none;
      }
    }
  `
})
export class HeaderComponent {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly auth = inject(AuthService);
  protected readonly language = inject(LanguageService);
  protected readonly t = this.language.t.bind(this.language);
  private readonly openMenu = signal<'movies' | 'booking' | 'member' | 'cultureplex' | null>(null);

  protected readonly memberLink = computed(() => (this.auth.isAuthenticated() ? '/account' : '/customer/account/login'));

  constructor() {
    const subscription = this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd)).subscribe(() => {
      this.openMenu.set(null);
    });

    this.destroyRef.onDestroy(() => subscription.unsubscribe());
  }

  protected isMenuOpen(menu: 'movies' | 'booking' | 'member' | 'cultureplex'): boolean {
    return this.openMenu() === menu;
  }

  protected toggleMenu(menu: 'movies' | 'booking' | 'member' | 'cultureplex'): void {
    this.openMenu.update((current) => (current === menu ? null : menu));
  }

  protected closeMenu(): void {
    this.openMenu.set(null);
  }

  protected logout(): void {
    this.auth.logout();
    void this.router.navigate(['/customer/account/login']);
  }

  protected onStaffClick(event: Event): void {
    event.preventDefault();
    if (this.auth.isAuthenticated()) {
      const role = this.auth.currentUserRole()?.toUpperCase();
      if (role === 'STAFF' || role === 'ADMIN') {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem('management_sidebar_collapsed');
        }
        void this.router.navigate(['/management/dashboard']);
      } else {
        alert('Tính năng này chỉ dành cho nhân viên và quản lý');
      }
    } else {
      void this.router.navigate(['/staff/account/login']);
    }
  }

  protected onDevelop(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    alert('Tính năng đang được phát triển. Vui lòng quay lại sau!');
  }

  protected isEn(): boolean {
    return this.language.currentLanguage() === 'en';
  }
}