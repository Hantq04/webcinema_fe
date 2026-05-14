import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LanguageService } from '../../../../core/services/language.service';

@Component({
  selector: 'app-user-filter-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="filter-bar">
      <div class="search-box">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input 
          type="text" 
          [placeholder]="t('management.userSearchPlaceholder')" 
          [(ngModel)]="searchQuery" 
          (ngModelChange)="onSearchChange($event)"
        >
      </div>

      <div class="filter-group">
        <select class="filter-select" [(ngModel)]="selectedRole" (ngModelChange)="onRoleChange($event)">
          <option value="">{{ t('management.filterAllRoles') }}</option>
          <option value="ADMIN">{{ t('management.roleAdmin') }}</option>
          <option value="STAFF">{{ t('management.roleStaff') }}</option>
          <option value="USER">{{ t('management.roleUser') }}</option>
        </select>
      </div>
    </div>
  `,
  styles: [`
    .filter-bar {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      margin-bottom: 1.5rem;
      align-items: center;
      justify-content: space-between;
    }
    .search-box {
      display: flex;
      align-items: center;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 0.5rem 1rem;
      flex: 1;
      min-width: 250px;
      max-width: 400px;
      transition: all 0.2s;
    }
    .search-box:focus-within {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 2px rgba(229, 9, 20, 0.1);
    }
    .search-box svg {
      color: var(--text-secondary);
      margin-right: 0.5rem;
    }
    .search-box input {
      border: none;
      background: transparent;
      outline: none;
      width: 100%;
      color: var(--text-primary);
      font-size: 0.95rem;
    }
    .filter-group {
      display: flex;
      gap: 1rem;
    }
    .filter-select {
      appearance: none;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 0.6rem 2.5rem 0.6rem 1rem;
      color: var(--text-primary);
      font-size: 0.95rem;
      cursor: pointer;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 0.75rem center;
      transition: all 0.2s;
    }
    .filter-select:focus {
      outline: none;
      border-color: var(--primary-color);
    }
  `]
})
export class UserFilterBarComponent {
  private readonly language = inject(LanguageService);

  @Input() searchQuery = '';
  @Input() selectedRole = '';

  @Output() searchChange = new EventEmitter<string>();
  @Output() roleChange = new EventEmitter<string>();

  t(key: string): string {
    return this.language.t(key);
  }

  onSearchChange(value: string) {
    this.searchChange.emit(value);
  }

  onRoleChange(value: string) {
    this.roleChange.emit(value);
  }
}
