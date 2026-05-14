import { Component, EventEmitter, Input, Output, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { StaffRegisterDTO } from '../../../../core/models/user.model';
import { LanguageService } from '../../../../core/services/language.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-staff-create-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="modal-overlay" [class.show]="isOpen">
      <div class="modal-container">
        <div class="modal-header">
          <h3>{{ t('management.staffCreateTitle') }}</h3>
          <button class="close-btn" (click)="close()">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        
        <div class="modal-body">
          <p class="modal-desc">{{ t('management.staffCreateDesc') }}</p>
          
          <form [formGroup]="form" (ngSubmit)="submit()">
            <div class="form-row">
              <div class="form-group">
                <label>{{ t('management.userFormUsername') }} <span class="required">*</span></label>
                <input type="text" formControlName="userName" class="form-control" [class.is-invalid]="isInvalid('userName')">
                <div class="error-msg" *ngIf="isInvalid('userName')">Username từ 3-20 ký tự.</div>
              </div>
              <div class="form-group">
                <label>{{ t('management.userFormEmail') }} <span class="required">*</span></label>
                <input type="email" formControlName="email" class="form-control" [class.is-invalid]="isInvalid('email')">
                <div class="error-msg" *ngIf="isInvalid('email')">Email không hợp lệ.</div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>{{ t('management.userFormName') }} <span class="required">*</span></label>
                <input type="text" formControlName="name" class="form-control" [class.is-invalid]="isInvalid('name')">
                <div class="error-msg" *ngIf="isInvalid('name')">Họ tên từ 3-20 ký tự.</div>
              </div>
              <div class="form-group">
                <label>{{ t('management.userFormPhone') }} <span class="required">*</span></label>
                <input type="text" formControlName="phoneNumber" class="form-control" [class.is-invalid]="isInvalid('phoneNumber')">
                <div class="error-msg" *ngIf="isInvalid('phoneNumber')">SĐT phải bắt đầu bằng 0 và có 10 chữ số.</div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>{{ t('management.userFormBirthDate') }} <span class="required">*</span></label>
                <input type="date" formControlName="birthDate" class="form-control" [class.is-invalid]="isInvalid('birthDate')">
                <div class="error-msg" *ngIf="isInvalid('birthDate')">Ngày sinh là bắt buộc.</div>
              </div>
              <div class="form-group">
                <label>{{ t('management.userFormGender') }} <span class="required">*</span></label>
                <select formControlName="gender" class="form-control" [class.is-invalid]="isInvalid('gender')">
                  <option value="">Chọn giới tính</option>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                </select>
                <div class="error-msg" *ngIf="isInvalid('gender')">Vui lòng chọn giới tính.</div>
              </div>
            </div>

            <div class="form-group">
              <label>{{ t('management.userFormPassword') }} <span class="required">*</span></label>
              <input type="password" formControlName="password" class="form-control" [class.is-invalid]="isInvalid('password')">
              <div class="error-msg" *ngIf="isInvalid('password')">Mật khẩu cần 8-20 ký tự, có chữ hoa, chữ thường, số và ký tự đặc biệt.</div>
            </div>

            <div class="form-group">
              <label>{{ t('management.userFormPoint') }}</label>
              <input type="number" formControlName="point" class="form-control">
            </div>

            <!-- Captcha Section -->
            <div class="captcha-section">
              <div class="captcha-image" *ngIf="captchaUrl" (click)="loadCaptcha()">
                <img [src]="captchaUrl" alt="Captcha" title="Click to reload">
              </div>
              <div class="captcha-input-group form-group mb-0">
                <label>Captcha <span class="required">*</span></label>
                <input type="text" formControlName="captchaValue" class="form-control" [class.is-invalid]="isInvalid('captchaValue')">
                <div class="error-msg" *ngIf="isInvalid('captchaValue')">Vui lòng nhập captcha.</div>
              </div>
            </div>

            <div class="form-actions">
              <button type="button" class="btn btn-secondary" (click)="close()">{{ t('management.invoiceFormCancel') }}</button>
              <button type="submit" class="btn btn-primary" [disabled]="form.invalid || isSubmitting">
                <span class="spinner-inline" *ngIf="isSubmitting"></span>
                {{ t('management.userFormSave') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1100;
      opacity: 0;
      visibility: hidden;
      transition: all 0.2s ease-in-out;
      backdrop-filter: blur(2px);
    }
    .modal-overlay.show {
      opacity: 1;
      visibility: visible;
    }
    .modal-container {
      background: var(--bg-card);
      border-radius: 12px;
      width: 100%;
      max-width: 600px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2);
      transform: translateY(20px);
      transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .modal-overlay.show .modal-container {
      transform: translateY(0);
    }
    
    .modal-header {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .modal-header h3 {
      margin: 0;
      font-size: 1.25rem;
      color: var(--text-primary);
    }
    .close-btn {
      background: transparent;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 50%;
    }
    .close-btn:hover {
      background: var(--hover-color);
      color: var(--text-primary);
    }

    .modal-body {
      padding: 1.5rem;
      overflow-y: auto;
    }
    .modal-desc {
      color: var(--text-secondary);
      margin-top: 0;
      margin-bottom: 1.5rem;
      font-size: 0.95rem;
    }

    .form-row {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    .form-row .form-group {
      flex: 1;
      margin-bottom: 0;
    }
    .form-group {
      margin-bottom: 1rem;
    }
    .mb-0 {
      margin-bottom: 0 !important;
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
    .error-msg {
      color: #ef4444;
      font-size: 0.8rem;
      margin-top: 0.25rem;
    }

    .captcha-section {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
      align-items: flex-end;
      background: rgba(0,0,0,0.02);
      padding: 1rem;
      border-radius: 8px;
    }
    :host-context(body.dark-theme) .captcha-section {
      background: rgba(255,255,255,0.02);
    }
    .captcha-image {
      background: #fff;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      height: 42px;
      min-width: 120px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      overflow: hidden;
    }
    .captcha-image img {
      max-height: 100%;
    }
    .captcha-input-group {
      flex: 1;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 2rem;
      padding-top: 1.25rem;
      border-top: 1px solid var(--border-color);
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
    .btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
    .btn-secondary {
      background: transparent;
      border: 1px solid var(--border-color);
      color: var(--text-primary);
    }
    .btn-secondary:hover:not(:disabled) {
      background: var(--hover-color);
    }
    .btn-primary {
      background: var(--primary-color);
      color: white;
    }
    .btn-primary:hover:not(:disabled) {
      filter: brightness(1.1);
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
export class StaffCreateModalComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly language = inject(LanguageService);
  private readonly authService = inject(AuthService);

  @Input() isOpen = false;
  @Input() isSubmitting = false;

  @Output() closeDialog = new EventEmitter<void>();
  @Output() submitForm = new EventEmitter<StaffRegisterDTO>();

  form!: FormGroup;
  captchaId = '';
  captchaUrl = '';

  ngOnInit() {
    this.initForm();
  }

  // Reload captcha when modal is opened
  ngOnChanges(changes: any) {
    if (changes.isOpen && changes.isOpen.currentValue) {
      this.initForm(); // reset form
      this.loadCaptcha();
    }
  }

  t(key: string): string {
    return this.language.t(key);
  }

  private initForm() {
    this.form = this.fb.group({
      userName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      email: ['', [Validators.required, Validators.email]],
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^0[0-9]{9}$/)]],
      birthDate: ['', Validators.required],
      gender: ['', Validators.required],
      password: ['', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/)]],
      point: [0],
      captchaValue: ['', Validators.required]
    });
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  loadCaptcha() {
    this.authService.getCaptcha().subscribe({
      next: (res) => {
        this.captchaId = res.captchaId;
        this.captchaUrl = res.imageUrl;
      },
      error: () => {
        console.error('Failed to load captcha');
      }
    });
  }

  close() {
    this.isOpen = false;
    this.closeDialog.emit();
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const val = this.form.value;
    const dto: StaffRegisterDTO = {
      userName: val.userName,
      email: val.email,
      name: val.name,
      phoneNumber: val.phoneNumber,
      birthDate: val.birthDate,
      gender: val.gender,
      password: val.password,
      point: val.point,
      captchaId: this.captchaId,
      captchaValue: val.captchaValue
    };

    this.submitForm.emit(dto);
  }
}
