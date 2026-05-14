import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { UserTableComponent } from './components/user-table.component';
import { UserDetailDrawerComponent } from './components/user-detail-drawer.component';
import { StaffCreateModalComponent } from './components/staff-create-modal.component';
import { MyProfileFormComponent } from './components/my-profile-form.component';
import { LanguageService } from '../../../core/services/language.service';
import { AuthService } from '../../../core/services/auth.service';
import { ManagementUserService } from '../../../core/services/management-user.service';
import { UserResponse, UserDetailResponse, StaffRegisterDTO, UserProfileResponse } from '../../../core/models/user.model';

@Component({
  selector: 'app-management-users',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    UserTableComponent,
    UserDetailDrawerComponent, 
    StaffCreateModalComponent, 
    MyProfileFormComponent
  ],
  templateUrl: './management-users.component.html',
  styleUrls: ['./management-users.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManagementUsersComponent implements OnInit {
  private readonly language = inject(LanguageService);
  private readonly auth = inject(AuthService);
  private readonly userService = inject(ManagementUserService);

  // View States
  currentView = signal<'LIST' | 'MY_PROFILE'>('LIST');

  // List States
  users = signal<UserResponse[]>([]);
  isLoadingList = signal(true);
  
  // Filters
  searchQuery = signal('');
  selectedRole = signal('');

  // Selection
  selectedUsernames = signal<string[]>([]);

  // Drawer & Modals
  isDrawerOpen = signal(false);
  isLoadingDrawer = signal(false);
  selectedUserDetail = signal<UserDetailResponse | null>(null);

  isCreateModalOpen = signal(false);
  isSubmittingCreate = signal(false);

  // Profile Form
  myProfileData = signal<UserProfileResponse | null>(null);
  isLoadingProfile = signal(false);
  isSubmittingProfile = signal(false);

  // Pagination (client side)
  currentPage = signal(1);
  pageSize = signal(10);

  // Toast
  toast = signal<{ show: boolean, message: string, type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });

  // Computed
  filteredUsers = computed(() => {
    let result = this.users();
    
    // Filter by role
    const role = this.selectedRole();
    if (role) {
      result = result.filter(u => u.role === role || u.role === `ROLE_${role}`);
    }

    // Search by text
    const query = this.searchQuery().toLowerCase();
    if (query) {
      result = result.filter(u => 
        (u.userName && u.userName.toLowerCase().includes(query)) ||
        (u.email && u.email.toLowerCase().includes(query)) ||
        (u.name && u.name.toLowerCase().includes(query)) ||
        (u.phoneNumber && u.phoneNumber.toLowerCase().includes(query))
      );
    }

    return result;
  });

  paginatedUsers = computed(() => {
    const list = this.filteredUsers();
    const start = (this.currentPage() - 1) * this.pageSize();
    return list.slice(start, start + this.pageSize());
  });

  totalPages = computed(() => {
    return Math.max(1, Math.ceil(this.filteredUsers().length / this.pageSize()));
  });

  t(key: string): string {
    return this.language.t(key);
  }

  ngOnInit() {
    this.loadUsers();
  }

  showToast(message: string, type: 'success' | 'error' = 'success') {
    this.toast.set({ show: true, message, type });
    setTimeout(() => {
      this.toast.update(t => ({ ...t, show: false }));
    }, 3000);
  }

  // --- Views ---

  switchToProfile() {
    this.currentView.set('MY_PROFILE');
    this.loadMyProfile();
  }

  switchToList() {
    this.currentView.set('LIST');
  }

  // --- Load Data ---

  loadUsers() {
    this.isLoadingList.set(true);
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users.set(data);
        this.isLoadingList.set(false);
        this.selectedUsernames.set([]);
      },
      error: (err) => {
        console.error('Error loading users', err);
        this.isLoadingList.set(false);
        this.showToast('Không thể tải danh sách người dùng', 'error');
      }
    });
  }

  loadMyProfile() {
    const username = this.auth.currentUserName();
    if (!username) return;

    this.isLoadingProfile.set(true);
    this.userService.getUserProfile(username).subscribe({
      next: (data) => {
        this.myProfileData.set(data);
        this.isLoadingProfile.set(false);
      },
      error: (err) => {
        console.error('Error loading profile', err);
        this.isLoadingProfile.set(false);
        this.showToast('Không thể tải thông tin hồ sơ', 'error');
      }
    });
  }

  // --- List Handlers ---

  onSearchChange(query: string) {
    this.searchQuery.set(query);
    this.currentPage.set(1);
  }

  onRoleChange(role: string) {
    this.selectedRole.set(role);
    this.currentPage.set(1);
  }

  onSelectionChange(usernames: string[]) {
    this.selectedUsernames.set(usernames);
  }

  onPageChange(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  // --- Actions ---

  openCreateModal() {
    this.isCreateModalOpen.set(true);
  }

  closeCreateModal() {
    this.isCreateModalOpen.set(false);
  }

  submitStaffCreate(dto: StaffRegisterDTO) {
    this.isSubmittingCreate.set(true);
    this.userService.staffRegister(dto).subscribe({
      next: () => {
        this.isSubmittingCreate.set(false);
        this.closeCreateModal();
        this.showToast(this.t('management.staffCreatedSuccess'), 'success');
        this.loadUsers();
      },
      error: (err) => {
        console.error('Staff register error', err);
        this.isSubmittingCreate.set(false);
        this.showToast(err.error?.message || 'Có lỗi xảy ra', 'error');
      }
    });
  }

  openUserDetail(user: UserResponse) {
    this.selectedUserDetail.set(null);
    this.isDrawerOpen.set(true);
    this.isLoadingDrawer.set(true);

    this.userService.getUserById(user.id).subscribe({
      next: (data) => {
        this.selectedUserDetail.set(data);
        this.isLoadingDrawer.set(false);
      },
      error: (err) => {
        console.error('Get user details error', err);
        this.isLoadingDrawer.set(false);
        this.showToast('Không thể tải thông tin chi tiết', 'error');
      }
    });
  }

  closeUserDetail() {
    this.isDrawerOpen.set(false);
  }

  deleteUser(user: UserResponse) {
    if (confirm(this.t('management.confirmDeleteUserDesc'))) {
      this.userService.deleteUsers([user.userName]).subscribe({
        next: () => {
          this.showToast(this.t('management.userDeletedSuccess'), 'success');
          this.loadUsers();
        },
        error: (err) => {
          console.error('Delete error', err);
          this.showToast(err.error?.message || 'Không thể xóa', 'error');
        }
      });
    }
  }

  bulkDelete() {
    const selected = this.selectedUsernames();
    if (selected.length === 0) return;

    if (confirm(this.t('management.confirmBulkDeleteUserDesc'))) {
      this.userService.deleteUsers(selected).subscribe({
        next: () => {
          this.showToast(this.t('management.userBulkDeletedSuccess'), 'success');
          this.loadUsers();
        },
        error: (err) => {
          console.error('Bulk delete error', err);
          this.showToast(err.error?.message || 'Không thể xóa hàng loạt', 'error');
        }
      });
    }
  }

  updateMyProfile(formData: FormData) {
    this.isSubmittingProfile.set(true);
    this.userService.updateProfile(formData).subscribe({
      next: () => {
        this.isSubmittingProfile.set(false);
        this.showToast(this.t('management.profileUpdatedSuccess'), 'success');
        this.loadMyProfile(); // Reload data
      },
      error: (err) => {
        console.error('Update profile error', err);
        this.isSubmittingProfile.set(false);
        this.showToast(err.error?.message || 'Không thể cập nhật hồ sơ', 'error');
      }
    });
  }
}
