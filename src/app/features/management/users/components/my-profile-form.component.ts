import { Component, EventEmitter, Input, Output, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserProfileResponse } from '../../../../core/models/user.model';
import { LanguageService } from '../../../../core/services/language.service';

@Component({
  selector: 'app-my-profile-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="profile-container">
      <div class="profile-header">
        <h3>{{ t('management.myProfileTitle') }}</h3>
        <p>{{ t('management.myProfileDesc') }}</p>
      </div>

      <div class="loading-state" *ngIf="isLoading">
        <div class="spinner"></div>
        <p>{{ t('shared.loading') }}...</p>
      </div>

      <form [formGroup]="form" (ngSubmit)="submit()" *ngIf="!isLoading">
        <div class="profile-content">
          <!-- Left side: Avatar -->
          <div class="avatar-section">
            <div class="avatar-preview">
              <img *ngIf="avatarPreview" [src]="avatarPreview" alt="Avatar">
              <span *ngIf="!avatarPreview" class="avatar-placeholder">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </span>
            </div>
            <div class="upload-btn-wrapper">
              <button type="button" class="btn btn-outline">{{ t('management.myProfileAvatar') }}</button>
              <input type="file" accept="image/*" (change)="onFileSelected($event)">
            </div>
          </div>

          <!-- Right side: Form fields -->
          <div class="form-section">
            <div class="form-row">
              <div class="form-group">
                <label>{{ t('management.userFormName') }} <span class="required">*</span></label>
                <input type="text" formControlName="name" class="form-control" [class.is-invalid]="isInvalid('name')">
              </div>
              <div class="form-group">
                <label>{{ t('management.userFormEmail') }} <span class="required">*</span></label>
                <input type="email" formControlName="email" class="form-control" [class.is-invalid]="isInvalid('email')">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>{{ t('management.userFormPhone') }} <span class="required">*</span></label>
                <input type="text" formControlName="phoneNumber" class="form-control" [class.is-invalid]="isInvalid('phoneNumber')">
              </div>
              <div class="form-group">
                <label>{{ t('management.userFormGender') }}</label>
                <select formControlName="gender" class="form-control">
                  <option value="">Chọn giới tính</option>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>{{ t('management.userFormBirthDate') }}</label>
                <input type="date" formControlName="birthDate" class="form-control">
              </div>
              <div class="form-group">
                <label>Tỉnh/Thành phố</label>
                <input type="text" formControlName="city" class="form-control">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Quận/Huyện</label>
                <input type="text" formControlName="district" class="form-control">
              </div>
              <div class="form-group">
                <label>Địa chỉ</label>
                <input type="text" formControlName="address" class="form-control">
              </div>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn btn-primary" [disabled]="form.invalid || isSubmitting">
                <span class="spinner-inline" *ngIf="isSubmitting"></span>
                {{ t('management.myProfileUpdate') }}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .profile-container {
      background: var(--bg-card);
      border-radius: 12px;
      border: 1px solid var(--border-color);
      padding: 2rem;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
    }
    .profile-header {
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--border-color);
    }
    .profile-header h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1.25rem;
      color: var(--text-primary);
    }
    .profile-header p {
      margin: 0;
      color: var(--text-secondary);
      font-size: 0.95rem;
    }

    .profile-content {
      display: flex;
      gap: 3rem;
      flex-wrap: wrap;
    }
    .avatar-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      width: 200px;
    }
    .avatar-preview {
      width: 150px;
      height: 150px;
      border-radius: 50%;
      background: rgba(0,0,0,0.05);
      border: 2px dashed var(--border-color);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    :host-context(body.dark-theme) .avatar-preview {
      background: rgba(255,255,255,0.05);
    }
    .avatar-preview img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .avatar-placeholder {
      color: var(--text-secondary);
      opacity: 0.5;
    }
    
    .upload-btn-wrapper {
      position: relative;
      overflow: hidden;
      display: inline-block;
    }
    .upload-btn-wrapper input[type=file] {
      font-size: 100px;
      position: absolute;
      left: 0;
      top: 0;
      opacity: 0;
      cursor: pointer;
    }

    .form-section {
      flex: 1;
      min-width: 300px;
    }

    .form-row {
      display: flex;
      gap: 1.5rem;
      margin-bottom: 1.25rem;
    }
    .form-group {
      flex: 1;
    }
    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: var(--text-primary);
      font-size: 0.9rem;
    }
    .required {
      color: #ef4444;
    }
    .form-control {
      width: 100%;
      padding: 0.6rem 0.75rem;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      background: var(--bg-card);
      color: var(--text-primary);
      font-size: 0.95rem;
      transition: border-color 0.2s;
    }
    .form-control:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 2px rgba(229, 9, 20, 0.1);
    }
    .form-control.is-invalid {
      border-color: #ef4444;
    }
    select.form-control {
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 0.75rem center;
    }

    .form-actions {
      margin-top: 2rem;
      display: flex;
      justify-content: flex-end;
    }

    .btn {
      padding: 0.6rem 1.5rem;
      border-radius: 6px;
      font-weight: 500;
      font-size: 0.95rem;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .btn-outline {
      background: transparent;
      border: 1px solid var(--border-color);
      color: var(--text-primary);
    }
    .btn-outline:hover {
      background: var(--hover-color);
    }
    .btn-primary {
      background: var(--primary-color);
      color: white;
    }
    .btn-primary:hover:not(:disabled) {
      filter: brightness(1.1);
    }
    .btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
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
    .spinner-inline {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255,255,255,0.3);
      border-radius: 50%;
      border-top-color: #fff;
      animation: spin 1s ease-in-out infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class MyProfileFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly language = inject(LanguageService);

  @Input() profile: UserProfileResponse | null = null;
  @Input() isLoading = false;
  @Input() isSubmitting = false;

  @Output() updateProfile = new EventEmitter<FormData>();

  form!: FormGroup;
  avatarFile: File | null = null;
  avatarPreview: string | null = null;

  ngOnInit() {
    this.initForm();
  }

  ngOnChanges(changes: any) {
    if (changes.profile && changes.profile.currentValue) {
      this.patchForm(changes.profile.currentValue);
    }
  }

  t(key: string): string {
    return this.language.t(key);
  }

  private initForm() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
      gender: [''],
      birthDate: [''],
      address: [''],
      city: [''],
      district: ['']
    });
  }

  private patchForm(p: UserProfileResponse) {
    this.form.patchValue({
      name: p.name || '',
      email: p.email || '',
      phoneNumber: p.phoneNumber || '',
      gender: p.gender || '',
      birthDate: p.birthDate || '',
      address: p.address || '',
      city: p.city || '',
      district: p.district || ''
    });
    this.avatarPreview = p.avatarUrl;
    this.avatarFile = null;
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.avatarFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.avatarPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const val = this.form.value;
    const formData = new FormData();
    
    // Add strings
    formData.append('name', val.name);
    formData.append('email', val.email);
    formData.append('phoneNumber', val.phoneNumber);
    if (val.gender) formData.append('gender', val.gender);
    if (val.birthDate) formData.append('birthDate', val.birthDate);
    if (val.address) formData.append('address', val.address);
    if (val.city) formData.append('city', val.city);
    if (val.district) formData.append('district', val.district);

    // Add file if changed
    if (this.avatarFile) {
      formData.append('avatar', this.avatarFile);
    }

    this.updateProfile.emit(formData);
  }
}
