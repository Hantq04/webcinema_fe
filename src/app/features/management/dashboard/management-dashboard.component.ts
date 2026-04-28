import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-management-dashboard',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="management-header">
      <div class="header-right">
        <a routerLink="/home" class="for-users-btn">
          {{ t('header.forUsers') }}
        </a>
        <div class="user-info">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>
          <span class="user-greeting">{{ t('header.hello') }} {{ auth.currentUserName() }}</span>
        </div>
        <button type="button" class="logout-btn" (click)="logout()">{{ t('header.logout') }}</button>
        <div class="lang-switch">
          <button type="button" class="lang-btn" [class.active]="language.isActive('vi')" (click)="language.useLanguage('vi')">VN</button>
          <button type="button" class="lang-btn" [class.active]="language.isActive('en')" (click)="language.useLanguage('en')">EN</button>
        </div>
      </div>
    </header>
    <div class="dashboard-container">
      <h1>Trang quản lý</h1>
    </div>
  `,
  styles: `
    :host {
      display: block;
      min-height: 100vh;
      background-color: white;
    }
    .management-header {
      background-color: #fdfaf0;
      padding: 0.6rem 2rem;
      display: flex;
      justify-content: flex-end;
      border-bottom: 0.45rem solid #d62f1f;
      position: relative;
    }
    .management-header::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 0.45rem;
      background: radial-gradient(circle, rgba(255,255,255,0.95) 0 0.13rem, transparent 0.14rem) 0 0 / 0.9rem 0.45rem repeat-x;
      z-index: 2;
    }
    .header-right {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      position: relative;
      z-index: 1;
    }
    .user-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 800;
      color: #3b3127;
      text-transform: uppercase;
      font-size: 0.9rem;
      letter-spacing: 0.02em;
    }
    .logout-btn {
      background-color: rgba(214, 47, 31, 0.08);
      color: #d62f1f;
      border: none;
      padding: 0.35rem 1.25rem;
      border-radius: 999px;
      font-weight: 800;
      cursor: pointer;
      text-transform: uppercase;
      font-size: 0.85rem;
      font-family: inherit;
    }
    .logout-btn:hover {
      background-color: rgba(214, 47, 31, 0.15);
    }
    .lang-switch {
      display: flex;
      border-radius: 0.375rem;
      overflow: hidden;
      border: 1px solid rgba(0, 0, 0, 0.05);
    }
    .lang-btn {
      border: none;
      padding: 0.25rem 0.75rem;
      font-weight: 700;
      cursor: pointer;
      background-color: #9d907d;
      color: white;
      font-size: 0.78rem;
      min-width: 40px;
      transition: background 150ms ease;
    }
    .lang-btn.active {
      background-color: #d62f1f;
    }
    .for-users-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #3b3127;
      text-decoration: none;
      font-weight: 800;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }
    .for-users-btn:hover {
      color: #d62f1f;
    }
    .dashboard-container {
      display: flex;
      justify-content: center;
      padding-top: 15vh;
      background-color: white;
      color: black;
    }
    h1 {
      font-size: 3rem;
      font-weight: 900;
      text-transform: capitalize;
    }
  `
})
export class ManagementDashboardComponent {
  protected readonly auth = inject(AuthService);
  protected readonly language = inject(LanguageService);
  protected readonly router = inject(Router);
  protected readonly t = this.language.t.bind(this.language);

  protected logout(): void {
    this.auth.logout();
    void this.router.navigate(['/customer/account/login']);
  }
}
