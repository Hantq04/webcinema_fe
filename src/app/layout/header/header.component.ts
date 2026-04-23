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
    <header class="cinema-header border-b-4 border-[#d62f1f] shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
      <div class="header-top-dotline"></div>

      <div class="mx-auto max-w-7xl px-4 py-3">
        <div class="top-row">
          <div class="rounded-full bg-[#d9f5d3] px-3 py-1 text-sm font-bold whitespace-nowrap text-[#1f6a2f] cursor-pointer" (click)="onDevelop()">Zalopay</div>
          <div class="flex flex-col items-center gap-1 text-center">
            <strong class="text-[1.1rem] font-black uppercase tracking-[0.12em] text-[#d62f1f]">CineGo</strong>
            <span class="text-sm text-[#6d5b46]">{{ t('header.slogan') }}</span>
          </div>
          <div class="rounded-full bg-[#d62f1f] px-3 py-1 text-sm font-bold whitespace-nowrap text-[#fff6ec] cursor-pointer" (click)="onDevelop()">{{ t('header.deal') }}</div>
        </div>

        <div class="utility-row">
          <a href="javascript:void(0)" (click)="onDevelop()" class="utility-link">{{ t('header.news') }}</a>
          <a href="javascript:void(0)" (click)="onDevelop()" class="utility-link">{{ t('header.myTickets') }}</a>
          @if (auth.isAuthenticated()) {
            <a routerLink="/account" class="utility-user utility-user--link">{{ t('header.hello') }} {{ auth.currentUserName() || t('header.member') }}</a>
            <button type="button" class="utility-link utility-link--button" (click)="logout()">{{ t('header.logout') }}</button>
          } @else {
            <a routerLink="/auth" class="utility-link">{{ t('header.loginRegister') }}</a>
          }
          <span class="inline-flex gap-1">
            <button type="button" class="lang-button" [class.active]="language.isActive('vi')" (click)="language.useLanguage('vi')">{{ t('header.vi') }}</button>
            <button type="button" class="lang-button" [class.active]="language.isActive('en')" (click)="language.useLanguage('en')">{{ t('header.en') }}</button>
          </span>
        </div>

        <div class="brand-row">
          <a routerLink="/home" class="logo-link" [attr.aria-label]="t('header.homeAria')">
            <span class="logo-text">CINEGO</span>
          </a>
          <a routerLink="/movies" class="buy-ticket-chip">{{ t('header.buyNow') }}</a>
        </div>

        <nav aria-label="Main navigation" class="main-nav grid grid-cols-4 gap-1 pt-3 pb-3 max-[900px]:grid-cols-2 max-[640px]:grid-cols-1">
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
              <a routerLink="/booking" class="dropdown-link">{{ t('header.allCinemas') }}</a>
              <a href="javascript:void(0)" (click)="onDevelop()" class="dropdown-link">{{ t('header.specialCinemas') }}</a>
              <a href="javascript:void(0)" (click)="onDevelop()" class="dropdown-link">{{ t('header.threeDCinemas') }}</a>
            </div>
          </div>

          <!-- Thành viên -->
          <div class="nav-item group" [class.nav-item--open]="isMenuOpen('member')" (mouseleave)="closeMenu()">
            <button type="button" class="nav-link" [attr.aria-expanded]="isMenuOpen('member')" aria-haspopup="menu" (click)="toggleMenu('member')">
              <span class="nav-link__label">{{ t('header.member') }}</span>
            </button>
            <div class="dropdown-menu" [class.dropdown-menu--open]="isMenuOpen('member')">
              <a href="javascript:void(0)" (click)="onDevelop()" class="dropdown-link">{{ t('header.accountCgv') }}</a>
              <a href="javascript:void(0)" (click)="onDevelop()" class="dropdown-link">{{ t('header.memberBenefits') }}</a>
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
    </header>
  `,
  styles: `
    :host {
      display: block;
    }

    .cinema-header {
      background-color: #f6f0df;
      background-image:
        radial-gradient(circle at 50% 0, rgba(214, 47, 31, 0.08), transparent 36%),
        linear-gradient(180deg, rgba(255, 255, 255, 0.55), rgba(255, 245, 223, 0.25)),
        repeating-linear-gradient(
          90deg,
          rgba(214, 47, 31, 0.14) 0 0.25rem,
          transparent 0.25rem 1.9rem
        );
      overflow: visible;
      position: relative;
      z-index: 30;
    }

    .cinema-header::before,
    .cinema-header::after {
      background: repeating-linear-gradient(
        90deg,
        #d62f1f 0 0.65rem,
        #fff1dd 0.65rem 1.05rem
      );
      content: '';
      display: block;
      height: 0.45rem;
      left: 0;
      position: absolute;
      right: 0;
      z-index: 0;
    }

    .cinema-header::before {
      top: 0;
    }

    .cinema-header::after {
      bottom: 0;
    }

    .header-top-dotline {
      background: radial-gradient(circle, rgba(255,255,255,0.95) 0 0.13rem, transparent 0.14rem) 0 0 / 0.9rem 0.45rem repeat-x, #d62f1f;
      height: 0.45rem;
      position: relative;
      z-index: 1;
    }

    .top-row,
    .utility-row,
    .brand-row {
      position: relative;
      z-index: 1;
    }

    .top-row {
      align-items: center;
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      margin-top: 0.45rem;
    }

    .utility-row {
      align-items: center;
      border-bottom: 1px solid rgba(81, 60, 35, 0.32);
      border-top: 1px solid rgba(81, 60, 35, 0.32);
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 0.6rem;
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
      padding: 0.85rem 0 0.2rem;
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
      letter-spacing: -0.1em;
      line-height: 1;
      text-transform: uppercase;
      text-shadow: 0 0.08rem 0 rgba(255, 255, 255, 0.6), 0 0.25rem 0.6rem rgba(214, 47, 31, 0.08);
    }

    .buy-ticket-chip {
      align-items: center;
      background: linear-gradient(180deg, #ff5a3c, #d62f1f);
      border-radius: 0.6rem;
      box-shadow: 0 0.65rem 1.1rem rgba(214, 47, 31, 0.24);
      color: #fff;
      display: inline-flex;
      font-size: 0.9rem;
      font-weight: 900;
      justify-content: center;
      letter-spacing: 0.04em;
      padding: 0.85rem 1.2rem;
      text-decoration: none;
      text-transform: uppercase;
      transform: rotate(-7deg);
      white-space: nowrap;
    }

    .main-nav {
      position: relative;
      z-index: 1;
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
      left: 0;
      min-width: 200px;
      background: #333333;
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 0;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
      padding: 0.5rem 0;
      opacity: 0;
      visibility: hidden;
      transform: translateY(10px);
      transition: opacity 200ms ease, transform 200ms ease, visibility 200ms;
      z-index: 80;
    }

    .nav-item:hover {
      z-index: 90;
    }

    .nav-item:hover .dropdown-menu {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
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

    .lang-button {
      background: #9d907d;
      border: 0;
      border-radius: 0.375rem;
      color: #fff;
      cursor: pointer;
      font-size: 0.78rem;
      font-weight: 700;
      padding: 0.2rem 0.55rem;
    }

    .lang-button.active {
      background: #d62f1f;
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

  protected readonly memberLink = computed(() => (this.auth.isAuthenticated() ? '/account' : '/auth'));

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
    void this.router.navigate(['/auth']);
  }

  protected onDevelop(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    alert('Tính năng đang được phát triển. Vui lòng quay lại sau!');
  }
}