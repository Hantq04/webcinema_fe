import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserDetailResponse } from '../../../../core/models/user.model';
import { LanguageService } from '../../../../core/services/language.service';

@Component({
  selector: 'app-user-detail-drawer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 z-[1000] transition-all duration-300 ease-in-out flex justify-end"
         [class.opacity-0]="!isOpen" [class.invisible]="!isOpen" [class.opacity-100]="isOpen" [class.visible]="isOpen">
      <!-- Overlay -->
      <div class="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" (click)="close()"></div>
      
      <!-- Drawer Content -->
      <div class="relative w-full max-w-md h-full bg-white dark:bg-slate-900 flex flex-col transition-transform duration-300 ease-in-out"
           [class.translate-x-full]="!isOpen" [class.translate-x-0]="isOpen"
           (click)="$event.stopPropagation()">
        
        <!-- Header -->
        <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900">
          <h3 class="text-lg font-bold text-slate-800 dark:text-white m-0">{{ t('management.userDetailTitle') }}</h3>
          <button class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-300 rounded-full transition-colors focus:outline-none" (click)="close()">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-slate-900/50" *ngIf="user">
          
          <div class="flex items-center gap-4 mb-8">
            <div class="w-16 h-16 rounded-full bg-rose-600 text-white flex items-center justify-center text-2xl font-bold overflow-hidden shrink-0">
              <img *ngIf="user.avatarUrl" [src]="user.avatarUrl" alt="Avatar" class="w-full h-full object-cover">
              <span *ngIf="!user.avatarUrl">{{ getInitial(user.name || user.userName) }}</span>
            </div>
            <div>
              <h4 class="text-xl font-bold text-slate-800 dark:text-white m-0 mb-1.5">{{ user.name || user.userName }}</h4>
              <span class="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider" [ngClass]="getRoleClass(user)">
                {{ getRoleName(user) }}
              </span>
            </div>
          </div>

          <!-- Section 1 -->
          <div class="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl p-5 mb-6">
            <h5 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">{{ t('management.userDetailTitle') }}</h5>
            
            <div class="space-y-4">
              <div class="flex items-start">
                <div class="w-32 text-sm font-medium text-slate-500">{{ t('management.colUsername') }}</div>
                <div class="flex-1 text-sm font-semibold text-slate-800 dark:text-slate-200 break-words">{{ user.userName }}</div>
              </div>
              <div class="flex items-start">
                <div class="w-32 text-sm font-medium text-slate-500">{{ t('management.colEmail') }}</div>
                <div class="flex-1 text-sm font-semibold text-slate-800 dark:text-slate-200 break-words">{{ user.email || '-' }}</div>
              </div>
              <div class="flex items-start">
                <div class="w-32 text-sm font-medium text-slate-500">{{ t('management.colPhone') }}</div>
                <div class="flex-1 text-sm font-semibold text-slate-800 dark:text-slate-200">{{ user.phoneNumber || '-' }}</div>
              </div>
              <div class="flex items-start">
                <div class="w-32 text-sm font-medium text-slate-500">{{ t('management.userFormBirthDate') }}</div>
                <div class="flex-1 text-sm font-semibold text-slate-800 dark:text-slate-200">{{ user.birthDate ? (user.birthDate | date:'dd/MM/yyyy') : '-' }}</div>
              </div>
              <div class="flex items-start">
                <div class="w-32 text-sm font-medium text-slate-500">{{ t('management.userFormGender') }}</div>
                <div class="flex-1 text-sm font-semibold text-slate-800 dark:text-slate-200">{{ getGenderTranslation(user.gender) }}</div>
              </div>
              <div class="flex items-start">
                <div class="w-32 text-sm font-medium text-slate-500">{{ t('management.colPoint') }}</div>
                <div class="flex-1">
                  <span class="inline-block bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-500 px-2.5 py-0.5 rounded-md font-bold text-sm">
                    {{ user.point | number }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Section 2 -->
          <div class="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl p-5 mb-6">
            <h5 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">{{ t('management.colAddress') }}</h5>
            
            <div class="flex items-start" *ngIf="user.address || user.city || user.district">
              <div class="flex-1 text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                {{ user.address ? user.address + ', ' : '' }}
                {{ user.district ? user.district + ', ' : '' }}
                {{ user.city || '' }}
              </div>
            </div>
            <div class="flex items-start" *ngIf="!user.address && !user.city && !user.district">
              <div class="flex-1 text-sm text-slate-400">-</div>
            </div>
          </div>

        </div>
        
        <!-- Loading State -->
        <div class="flex-1 loading-state" *ngIf="!user && isLoading">
          <div class="spinner"></div>
          <span>{{ t('shared.loading') }}...</span>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end bg-white dark:bg-slate-900">
          <button type="button" class="px-6 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-sm font-medium transition-colors" (click)="close()">
            {{ t('shared.close') }}
          </button>
        </div>

      </div>
    </div>
  `,
  styles: []
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

  getGenderTranslation(gender: string | null | undefined): string {
    if (!gender) return '-';
    const g = gender.toLowerCase();
    if (g === 'male' || g === 'nam') return this.t('auth.male');
    if (g === 'female' || g === 'nữ' || g === 'nu') return this.t('auth.female');
    return gender;
  }

  getRoleClass(user: any): string {
    if (!user) return '';
    const role = user.role || user.roles || user.authority || user.authorities || '';
    const roleStr = String(role || '').toUpperCase();

    if (roleStr.includes('ADMIN') || (user.userName === 'admin')) return 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400';
    if (roleStr.includes('STAFF')) return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';

    if (Array.isArray(role)) {
      const roles = role.map(r => typeof r === 'string' ? r.toUpperCase() : (r.name || r.authority || '').toUpperCase());
      if (roles.some(r => r.includes('ADMIN'))) return 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400';
      if (roles.some(r => r.includes('STAFF'))) return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
    }

    return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400';
  }

  getRoleName(user: any): string {
    if (!user) return '';
    const role = user.role || user.roles || user.authority || user.authorities || '';
    const roleStr = String(role || '').toUpperCase();

    if (roleStr.includes('ADMIN') || (user.userName === 'admin')) return this.t('management.roleAdmin');
    if (roleStr.includes('STAFF')) return this.t('management.roleStaff');

    if (Array.isArray(role)) {
      const roles = role.map(r => typeof r === 'string' ? r.toUpperCase() : (r.name || r.authority || '').toUpperCase());
      if (roles.some(r => r.includes('ADMIN'))) return this.t('management.roleAdmin');
      if (roles.some(r => r.includes('STAFF'))) return this.t('management.roleStaff');
    }

    return this.t('management.roleUser');
  }
}
