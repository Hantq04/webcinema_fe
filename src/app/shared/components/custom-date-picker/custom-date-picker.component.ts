import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  computed,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LanguageService } from '../../../core/services/language.service';

interface CalendarDay {
  day: number;
  month: number;
  year: number;
  isCurrentMonth: boolean;
  dateString: string;
}

@Component({
  selector: 'app-custom-date-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative w-full custom-date-picker" [class.disabled]="disabled">
      <!-- Input Display Box (Trigger) -->
      <div
        class="trigger-box border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg py-2 px-3 text-sm flex justify-between items-center cursor-pointer select-none h-[38px] transition-all hover:border-slate-300 dark:hover:border-slate-600"
        [class.focused]="isOpen()"
        (click)="toggleCalendar()"
      >
        <span class="truncate" [class.text-slate-400]="!value">
          {{ formatToShow(value) || placeholder }}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4.5 w-4.5 text-slate-400 transition-colors calendar-icon"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>

      <!-- Calendar Popover Panel -->
      <div *ngIf="isOpen()" class="calendar-popover bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl z-50">
        
        <!-- Header -->
        <div class="calendar-header flex items-center justify-between p-3 border-b border-slate-100 dark:border-slate-800">
          <button
            type="button"
            (click)="prevMonth()"
            class="nav-btn p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <!-- Current Month / Year Title (Click to open list selectors) -->
          <div class="header-title flex items-center gap-1 font-semibold text-slate-800 dark:text-white cursor-pointer select-none px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" (click)="toggleSelector()">
            <span>{{ formatHeaderTitle() }}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-3.5 w-3.5 text-slate-400 transition-transform"
              [class.rotate-180]="showSelectorPanel()"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          <button
            type="button"
            (click)="nextMonth()"
            class="nav-btn p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <!-- Main Body -->
        <div class="calendar-body p-3 min-h-[258px]">
          <!-- Grid View (Normal) -->
          <div *ngIf="!showSelectorPanel()" class="fade-in">
            <!-- Weekday Headers -->
            <div class="weekdays-grid grid grid-cols-7 mb-1 text-center">
              <span *ngFor="let day of weekdays()" class="weekday text-xs font-semibold text-slate-400 dark:text-slate-500 select-none py-1">
                {{ day }}
              </span>
            </div>

            <!-- Days Grid -->
            <div class="days-grid grid grid-cols-7 gap-1">
              <button
                *ngFor="let day of calendarDays()"
                type="button"
                [disabled]="isDisabledDay(day)"
                [class.current-month]="day.isCurrentMonth"
                [class.other-month]="!day.isCurrentMonth"
                [class.selected]="day.dateString === value"
                [class.today]="day.dateString === todayStr()"
                (click)="selectDay(day)"
                class="day-cell select-none relative flex items-center justify-center font-medium text-sm rounded-lg aspect-square transition-all"
              >
                {{ day.day }}
              </button>
            </div>
          </div>

          <!-- Selector View (Month/Year Quick Select) -->
          <div *ngIf="showSelectorPanel()" class="selector-panel fade-in">
            <div class="selector-tabs flex border-b border-slate-100 dark:border-slate-800 mb-3 text-xs font-bold text-slate-500 uppercase select-none">
              <div
                class="flex-1 text-center py-2 cursor-pointer transition-colors border-b-2"
                [class.border-rose-500]="activeTab() === 'month'"
                [class.text-rose-600]="activeTab() === 'month'"
                [class.border-transparent]="activeTab() !== 'month'"
                (click)="activeTab.set('month')"
              >
                {{ isEn() ? 'Months' : 'Tháng' }}
              </div>
              <div
                class="flex-1 text-center py-2 cursor-pointer transition-colors border-b-2"
                [class.border-rose-500]="activeTab() === 'year'"
                [class.text-rose-600]="activeTab() === 'year'"
                [class.border-transparent]="activeTab() !== 'year'"
                (click)="activeTab.set('year')"
              >
                {{ isEn() ? 'Years' : 'Năm' }}
              </div>
            </div>

            <!-- Month Selection Grid -->
            <div *ngIf="activeTab() === 'month'" class="months-selector grid grid-cols-3 gap-2 py-1 fade-in">
              <button
                *ngFor="let m of monthNames(); let idx = index"
                type="button"
                (click)="selectMonth(idx)"
                [class.active]="idx === currentMonth()"
                class="selector-btn py-2 text-sm font-semibold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
              >
                {{ m }}
              </button>
            </div>

            <!-- Year Selection List -->
            <div *ngIf="activeTab() === 'year'" class="years-selector grid grid-cols-4 gap-2 max-h-[190px] overflow-y-auto py-1 pr-1 fade-in">
              <button
                *ngFor="let yr of yearRange()"
                type="button"
                (click)="selectYear(yr)"
                [class.active]="yr === currentYear()"
                class="selector-btn py-2 text-sm font-semibold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
              >
                {{ yr }}
              </button>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="calendar-footer flex items-center justify-between p-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            (click)="clear()"
            class="text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-white px-2 py-1 rounded transition-colors uppercase"
          >
            {{ isEn() ? 'Clear' : 'Xóa' }}
          </button>
          <button
            type="button"
            (click)="goToday()"
            class="text-xs font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 px-2 py-1 rounded transition-colors uppercase"
          >
            {{ isEn() ? 'Today' : 'Hôm nay' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .custom-date-picker {
      font-family: inherit;
    }
    
    .trigger-box.focused {
      border-color: var(--m-brand-color, #e11d48);
      box-shadow: 0 0 0 2px rgba(225, 29, 72, 0.15);
    }
    
    .trigger-box.focused .calendar-icon {
      color: var(--m-brand-color, #e11d48);
    }
    
    .calendar-popover {
      position: absolute;
      top: calc(100% + 4px);
      left: 0;
      width: 290px;
      animation: popover-animation 0.18s cubic-bezier(0.16, 1, 0.3, 1);
      transform-origin: top left;
      user-select: none;
    }
    
    .disabled {
      opacity: 0.6;
      pointer-events: none;
    }
    
    /* Days Grid styling */
    .day-cell {
      background: transparent;
      border: none;
      cursor: pointer;
    }
    
    .day-cell.current-month {
      color: #334155;
    }
    .dark .day-cell.current-month {
      color: #e2e8f0;
    }
    
    .day-cell.other-month {
      color: #94a3b8;
      opacity: 0.55;
      font-weight: 400;
    }
    
    .day-cell:hover:not([disabled]) {
      background-color: #f1f5f9;
      color: #0f172a;
    }
    .dark .day-cell:hover:not([disabled]) {
      background-color: #334155;
      color: #f8fafc;
    }
    
    .day-cell.today {
      box-shadow: inset 0 0 0 1.5px var(--m-brand-color, #e11d48);
      color: var(--m-brand-color, #e11d48);
    }
    
    .day-cell.selected {
      background-color: var(--m-brand-color, #e11d48) !important;
      color: white !important;
      font-weight: 700;
      box-shadow: 0 4px 10px rgba(225, 29, 72, 0.25);
    }
    
    .day-cell[disabled] {
      opacity: 0.25;
      cursor: not-allowed;
      pointer-events: none;
    }
    
    /* Selector panels and buttons */
    .selector-btn {
      border: none;
      background: transparent;
      cursor: pointer;
    }
    
    .selector-btn.active {
      background-color: var(--m-brand-color, #e11d48) !important;
      color: white !important;
      box-shadow: 0 4px 6px -1px rgba(225, 29, 72, 0.2);
    }
    
    /* Animations */
    @keyframes popover-animation {
      from {
        opacity: 0;
        transform: scale(0.96) translateY(-4px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }
    
    .fade-in {
      animation: fade-in-anim 0.15s ease-out;
    }
    
    @keyframes fade-in-anim {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    /* Scrollbar */
    .years-selector::-webkit-scrollbar {
      width: 4px;
    }
    .years-selector::-webkit-scrollbar-track {
      background: transparent;
    }
    .years-selector::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 4px;
    }
    .dark .years-selector::-webkit-scrollbar-thumb {
      background: #475569;
    }
  `]
})
export class CustomDatePickerComponent implements OnInit {
  private readonly elementRef = inject(ElementRef);
  protected readonly language = inject(LanguageService);

  @Input() value: string = ''; // YYYY-MM-DD format
  @Output() valueChange = new EventEmitter<string>();
  @Input() placeholder: string = 'Chọn ngày';
  @Input() disabled: boolean = false;
  @Input() min: string = ''; // YYYY-MM-DD
  @Input() max: string = ''; // YYYY-MM-DD

  protected isOpen = signal(false);
  protected showSelectorPanel = signal(false);
  protected activeTab = signal<'month' | 'year'>('month');

  // Working date signals for calendar display
  protected currentMonth = signal<number>(new Date().getMonth());
  protected currentYear = signal<number>(new Date().getFullYear());
  protected calendarDays = signal<CalendarDay[]>([]);

  protected isEn = computed(() => this.language.currentLanguage() === 'en');

  protected todayStr = signal<string>(new Date().toISOString().split('T')[0]);

  // Months
  protected monthNames = computed(() => {
    return this.isEn()
      ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      : ['Thg 1', 'Thg 2', 'Thg 3', 'Thg 4', 'Thg 5', 'Thg 6', 'Thg 7', 'Thg 8', 'Thg 9', 'Thg 10', 'Thg 11', 'Thg 12'];
  });

  // Weekdays
  protected weekdays = computed(() => {
    return this.isEn()
      ? ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
      : ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  });

  // Year Selection Range (current - 20 to current + 10)
  protected yearRange = computed(() => {
    const yr = new Date().getFullYear();
    const list: number[] = [];
    for (let y = yr - 20; y <= yr + 10; y++) {
      list.push(y);
    }
    return list;
  });

  ngOnInit(): void {
    this.syncWithInput();
  }

  private syncWithInput(): void {
    if (this.value && this.value.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const parts = this.value.split('-');
      this.currentYear.set(parseInt(parts[0], 10));
      this.currentMonth.set(parseInt(parts[1], 10) - 1);
    } else {
      const d = new Date();
      this.currentYear.set(d.getFullYear());
      this.currentMonth.set(d.getMonth());
    }
    this.generateCalendar();
  }

  protected toggleCalendar(): void {
    if (this.disabled) return;
    if (this.isOpen()) {
      this.isOpen.set(false);
    } else {
      this.syncWithInput();
      this.showSelectorPanel.set(false);
      this.isOpen.set(true);
    }
  }

  protected toggleSelector(): void {
    if (this.showSelectorPanel()) {
      this.showSelectorPanel.set(false);
    } else {
      this.activeTab.set('month');
      this.showSelectorPanel.set(true);
    }
  }

  protected selectMonth(m: number): void {
    this.currentMonth.set(m);
    this.generateCalendar();
    this.showSelectorPanel.set(false);
  }

  protected selectYear(y: number): void {
    this.currentYear.set(y);
    this.generateCalendar();
    this.showSelectorPanel.set(false);
  }

  protected prevMonth(): void {
    if (this.currentMonth() === 0) {
      this.currentMonth.set(11);
      this.currentYear.update(y => y - 1);
    } else {
      this.currentMonth.update(m => m - 1);
    }
    this.generateCalendar();
  }

  protected nextMonth(): void {
    if (this.currentMonth() === 11) {
      this.currentMonth.set(0);
      this.currentYear.update(y => y + 1);
    } else {
      this.currentMonth.update(m => m + 1);
    }
    this.generateCalendar();
  }

  protected selectDay(day: CalendarDay): void {
    this.value = day.dateString;
    this.valueChange.emit(this.value);
    this.isOpen.set(false);
  }

  protected clear(): void {
    this.value = '';
    this.valueChange.emit('');
    this.isOpen.set(false);
  }

  protected goToday(): void {
    const today = new Date();
    this.value = today.toISOString().split('T')[0];
    this.valueChange.emit(this.value);
    this.isOpen.set(false);
  }

  protected isDisabledDay(day: CalendarDay): boolean {
    if (this.min && day.dateString < this.min) return true;
    if (this.max && day.dateString > this.max) return true;
    return false;
  }

  protected formatToShow(dateStr: string): string {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  }

  protected formatHeaderTitle(): string {
    const m = this.monthNames()[this.currentMonth()];
    const y = this.currentYear();
    return this.isEn() ? `${m} ${y}` : `${m}, ${y}`;
  }

  private generateCalendar(): void {
    const year = this.currentYear();
    const month = this.currentMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevTotalDays = new Date(year, month, 0).getDate();

    const days: CalendarDay[] = [];

    // Prev month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = prevTotalDays - i;
      const m = month === 0 ? 11 : month - 1;
      const y = month === 0 ? year - 1 : year;
      days.push({
        day: d,
        month: m,
        year: y,
        isCurrentMonth: false,
        dateString: this.formatDateString(y, m, d)
      });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      days.push({
        day: i,
        month: month,
        year: year,
        isCurrentMonth: true,
        dateString: this.formatDateString(year, month, i)
      });
    }

    // Next month padding
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const m = month === 11 ? 0 : month + 1;
      const y = month === 11 ? year + 1 : year;
      days.push({
        day: i,
        month: m,
        year: y,
        isCurrentMonth: false,
        dateString: this.formatDateString(y, m, i)
      });
    }

    this.calendarDays.set(days);
  }

  private formatDateString(y: number, m: number, d: number): string {
    const mm = String(m + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  }

  @HostListener('document:click', ['$event'])
  protected clickOutside(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }
}
