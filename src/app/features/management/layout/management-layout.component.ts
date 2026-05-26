import { ChangeDetectionStrategy, Component, inject, signal, OnInit, PLATFORM_ID, HostListener } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet, NavigationEnd } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LanguageService } from '../../../core/services/language.service';
import { NgIf, isPlatformBrowser } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { filter } from 'rxjs';
import { NotificationBellComponent } from './components/notification-bell/notification-bell.component';

@Component({
  selector: 'app-management-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgIf, NotificationBellComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="management-container" [class.collapsed]="isCollapsed()">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <span class="menu-label" *ngIf="!isCollapsed()">{{ t('management.menu') }}</span>
          <button class="toggle-btn" (click)="toggleSidebar()">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 12h18M3 6h18M3 18h18" *ngIf="isCollapsed()"/>
              <path d="M19 12H5M12 19l-7-7 7-7" *ngIf="!isCollapsed()"/>
            </svg>
          </button>
        </div>

        <nav class="sidebar-nav">
          <a routerLink="/management/dashboard" routerLinkActive="active" class="nav-item" [title]="isCollapsed() ? t('management.dashboard') : ''">
            <svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
            <span class="nav-label" *ngIf="!isCollapsed()">{{ t('management.dashboard') }}</span>
          </a>
          <a routerLink="/management/movies" routerLinkActive="active" class="nav-item" [title]="isCollapsed() ? t('management.movies') : ''">
            <svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18"/><path d="M17 3v18"/><path d="M3 9h18"/><path d="M3 15h18"/></svg>
            <span class="nav-label" *ngIf="!isCollapsed()">{{ t('management.movies') }}</span>
          </a>
          <a routerLink="/management/schedules" routerLinkActive="active" class="nav-item" [title]="isCollapsed() ? t('management.showtimes') : ''">
            <svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span class="nav-label" *ngIf="!isCollapsed()">{{ t('management.showtimes') }}</span>
          </a>
          <a routerLink="/management/cinemas" routerLinkActive="active" class="nav-item" [title]="isCollapsed() ? t('management.cinemas') : ''">
            <svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-3"/><path d="M9 9v2"/><path d="M9 13v2"/></svg>
            <span class="nav-label" *ngIf="!isCollapsed()">{{ t('management.cinemas') }}</span>
          </a>
          <a routerLink="/management/seats" routerLinkActive="active" class="nav-item" [title]="isCollapsed() ? t('management.seats') : ''">
            <svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 16v-3a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3"/><path d="M4 20h16"/><path d="M7 11V7a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v4"/><rect width="12" height="4" x="6" y="16" rx="1"/></svg>
            <span class="nav-label" *ngIf="!isCollapsed()">{{ t('management.seats') }}</span>
          </a>
          <a href="javascript:void(0)" (click)="showAlert($event)" class="nav-item" [title]="isCollapsed() ? t('management.bookings') : ''">
            <svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg>
            <span class="nav-label" *ngIf="!isCollapsed()">{{ t('management.bookings') }}</span>
          </a>
          <a routerLink="/management/bills" routerLinkActive="active" class="nav-item" [title]="isCollapsed() ? t('management.invoices') : ''">
            <svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
            <span class="nav-label" *ngIf="!isCollapsed()">{{ t('management.invoices') }}</span>
          </a>

          <div class="nav-item-wrapper others-wrapper">
            <a href="javascript:void(0)" class="nav-item" [class.active]="isOthersActive()" [class.popover-active]="isOthersPopoverOpen() && !isOthersActive()" (click)="toggleOthersPopover($event)" style="cursor: pointer;" [title]="isCollapsed() ? t('management.others') : ''">
              <svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
              <span class="nav-label" *ngIf="!isCollapsed()">{{ t('management.others') }}</span>
            </a>

            <div class="hover-submenu" 
                 [class.show]="isOthersPopoverOpen()"
                 [style.top.px]="submenuTop()"
                 [style.left.px]="isCollapsed() ? 85 : 265">
              <a routerLink="/management/food-beverages" routerLinkActive="active" class="hover-submenu-item">
                <svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 20V10"/><path d="M12 9A6 6 0 0 0 6 9h12A6 6 0 0 0 12 9z"/><path d="M6 20V10"/><path d="M12 20V10"/><path d="M6 20h12"/></svg>
                <span class="nav-label">{{ t('management.foodBeverages') }}</span>
              </a>
              <a routerLink="/management/promotions" routerLinkActive="active" class="hover-submenu-item">
                <svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.44 11.05-9.19 9.19a2 2 0 0 1-2.83 0l-8.97-8.97a2 2 0 0 1 0-2.82l9.19-9.19a2 2 0 0 1 2.82 0l8.98 8.97a2 2 0 0 1 0 2.82z"/><path d="M7 7h.01"/></svg>
                <span class="nav-label">{{ t('management.promotions') }}</span>
              </a>
              <a routerLink="/management/banners" routerLinkActive="active" class="hover-submenu-item">
                <svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/></svg>
                <span class="nav-label">{{ t('management.banners') }}</span>
              </a>
              <a routerLink="/management/events" routerLinkActive="active" class="hover-submenu-item">
                <svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>
                <span class="nav-label">{{ t('management.events') }}</span>
              </a>
            </div>
          </div>
          
          <div class="nav-divider"></div>
          
          <a routerLink="/management/users" routerLinkActive="active" class="nav-item" [title]="isCollapsed() ? t('management.users') : ''">
            <svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <span class="nav-label" *ngIf="!isCollapsed()">{{ t('management.users') }}</span>
          </a>
          <a routerLink="/management/revenue" routerLinkActive="active" class="nav-item" [title]="isCollapsed() ? t('management.reports') : ''">
            <svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 21v-2a4 4 0 0 0-4-4h-4a4 4 0 0 0-4 4v2"/><circle cx="12" cy="11" r="3"/></svg>
            <span class="nav-label" *ngIf="!isCollapsed()">{{ t('management.reports') }}</span>
          </a>
          <a routerLink="/management/settings" routerLinkActive="active" class="nav-item" [title]="isCollapsed() ? t('management.settings') : ''">
            <svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
            <span class="nav-label" *ngIf="!isCollapsed()">{{ t('management.settings') }}</span>
          </a>
        </nav>

        <div class="sidebar-footer">
          <a href="javascript:void(0)" (click)="logout()" class="logout-nav-item" [title]="isCollapsed() ? t('header.logout') : ''">
            <svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            <span class="nav-label" *ngIf="!isCollapsed()">{{ t('header.logout') }}</span>
          </a>
        </div>
      </aside>

      <!-- Main Content Area -->
      <div class="main-wrapper">
        <!-- Top Header -->
        <header class="top-header">
          <div class="header-left-group">
            <a routerLink="/management/dashboard" class="header-logo-link">
              <span class="header-logo-text">CINEGO</span>
            </a>
            <div class="search-bar">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              <input type="text" [placeholder]="t('management.search')" class="search-input">
            </div>
          </div>

          <div class="header-actions">
            <!-- For Users Button -->
            <a routerLink="/home" class="for-users-btn">
              {{ t('management.forUsers') }}
            </a>
            
            <!-- Theme Toggle -->
            <button class="icon-btn theme-toggle-btn" (click)="toggleTheme()" [title]="isDarkMode() ? 'Light Mode' : 'Dark Mode'">
              <svg *ngIf="!isDarkMode()" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
              <svg *ngIf="isDarkMode()" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
            </button>

            <!-- Language Switcher -->
            <div class="lang-switch">
              <button type="button" class="lang-btn" [class.active]="language.isActive('vi')" (click)="language.useLanguage('vi')">VN</button>
              <button type="button" class="lang-btn" [class.active]="language.isActive('en')" (click)="language.useLanguage('en')">EN</button>
            </div>

            <!-- Notifications -->
            <app-notification-bell></app-notification-bell>


            <!-- User Profile -->
            <div class="user-profile">
              <div class="avatar">
                {{ getInitial() }}
              </div>
              <div class="user-details">
                <span class="user-name">{{ auth.currentUserName() || 'Admin' }}</span>
                <span class="user-role">{{ getUserRoleName() }}</span>
              </div>
            </div>

          </div>
        </header>

        <!-- Main Content -->
        <main class="content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styleUrls: ['./management-layout.component.css']
})
export class ManagementLayoutComponent implements OnInit {
  isCollapsed = signal(false);
  isDarkMode = signal(false);
  isOthersPopoverOpen = signal(false);
  submenuTop = signal(0);
  protected readonly auth = inject(AuthService);
  protected readonly language = inject(LanguageService);
  protected readonly router = inject(Router);
  protected readonly t = this.language.t.bind(this.language);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly titleService = inject(Title);

  ngOnInit() {
    this.titleService.setTitle('CineGo Management');
    
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.titleService.setTitle('CineGo Management');
    });

    if (isPlatformBrowser(this.platformId)) {
      const savedTheme = localStorage.getItem('management_theme');
      if (savedTheme === 'dark') {
        this.isDarkMode.set(true);
        document.body.classList.add('dark-theme');
        document.body.classList.add('dark');
      } else {
        this.isDarkMode.set(false);
        document.body.classList.remove('dark-theme');
        document.body.classList.remove('dark');
      }

      // Load sidebar state
      const savedCollapsed = localStorage.getItem('management_sidebar_collapsed');
      if (savedCollapsed !== null) {
        this.isCollapsed.set(savedCollapsed === 'true');
      }
    }
  }

  isOthersActive(): boolean {
    const subRoutes = ['/management/food-beverages', '/management/promotions', '/management/banners', '/management/events'];
    return subRoutes.some(route => this.router.url.includes(route));
  }

  @HostListener('document:click')
  onDocumentClick() {
    this.isOthersPopoverOpen.set(false);
  }

  toggleOthersPopover(event: Event) {
    event.stopPropagation();
    event.preventDefault();

    const element = event.currentTarget as HTMLElement;
    const rect = element.getBoundingClientRect();
    this.submenuTop.set(rect.top);

    this.isOthersPopoverOpen.update(v => !v);
  }

  toggleSidebar() {
    this.isCollapsed.update(v => {
      const newValue = !v;
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('management_sidebar_collapsed', String(newValue));
      }
      return newValue;
    });
  }

  toggleTheme() {
    this.isDarkMode.update(v => !v);
    if (isPlatformBrowser(this.platformId)) {
      if (this.isDarkMode()) {
        document.body.classList.add('dark-theme');
        document.body.classList.add('dark');
        localStorage.setItem('management_theme', 'dark');
      } else {
        document.body.classList.remove('dark-theme');
        document.body.classList.remove('dark');
        localStorage.setItem('management_theme', 'light');
      }
    }
  }

  getInitial(): string {
    const name = this.auth.currentUserName() || 'A';
    return name.charAt(0).toUpperCase();
  }

  getUserRoleName(): string {
    const role = this.auth.currentUserRole();
    if (role === 'ADMIN' || role === 'ROLE_ADMIN') {
      return 'Administrator';
    } else if (role === 'STAFF' || role === 'ROLE_STAFF') {
      return 'Staff';
    }
    return role ? role.charAt(0).toUpperCase() + role.slice(1).toLowerCase() : 'Staff';
  }

  showAlert(event: Event) {
    event.preventDefault();
    alert(this.t('management.devMessage'));
  }

  protected logout(): void {
    this.auth.logout();
    void this.router.navigate(['/staff/account/login']);
  }
}
