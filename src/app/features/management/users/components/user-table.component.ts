import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserResponse } from '../../../../core/models/user.model';
import { LanguageService } from '../../../../core/services/language.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th class="checkbox-col">
              <input type="checkbox" 
                     [checked]="allSelected" 
                     [indeterminate]="someSelected && !allSelected"
                     (change)="toggleAll($event)">
            </th>
            <th>{{ t('management.colId') }}</th>
            <th>{{ t('management.colUsername') }}</th>
            <th>{{ t('management.colName') }}</th>
            <th>{{ t('management.colEmail') }}</th>
            <th>{{ t('management.colPhone') }}</th>
            <th>{{ t('management.colPoint') }}</th>
            <th>{{ t('management.colRole') }}</th>
            <th class="actions-col">{{ t('management.colActions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngIf="users.length === 0">
            <td colspan="9" class="empty-state">
              <div class="empty-content">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="empty-icon"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                <p>{{ t('management.noUsersFound') }}</p>
              </div>
            </td>
          </tr>
          <tr *ngFor="let user of users" [class.selected]="isSelected(user.userName)">
            <td class="checkbox-col">
              <input type="checkbox" 
                     [checked]="isSelected(user.userName)" 
                     (change)="toggleSelection(user.userName)">
            </td>
            <td>#{{ user.id }}</td>
            <td class="fw-medium">{{ user.userName }}</td>
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.phoneNumber }}</td>
            <td><span class="point-badge">{{ user.point | number }}</span></td>
            <td>
              <span class="role-badge" [ngClass]="getRoleClass(user.role)">
                {{ getRoleName(user.role) }}
              </span>
            </td>
            <td class="actions-col">
              <div class="action-buttons">
                <button class="btn-action view" (click)="onViewDetail(user)" [title]="t('management.actionViewDetail')">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
                <button class="btn-action delete" (click)="onDelete(user)" [title]="t('management.actionDelete')">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .table-container {
      background: var(--bg-card);
      border-radius: 12px;
      border: 1px solid var(--border-color);
      overflow-x: auto;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }
    .data-table th, .data-table td {
      padding: 1rem;
      border-bottom: 1px solid var(--border-color);
      vertical-align: middle;
      font-size: 0.95rem;
    }
    .data-table th {
      background-color: rgba(0,0,0,0.02);
      color: var(--text-secondary);
      font-weight: 600;
      white-space: nowrap;
    }
    .data-table tbody tr {
      transition: background-color 0.2s;
    }
    .data-table tbody tr:hover {
      background-color: var(--hover-color);
    }
    .data-table tbody tr.selected {
      background-color: rgba(229, 9, 20, 0.05);
    }
    .fw-medium {
      font-weight: 500;
      color: var(--text-primary);
    }
    .checkbox-col {
      width: 40px;
      text-align: center;
    }
    .checkbox-col input[type="checkbox"] {
      width: 16px;
      height: 16px;
      cursor: pointer;
      accent-color: var(--primary-color);
    }
    .actions-col {
      text-align: right;
    }
    .action-buttons {
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
    }
    .btn-action {
      background: transparent;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--text-secondary);
      transition: all 0.2s;
    }
    .btn-action:hover {
      background: var(--hover-color);
      color: var(--text-primary);
    }
    .btn-action.view:hover {
      color: #3b82f6;
      border-color: #3b82f6;
      background: rgba(59, 130, 246, 0.1);
    }
    .btn-action.delete:hover {
      color: #ef4444;
      border-color: #ef4444;
      background: rgba(239, 68, 68, 0.1);
    }
    
    /* Badges */
    .role-badge {
      display: inline-block;
      padding: 0.2rem 0.6rem;
      border-radius: 9999px;
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }
    .role-admin {
      background: rgba(239, 68, 68, 0.15);
      color: #ef4444;
    }
    .role-staff {
      background: rgba(59, 130, 246, 0.15);
      color: #3b82f6;
    }
    .role-user {
      background: rgba(16, 185, 129, 0.15);
      color: #10b981;
    }
    .point-badge {
      display: inline-block;
      background: rgba(245, 158, 11, 0.15);
      color: #f59e0b;
      padding: 0.2rem 0.6rem;
      border-radius: 6px;
      font-weight: 600;
      font-size: 0.85rem;
    }

    /* Empty state */
    .empty-state {
      text-align: center;
      padding: 4rem 2rem !important;
    }
    .empty-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      color: var(--text-secondary);
    }
    .empty-icon {
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    /* Dark Mode specific */
    :host-context(body.dark-theme) .data-table th {
      background-color: rgba(255,255,255,0.02);
    }
  `]
})
export class UserTableComponent {
  private readonly language = inject(LanguageService);

  @Input() users: UserResponse[] = [];
  @Input() selectedUsernames: string[] = [];

  @Output() selectionChange = new EventEmitter<string[]>();
  @Output() viewDetail = new EventEmitter<UserResponse>();
  @Output() deleteUser = new EventEmitter<UserResponse>();

  get allSelected(): boolean {
    return this.users.length > 0 && this.selectedUsernames.length === this.users.length;
  }

  get someSelected(): boolean {
    return this.selectedUsernames.length > 0;
  }

  t(key: string): string {
    return this.language.t(key);
  }

  isSelected(username: string): boolean {
    return this.selectedUsernames.includes(username);
  }

  toggleSelection(username: string) {
    let updatedSelection = [...this.selectedUsernames];
    if (this.isSelected(username)) {
      updatedSelection = updatedSelection.filter(u => u !== username);
    } else {
      updatedSelection.push(username);
    }
    this.selectionChange.emit(updatedSelection);
  }

  toggleAll(event: any) {
    if (event.target.checked) {
      this.selectionChange.emit(this.users.map(u => u.userName));
    } else {
      this.selectionChange.emit([]);
    }
  }

  onViewDetail(user: UserResponse) {
    this.viewDetail.emit(user);
  }

  onDelete(user: UserResponse) {
    this.deleteUser.emit(user);
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
