import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserDetailResponse } from '../../../../core/models/user.model';
import { LanguageService } from '../../../../core/services/language.service';

@Component({
  selector: 'app-user-detail-drawer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="drawer-overlay" [class.show]="isOpen" (click)="close()">
      <div class="drawer-content" [class.show]="isOpen" (click)="$event.stopPropagation()">
        
        <div class="drawer-header">
          <h3>{{ t('management.userDetailTitle') }}</h3>
          <button class="close-btn" (click)="close()">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div class="drawer-body" *ngIf="user">
          <div class="user-profile-header">
            <div class="avatar">
              <img *ngIf="user.avatarUrl" [src]="user.avatarUrl" alt="Avatar">
              <span *ngIf="!user.avatarUrl">{{ getInitial(user.name || user.userName) }}</span>
            </div>
            <div class="profile-title">
              <h4>{{ user.name || user.userName }}</h4>
              <span class="role-badge" [ngClass]="getRoleClass(user.role)">
                {{ getRoleName(user.role) }}
              </span>
            </div>
          </div>

          <div class="info-section">
            <div class="info-row">
              <div class="info-label">{{ t('management.colUsername') }}</div>
              <div class="info-value">{{ user.userName }}</div>
            </div>
            <div class="info-row">
              <div class="info-label">{{ t('management.colEmail') }}</div>
              <div class="info-value">{{ user.email || '-' }}</div>
            </div>
            <div class="info-row">
              <div class="info-label">{{ t('management.colPhone') }}</div>
              <div class="info-value">{{ user.phoneNumber || '-' }}</div>
            </div>
            <div class="info-row">
              <div class="info-label">{{ t('management.userFormBirthDate') }}</div>
              <div class="info-value">{{ user.birthDate ? (user.birthDate | date:'dd/MM/yyyy') : '-' }}</div>
            </div>
            <div class="info-row">
              <div class="info-label">{{ t('management.userFormGender') }}</div>
              <div class="info-value">{{ user.gender || '-' }}</div>
            </div>
            <div class="info-row">
              <div class="info-label">{{ t('management.colPoint') }}</div>
              <div class="info-value"><span class="point-badge">{{ user.point | number }}</span></div>
            </div>
          </div>
          
          <div class="info-section">
            <h5>Địa chỉ</h5>
            <div class="info-row" *ngIf="user.address || user.city || user.district">
              <div class="info-value address-value">
                {{ user.address ? user.address + ', ' : '' }}
                {{ user.district ? user.district + ', ' : '' }}
                {{ user.city || '' }}
              </div>
            </div>
            <div class="info-row" *ngIf="!user.address && !user.city && !user.district">
              <div class="info-value text-muted">-</div>
            </div>
          </div>

          <!-- Add any more details as needed -->

        </div>
        
        <div class="drawer-body loading-body" *ngIf="!user && isLoading">
          <div class="spinner"></div>
          <p>{{ t('shared.loading') }}...</p>
        </div>

        <div class="drawer-footer">
          <button type="button" class="btn btn-secondary" (click)="close()">{{ t('shared.close') }}</button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .drawer-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.5);
      z-index: 1000;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease-in-out;
      backdrop-filter: blur(2px);
    }
    .drawer-overlay.show {
      opacity: 1;
      visibility: visible;
    }
    .drawer-content {
      position: fixed;
      top: 0;
      right: -400px;
      width: 100%;
      max-width: 400px;
      height: 100vh;
      background: var(--bg-card);
      box-shadow: -4px 0 15px rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: column;
      transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 1001;
    }
    .drawer-content.show {
      right: 0;
    }

    .drawer-header {
      padding: 1.5rem;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .drawer-header h3 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-primary);
    }
    .close-btn {
      background: transparent;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.5rem;
      border-radius: 50%;
      transition: background 0.2s;
    }
    .close-btn:hover {
      background: var(--hover-color);
      color: var(--text-primary);
    }

    .drawer-body {
      padding: 1.5rem;
      overflow-y: auto;
      flex: 1;
    }

    .user-profile-header {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    .avatar {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: var(--primary-color);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      font-weight: bold;
      overflow: hidden;
    }
    .avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .profile-title h4 {
      margin: 0 0 0.5rem 0;
      font-size: 1.2rem;
      color: var(--text-primary);
    }

    .info-section {
      background: rgba(0,0,0,0.02);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 1.25rem;
      margin-bottom: 1.5rem;
    }
    :host-context(body.dark-theme) .info-section {
      background: rgba(255,255,255,0.02);
    }
    .info-section h5 {
      margin: 0 0 1rem 0;
      font-size: 0.95rem;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .info-row {
      display: flex;
      margin-bottom: 1rem;
    }
    .info-row:last-child {
      margin-bottom: 0;
    }
    .info-label {
      width: 120px;
      color: var(--text-secondary);
      font-size: 0.9rem;
    }
    .info-value {
      flex: 1;
      font-weight: 500;
      color: var(--text-primary);
      font-size: 0.95rem;
      word-break: break-word;
    }
    .text-muted {
      color: var(--text-secondary);
      font-weight: normal;
    }
    
    .loading-body {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: var(--text-secondary);
    }
    .spinner {
      border: 3px solid rgba(229, 9, 20, 0.2);
      border-radius: 50%;
      border-top: 3px solid var(--primary-color);
      width: 30px;
      height: 30px;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

    .drawer-footer {
      padding: 1.25rem 1.5rem;
      border-top: 1px solid var(--border-color);
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
    }

    .btn {
      padding: 0.6rem 1.5rem;
      border-radius: 6px;
      font-weight: 500;
      font-size: 0.95rem;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
    }
    .btn-secondary {
      background: transparent;
      border: 1px solid var(--border-color);
      color: var(--text-primary);
    }
    .btn-secondary:hover {
      background: var(--hover-color);
    }

    /* Badges */
    .role-badge {
      display: inline-block;
      padding: 0.2rem 0.6rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .role-admin { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
    .role-staff { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }
    .role-user { background: rgba(16, 185, 129, 0.15); color: #10b981; }
    
    .point-badge {
      display: inline-block;
      background: rgba(245, 158, 11, 0.15);
      color: #f59e0b;
      padding: 0.2rem 0.6rem;
      border-radius: 6px;
      font-weight: 600;
      font-size: 0.85rem;
    }
  `]
})
export class UserDetailDrawerComponent {
  private readonly language = inject(LanguageService);

  @Input() isOpen = false;
  @Input() isLoading = false;
  @Input() user: UserDetailResponse | null = null;
  @Output() closeDrawer = new EventEmitter<void>();

  t(key: string): string {
    return this.language.t(key);
  }

  close() {
    this.isOpen = false;
    this.closeDrawer.emit();
  }

  getInitial(name: string | undefined): string {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  }

  getRoleClass(role: string): string {
    const roleStr = (role || '').toUpperCase();
    if (roleStr.includes('ADMIN')) return 'role-admin';
    if (roleStr.includes('STAFF')) return 'role-staff';
    return 'role-user';
  }

  getRoleName(role: string): string {
    const roleStr = (role || '').toUpperCase();
    if (roleStr.includes('ADMIN')) return this.t('management.roleAdmin');
    if (roleStr.includes('STAFF')) return this.t('management.roleStaff');
    return this.t('management.roleUser');
  }
}
