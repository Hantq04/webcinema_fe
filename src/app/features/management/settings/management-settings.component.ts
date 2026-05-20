import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, computed, inject, signal, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LanguageService } from '../../../core/services/language.service';
import { SettingService } from '../../../core/services/setting.service';
import { GeneralSetting } from '../../../core/models/setting.model';

@Component({
  selector: 'app-management-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './management-settings.component.html',
  styleUrls: ['./management-settings.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManagementSettingsComponent implements OnInit {
  protected readonly language = inject(LanguageService);
  private readonly settingService = inject(SettingService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly ngZone = inject(NgZone);

  protected readonly t = this.language.t.bind(this.language);

  // States
  isLoadingSettings = signal(false);
  isSavingSetting = signal(false);
  hasSettingError = signal(false);

  settingsList = signal<GeneralSetting[]>([]);

  // Selection / Form Mode
  activeSettingId = signal<number | null>(null); // null = Save (create) mode, non-null = Update mode

  // General Settings Form Signals
  breakTime = signal<string>('12:00');
  businessHours = signal<number>(16);
  openTime = signal<string>('08:00');
  percentWeekend = signal<number>(10);
  timeBeginToChange = signal<string>('2026-05-01T00:00');

  // Form Validations & Toast States
  formErrors = signal<string[]>([]);
  toast = signal<{ show: boolean, message: string, type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });

  // Delete confirmation states
  showDeleteConfirm = signal(false);
  settingIdToDelete = signal<number | null>(null);

  private loadedTimeBeginToChange: string | null = null;

  // Computed closeTime derivation from openTime + businessHours
  closeTime = computed(() => {
    return this.calculateCloseTime(this.openTime(), this.businessHours());
  });

  // Translation helpers to keep template logic extremely simple and avoid runtime exceptions
  isVi(): boolean {
    return this.language.currentLanguage() === 'vi';
  }

  get textSettingsTitle() { return this.isVi() ? 'Cấu Hình & Cài Đặt' : 'Settings & Configurations'; }
  get textOperatingRules() { return this.isVi() ? 'Thông Số Vận Hành' : 'Operating Rules'; }
  get textOpenTime() { return this.isVi() ? 'Giờ mở cửa rạp' : 'Open Time'; }
  get textBusinessHours() { return this.isVi() ? 'Số giờ mở cửa rạp (tiếng)' : 'Business Hours (hrs)'; }
  get textCloseTime() { return this.isVi() ? 'Giờ đóng cửa rạp (Tự động)' : 'Close Time (Derived)'; }
  get textCloseTimeTooltip() { return this.isVi() ? 'Tính từ: Giờ mở cửa + Số giờ mở cửa' : 'Formula: Open Time + Business Hours'; }
  get textBreakTime() { return this.isVi() ? 'Thời gian nghỉ suất chiếu' : 'Break Time'; }
  get textWeekendPercent() { return this.isVi() ? '% Phụ thu vé cuối tuần' : 'Weekend Surcharge %'; }
  get textTimeBeginToChange() { return this.isVi() ? 'Thời gian bắt đầu thay đổi' : 'Time Begin to Change'; }
  get textSaveRules() { return this.isVi() ? 'Lưu cấu hình' : 'Save Rules'; }
  get textUpdateRules() { return this.isVi() ? 'Cập nhật cấu hình' : 'Update Rules'; }
  get textResetForm() { return this.isVi() ? 'Làm mới' : 'Reset Form'; }

  get textHistoryTitle() { return this.isVi() ? 'Lịch Sử Cấu Hình Vận Hành' : 'General Settings Log'; }
  get textRecords() { return this.isVi() ? 'bản ghi' : 'records'; }
  get textFetchingRecords() { return this.isVi() ? 'Đang tải danh sách lịch sử...' : 'Fetching configuration records...'; }
  get textNoRecords() { return this.isVi() ? 'Chưa có bản ghi cấu hình nào.' : 'No configuration logs available.'; }

  get textColOpenTime() { return this.isVi() ? 'Giờ Mở Cửa' : 'Open Time'; }
  get textColOperatingHours() { return this.isVi() ? 'Số Giờ Hoạt Động' : 'Operating Hours'; }
  get textColCloseTime() { return this.isVi() ? 'Giờ Đóng Cửa' : 'Close Time'; }
  get textColBreakTime() { return this.isVi() ? 'Nghỉ Suất Chiếu' : 'Break Time'; }
  get textColWeekendSurcharge() { return this.isVi() ? 'Phụ Thu Cuối Tuần' : 'Weekend Surcharge'; }
  get textColLockChangeTime() { return this.isVi() ? 'Giờ Khóa Thay Đổi' : 'Lock Change Time'; }
  get textColActions() { return this.isVi() ? 'Hành động' : 'Actions'; }

  get textHour() { return this.isVi() ? 'giờ' : 'hrs'; }
  get textMinute() { return this.isVi() ? 'phút' : 'mins'; }
  get textEdit() { return this.isVi() ? 'Chỉnh sửa' : 'Edit item'; }
  get textDelete() { return this.isVi() ? 'Xóa bản ghi' : 'Delete record'; }

  ngOnInit(): void {
    this.loadLatestSetting();
    this.loadAllSettings();
  }

  showToast(message: string, type: 'success' | 'error' = 'success') {
    this.toast.set({ show: true, message, type });
    this.cdr.detectChanges();
    setTimeout(() => {
      this.toast.update(t => ({ ...t, show: false }));
      this.cdr.detectChanges();
    }, 4000);
  }

  // --- API Methods ---

  loadLatestSetting() {
    this.isLoadingSettings.set(true);
    this.cdr.detectChanges();
    this.settingService.getLatestSetting().subscribe({
      next: (setting) => {
        this.ngZone.run(() => {
          setTimeout(() => {
            this.isLoadingSettings.set(false);
            if (setting) {
              this.fillForm(setting);
              this.activeSettingId.set(setting.id || null);
            } else {
              this.clearForm();
            }
            this.cdr.detectChanges();
          }, 0);
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          setTimeout(() => {
            console.error('Error loading latest setting', err);
            this.isLoadingSettings.set(false);
            this.hasSettingError.set(true);
            this.cdr.detectChanges();
          }, 0);
        });
      }
    });
  }

  loadAllSettings() {
    this.isLoadingSettings.set(true);
    this.cdr.detectChanges();
    this.settingService.getAllSettings().subscribe({
      next: (list) => {
        this.ngZone.run(() => {
          setTimeout(() => {
            this.settingsList.set(list || []);
            this.isLoadingSettings.set(false);
            this.cdr.detectChanges();
          }, 0);
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          setTimeout(() => {
            console.error('Error loading all settings', err);
            this.isLoadingSettings.set(false);
            this.hasSettingError.set(true);
            this.cdr.detectChanges();
          }, 0);
        });
      }
    });
  }

  // --- Actions ---

  fillForm(setting: GeneralSetting) {
    if (!setting) return;
    if (this.activeSettingId() === setting.id) {
      this.clearForm();
      return;
    }
    this.breakTime.set(this.formatTimeToHHMM(setting.breakTime) || '00:15');
    this.businessHours.set(setting.businessHours ?? 16);
    this.openTime.set(this.formatTimeToHHMM(setting.openTime) || '08:00');
    this.percentWeekend.set(setting.percentWeekend ?? 10);
    this.timeBeginToChange.set(this.formatDateTimeToLocal(setting.timeBeginToChange) || '2026-05-01T00:00');
    this.loadedTimeBeginToChange = setting.timeBeginToChange || null;
    this.activeSettingId.set(setting.id || null);
    this.formErrors.set([]);
    this.cdr.detectChanges();
  }

  clearForm() {
    this.breakTime.set('12:00');
    this.businessHours.set(16);
    this.openTime.set('08:00');
    this.percentWeekend.set(10);
    this.timeBeginToChange.set('2026-05-01T00:00');
    this.loadedTimeBeginToChange = null;
    this.activeSettingId.set(null);
    this.formErrors.set([]);
    this.cdr.detectChanges();
  }

  saveSetting() {
    if (!this.validateForm()) return;

    const payload = this.preparePayload();

    this.isSavingSetting.set(true);
    this.cdr.detectChanges();
    this.settingService.saveSetting(payload).subscribe({
      next: () => {
        this.isSavingSetting.set(false);
        this.showToast('Lưu cấu hình thành công!', 'success');
        this.loadAllSettings();
        this.loadLatestSetting();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Save setting error', err);
        this.isSavingSetting.set(false);
        this.showToast(err.error?.message || 'Lỗi khi lưu cấu hình', 'error');
        this.cdr.detectChanges();
      }
    });
  }

  updateSetting() {
    const id = this.activeSettingId();
    if (!id) return;

    if (!this.validateForm()) return;

    const payload = this.preparePayload(id);

    this.isSavingSetting.set(true);
    this.cdr.detectChanges();
    this.settingService.updateSetting(payload).subscribe({
      next: () => {
        this.isSavingSetting.set(false);
        this.showToast('Cập nhật cấu hình thành công!', 'success');
        this.loadAllSettings();
        this.loadLatestSetting();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Update setting error', err);
        this.isSavingSetting.set(false);
        this.showToast(err.error?.message || 'Lỗi khi cập nhật cấu hình', 'error');
        this.cdr.detectChanges();
      }
    });
  }

  deleteSetting(id: number) {
    this.settingIdToDelete.set(id);
    this.showDeleteConfirm.set(true);
    this.cdr.detectChanges();
  }

  cancelDelete() {
    this.showDeleteConfirm.set(false);
    this.settingIdToDelete.set(null);
    this.cdr.detectChanges();
  }

  confirmDelete() {
    const id = this.settingIdToDelete();
    if (id === null) return;

    this.settingService.deleteSetting(id).subscribe({
      next: () => {
        this.showToast('Xóa cấu hình thành công!', 'success');
        // If we were editing the deleted configuration, clear the form
        if (this.activeSettingId() === id) {
          this.clearForm();
        }
        this.loadAllSettings();
        // Reload latest in case active config changed
        this.loadLatestSetting();
        this.cancelDelete();
      },
      error: (err) => {
        console.error('Delete setting error', err);
        this.showToast(err.error?.message || 'Không thể xóa cấu hình này', 'error');
        this.cancelDelete();
      }
    });
  }

  // --- Helper Methods ---

  private formatTimeWithSeconds(timeStr: string): string {
    if (!timeStr) return '00:00:00';
    const clean = timeStr.trim();
    const parts = clean.split(':');
    if (parts.length === 3) {
      return clean;
    }
    const hh = parts[0] ? parts[0].padStart(2, '0') : '00';
    const mm = parts[1] ? parts[1].padStart(2, '0') : '00';
    return `${hh}:${mm}:00`;
  }

  private formatDateTimeToLocal(dateTimeStr: any): string {
    if (dateTimeStr == null) return '';
    let str = String(dateTimeStr).trim().replace(' ', 'T');
    const match = str.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})/);
    return match ? match[1] : '';
  }

  private formatDateTimeToBackend(dateTimeStr: string): string {
    if (!dateTimeStr) return '2026-05-01 00:00:00';
    const clean = dateTimeStr.trim().replace('T', ' ');
    const parts = clean.split(':');
    if (parts.length === 3) {
      return clean;
    }
    return `${clean}:00`;
  }

  private preparePayload(id?: number): GeneralSetting {
    const formattedBreakTime = this.formatTimeWithSeconds(this.breakTime());
    const formattedOpen = this.formatTimeWithSeconds(this.openTime());
    const formattedClose = this.formatTimeWithSeconds(this.closeTime());
    const formattedTimeBegin = this.formatDateTimeToBackend(this.timeBeginToChange());

    const payload: GeneralSetting = {
      breakTime: formattedBreakTime,
      businessHours: this.businessHours(),
      openTime: formattedOpen,
      closeTime: formattedClose,
      percentWeekend: this.percentWeekend(),
      timeBeginToChange: formattedTimeBegin
    };

    if (id !== undefined) {
      payload.id = id;
    }
    return payload;
  }

  protected formatTimeToHHMM(timeStr: any): string {
    if (timeStr == null) return '';
    let time = String(timeStr).trim();
    if (time.includes(' ')) {
      time = time.split(' ')[1];
    } else if (time.includes('T')) {
      time = time.split('T')[1];
    }
    const parts = time.split(':');
    if (parts.length >= 2) {
      const hours = parts[0].padStart(2, '0');
      const minutes = parts[1].padStart(2, '0');
      return `${hours}:${minutes}`;
    }
    return time;
  }

  protected getBreakTimeMinutes(timeStr: string): number {
    if (!timeStr) return 0;
    const parts = timeStr.split(':');
    const hh = parseInt(parts[0], 10) || 0;
    const mm = parseInt(parts[1], 10) || 0;
    return hh * 60 + mm;
  }

  private calculateCloseTime(openTime: string, businessHours: number): string {
    if (!openTime || businessHours == null || isNaN(businessHours)) {
      return '';
    }
    const parts = openTime.split(':');
    if (parts.length !== 2) return '';
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    if (isNaN(hours) || isNaN(minutes)) return '';

    let totalHours = hours + businessHours;
    let finalHours = Math.floor(totalHours) % 24;

    // Support fractional business hours if any
    let additionalMinutes = Math.round((totalHours - Math.floor(totalHours)) * 60);
    let finalMinutes = minutes + additionalMinutes;

    if (finalMinutes >= 60) {
      finalHours = (finalHours + Math.floor(finalMinutes / 60)) % 24;
      finalMinutes = finalMinutes % 60;
    }

    const hStr = String(finalHours).padStart(2, '0');
    const mStr = String(finalMinutes).padStart(2, '0');
    return `${hStr}:${mStr}`;
  }

  private validateForm(): boolean {
    const errors: string[] = [];

    const breakTimeMins = this.getBreakTimeMinutes(this.breakTime());
    if (!this.breakTime()) {
      errors.push('Thời gian nghỉ giữa các suất chiếu không được bỏ trống.');
    } else if (breakTimeMins < 0) {
      errors.push('Thời gian nghỉ giữa các suất chiếu không được nhỏ hơn 0.');
    }

    const totalOperatingMinutes = this.businessHours() * 60;
    if (breakTimeMins >= totalOperatingMinutes) {
      errors.push('Thời gian nghỉ giữa các suất chiếu phải ngắn hơn tổng số giờ mở cửa.');
    }

    if (this.businessHours() == null || this.businessHours() <= 0 || this.businessHours() > 24) {
      errors.push('Thời gian mở cửa hoạt động rạp phải từ 1 đến 24 giờ.');
    }

    if (!this.openTime()) {
      errors.push('Thời gian mở cửa rạp chiếu phim không được bỏ trống.');
    }

    if (this.percentWeekend() == null || this.percentWeekend() < 0 || this.percentWeekend() > 100) {
      errors.push('Phần trăm phụ thu ngày cuối tuần phải nằm trong khoảng từ 0% đến 100%.');
    }

    if (!this.timeBeginToChange()) {
      errors.push('Giờ bắt đầu áp dụng thay đổi lịch chiếu là bắt buộc.');
    }

    this.formErrors.set(errors);
    return errors.length === 0;
  }
}
