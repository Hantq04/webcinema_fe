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
    <div *ngIf="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in duration-200">
        <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
          <h3 class="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-rose-500"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" y1="8" x2="19" y2="14"></line><line x1="22" y1="11" x2="16" y2="11"></line></svg>
            {{ t('management.staffCreateTitle') }}
          </h3>
          <button class="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors" (click)="close()">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        
        <div class="flex-1 overflow-y-auto p-6">
          <p class="text-slate-500 dark:text-slate-400 text-sm mb-6">{{ t('management.staffCreateDesc') }}</p>
          
          <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{{ t('management.userFormUsername') }} <span class="text-rose-500">*</span></label>
                <input type="text" formControlName="userName" class="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-lg py-2 px-3 focus:ring-2 focus:ring-rose-500 outline-none transition-shadow" [class.border-rose-500]="isInvalid('userName')">
                <p class="text-xs text-rose-500 mt-1" *ngIf="isInvalid('userName')">Username từ 3-20 ký tự.</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{{ t('management.userFormEmail') }} <span class="text-rose-500">*</span></label>
                <input type="email" formControlName="email" class="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-lg py-2 px-3 focus:ring-2 focus:ring-rose-500 outline-none transition-shadow" [class.border-rose-500]="isInvalid('email')">
                <p class="text-xs text-rose-500 mt-1" *ngIf="isInvalid('email')">Email không hợp lệ.</p>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{{ t('management.userFormName') }} <span class="text-rose-500">*</span></label>
                <input type="text" formControlName="name" class="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-lg py-2 px-3 focus:ring-2 focus:ring-rose-500 outline-none transition-shadow" [class.border-rose-500]="isInvalid('name')">
                <p class="text-xs text-rose-500 mt-1" *ngIf="isInvalid('name')">Họ tên từ 3-20 ký tự.</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{{ t('management.userFormPhone') }} <span class="text-rose-500">*</span></label>
                <input type="text" formControlName="phoneNumber" class="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-lg py-2 px-3 focus:ring-2 focus:ring-rose-500 outline-none transition-shadow" [class.border-rose-500]="isInvalid('phoneNumber')">
                <p class="text-xs text-rose-500 mt-1" *ngIf="isInvalid('phoneNumber')">SĐT phải bắt đầu bằng 0 và có 10 chữ số.</p>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{{ t('management.userFormBirthDate') }} <span class="text-rose-500">*</span></label>
                <input type="date" formControlName="birthDate" class="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-lg py-2 px-3 focus:ring-2 focus:ring-rose-500 outline-none transition-shadow" [class.border-rose-500]="isInvalid('birthDate')">
                <p class="text-xs text-rose-500 mt-1" *ngIf="isInvalid('birthDate')">Ngày sinh là bắt buộc.</p>
              </div>
              <div class="relative">
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{{ t('management.userFormGender') }} <span class="text-rose-500">*</span></label>
                <div class="relative w-full">
                  <div
                    class="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-lg py-2 px-3 text-sm flex justify-between items-center cursor-pointer hover:border-rose-300 transition-all"
                    [class.ring-2]="isGenderOpen" [class.ring-rose-500]="isGenderOpen"
                    [class.border-rose-500]="isGenderOpen || isInvalid('gender')" (click)="isGenderOpen = !isGenderOpen">
                    <span class="truncate" [class.text-slate-400]="!form.get('gender')?.value">{{ form.get('gender')?.value || 'Chọn giới tính' }}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-400 transition-transform" [class.rotate-180]="isGenderOpen" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <div *ngIf="isGenderOpen" class="absolute top-full left-0 mt-1 w-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-lg py-1 z-50">
                    <div class="px-4 py-2.5 text-sm hover:bg-rose-50 dark:hover:bg-rose-900/30 cursor-pointer transition-colors" (click)="form.get('gender')?.setValue('Nam'); isGenderOpen = false">Nam</div>
                    <div class="px-4 py-2.5 text-sm hover:bg-rose-50 dark:hover:bg-rose-900/30 cursor-pointer transition-colors" (click)="form.get('gender')?.setValue('Nữ'); isGenderOpen = false">Nữ</div>
                  </div>
                  <div *ngIf="isGenderOpen" class="fixed inset-0 z-40" (click)="isGenderOpen = false"></div>
                </div>
                <p class="text-xs text-rose-500 mt-1" *ngIf="isInvalid('gender')">Vui lòng chọn giới tính.</p>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{{ t('management.userFormPassword') }} <span class="text-rose-500">*</span></label>
              <input type="password" formControlName="password" class="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-lg py-2 px-3 focus:ring-2 focus:ring-rose-500 outline-none transition-shadow" [class.border-rose-500]="isInvalid('password')">
              <p class="text-xs text-rose-500 mt-1" *ngIf="isInvalid('password')">Mật khẩu cần 8-20 ký tự, có chữ hoa, chữ thường, số và ký tự đặc biệt.</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{{ t('management.userFormPoint') }}</label>
              <input type="number" formControlName="point" class="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-lg py-2 px-3 focus:ring-2 focus:ring-rose-500 outline-none transition-shadow">
            </div>

            <!-- Captcha Section -->
            <div class="flex flex-col md:flex-row gap-4 items-end bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
              <div class="h-[42px] min-w-[120px] bg-white border border-slate-200 dark:border-slate-600 rounded-lg flex items-center justify-center cursor-pointer overflow-hidden shrink-0 shadow-sm" *ngIf="captchaUrl" (click)="loadCaptcha()" title="Click to reload">
                <img [src]="captchaUrl" alt="Captcha" class="max-h-full">
              </div>
              <div class="flex-1 w-full">
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Captcha <span class="text-rose-500">*</span></label>
                <input type="text" formControlName="captchaValue" class="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-lg py-2 px-3 focus:ring-2 focus:ring-rose-500 outline-none transition-shadow" [class.border-rose-500]="isInvalid('captchaValue')">
                <p class="text-xs text-rose-500 mt-1" *ngIf="isInvalid('captchaValue')">Vui lòng nhập captcha.</p>
              </div>
            </div>
          </form>
        </div>
        
        <div class="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
          <button type="button" class="px-5 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors" (click)="close()">
            {{ t('management.invoiceFormCancel') }}
          </button>
          <button type="button" class="px-5 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2" [disabled]="form.invalid || isSubmitting" (click)="submit()">
            <svg *ngIf="isSubmitting" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            {{ t('management.userFormSave') }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: []
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
  isGenderOpen = false;

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
