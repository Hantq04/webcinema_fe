import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-account',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="account-page">
      <div class="account-shell mx-auto max-w-7xl px-4 py-10">
        <div class="account-header">
          <div>
            <p class="account-kicker">{{ t('header.member') }}</p>
            <h1 class="account-title">{{ t('account.title') }}</h1>
          </div>
          <div class="account-actions">
            <a routerLink="/account" class="account-action account-action--ghost">{{ t('header.viewAccount') }}</a>
            <button type="button" class="account-action account-action--solid" (click)="logout()">{{ t('header.logout') }}</button>
          </div>
        </div>

        <div class="account-grid">
          <aside class="account-sidebar">
            <div class="avatar">{{ initials() }}</div>
            <strong>{{ currentName() }}</strong>
            <span>{{ t('account.memberStatus') }}</span>
            <a routerLink="/booking" class="account-link">{{ t('account.myTickets') }}</a>
          </aside>

          <article class="account-card">
            <h2>{{ t('account.overviewTitle') }}</h2>
            <div class="account-info-row">
              <span>{{ t('account.usernameLabel') }}</span>
              <strong>{{ currentName() }}</strong>
            </div>
            <div class="account-info-row">
              <span>{{ t('account.loginStateLabel') }}</span>
              <strong>{{ t('account.loggedIn') }}</strong>
            </div>
            <div class="account-info-row">
              <span>{{ t('account.quickActionLabel') }}</span>
              <strong>{{ t('account.quickActionValue') }}</strong>
            </div>
          </article>
        </div>
      </div>
    </section>
  `,
  styles: `
    :host { display: block; }
    .account-page { background: #f6f0df; min-height: 60vh; }
    .account-header { align-items: flex-start; display: flex; justify-content: space-between; gap: 1rem; margin-bottom: 1.25rem; }
    .account-kicker { color: #d62f1f; font-size: 0.85rem; font-weight: 900; margin: 0 0 0.25rem; text-transform: uppercase; }
    .account-title { color: #201b16; font-size: clamp(1.7rem, 2.8vw, 2.8rem); font-weight: 900; margin: 0; }
    .account-actions { display: flex; gap: 0.65rem; flex-wrap: wrap; }
    .account-action { border-radius: 999px; font-weight: 900; padding: 0.75rem 1rem; text-decoration: none; text-transform: uppercase; }
    .account-action--ghost { background: rgba(214, 47, 31, 0.08); color: #d62f1f; }
    .account-action--solid { background: #d62f1f; border: 0; color: #fff; cursor: pointer; }
    .account-grid { display: grid; gap: 1rem; grid-template-columns: 280px minmax(0, 1fr); }
    .account-sidebar, .account-card { background: rgba(255, 249, 238, 0.96); border: 1px solid rgba(97, 72, 46, 0.14); border-radius: 1rem; box-shadow: 0 0.75rem 1.4rem rgba(36, 22, 12, 0.06); }
    .account-sidebar { align-items: center; display: flex; flex-direction: column; gap: 0.75rem; padding: 1.25rem; text-align: center; }
    .avatar { align-items: center; background: #fff; border: 2px solid rgba(97, 72, 46, 0.22); border-radius: 999px; color: #6f5c49; display: inline-flex; font-size: 2rem; font-weight: 900; height: 7rem; justify-content: center; width: 7rem; }
    .account-sidebar strong { color: #201b16; font-size: 1.1rem; }
    .account-sidebar span { color: #6f5c49; font-weight: 700; }
    .account-link { color: #d62f1f; font-weight: 900; text-decoration: none; }
    .account-card { padding: 1.25rem; }
    .account-card h2 { color: #201b16; margin: 0 0 1rem; }
    .account-info-row { border-top: 1px solid rgba(97, 72, 46, 0.12); display: flex; justify-content: space-between; gap: 1rem; padding: 0.85rem 0; }
    .account-info-row:first-of-type { border-top: 0; }
    .account-info-row span { color: #6f5c49; font-weight: 700; }
    .account-info-row strong { color: #201b16; }
    @media (max-width: 840px) { .account-header, .account-grid { grid-template-columns: 1fr; display: grid; } .account-actions { justify-content: flex-start; } }
  `
})
export class AccountComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly language = inject(LanguageService);
  protected readonly t = this.language.t.bind(this.language);

  protected currentName(): string {
    return this.auth.currentUserName() || this.t('header.member');
  }

  protected initials(): string {
    const name = this.currentName().trim();
    return name ? name.charAt(0).toUpperCase() : 'U';
  }

  protected logout(): void {
    this.auth.logout();
    void this.router.navigateByUrl('/customer/account/login');
  }
}