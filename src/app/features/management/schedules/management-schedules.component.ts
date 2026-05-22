import { ChangeDetectionStrategy, Component, computed, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { LanguageService } from '../../../core/services/language.service';
import { ManagementScheduleService, ScheduleResponse } from '../../../core/services/management-schedule.service';
import { ManagementMovieService } from '../../../core/services/management-movie.service';
import { CinemaService } from '../../../core/services/cinema.service';
import { RoomService } from '../../../core/services/room.service';

@Component({
  selector: 'app-management-schedules',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './management-schedules.component.html',
  styleUrls: ['./management-schedules.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManagementSchedulesComponent implements OnInit {
  protected readonly language = inject(LanguageService);
  protected readonly scheduleService = inject(ManagementScheduleService);
  protected readonly movieService = inject(ManagementMovieService);
  protected readonly cinemaService = inject(CinemaService);
  protected readonly roomService = inject(RoomService);
  protected readonly platformId = inject(PLATFORM_ID);
  protected readonly fb = inject(FormBuilder);
  protected readonly t = this.language.t.bind(this.language);

  // Filter State
  searchQuery = signal<string>('');
  filterDate = signal<string>('');
  filterAddress = signal<string>('');
  filterCinemaName = signal<string>('');
  filterMovie = signal<string>('');

  // Data State
  schedules = signal<ScheduleResponse[]>([]);
  selectedScheduleCode = signal<string | null>(null);
  selectedScheduleDetail = signal<ScheduleResponse | null>(null);
  isLoadingList = signal(false);

  // Dropdown Data
  movies = signal<any[]>([]);
  addresses = signal<string[]>([]);
  cinemas = signal<string[]>([]); // For create form
  rooms = signal<string[]>([]);   // For create form

  // Cinemas for the Filter bar
  filterCinemas = signal<string[]>([]);

  // Modals visibility
  showFormModal = signal(false);
  showDeleteModal = signal(false);

  // Forms
  scheduleForm: FormGroup;
  isEditMode = signal(false);
  deleteScheduleCode = signal<string>('');
  deleteMovieId = signal<number>(0);
  fieldErrors = signal<Record<string, string>>({});

  // Dropdown UI state
  isFilterAddressOpen = signal(false);
  isFilterCinemaOpen = signal(false);
  isFormMovieOpen = signal(false);
  isFormAddressOpen = signal(false);
  isFormCinemaOpen = signal(false);
  isFormRoomOpen = signal(false);

  constructor() {
    this.scheduleForm = this.fb.group({
      code: [{ value: '', disabled: true }],
      movieName: [''],
      address: [''], 
      cinemaName: [''], 
      roomName: [''], 
      roomCode: [''],
      startAt: ['']
    });

    // Subscribe to form changes for dropdown cascade
    this.scheduleForm.get('address')?.valueChanges.subscribe(address => {
      if (address) {
        this.cinemaService.getCinemasByAddress(address).subscribe(c => {
          this.cinemas.set(c);
          this.scheduleForm.patchValue({ cinemaName: '', roomName: '', roomCode: '' });
          this.rooms.set([]);
        });
      }
    });

    this.scheduleForm.get('cinemaName')?.valueChanges.subscribe(cinema => {
      if (cinema) {
        this.roomService.getRoomsByCinema(cinema).subscribe(r => {
          this.rooms.set(r);
          this.scheduleForm.patchValue({ roomName: '', roomCode: '' });
        });
      }
    });

    this.scheduleForm.get('roomName')?.valueChanges.subscribe(rName => {
      // Assuming roomName is same as roomCode or we parse it. Wait, RoomService returns string[].
      // Let's assume the string is the roomCode, or roomName. The backend expects both. We will pass the same string to both.
      if (rName) {
        this.scheduleForm.patchValue({ roomCode: rName }, { emitEvent: false });
      }
    });
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadDropdownData();
      this.loadSchedules();
    }
  }

  isEn(): boolean {
    return this.language.currentLanguage() === 'en';
  }

  formatFullDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;

    if (this.isEn()) {
      return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    } else {
      const weekdays = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
      const weekday = weekdays[date.getDay()];
      const day = date.getDate().toString().padStart(2, '0');
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      return `${weekday}, Ngày ${day} tháng ${month}, ${year}`;
    }
  }

  // --- Data Loading ---
  loadDropdownData() {
    // Load movies
    this.movieService.getNowShowingMovies().subscribe(res => {
      const data = res?.data || res || [];
      this.movies.set(Array.isArray(data) ? data : (data.content || []));
    });

    // Load addresses
    this.cinemaService.getAllAddresses().subscribe(a => this.addresses.set(a));
  }

  loadSchedules() {
    this.isLoadingList.set(true);
    this.scheduleService.getAllSchedules().subscribe({
      next: (res: any) => {
        const data = res?.data || res || [];
        this.schedules.set(Array.isArray(data) ? data : (data.content || []));
        this.isLoadingList.set(false);

        // Auto-select first schedule if none selected
        const currentSchedules = this.filteredSchedules();
        if (currentSchedules.length > 0 && !this.selectedScheduleCode()) {
          this.selectSchedule(currentSchedules[0].code);
        } else if (this.schedules().length === 0) {
          this.selectedScheduleCode.set(null);
          this.selectedScheduleDetail.set(null);
        }
      },
      error: () => this.isLoadingList.set(false)
    });
  }

  onAddressFilterChange(address: string) {
    this.filterAddress.set(address);
    this.filterCinemaName.set(''); // Reset cinema filter when address changes
    if (address) {
      this.cinemaService.getCinemasByAddress(address).subscribe(cList => {
        this.filterCinemas.set(cList);
      });
    } else {
      this.filterCinemas.set([]);
    }
  }

  selectSchedule(code: string) {
    this.selectedScheduleCode.set(code);
    const detail = this.schedules().find(s => s.code === code) || null;
    this.selectedScheduleDetail.set(detail);
  }

  // --- Filtering ---
  filteredSchedules = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const d = this.filterDate();
    const addr = this.filterAddress().toLowerCase();
    const cinemaName = this.filterCinemaName().toLowerCase();
    const m = this.filterMovie().toLowerCase();

    // Get the list of cinemas that belong to the selected address
    const allowedCinemas = this.filterCinemas().map(c => c.toLowerCase());

    return this.schedules().filter(s => {
      let match = true;

      // Search by Movie Title OR Schedule Name OR Schedule Code
      if (q) {
        const movieTitle = (s.movie || '').toLowerCase();
        const scheduleName = (s.name || '').toLowerCase();
        const scheduleCode = (s.code || '').toLowerCase();
        match = match && (movieTitle.includes(q) || scheduleName.includes(q) || scheduleCode.includes(q));
      }

      if (d) match = match && Boolean(s.startAt?.startsWith(d));

      // Filter by Area (Address): The schedule's cinema must belong to the selected address
      // Since we don't have a direct address in ScheduleResponse, we check if s.cinema is in allowedCinemas
      if (addr && allowedCinemas.length > 0) {
        match = match && allowedCinemas.includes(s.cinema?.toLowerCase());
      }

      // Filter by specific Cinema Name
      if (cinemaName) {
        match = match && s.cinema?.toLowerCase().includes(cinemaName);
      }

      if (m) match = match && Boolean(s.movie?.toLowerCase().includes(m));

      return match;
    }).sort((a, b) => {
      const timeA = a.startAt ? new Date(a.startAt.replace(' ', 'T')).getTime() : 0;
      const timeB = b.startAt ? new Date(b.startAt.replace(' ', 'T')).getTime() : 0;
      return timeB - timeA;
    });
  });

  // --- Actions ---
  deactivateExpired() {
    if (confirm(this.t('management.confirmDeactivateExpired'))) {
      this.scheduleService.deactivateExpired().subscribe({
        next: () => {
          this.loadSchedules();
        },
        error: (err) => {
          alert(this.t('management.errorOccurred') + (err.error?.message || err.message));
        }
      });
    }
  }

  // --- Forms ---
  openAddModal() {
    this.isEditMode.set(false);
    this.scheduleForm.reset();
    this.fieldErrors.set({});

    this.scheduleForm.get('movieName')?.enable();
    this.scheduleForm.get('roomName')?.enable();
    this.scheduleForm.get('address')?.enable();
    this.scheduleForm.get('cinemaName')?.enable();

    this.showFormModal.set(true);
  }

  openEditModal() {
    const detail = this.selectedScheduleDetail();
    if (!detail) return;

    this.isEditMode.set(true);
    this.fieldErrors.set({});

    // Format date for input[type="datetime-local"]
    let formattedDate = detail.startAt;
    if (formattedDate && formattedDate.includes(' ')) {
      formattedDate = formattedDate.replace(' ', 'T');
    }

    this.scheduleForm.patchValue({
      code: detail.code,
      movieName: detail.movie,
      cinemaName: detail.cinema,
      roomName: detail.roomCode, // backend returns roomCode
      roomCode: detail.roomCode,
      startAt: formattedDate
    });

    // In edit mode, usually only startAt is allowed to change
    this.scheduleForm.get('movieName')?.disable();
    this.scheduleForm.get('roomName')?.disable();
    this.scheduleForm.get('address')?.disable();
    this.scheduleForm.get('cinemaName')?.disable();

    this.showFormModal.set(true);
  }

  submitForm() {
    const rawValue = this.scheduleForm.getRawValue();

    // Format date: YYYY-MM-DDTHH:mm -> YYYY-MM-DD HH:mm:ss
    let formattedDate = rawValue.startAt;
    if (formattedDate) {
      formattedDate = formattedDate.replace('T', ' ');
      if (formattedDate.length === 16) {
        formattedDate += ':00';
      }
    }

    // Construct payload based on backend expectation
    const payload: any = {
      movieName: rawValue.movieName,
      roomName: rawValue.cinemaName, // Backend expects cinema name in roomName field
      roomCode: rawValue.roomCode,
      startAt: formattedDate
    };

    if (this.isEditMode()) {
      payload.code = rawValue.code;
    }

    const obs$ = this.isEditMode()
      ? this.scheduleService.updateSchedule(payload)
      : this.scheduleService.saveSchedule(payload);

    obs$.subscribe({
      next: () => {
        this.closeFormModal();
        this.loadSchedules();
        this.fieldErrors.set({});
      },
      error: (err) => {
        const apiError = err.error;
        if (apiError && apiError.errors && Array.isArray(apiError.errors)) {
          const newErrors: Record<string, string> = {};
          apiError.errors.forEach((e: any) => {
            if (e.field) newErrors[e.field] = e.message;
          });
          this.fieldErrors.set(newErrors);
        } else {
          this.fieldErrors.set({ _general: apiError?.message || 'Có lỗi xảy ra' });
        }
      }
    });
  }

  closeFormModal() {
    this.showFormModal.set(false);
    this.scheduleForm.reset();
  }

  // --- Deletion ---
  confirmDelete(detail: ScheduleResponse) {
    this.deleteScheduleCode.set(detail.code);
    // Find movie id from movies list
    const m = this.movies().find(x => x.name === detail.movie || x.nameEn === detail.movie);
    if (m) {
      this.deleteMovieId.set(m.id);
      this.showDeleteModal.set(true);
    } else {
      alert(this.t('management.movieInfoNotFoundToDeleteShowtime'));
    }
  }

  executeDelete() {
    this.scheduleService.deleteSchedule(this.deleteScheduleCode(), this.deleteMovieId()).subscribe({
      next: () => {
        this.showDeleteModal.set(false);
        if (this.selectedScheduleCode() === this.deleteScheduleCode()) {
          this.selectedScheduleCode.set(null);
          this.selectedScheduleDetail.set(null);
        }
        this.loadSchedules();
      },
      error: (err) => {
        alert(this.t('management.deleteError') + (err.error?.message || err.message));
        this.showDeleteModal.set(false);
      }
    });
  }

  closeDeleteModal() {
    this.showDeleteModal.set(false);
  }

  getScheduleStatus(s: ScheduleResponse | null): { label: string, class: string } {
    if (!s) return { label: '', class: '' };
    
    const now = new Date().getTime();
    const start = s.startAt ? new Date(s.startAt.replace(' ', 'T')).getTime() : 0;
    const end = s.endAt ? new Date(s.endAt.replace(' ', 'T')).getTime() : 0;

    if (!s.active || now > end) {
      return { label: this.t('management.statusEnded'), class: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' };
    }

    if (now >= start && now <= end) {
      return { label: this.t('management.statusNowShowing'), class: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' };
    } else if (now < start) {
      return { label: this.t('management.statusComingSoon'), class: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' };
    } else {
      return { label: this.t('management.statusEnded'), class: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' };
    }
  }
}
