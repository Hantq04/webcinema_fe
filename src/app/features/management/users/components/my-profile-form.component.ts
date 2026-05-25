import { Component, EventEmitter, Input, Output, inject, OnInit, OnChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserProfileResponse } from '../../../../core/models/user.model';
import { LanguageService } from '../../../../core/services/language.service';
import { LocationService, Province, District } from '../../../../core/services/location.service';

@Component({
  selector: 'app-my-profile-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-4xl mx-auto pb-8">
      <div class="mb-8">
        <h3 class="text-2xl font-bold text-slate-800 dark:text-white mb-2">{{ t('management.myProfileTitle') }}</h3>
        <p class="text-slate-500 dark:text-slate-400">{{ t('management.myProfileDesc') }}</p>
      </div>

      <div *ngIf="isLoading" class="loading-state py-12">
        <div class="spinner"></div>
        <span>{{ t('shared.loading') }}...</span>
      </div>

      <form [formGroup]="form" (ngSubmit)="submit()" *ngIf="!isLoading">
        <div *ngIf="fieldErrors && fieldErrors['_general']"
          class="mb-5 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl text-xs text-red-600 dark:text-red-400 animate-in fade-in slide-in-from-top-1 duration-200">
          {{ fieldErrors['_general'] }}
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 lg:gap-x-12">
          <!-- Row 1 -->
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{{ t('management.colName') }} <span class="text-rose-500">*</span></label>
            <input type="text" formControlName="name" class="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-rose-500 outline-none transition-shadow" [class.border-rose-500]="isInvalid('name') || (fieldErrors && fieldErrors['name'])">
            <p *ngIf="fieldErrors && fieldErrors['name']" class="text-xs text-rose-500 mt-1">{{ fieldErrors['name'] }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{{ t('account.cityLabel') }} <span class="text-rose-500">*</span></label>
            <div class="relative w-full">
              <div class="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-lg py-2.5 px-3 flex justify-between items-center cursor-pointer hover:border-rose-400 transition-all"
                [class.ring-2]="isCityOpen" [class.ring-rose-500/10]="isCityOpen" [class.border-rose-500]="isCityOpen || (fieldErrors && fieldErrors['city'])"
                (click)="isCityOpen = !isCityOpen; isDistrictOpen = false; isGenderOpen = false">
                <span class="truncate" [class.text-slate-400]="!form.get('city')?.value">
                  {{ getProvinceName(form.get('city')?.value) || t('shared.pleaseSelect') }}
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-400 transition-transform" [class.rotate-180]="isCityOpen" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </div>
              <div *ngIf="isCityOpen" class="absolute top-full left-0 mt-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-1.5 z-[110] max-h-60 overflow-y-auto custom-scrollbar">
                <div *ngFor="let p of provinces()" 
                  class="px-3 py-2 text-sm hover:bg-rose-50 dark:hover:bg-rose-900/20 cursor-pointer transition-colors"
                  [class.text-rose-600]="form.get('city')?.value === p.code.toString()"
                  (click)="form.get('city')?.setValue(p.code.toString()); isCityOpen = false">
                  {{ p.name }}
                </div>
              </div>
              <div *ngIf="isCityOpen" class="fixed inset-0 z-[105]" (click)="isCityOpen = false"></div>
            </div>
            <p *ngIf="fieldErrors && fieldErrors['city']" class="text-xs text-rose-500 mt-1">{{ fieldErrors['city'] }}</p>
          </div>

          <!-- Row 2 -->
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{{ t('management.colPhone') }} <span class="text-rose-500">*</span></label>
            <input type="text" formControlName="phoneNumber" class="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-rose-500 outline-none transition-shadow" [class.border-rose-500]="isInvalid('phoneNumber') || (fieldErrors && fieldErrors['phoneNumber'])">
            <p *ngIf="fieldErrors && fieldErrors['phoneNumber']" class="text-xs text-rose-500 mt-1">{{ fieldErrors['phoneNumber'] }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{{ t('account.districtLabel') }} <span class="text-rose-500">*</span></label>
            <div class="relative w-full">
              <div class="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-lg py-2.5 px-3 flex justify-between items-center cursor-pointer hover:border-rose-400 transition-all"
                [class.ring-2]="isDistrictOpen" [class.ring-rose-500/10]="isDistrictOpen" [class.border-rose-500]="isDistrictOpen || (fieldErrors && fieldErrors['district'])"
                [class.opacity-50]="!form.get('city')?.value" [class.cursor-not-allowed]="!form.get('city')?.value"
                (click)="form.get('city')?.value && (isDistrictOpen = !isDistrictOpen); isCityOpen = false; isGenderOpen = false">
                <span class="truncate" [class.text-slate-400]="!form.get('district')?.value">
                  {{ getDistrictName(form.get('district')?.value) || t('shared.pleaseSelect') }}
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-400 transition-transform" [class.rotate-180]="isDistrictOpen" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </div>
              <div *ngIf="isDistrictOpen" class="absolute top-full left-0 mt-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-1.5 z-[110] max-h-60 overflow-y-auto custom-scrollbar">
                <div *ngFor="let d of districts()" 
                  class="px-3 py-2 text-sm hover:bg-rose-50 dark:hover:bg-rose-900/20 cursor-pointer transition-colors"
                  [class.text-rose-600]="form.get('district')?.value === d.code.toString()"
                  (click)="form.get('district')?.setValue(d.code.toString()); isDistrictOpen = false">
                  {{ d.name }}
                </div>
                <div *ngIf="districts().length === 0" class="px-3 py-2 text-sm text-slate-400 italic">{{ t('shared.noData') }}</div>
              </div>
              <div *ngIf="isDistrictOpen" class="fixed inset-0 z-[105]" (click)="isDistrictOpen = false"></div>
            </div>
            <p *ngIf="fieldErrors && fieldErrors['district']" class="text-xs text-rose-500 mt-1">{{ fieldErrors['district'] }}</p>
          </div>

          <!-- Row 3 -->
          <div class="relative">
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{{ t('management.userFormGender') }}</label>
            <div class="relative w-full">
              <div class="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-lg py-2.5 px-3 flex justify-between items-center cursor-pointer hover:border-rose-400 transition-all"
                [class.ring-2]="isGenderOpen" [class.ring-rose-500/10]="isGenderOpen" [class.border-rose-500]="isGenderOpen || (fieldErrors && fieldErrors['gender'])"
                (click)="isGenderOpen = !isGenderOpen; isCityOpen = false; isDistrictOpen = false">
                <span class="truncate" [class.text-slate-400]="!form.get('gender')?.value || form.get('gender')?.value === 'None'">
                  {{ form.get('gender')?.value && form.get('gender')?.value !== 'None' ? (form.get('gender')?.value === 'Nam' ? t('auth.male') : t('auth.female')) : t('management.selectGender') }}
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-400 transition-transform duration-200" [class.rotate-180]="isGenderOpen" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </div>
              
              <!-- Dropdown Menu -->
              <div *ngIf="isGenderOpen" 
                class="absolute top-full left-0 mt-1.5 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-1.5 z-[100] animate-in fade-in slide-in-from-top-1 duration-200">
                <div class="px-3 py-2 text-sm hover:bg-rose-50 dark:hover:bg-rose-900/20 cursor-pointer transition-colors flex items-center justify-between" 
                  [class.text-rose-600]="form.get('gender')?.value === 'Nam'"
                  (click)="form.get('gender')?.setValue('Nam'); isGenderOpen = false">
                  <span>{{ t('auth.male') }}</span>
                  <svg *ngIf="form.get('gender')?.value === 'Nam'" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                </div>
                <div class="px-3 py-2 text-sm hover:bg-rose-50 dark:hover:bg-rose-900/20 cursor-pointer transition-colors flex items-center justify-between" 
                  [class.text-rose-600]="form.get('gender')?.value === 'Nữ'"
                  (click)="form.get('gender')?.setValue('Nữ'); isGenderOpen = false">
                  <span>{{ t('auth.female') }}</span>
                  <svg *ngIf="form.get('gender')?.value === 'Nữ'" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                </div>
              </div>
              <div *ngIf="isGenderOpen" class="fixed inset-0 z-[90]" (click)="isGenderOpen = false"></div>
            </div>
            <p *ngIf="fieldErrors && fieldErrors['gender']" class="text-xs text-rose-500 mt-1">{{ fieldErrors['gender'] }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{{ t('account.addressLabel') }} <span class="text-rose-500">*</span></label>
            <input type="text" formControlName="address" class="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-rose-500 outline-none transition-shadow" [class.border-rose-500]="isInvalid('address') || (fieldErrors && fieldErrors['address'])">
            <p *ngIf="fieldErrors && fieldErrors['address']" class="text-xs text-rose-500 mt-1">{{ fieldErrors['address'] }}</p>
          </div>

          <!-- Row 4 -->
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{{ t('management.userFormBirthDate') }}</label>
            <div class="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 rounded-lg py-2.5 px-3">
              {{ profile?.birthDate || 'N/A' }}
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{{ t('account.oldPasswordLabel') }} <span class="text-rose-500">*</span></label>
            <input type="password" formControlName="oldPassword" class="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-rose-500 outline-none transition-shadow" [class.border-rose-500]="isInvalid('oldPassword') || (fieldErrors && fieldErrors['oldPassword'])">
            <p *ngIf="fieldErrors && fieldErrors['oldPassword']" class="text-xs text-rose-500 mt-1">{{ fieldErrors['oldPassword'] }}</p>
          </div>

          <!-- Row 5 -->
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email <span class="text-rose-500">*</span></label>
            <input type="email" formControlName="email" class="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-rose-500 outline-none transition-shadow" [class.border-rose-500]="isInvalid('email') || (fieldErrors && fieldErrors['email'])">
            <p *ngIf="fieldErrors && fieldErrors['email']" class="text-xs text-rose-500 mt-1">{{ fieldErrors['email'] }}</p>
          </div>
          <div class="hidden md:block"></div> <!-- Empty right column space -->
          
          <!-- Checkbox Row -->
          <div class="col-span-1 md:col-span-2 pt-2">
            <label class="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300 w-fit">
              <input type="checkbox" formControlName="wantsChangePassword" class="w-4 h-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"> {{ t('account.changePasswordToggle') }}
            </label>
          </div>

          <!-- Password Row -->
          <ng-container *ngIf="form.get('wantsChangePassword')?.value">
            <div class="mt-2">
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{{ t('auth.newPassword') }} <span class="text-rose-500">*</span></label>
              <input type="password" formControlName="newPassword" class="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-rose-500 outline-none transition-shadow" [class.border-rose-500]="isInvalid('newPassword') || (fieldErrors && fieldErrors['newPassword'])">
              <p *ngIf="fieldErrors && fieldErrors['newPassword']" class="text-xs text-rose-500 mt-1">{{ fieldErrors['newPassword'] }}</p>
            </div>
            <div class="mt-2">
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{{ t('auth.confirmNewPassword') }} <span class="text-rose-500">*</span></label>
              <input type="password" formControlName="confirmPassword" class="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-rose-500 outline-none transition-shadow" [class.border-rose-500]="isInvalid('confirmPassword') || (fieldErrors && fieldErrors['confirmPassword'])">
              <p *ngIf="fieldErrors && fieldErrors['confirmPassword']" class="text-xs text-rose-500 mt-1">{{ fieldErrors['confirmPassword'] }}</p>
            </div>
          </ng-container>
        </div>

        <div class="mt-10 flex justify-center w-full">
          <button type="submit" 
            class="px-10 py-3 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-all shadow-md flex items-center gap-2 transform active:scale-95" 
            [disabled]="isSubmitting">
            <svg *ngIf="isSubmitting" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            {{ t('management.myProfileUpdate') }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: []
})
export class MyProfileFormComponent implements OnInit, OnChanges {
  private readonly fb = inject(FormBuilder);
  private readonly language = inject(LanguageService);
  private readonly locationService = inject(LocationService);

  @Input() profile: UserProfileResponse | null = null;
  @Input() isLoading = false;
  @Input() isSubmitting = false;
  @Input() fieldErrors: Record<string, string> = {};

  @Output() updateProfile = new EventEmitter<FormData>();

  form!: FormGroup;
  provinces = signal<Province[]>([]);
  districts = signal<District[]>([]);
  isGenderOpen = false;
  isCityOpen = false;
  isDistrictOpen = false;

  ngOnInit() {
    this.initForm();
    this.locationService.getProvinces().subscribe(data => this.provinces.set(data));
    
    this.form.get('city')?.valueChanges.subscribe(cityCode => {
      if (cityCode) {
        this.locationService.getDistricts(parseInt(cityCode)).subscribe(data => this.districts.set(data));
      } else {
        this.districts.set([]);
      }
      this.form.patchValue({ district: '' }, { emitEvent: false });
    });

    this.form.get('wantsChangePassword')?.valueChanges.subscribe(checked => {
      if (checked) {
        this.form.get('newPassword')?.setValidators([Validators.required]);
        this.form.get('confirmPassword')?.setValidators([Validators.required]);
      } else {
        this.form.get('newPassword')?.clearValidators();
        this.form.get('confirmPassword')?.clearValidators();
      }
      this.form.get('newPassword')?.updateValueAndValidity();
      this.form.get('confirmPassword')?.updateValueAndValidity();
    });
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
      gender: ['None'],
      birthDate: [''],
      address: ['', Validators.required],
      city: ['', Validators.required],
      district: ['', Validators.required],
      oldPassword: ['', Validators.required],
      wantsChangePassword: [false],
      newPassword: [''],
      confirmPassword: ['']
    });
  }

  private patchForm(p: UserProfileResponse) {
    if (!p) return;
    
    // Patch basic info
    this.form.patchValue({
      name: p.name || '',
      email: p.email || '',
      phoneNumber: p.phoneNumber || '',
      gender: p.gender || 'None',
      birthDate: p.birthDate || '',
      address: p.address || ''
    }, { emitEvent: false });

    // Handle City and District mapping
    if (p.city) {
      // Find province by code (p.city might be a code or name)
      this.locationService.getProvinces().subscribe(provinces => {
        const province = provinces.find(pr => pr.code.toString() === p.city || pr.name === p.city);
        if (province) {
          this.form.get('city')?.setValue(province.code.toString(), { emitEvent: true });
          
          // Now wait for districts to load from the valueChanges subscription
          // But we need to ensure the district is set AFTER they load
          this.locationService.getDistricts(province.code).subscribe(districts => {
            this.districts.set(districts);
            const district = districts.find(d => d.code.toString() === p.district || d.name === p.district);
            if (district) {
              this.form.get('district')?.setValue(district.code.toString(), { emitEvent: false });
            } else if (p.district) {
              this.form.get('district')?.setValue(p.district, { emitEvent: false });
            }
          });
        } else {
          this.form.get('city')?.setValue(p.city, { emitEvent: false });
          if (p.district) this.form.get('district')?.setValue(p.district, { emitEvent: false });
        }
      });
    }
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getProvinceName(code: any): string {
    if (!code) return '';
    return this.provinces().find(p => p.code.toString() === code.toString())?.name || '';
  }

  getDistrictName(code: any): string {
    if (!code) return '';
    return this.districts().find(d => d.code.toString() === code.toString())?.name || '';
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const val = this.form.value;
    
    if (val.wantsChangePassword && val.newPassword !== val.confirmPassword) {
      alert(this.t('account.newPasswordMismatch'));
      return;
    }

    const formData = new FormData();
    
    // Add strings
    formData.append('name', val.name);
    formData.append('email', val.email);
    formData.append('phoneNumber', val.phoneNumber);
    if (val.gender) formData.append('gender', val.gender);
    if (val.address) formData.append('address', val.address);
    if (val.city) formData.append('city', val.city);
    if (val.district) formData.append('district', val.district);
    
    // Passwords
    if (val.oldPassword) formData.append('oldPassword', val.oldPassword);
    if (val.wantsChangePassword && val.newPassword) {
      formData.append('newPassword', val.newPassword);
      formData.append('confirmPassword', val.confirmPassword);
    }

    this.updateProfile.emit(formData);
  }
}
